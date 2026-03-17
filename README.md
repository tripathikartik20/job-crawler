JobCrawler — LinkedIn Job Search with AI Matching
A full-stack web application that crawls LinkedIn for job listings, parses your resume (PDF or text), and uses AI to score and rank each job by how well it fits your background.

Unsupported image

Features
LinkedIn Job Search — Search jobs by title, keywords, and location
Resume Upload — Drag-and-drop a PDF or paste plain text
AI Match Scoring — Each job is scored 0–100 against your resume using GPT-4o-mini, with a plain-English explanation
Auto-Save — All results are saved to a PostgreSQL database
CSV Export — Download your saved jobs as a spreadsheet
Dark UI — Clean, responsive dark theme with mobile support
Tech Stack
Layer	Technology
Frontend	React 19, Vite, Tailwind CSS v4, Framer Motion
Backend	Express 5, TypeScript, Node.js 20
Database	PostgreSQL (Neon serverless) + Drizzle ORM
AI	OpenAI GPT-4o-mini
Package Manager	pnpm (monorepo)
Deployment	Docker
Project Structure
├── artifacts/
│   ├── api-server/        # Express backend (port 8080)
│   └── job-crawler/       # React + Vite frontend
├── lib/
│   ├── db/                # Drizzle ORM schema & client
│   ├── api-zod/           # Shared Zod validation schemas
│   └── api-client-react/  # React Query API hooks
├── Dockerfile             # Single-container build (frontend + backend)
├── docker-compose.yml     # Local Docker testing
└── LOCAL_SETUP.md         # Local development guide
Prerequisites
Node.js 20+
pnpm 10+ — npm install -g pnpm
Neon account (free tier) — for PostgreSQL
OpenAI API key
Local Development Setup
1. Clone and install
git clone https://github.com/your-username/your-repo.git
cd your-repo
pnpm install
2. Create a Neon database
Sign up at neon.tech
Create a new project
Copy the Connection string from the dashboard
3. Configure environment variables
Create lib/db/.env:

DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
Create artifacts/api-server/.env:

DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
OPENAI_API_KEY=sk-...
PORT=8080
Create artifacts/job-crawler/.env:

PORT=5173
BASE_PATH=/
4. Push database schema
pnpm --filter @workspace/db run push
5. Start the dev servers
Open two terminals:

# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev
# Terminal 2 — Frontend
pnpm --filter @workspace/job-crawler run dev
Open http://localhost:5173

Docker (Local Testing)
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENAI_API_KEY
docker compose up --build
Open http://localhost:8080

Deploying to Render (Recommended)
Render automatically detects the Dockerfile and builds a single container serving both the API and the frontend.

Steps
Push your code to GitHub

Go to render.com → New → Web Service → Connect your GitHub repo

Configure the service:

Environment: Docker
Port: 8080
Add environment variables in the Render dashboard:

Key	Value
DATABASE_URL	postgresql://...neon.tech/...?sslmode=require
OPENAI_API_KEY	sk-...
STATIC_DIR	/app/public
PORT	8080
Deploy — Render builds the Docker image and gives you a public HTTPS URL

Run the database migration (once)
After your first deploy, run the schema push from your local machine pointing at your Neon database:

DATABASE_URL="your-neon-connection-string" pnpm --filter @workspace/db run push
Deploying to AWS
Option A — AWS App Runner (easiest)
Push code to GitHub
Open AWS App Runner → Create service → Source: GitHub
Runtime: Docker
Port: 8080
Add the same 4 environment variables listed above
Deploy — App Runner handles scaling and HTTPS automatically
Option B — EC2 with Docker
# On your EC2 instance
sudo apt install docker.io git -y
sudo systemctl start docker
# Clone or upload your repo
git clone https://github.com/your-username/your-repo.git
cd your-repo
cp .env.example .env
nano .env   # fill in your values
sudo docker build -t job-crawler .
sudo docker run -d --env-file .env -p 80:8080 --restart always job-crawler
Deploying to Railway
Push code to GitHub
Go to railway.app → New Project → Deploy from GitHub repo
Railway auto-detects the Dockerfile
Add the 4 environment variables in the Railway dashboard
Done — Railway provides a public URL with HTTPS
Environment Variables Reference
Variable	Required	Description
DATABASE_URL	Yes	PostgreSQL connection string
OPENAI_API_KEY	Yes	OpenAI API key for AI job matching
STATIC_DIR	Yes (production)	Path to built frontend files (/app/public in Docker)
PORT	Yes	Server port (use 8080)
OPENAI_MODEL	No	Override AI model (default: gpt-4o-mini)
API Endpoints
Method	Path	Description
GET	/api/healthz	Health check
GET	/api/jobs/search?q=...&location=...	Search LinkedIn jobs
GET	/api/jobs/saved	List saved jobs
POST	/api/jobs/save	Save a job
DELETE	/api/jobs/:id	Delete a saved job
GET	/api/jobs/export	Export saved jobs as CSV
GET	/api/resume	Get saved resume
POST	/api/resume	Save resume text
POST	/api/resume/upload	Upload PDF resume
Notes
LinkedIn scraping may be rate-limited or blocked by LinkedIn. The app automatically falls back to realistic mock data when this happens, so the UI always works.
AI matching only activates after you upload a resume on the Resume page.
The OPENAI_MODEL env var lets you use a different model (e.g., gpt-4o for higher quality at higher cost).
License
MIT

