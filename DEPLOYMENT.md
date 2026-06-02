# Deployment Guide

This project is easiest to deploy as two services:

- Backend: Render web service running FastAPI from `backend/`
- Frontend: Vercel static Vite app running from `frontend/`

## 1. Deploy The Backend On Render

1. Push this repository to GitHub.
2. In Render, create a PostgreSQL database.
3. Copy the database's internal connection string.
4. Create a new Web Service from the same GitHub repository.
5. Use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | `Python` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

6. Add these Render environment variables:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Render PostgreSQL internal connection string |
| `ENV` | `production` |
| `SECRET_KEY` | A long random secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `11520` |
| `BACKEND_CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` |

After deploy, open:

```text
https://your-render-service.onrender.com/health
```

It should return a healthy API response.

## 2. Deploy The Frontend On Vercel

1. In Vercel, import the same GitHub repository.
2. Use these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

3. Add this Vercel environment variable:

| Key | Value |
| --- | --- |
| `VITE_API_URL` | Your Render backend URL, for example `https://your-render-service.onrender.com` |

4. Deploy.

The frontend includes `frontend/vercel.json`, so refreshing nested React routes works in any browser.

## Local Development

Backend:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
```

Local frontend requests use the Vite proxy in `frontend/vite.config.js`.
