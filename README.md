<!-- 🔥 HERO HEADER --> <p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=220&section=header&text=JobCrawler&fontSize=45&fontColor=ffffff&animation=fadeIn&fontAlignY=35" /> </p> <p align="center"> <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&size=24&center=true&vCenter=true&width=700&lines=AI-Powered+LinkedIn+Job+Search;Resume+Matching+Engine;Full-Stack+Production+App;Built+with+React+%2B+Node+%2B+AI" /> </p>
🚀 JobCrawler — AI-Powered LinkedIn Job Matching

A full-stack application that pulls job listings from LinkedIn, analyzes your resume, and assigns a match score (0–100) to each job based on how relevant it is to your profile.

I built this to explore how AI can be applied to real-world job search workflows and simplify the process of finding relevant opportunities.

Project Demo - https://job-crawler-xiw4.onrender.com/
⚡ Key Features

🔍 LinkedIn Job Search — Search jobs by role, keywords, or location

📄 Resume Upload — Upload a PDF or paste your resume text

🧠 AI Match Scoring — Generates a score with a clear explanation

💾 Auto Save System — Stores jobs using PostgreSQL

📊 CSV Export — Export saved jobs in one click

🌙 Modern UI — Clean, responsive dark interface

🧠 Why This Project Matters

This project helped me work on:

Integrating AI into a practical use case

Designing a full-stack application with a clean architecture

Handling external data sources with fallback strategies

Building a system that feels closer to a production-ready product

👉 More than just a demo, this is a working prototype of a job intelligence tool.

🏗️ Tech Stack
Layer	Technology
Frontend	React 19, Vite, Tailwind CSS v4, Framer Motion
Backend	Express 5, TypeScript, Node.js 20
Database	PostgreSQL (Neon) + Drizzle ORM
AI	OpenAI GPT-4o-mini
Dev Tools	pnpm (monorepo), Docker
📁 Project Structure
artifacts/
 ├── api-server/        # Express backend (port 8080)
 └── job-crawler/       # React frontend

lib/
 ├── db/                # Database schema & client
 ├── api-zod/           # Validation schemas
 └── api-client-react/  # API hooks

Dockerfile
docker-compose.yml
⚙️ Local Setup
1️⃣ Clone & Install
git clone https://github.com/your-username/your-repo.git
cd your-repo
pnpm install
2️⃣ Setup Database (Neon)

Create an account → https://neon.tech

Create a project and copy the connection string

3️⃣ Environment Variables
/lib/db/.env
DATABASE_URL=your_neon_db_url
/artifacts/api-server/.env
DATABASE_URL=your_neon_db_url
OPENAI_API_KEY=your_key
PORT=8080
/artifacts/job-crawler/.env
PORT=5173
BASE_PATH=/
4️⃣ Push Schema
pnpm --filter @workspace/db run push
5️⃣ Start Dev Servers
# Backend
pnpm --filter @workspace/api-server run dev

# Frontend
pnpm --filter @workspace/job-crawler run dev

👉 Open: http://localhost:5173

🐳 Docker Setup
cp .env.example .env
docker compose up --build

👉 Runs the full stack on port 8080

🚀 Deployment
🌐 Render (Recommended)

Works well with Docker setups

Just add environment variables and deploy

☁️ AWS

App Runner for quick setup

EC2 + Docker if you want more control

🚄 Railway

Simple GitHub integration

Automatic HTTPS

🔑 Environment Variables
Variable	Required	Description
DATABASE_URL	✅	PostgreSQL connection
OPENAI_API_KEY	✅	Used for AI scoring
STATIC_DIR	⚠️	Path to frontend build
PORT	✅	Server port
OPENAI_MODEL	❌	Optional model override
🔌 API Endpoints
Method	Endpoint	Description
GET	/api/healthz	Health check
GET	/api/jobs/search	Fetch jobs
GET	/api/jobs/saved	Retrieve saved
POST	/api/jobs/save	Save a job
DELETE	/api/jobs/:id	Remove a job
GET	/api/jobs/export	Export as CSV
POST	/api/resume	Save resume text
POST	/api/resume/upload	Upload resume PDF
⚠️ Notes

LinkedIn scraping isn’t always reliable, so fallback data is used when needed

AI scoring works only after a resume is provided

You can switch models using OPENAI_MODEL

🧠 Future Improvements

🔐 Add authentication

📈 Job insights and analytics

🤖 Improve scoring accuracy

📬 Notifications for new matches

💣 Final Thought

This project brings together AI, backend systems, and frontend engineering into a single workflow — something very close to how real-world products are built.

<p align="center"> ⭐ Star this repo if you found it useful </p>
