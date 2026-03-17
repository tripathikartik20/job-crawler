# JobCrawler

A LinkedIn Job Crawler web application that lets users search LinkedIn jobs via web scraping, upload/paste their resume (PDF or text), and get AI-powered match scores ranking jobs by fit. Jobs are auto-saved to PostgreSQL and exportable as CSV.

## Architecture

### Monorepo Structure (pnpm workspaces)
- `artifacts/job-crawler/` — React + Vite frontend (port via PORT env var, preview path `/`)
- `artifacts/api-server/` — Express 5 backend (port 8080)
- `lib/db/` — Drizzle ORM + PostgreSQL schema and client
- `lib/api-zod/` — Shared Zod schemas (request/response validation)
- `lib/api-client-react/` — React Query hooks for API calls
- `lib/integrations-openai-ai-server/` — Replit OpenAI AI integration client

### Key Features
1. **LinkedIn Job Search** — axios + cheerio scraping with mock fallback when LinkedIn blocks
2. **Resume Upload** — PDF parsing via `pdf-parse` (multer multipart) or plain text paste
3. **AI Match Scoring** — GPT-4o-mini rates each job 0–100 against the resume with reasoning
4. **Auto-Save** — All searched jobs are saved to PostgreSQL (`saved_jobs` table)
5. **CSV Export** — Download all saved jobs as a CSV file
6. **Dark Theme** — Full dark mode with indigo primary palette

### Database (PostgreSQL via Replit)
- `resumes` table — stores the user's latest resume text
- `saved_jobs` table — stores crawled + matched jobs with scores

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (set by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI proxy base URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI proxy key

### Workflows
- `artifacts/api-server: API Server` — `pnpm --filter @workspace/api-server run dev`
- `artifacts/job-crawler: web` — `pnpm --filter @workspace/job-crawler run dev`

## Development Notes
- AI model: `gpt-4o-mini` for job-to-resume matching
- PDF parsing uses `createRequire` for CJS interop in ESM modules
- LinkedIn scraping uses realistic browser headers; falls back to mock data on block
- Frontend routes: `/` (redirects to `/search`), `/search`, `/saved`, `/resume`
