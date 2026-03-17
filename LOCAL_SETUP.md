# Local Setup Guide

This project is a pnpm monorepo with a React + Vite frontend, Express backend, and PostgreSQL (Neon) database.

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- A [Neon](https://neon.tech) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key

---

## 1. Clone / Download the code

If you downloaded from Replit as a ZIP, extract it, then:

```bash
cd <project-folder>
```

---

## 2. Install dependencies

```bash
pnpm install
```

---

## 3. Create a Neon database

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Copy the **Connection string** (looks like `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)

---

## 4. Set environment variables

Create `.env` files from the examples:

**`lib/db/.env`**
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

**`artifacts/api-server/.env`**
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
OPENAI_API_KEY=sk-...
PORT=8080
```

**`artifacts/job-crawler/.env`**
```
PORT=5173
BASE_PATH=/
VITE_API_URL=http://localhost:8080
```

---

## 5. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This creates the `resumes` and `saved_jobs` tables in your Neon database.

---

## 6. Start the servers

Open two terminal tabs:

**Terminal 1 — API server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/job-crawler run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How it works

| Part | Tech | Port |
|------|------|------|
| Frontend | React + Vite + Tailwind | 5173 |
| Backend | Express 5 + TypeScript | 8080 |
| Database | PostgreSQL via Drizzle ORM | Neon (remote) |
| AI | OpenAI gpt-4o-mini | via API |

---

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jobs/search` | Search LinkedIn jobs |
| GET | `/api/jobs/saved` | List saved jobs |
| POST | `/api/jobs/save` | Save a job |
| DELETE | `/api/jobs/:id` | Delete a saved job |
| GET | `/api/jobs/export` | Export saved jobs as CSV |
| GET | `/api/resume` | Get saved resume |
| POST | `/api/resume` | Save resume (text) |
| POST | `/api/resume/upload` | Upload PDF resume |

---

## Notes

- LinkedIn scraping may be blocked; the app falls back to realistic mock data automatically
- The AI match scoring only runs when a resume is saved — upload yours on the Resume page first
- `OPENAI_MODEL` env var lets you override the model (default: `gpt-4o-mini`)
