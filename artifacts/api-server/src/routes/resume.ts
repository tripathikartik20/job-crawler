import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { db, resumesTable } from "@workspace/db";
import {
  GetResumeResponse,
  SaveResumeBody,
  SaveResumeResponse,
} from "@workspace/api-zod";

// Lazy-load pdf-parse: dynamic import works in ESM (dev) and is converted to
// a deferred require() by esbuild in the CJS production bundle.
let _pdfParse: ((buf: Buffer) => Promise<{ text: string }>) | null = null;
async function getPdfParse() {
  if (!_pdfParse) {
    const mod = await import("pdf-parse");
    _pdfParse = (mod.default ?? mod) as (buf: Buffer) => Promise<{ text: string }>;
  }
  return _pdfParse;
}

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/resume", async (_req: Request, res: Response): Promise<void> => {
  const [resume] = await db
    .select()
    .from(resumesTable)
    .orderBy(resumesTable.updatedAt)
    .limit(1);

  if (!resume) {
    res.status(404).json({ error: "No resume found" });
    return;
  }

  res.json(GetResumeResponse.parse(resume));
});

router.post("/resume", async (req: Request, res: Response): Promise<void> => {
  const parsed = SaveResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(resumesTable).limit(1);
  let resume;

  if (existing.length > 0) {
    const [updated] = await db
      .update(resumesTable)
      .set({ content: parsed.data.content })
      .returning();
    resume = updated;
  } else {
    const [inserted] = await db
      .insert(resumesTable)
      .values({ content: parsed.data.content })
      .returning();
    resume = inserted;
  }

  res.json(SaveResumeResponse.parse(resume));
});

router.post(
  "/resume/upload",
  upload.single("resume"),
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    if (req.file.mimetype !== "application/pdf") {
      res.status(400).json({ error: "Only PDF files are supported" });
      return;
    }

    let text: string;
    try {
      const pdfParse = await getPdfParse();
      const result = await pdfParse(req.file.buffer);
      text = result.text.trim();
    } catch {
      res
        .status(400)
        .json({ error: "Failed to parse PDF. Please ensure it's a valid PDF file." });
      return;
    }

    if (text.length < 50) {
      res
        .status(400)
        .json({ error: "Could not extract enough text from the PDF. Try a different file." });
      return;
    }

    const existing = await db.select().from(resumesTable).limit(1);
    let resume;

    if (existing.length > 0) {
      const [updated] = await db
        .update(resumesTable)
        .set({ content: text })
        .returning();
      resume = updated;
    } else {
      const [inserted] = await db
        .insert(resumesTable)
        .values({ content: text })
        .returning();
      resume = inserted;
    }

    res.json(SaveResumeResponse.parse({ ...resume, content: text }));
  }
);

export default router;
