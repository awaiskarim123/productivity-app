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

## 2. Backend Deployment (Railway, Render, Fly.io, etc.)

The backend is a **Fastify** app with **Prisma**, **WebSockets**, and a DB. It must run as a **long‑running process**, not as serverless.

### Suggested: Railway

1. Create a project and connect the repo.
2. Set **Root Directory** to `backend`.
3. **Build**: `npm install && npx prisma generate && npm run build`
4. **Start**: `npm run start` (runs `node dist/index.js`)
5. Add a **Postgres** (or your DB) service and set `DATABASE_URL`.
6. Set other env vars (e.g. `JWT_SECRET`, `PORT`).
7. Expose the service (e.g. `https://your-app.railway.app`) and ensure the API is under `/api` or adjust your Fastify base path.

### Render

1. New **Web Service**, connect repo, **Root Directory**: `backend`.
2. **Build**: `npm install && npx prisma generate && npm run build`
3. **Start**: `npm start`
4. Add **Postgres** and `DATABASE_URL`, plus `JWT_SECRET`, `PORT`, etc.

### Fly.io

1. `fly launch` in `backend/` (or from root with `--config` in `backend/`).
2. Add Postgres: `fly postgres create` and attach.
3. Set `DATABASE_URL`, `JWT_SECRET`, `PORT` in `fly secrets` or in `fly.toml` env.
4. **Build** and **Start** as above.

### CORS

Configure CORS in the backend to allow your Vercel frontend origin, e.g.:

- `https://your-project.vercel.app`
- `https://your-domain.com`

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

### Frontend cannot reach the API

- Check `VITE_API_URL` on Vercel (must include `/api` if that’s your base path).
- Check backend CORS allows the Vercel (and prod) origins.
- Ensure the backend is running and reachable at the URL used in `VITE_API_URL`.

### Backend DB / Prisma errors in production

- `DATABASE_URL` must be set where the backend runs (Railway/Render/Fly.io).
- Run `npx prisma migrate deploy` (or your migration strategy) as part of the backend build or release step.
