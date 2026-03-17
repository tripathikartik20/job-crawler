<!-- 🔥 HERO HEADER -->

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=220&section=header&text=JobCrawler&fontSize=45&fontColor=ffffff&animation=fadeIn&fontAlignY=35" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&size=24&center=true&vCenter=true&width=700&lines=AI-Powered+LinkedIn+Job+Search;Resume+Matching+Engine;Full-Stack+Production+App;Built+with+React+%2B+Node+%2B+AI" />
</p>

---

# 🚀 JobCrawler — AI-Powered LinkedIn Job Matching

A full-stack application that **crawls LinkedIn jobs**, analyzes your resume, and uses AI to **score and rank jobs (0–100)** based on how well they match your profile.

> 💡 Built to simulate real-world AI-driven recruitment and job intelligence systems.

---

# **Project Demo**  
https://job-crawler-xiw4.onrender.com/

# ⚡ Key Features

* 🔍 **LinkedIn Job Search** — Search by role, keywords, and location
* 📄 **Resume Upload** — PDF upload or raw text input
* 🧠 **AI Match Scoring** — GPT-powered scoring + human-readable explanations
* 💾 **Auto Save System** — Persistent job storage (PostgreSQL)
* 📊 **CSV Export** — Export saved jobs instantly
* 🌙 **Modern Dark UI** — Fully responsive & clean UX

---

# 🧠 Why This Project Matters

This project demonstrates:

* Real-world **AI integration (OpenAI)**
* Full-stack architecture with **scalable backend + modern frontend**
* Handling **external scraping + fallback systems**
* Designing **production-ready systems with persistence & exports**

👉 Not just a project — this is a **mini job intelligence platform**

---

# 🏗️ Tech Stack

| Layer     | Technology                                     |
| --------- | ---------------------------------------------- |
| Frontend  | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend   | Express 5, TypeScript, Node.js 20              |
| Database  | PostgreSQL (Neon) + Drizzle ORM                |
| AI        | OpenAI GPT-4o-mini                             |
| Dev Tools | pnpm (monorepo), Docker                        |

---

# 📁 Project Structure

```
artifacts/
 ├── api-server/        # Express backend (port 8080)
 └── job-crawler/       # React frontend

lib/
 ├── db/                # Database schema & client
 ├── api-zod/           # Validation schemas
 └── api-client-react/  # API hooks

Dockerfile
docker-compose.yml
```

---

# ⚙️ Local Setup

## 1️⃣ Clone & Install

```
git clone https://github.com/your-username/your-repo.git
cd your-repo
pnpm install
```

## 2️⃣ Setup Database (Neon)

* Create account → https://neon.tech
* Create project → copy connection string

## 3️⃣ Environment Variables

### `/lib/db/.env`

```
DATABASE_URL=your_neon_db_url
```

### `/artifacts/api-server/.env`

```
DATABASE_URL=your_neon_db_url
OPENAI_API_KEY=your_key
PORT=8080
```

### `/artifacts/job-crawler/.env`

```
PORT=5173
BASE_PATH=/
```

---

## 4️⃣ Push Schema

```
pnpm --filter @workspace/db run push
```

## 5️⃣ Start Dev Servers

```
# Backend
pnpm --filter @workspace/api-server run dev

# Frontend
pnpm --filter @workspace/job-crawler run dev
```

👉 Open: http://localhost:5173

---

# 🐳 Docker Setup

```
cp .env.example .env
docker compose up --build
```

👉 Runs full stack on **port 8080**

---

# 🚀 Deployment

## 🌐 Render (Recommended)

* Auto-detects Docker
* Set env variables
* Deploy → get HTTPS URL

## ☁️ AWS

* App Runner → easiest
* EC2 + Docker → full control

## 🚄 Railway

* One-click GitHub deploy
* Auto HTTPS

---

# 🔑 Environment Variables

| Variable       | Required | Description              |
| -------------- | -------- | ------------------------ |
| DATABASE_URL   | ✅        | PostgreSQL connection    |
| OPENAI_API_KEY | ✅        | AI scoring               |
| STATIC_DIR     | ⚠️       | Production frontend path |
| PORT           | ✅        | Server port              |
| OPENAI_MODEL   | ❌        | Optional model override  |

---

# 🔌 API Endpoints

| Method | Endpoint           | Description    |
| ------ | ------------------ | -------------- |
| GET    | /api/healthz       | Health check   |
| GET    | /api/jobs/search   | Search jobs    |
| GET    | /api/jobs/saved    | Get saved jobs |
| POST   | /api/jobs/save     | Save job       |
| DELETE | /api/jobs/:id      | Delete job     |
| GET    | /api/jobs/export   | Export CSV     |
| POST   | /api/resume        | Save resume    |
| POST   | /api/resume/upload | Upload PDF     |

---

# ⚠️ Notes

* LinkedIn scraping may fail → app uses fallback mock data
* AI scoring activates only after resume upload
* Model can be changed via `OPENAI_MODEL`

---

# 🧠 Future Improvements

* 🔐 Authentication system
* 📈 Job trend analytics
* 🤖 Better AI ranking models
* 📬 Email alerts for matched jobs

---

# 💣 Final Thought

> This project combines **AI + scraping + full-stack engineering**
> — exactly what modern production systems look like.

---

<p align="center">
  ⭐ Star this repo if you found it useful
</p>
