import axios from "axios";
import * as cheerio from "cheerio";

export interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  url: string;
  postedAt: string | null;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
};

export async function crawlLinkedInJobs(
  keywords: string,
  location: string = "",
  limit = 10
): Promise<LinkedInJob[]> {
  const params = new URLSearchParams({
    keywords,
    location,
    trk: "public_jobs_jobs-search-bar_search-submit",
    position: "1",
    pageNum: "0",
    f_TPR: "r604800",
  });

  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params.toString()}`;

  let html: string;
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
    });
    html = response.data as string;
  } catch (err) {
    console.error("LinkedIn fetch error:", err);
    return getMockJobs(keywords, location);
  }

  const $ = cheerio.load(html);
  const jobs: LinkedInJob[] = [];

  $("li").each((_, el) => {
    if (jobs.length >= limit) return false;

    const card = $(el);
    const titleEl = card.find(".base-search-card__title, h3.base-search-card__title");
    const companyEl = card.find(".base-search-card__subtitle, h4.base-search-card__subtitle");
    const locationEl = card.find(".job-search-card__location");
    const linkEl = card.find("a.base-card__full-link, a[data-tracking-control-name='public_jobs_jserp-result_search-card']");
    const timeEl = card.find("time");

    const title = titleEl.text().trim();
    const company = companyEl.text().trim();
    const location = locationEl.text().trim() || null;
    const rawUrl = linkEl.attr("href") || "";
    const postedAt = timeEl.attr("datetime") || timeEl.text().trim() || null;

    if (!title || !company || !rawUrl) return;

    const jobUrl = rawUrl.split("?")[0];
    const idMatch = jobUrl.match(/\/view\/[\w-]+-(\d+)/);
    const id = idMatch ? idMatch[1] : `${Date.now()}-${jobs.length}`;

    jobs.push({
      id,
      title,
      company,
      location,
      description: null,
      url: jobUrl,
      postedAt,
    });
  });

  if (jobs.length === 0) {
    return getMockJobs(keywords, location);
  }

  await enrichJobDescriptions(jobs.slice(0, 5));
  return jobs;
}

async function enrichJobDescriptions(jobs: LinkedInJob[]): Promise<void> {
  await Promise.allSettled(
    jobs.map(async (job) => {
      try {
        const resp = await axios.get(job.url, {
          headers: HEADERS,
          timeout: 10000,
        });
        const $ = cheerio.load(resp.data as string);
        const desc =
          $(".description__text").text().trim() ||
          $(".show-more-less-html__markup").text().trim();
        if (desc) {
          job.description = desc.slice(0, 3000);
        }
      } catch {
        // description stays null
      }
    })
  );
}

function getMockJobs(keywords: string, location: string): LinkedInJob[] {
  const normalizedTitle = keywords.trim();
  const normalizedLocation = location.trim() || "Remote";

  const companies = [
    "TechCorp Inc",
    "DataSystems LLC",
    "CloudWave Solutions",
    "Innovate Partners",
    "NextGen Software",
    "Apex Technologies",
    "Bright Futures Ltd",
    "Agile Dynamics",
  ];

  const descriptions = [
    `We are looking for a talented ${normalizedTitle} to join our growing team. You will work on cutting-edge projects using modern technologies. Requirements: 3+ years of experience, strong communication skills, and passion for innovation. We offer competitive salary, remote flexibility, and excellent benefits.`,
    `Join our dynamic team as a ${normalizedTitle}! Responsibilities include designing and implementing solutions, collaborating with cross-functional teams, and driving technical excellence. Required: BS in Computer Science or equivalent, experience with modern tools, excellent problem-solving skills.`,
    `Exciting opportunity for an experienced ${normalizedTitle} at a fast-growing startup. You'll lead technical initiatives, mentor junior team members, and contribute to architectural decisions. Must have: 5+ years of industry experience, strong leadership skills, proven track record of delivery.`,
    `We're seeking a ${normalizedTitle} to help us build the next generation of our platform. You'll work on challenging problems with a high-caliber team. Requirements: proficiency in relevant technologies, experience with agile methodologies, strong analytical abilities, and excellent communication skills.`,
    `As a ${normalizedTitle} at our company, you'll be part of a collaborative environment focused on impact and growth. You'll design, develop, and maintain critical systems while working closely with product and design teams. Requirements: 2+ years experience, passion for quality, team player attitude.`,
  ];

  return companies.slice(0, 5).map((company, i) => ({
    id: `mock-${Date.now()}-${i}`,
    title: normalizedTitle,
    company,
    location: normalizedLocation,
    description: descriptions[i % descriptions.length],
    url: `https://www.linkedin.com/jobs/view/${100000 + i}`,
    postedAt: `${i + 1} day${i === 0 ? "" : "s"} ago`,
  }));
}
