# 🏥 AI Hospital Management System — Deployment Guide

This guide walks you through deploying the full-stack app:
- **Backend (FastAPI)** → [Render](https://render.com)
- **Frontend (React + Vite)** → [Vercel](https://vercel.com)

---

## ⚙️ Architecture Overview

```
Browser
  └── Vercel (frontend) ──HTTPS API calls──> Render (backend)
                                                  └── PostgreSQL DB (Render)
```

---

## 🔷 Step 1 — Deploy Backend to Render

### 1.1 Create a Render Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   | Setting | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### 1.2 Set Environment Variables in Render

Go to your Render service → **Environment** tab and add these:

| Key | Value | Notes |
|---|---|---|
| `ENV` | `production` | |
| `SECRET_KEY` | *(click "Generate")* | Must be a long random string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `11520` | 8 days |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | |
| `DEFAULT_ADMIN_EMAIL` | `admin@medos.com` | Admin login email |
| `DEFAULT_ADMIN_PASSWORD` | *(choose a strong password)* | **Keep secret!** |
| `DEFAULT_ADMIN_NAME` | `MedOS Administrator` | |
| `DATABASE_URL` | *(from Render PostgreSQL)* | See 1.3 below |
| `BACKEND_CORS_ORIGINS` | `https://YOUR-APP.vercel.app` | Set **after** frontend is deployed |
| `BACKEND_CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` | Covers all Vercel preview URLs |

> **Twilio / OpenAI** (optional — leave blank to disable):
> - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
> - `OPENAI_API_KEY`

### 1.3 Add a PostgreSQL Database (Recommended)

1. In Render → **New** → **PostgreSQL**
2. Copy the **Internal Database URL**
3. Paste it as the `DATABASE_URL` environment variable in your web service
4. Render will automatically create all tables on first startup

### 1.4 Note Your Backend URL

After deployment, your backend URL will be:
```
https://ai-hospital-backend.onrender.com   ← (your actual name will vary)
```
Copy this — you'll need it for the frontend.

---

## 🔶 Step 2 — Deploy Frontend to Vercel

### 2.1 Create a Vercel Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Set the **Root Directory** to `frontend` (or leave as root if using root vercel.json)
4. Framework will be auto-detected as **Vite**

### 2.2 Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**:

| Key | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://ai-hospital-backend.onrender.com` | Production, Preview, Development |

> ⚠️ **This is the most critical step.** Without `VITE_API_URL`, ALL login and registration calls will fail.

### 2.3 Redeploy

After setting the env var, trigger a new deployment:
- Vercel Dashboard → **Deployments** → **Redeploy** (top deployment)

---

## 🔗 Step 3 — Connect Frontend and Backend (CORS)

Once your Vercel frontend is deployed, you'll have a URL like:
```
https://ai-hospital-xyz.vercel.app
```

Go back to **Render** → your backend service → **Environment**:
1. Update `BACKEND_CORS_ORIGINS` to your exact Vercel URL:
   ```
   https://ai-hospital-xyz.vercel.app
   ```
2. Click **Save Changes** → Render will redeploy automatically

---

## ✅ Step 4 — Verify the Deployment

1. Visit your Vercel URL
2. **Test Registration**: Click "Register clinical profile" → create a patient account
3. **Test Login**: Login with the new account
4. **Test Admin Login**:
   - Email: `admin@medos.com`
   - Password: *(what you set as `DEFAULT_ADMIN_PASSWORD`)*
5. **Test API Health**: Visit `https://your-backend.onrender.com/health`

---

## 🛠️ Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

The `frontend/.env` already points `VITE_API_URL=http://localhost:8000` for local dev.

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Login fails in production | `VITE_API_URL` not set in Vercel | Add env var in Vercel dashboard |
| "Network Error" on login | CORS not configured or backend URL wrong | Check `BACKEND_CORS_ORIGINS` in Render |
| Backend gives 500 errors | Database not connected | Check `DATABASE_URL` in Render |
| "Cannot reach server" message | Render free tier sleeping (cold start) | Wait 30-60s and retry; upgrade to paid plan |
| Admin login fails | `DEFAULT_ADMIN_PASSWORD` not set | Check env vars in Render dashboard |
| Registration fails | Same as login — API URL or CORS issue | Repeat steps 2.2 and 3 |

---

## 🔐 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@medos.com` | *(set in Render: `DEFAULT_ADMIN_PASSWORD`)* |
| **Patient** | *(self-register)* | *(chosen during registration)* |
| **Doctor/Nurse/Staff** | *(created by admin)* | *(set by admin)* |

> ⚠️ Change `DEFAULT_ADMIN_PASSWORD` to something strong and keep it secret!
