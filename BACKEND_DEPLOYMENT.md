# Backend deployment (Railway or Render)

The backend is a **Fastify + Prisma + PostgreSQL** API. It cannot run on Vercel (serverless). Deploy it on **Railway** or **Render**, then point the frontend’s `VITE_API_URL` to the backend URL.

---

## Required env vars

| Variable      | Required | Description                                      |
|---------------|----------|--------------------------------------------------|
| `DATABASE_URL`| Yes      | PostgreSQL URL (from Railway/Render Postgres)    |
| `JWT_SECRET`  | Yes      | At least 32 chars. Generate: `openssl rand -base64 32` |
| `PORT`        | No       | Set by Railway/Render (e.g. `4000`)              |
| `NODE_ENV`    | No       | `production` in prod                             |

---

## Option A: Railway (simplest)

### 1. Create project and Postgres

1. [railway.app](https://railway.app) → **New Project**
2. **Add service** → **Database** → **PostgreSQL**
3. Open the Postgres service → **Variables** → copy `DATABASE_URL`

### 2. Add backend service

1. **Add service** → **GitHub Repo** → select `productivity-app`
2. In the new service:
   - **Settings** → **Root Directory**: `backend`
   - **Settings** → **Build Command**: (leave default or set to) `npm install && npm run build`
   - **Settings** → **Start Command**: `npm run start:prod`
   - **Variables**:
     - `DATABASE_URL` = (paste from Postgres; or use **Variables** → **Add a variable** → **Add a reference** to `DATABASE_URL` from the Postgres service)
     - `JWT_SECRET` = output of `openssl rand -base64 32`

### 3. Get backend URL

1. **Settings** → **Networking** → **Generate Domain**
2. Copy the URL, e.g. `https://productivity-app-backend-production-xxxx.up.railway.app`

### 4. Point frontend to backend

In **Vercel** (frontend project):

- **Settings** → **Environment Variables**
- `VITE_API_URL` = `https://YOUR-RAILWAY-URL/api`  
  (must end with `/api`; the backend serves routes under `/api`)

Redeploy the frontend after changing `VITE_API_URL`.

---

## Option B: Render

### 1. Deploy with Blueprint (recommended)

1. [render.com](https://render.com) → **New** → **Blueprint**
2. Connect the `productivity-app` repo
3. Render reads `render.yaml` and creates:
   - Postgres DB (`productivity-db`)
   - Web service (`productivity-backend`) with `DATABASE_URL` linked
4. In the **productivity-backend** service:
   - **Environment** → **Add** → `JWT_SECRET` = `openssl rand -base64 32`
5. Deploy; note the backend URL, e.g. `https://productivity-backend.onrender.com`

### 2. Manual setup (without Blueprint)

1. **New** → **PostgreSQL**; create DB and copy **Internal Database URL** (or External if you need it).
2. **New** → **Web Service** → connect `productivity-app`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment**:
     - `DATABASE_URL` = Postgres URL
     - `JWT_SECRET` = `openssl rand -base64 32`
     - `NODE_ENV` = `production`
3. Create the service and copy its URL.

### 3. Point frontend to backend

In **Vercel**:

- `VITE_API_URL` = `https://YOUR-RENDER-URL/api`

Redeploy the frontend.

---

## Scripts used in deployment

- **Build**: `prisma generate && tsc` (runs as `npm run build`)
- **Start (prod)**: `prisma migrate deploy && node dist/index.js` (runs as `npm run start:prod`)  
  - Runs DB migrations, then starts the server.

---

## Check it works

1. **Health**: `https://YOUR-BACKEND-URL/api/health` → `{"status":"ok"}`
2. **Frontend**: Log in / use the app; it should call the backend with no “Unable to connect to the server” errors.

---

## CORS

The backend allows all origins (`origin: true`). For stricter security, you can later limit it to your Vercel frontend URL (e.g. via a `CORS_ORIGIN` env and code change).

---

## Local env (reference)

Copy `backend/env.example` to `backend/.env` and set `DATABASE_URL` and `JWT_SECRET` for local runs.
