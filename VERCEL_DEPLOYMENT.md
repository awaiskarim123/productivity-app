# Vercel Deployment: Frontend + Backend

## Overview

- **Frontend (SvelteKit)**: Deployed on **Vercel** using `@sveltejs/adapter-vercel` and Build Output API.
- **Backend (Fastify + Prisma)**: Long‑running Node server with WebSockets and a DB — **cannot run on Vercel**. Deploy it on **Railway**, **Render**, **Fly.io**, or similar.

---

## 1. Frontend on Vercel

### How It Works

- **Build from repo root** (no Root Directory override).
- **Install**: `cd frontend && npm install` (frontend deps only).
- **Build**: `npm run vercel:build`:
  1. Builds SvelteKit in `frontend/` → creates `frontend/.vercel/output` (Build Output API).
  2. Copies `frontend/.vercel/output` to `./.vercel/output` at repo root so Vercel finds it.

### Vercel Dashboard

1. **Root Directory**: leave **blank** (use repo root).
2. **Build & Development** (if you override in `vercel.json`, these are optional):
   - **Framework Preset**: SvelteKit or blank (auto from Build Output API).
   - **Output Directory**: leave **blank**.
3. **Node.js Version**: 20.x (from `.nvmrc` or `package.json` engines).

### Environment Variables (Vercel)

Set in **Project → Settings → Environment Variables**:

| Name           | Value                      | Notes                                      |
|----------------|----------------------------|--------------------------------------------|
| `VITE_API_URL` | `https://your-api.com/api` | Backend base URL including `/api` path.    |

Replace `https://your-api.com` with your deployed backend URL (e.g. `https://your-app.railway.app` if the backend serves under `/api`).

### Verifying the Frontend Build

- `vercel:build` only builds the frontend and copies `.vercel/output` to the root. No `public` folder is used; the adapter emits Build Output API.

---

## 2. Backend Deployment

The backend cannot run on Vercel. Deploy it on **Railway** or **Render**, then set `VITE_API_URL` on Vercel.

**→ Step-by-step: [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)**

Summary:
- **Build**: `npm install && npm run build` (includes `prisma generate`)
- **Start**: `npm run start:prod` (runs `prisma migrate deploy` then `node dist/index.js`)
- **Env**: `DATABASE_URL`, `JWT_SECRET` (see `backend/env.example`)
- **API base path**: `/api` → set `VITE_API_URL` = `https://YOUR-BACKEND-URL/api`

---

## 3. Wiring Frontend and Backend

1. Deploy the **backend** first and note its base URL (e.g. `https://your-api.railway.app`).
2. In the backend, ensure the API is mounted at `/api` (or whatever your Fastify setup uses).
3. In **Vercel**, set:
   - `VITE_API_URL` = `https://your-api.railway.app/api` (or `https://.../api` to match your routes).
4. Redeploy the frontend on Vercel so the new `VITE_API_URL` is baked into the build.

The frontend uses `VITE_API_URL` in `frontend/src/lib/config.ts`; it defaults to `http://localhost:4000/api` for local dev.

---

## 4. Project Scripts

| Script          | Purpose                                                                 |
|-----------------|-------------------------------------------------------------------------|
| `vercel:build`  | Frontend build + copy `frontend/.vercel/output` → `./.vercel/output`    |
| `build`         | Frontend + backend (for local or CI; not used by Vercel)                |
| `install:all`   | Installs deps in `frontend` and `backend` (e.g. for local `npm install`)|

---

## 5. Troubleshooting

### "No Output Directory named 'public' found"

- The app uses Build Output API (`.vercel/output`), not `public`.
- Fix: `vercel:build` must run and copy `frontend/.vercel/output` to `./.vercel/output`. Ensure `vercel.json` uses `"buildCommand": "npm run vercel:build"` and that the root `vercel:build` script is present.

### "vite: command not found"

- Install must run in `frontend`. `vercel.json` uses `"installCommand": "cd frontend && npm install"`. Do not set Root Directory to `frontend` if you rely on `vercel:build` copying from `frontend/` to root.

### "Unable to connect to the server" / Frontend cannot reach the API

- **Backend not deployed**: The backend runs on Railway/Render, not Vercel. Follow **[BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)** to deploy it first.
- **`VITE_API_URL`**: In Vercel → Project → Settings → Environment Variables, set `VITE_API_URL` = `https://YOUR-BACKEND-URL/api` (must end with `/api`). Redeploy the frontend after changing it.
- **Backend running**: Open `https://YOUR-BACKEND-URL/api/health` in a browser; it should return `{"status":"ok"}`.
- **CORS**: The backend allows all origins by default; if you restricted it, ensure the Vercel frontend origin is allowed.

### Backend DB / Prisma errors in production

- `DATABASE_URL` must be set where the backend runs (Railway/Render/Fly.io).
- Run `npx prisma migrate deploy` (or your migration strategy) as part of the backend build or release step.
