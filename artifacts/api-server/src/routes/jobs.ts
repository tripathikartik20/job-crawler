import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, resumesTable, savedJobsTable } from "@workspace/db";
import {
  SearchJobsBody,
  SearchJobsResponse,
  GetSavedJobsResponse,
  SaveJobBody,
  SaveJobParams,
  SaveJobResponse,
  DeleteJobParams,
} from "@workspace/api-zod";
import { crawlLinkedInJobs } from "../lib/linkedin-crawler.js";
import { matchJobsToResume } from "../lib/job-matcher.js";

const router: IRouter = Router();

router.post("/jobs/search", async (req: Request, res: Response): Promise<void> => {
  const parsed = SearchJobsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { keywords, location, resumeId } = parsed.data;

  let resumeContent = "";
  if (resumeId) {
    const [resume] = await db
      .select()
      .from(resumesTable)
      .where(eq(resumesTable.id, resumeId));
    if (resume) resumeContent = resume.content;
  } else {
    const [resume] = await db
      .select()
      .from(resumesTable)
      .orderBy(resumesTable.updatedAt)
      .limit(1);
    if (resume) resumeContent = resume.content;
  }

  const crawledJobs = await crawlLinkedInJobs(keywords, location || "", 10);

  let matchedJobs = crawledJobs.map((j) => ({
    ...j,
    matchScore: null as number | null,
    matchReason: null as string | null,
  }));

  if (resumeContent) {
    const aiMatched = await matchJobsToResume(crawledJobs, resumeContent);
    matchedJobs = aiMatched;
  }

  matchedJobs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  if (matchedJobs.length > 0) {
    await db
      .insert(savedJobsTable)
      .values(
        matchedJobs.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location ?? null,
          description: j.description ?? null,
          url: j.url,
          matchScore: j.matchScore ?? null,
          matchReason: j.matchReason ?? null,
          postedAt: j.postedAt ?? null,
        }))
      )
      .onConflictDoUpdate({
        target: savedJobsTable.id,
        set: {
          title: savedJobsTable.title,
          matchScore: savedJobsTable.matchScore,
          matchReason: savedJobsTable.matchReason,
        },
      });
  }

  const savedJobIds = new Set(
    (await db.select({ id: savedJobsTable.id }).from(savedJobsTable)).map(
      (j) => j.id
    )
  );

  const result = matchedJobs.map((j) => ({
    ...j,
    saved: savedJobIds.has(j.id),
  }));

  res.json(SearchJobsResponse.parse(result));
});

router.get("/jobs", async (_req: Request, res: Response): Promise<void> => {
  const jobs = await db
    .select()
    .from(savedJobsTable)
    .orderBy(savedJobsTable.savedAt);

  const result = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description,
    url: j.url,
    matchScore: j.matchScore,
    matchReason: j.matchReason,
    postedAt: j.postedAt,
    saved: true,
  }));

  res.json(GetSavedJobsResponse.parse(result));
});

router.get("/jobs/export", async (_req: Request, res: Response): Promise<void> => {
  const jobs = await db
    .select()
    .from(savedJobsTable)
    .orderBy(savedJobsTable.savedAt);

  const escape = (v: string | null | undefined) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headers = ["Title", "Company", "Location", "Match Score", "Match Reason", "Posted", "URL"];
  const rows = jobs.map((j) => [
    escape(j.title),
    escape(j.company),
    escape(j.location),
    j.matchScore != null ? String(Math.round(j.matchScore)) : "",
    escape(j.matchReason),
    escape(j.postedAt),
    escape(j.url),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=jobs.csv");
  res.send(csv);
});

router.put("/jobs/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = SaveJobParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SaveJobBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const job = body.data;

  const [saved] = await db
    .insert(savedJobsTable)
    .values({
      id: params.data.id,
      title: job.title,
      company: job.company,
      location: job.location ?? null,
      description: job.description ?? null,
      url: job.url,
      matchScore: job.matchScore ?? null,
      matchReason: job.matchReason ?? null,
      postedAt: job.postedAt ?? null,
    })
    .onConflictDoUpdate({
      target: savedJobsTable.id,
      set: {
        title: job.title,
        company: job.company,
        location: job.location ?? null,
      },
    })
    .returning();

  res.json(
    SaveJobResponse.parse({
      ...saved,
      saved: true,
    })
  );
});

router.delete("/jobs/:id", async (req: Request, res: Response): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteJobParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(savedJobsTable).where(eq(savedJobsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
