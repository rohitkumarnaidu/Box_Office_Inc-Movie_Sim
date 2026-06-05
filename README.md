# CineVerse: The Ultimate Movie Studio Tycoon

CineVerse is a sophisticated, full-stack movie studio simulation game where players step into the role of a Studio Head. Build your cinematic empire from the ground up, manage talent, greenlight scripts, and dominate the global box office.

## 🎬 Project Overview

CineVerse provides a deep simulation of the film industry. From the initial spark of a script idea to the high-stakes world of theatrical releases, every decision matters. Balance your budget, nurture talent careers, and react to shifting market trends to become a legendary studio.

## 🚀 Features

### 🏢 Studio Management
- **Financial Control:** Manage your studio's cash flow, weekly payroll, and project budgets.
- **Growth & Prestige:** Earn fans and increase your studio's reputation with every hit.

### 🎭 Talent Agency
- **Writers:** Discover and hire writers with varying stats (Quality, Originality, Audience Appeal).
- **Directors:** Assign visionary directors to bring your projects to life.
- **Actors & Crew:** Recruit top-tier lead actors and technical crew teams to ensure production quality.
- **Career Progression:** Watch your talent grow (or fade) based on movie performance.

### 🎥 Production Pipeline
- **Script Marketplace:** Browse and buy scripts ranging from Common to Legendary rarity.
- **Project Lifecycle:** Manage movies through Planning, Pre-Production, Production, and Post-Production stages.
- **Marketing:** Launch targeted campaigns (Trailer, TV, Digital) to build hype before release.

### 📊 Simulation & Results
- **Weekly Tick System:** A unified simulation engine that processes finances, production progress, and talent updates.
- **Dynamic Box Office:** Realistic earnings calculation based on quality, marketing, and genre appeal.
- **Critical Reviews:** Receive detailed scores from both critics and audiences.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Redux Toolkit (State Management), TailwindCSS (Styling), Lucide React (Icons).
- **Backend:** Node.js, Express, Mongoose (ODM).
- **Database:** MongoDB Atlas.
- **Deployment:** Vercel (Frontend & Backend).

## 💻 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`.
4. Start the development server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`.
4. Start the development server: `npm run dev`

## 🌍 Deployment Setup

CineVerse is optimized for deployment on **Vercel** with **MongoDB Atlas**.

### 1. MongoDB Atlas
- Create a new cluster and database.
- Whitelist `0.0.0.0/0` in Network Access.
- Obtain your Connection String.

### 2. Backend Deployment (Vercel)
- Deploy the `backend` folder as a new Vercel project.
- Configure Environment Variables:
  - `MONGO_URI`: Your Atlas string.
  - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secure random strings.
  - `CLIENT_URL`: The URL of your future frontend deployment.
  - `NODE_ENV`: `production`.

### 3. Frontend Deployment (Vercel)
- Deploy the `frontend` folder as a new Vercel project.
- Configure Environment Variables:
  - `VITE_BACKEND_API_URL`: The URL of your deployed backend (e.g., `https://api.cineverse.com/api`).

## 📁 Project Structure

```text
├── backend/
│   ├── api/            # Vercel Serverless Entry Point
│   ├── src/
│   │   ├── config/     # DB and Env config
│   │   ├── controllers/# Route handlers
│   │   ├── models/     # Mongoose Schemas
│   │   ├── routes/     # API Endpoints
│   │   ├── services/   # Simulation Engines & Logic
│   │   └── utils/      # Helpers
│   └── vercel.json     # Backend Vercel Config
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios & API client
│   │   ├── app/        # Redux Store
│   │   ├── components/ # UI Components
│   │   ├── features/   # Redux Slices
│   │   └── pages/      # Route Views
│   └── vercel.json     # Frontend Vercel Config
└── AUDIT_REPORT.md     # Detailed Deployment Audit
```

## 🛠 Available Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Starts development server (Frontend/Backend) |
| `npm run build` | Builds the frontend for production |
| `npm start` | Starts the backend production server |

## ❓ Troubleshooting

- **CORS Issues:** Ensure `CLIENT_URL` in the backend environment variables exactly matches your frontend deployment URL.
- **Cookie/Auth Failures:** In production, ensure both sites use HTTPS. The backend uses `secure: true` and `sameSite: 'none'` for cookies.
- **Database Connection:** Verify that your MongoDB Atlas IP Whitelist allows all connections (`0.0.0.0/0`) if using Vercel.

## 🗺 Future Roadmap

- **AI Studios:** Compete against procedurally generated rival studios.
- **Industry Simulation:** Market trends, genre booms, and seasonal events.
- **Awards Season:** Win prestigious awards for high-quality productions.
- **Franchise System:** Build sequels and cinematic universes.

## 🌟 ELUSOC 2026 Contribution Guide

CineVerse is proud to be a participating project in ELUSOC 2026! We welcome contributions from developers of all skill levels.

### ⚠️ Important Rules
- **Target Branch:** All Pull Requests must target the `elusoc` branch. The `main` branch is reserved for stable releases.
- **Issue Assignment:** You **must** request assignment on an issue and wait for approval before starting any work. Work submitted without assignment will not be merged.
- **No Duplicates:** Check existing issues before opening a new one.

### 🛠 How to Contribute
1. Browse [Open Issues](https://github.com/your-repo/cineverse/issues).
2. Request assignment in the comments.
3. Once assigned, fork the repo and create a branch from `elusoc`.
4. Follow the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md).

## 🌍 Open Source

CineVerse is an open-source project licensed under the [MIT License](LICENSE). We believe in the power of community-driven development to create the best possible movie studio simulation experience.

## 🤝 Contributions

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Labels Explanation
- `bug`: Something isn't working correctly.
- `enhancement`: New feature or request.
- `documentation`: Improvements or additions to documentation.
- `good first issue`: Ideal for beginners.
- `help wanted`: Extra attention needed.
- `elusoc`: Specifically for ELUSOC 2026 participants.
