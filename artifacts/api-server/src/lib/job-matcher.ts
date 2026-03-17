import { openai } from "@workspace/integrations-openai-ai-server";
import type { LinkedInJob } from "./linkedin-crawler.js";

export interface MatchedJob extends LinkedInJob {
  matchScore: number | null;
  matchReason: string | null;
}

export async function matchJobsToResume(
  jobs: LinkedInJob[],
  resumeContent: string
): Promise<MatchedJob[]> {
  if (jobs.length === 0) return [];

  const jobSummaries = jobs
    .map(
      (j, i) =>
        `Job ${i + 1}: "${j.title}" at ${j.company}\nDescription: ${(j.description || "").slice(0, 800)}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are a professional resume evaluator. Given a resume and a list of job postings, score each job's fit for the candidate.

RESUME:
${resumeContent.slice(0, 2000)}

JOB POSTINGS:
${jobSummaries}

Return a JSON array with one object per job (same order), each with:
- "score": integer 0-100 (how well the candidate fits the role)
- "reason": string (1-2 sentence explanation of the match)

Respond ONLY with valid JSON array, no markdown.`;

  try {
    const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
      ? "gpt-5-mini"
      : (process.env.OPENAI_MODEL || "gpt-4o-mini");

    const response = await openai.chat.completions.create({
      model,
      max_completion_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const results: { score: number; reason: string }[] = JSON.parse(cleaned);

    return jobs.map((job, i) => ({
      ...job,
      matchScore: results[i]?.score ?? null,
      matchReason: results[i]?.reason ?? null,
    }));
  } catch (err) {
    console.error("AI matching error:", err);
    return jobs.map((job) => ({
      ...job,
      matchScore: null,
      matchReason: "Could not compute match score.",
    }));
  }
}
