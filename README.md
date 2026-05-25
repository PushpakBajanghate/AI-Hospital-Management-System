# AI-Powered Smart Hospital Management System (MedOS)

Welcome to the initial project architecture setup for your AI-Powered Smart Hospital Management System. This project is structured as a scalable **Modular Monolith**, designed to be highly maintainable, beginner-friendly, and simple to run using Docker Compose.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router v6, Axios, Tailwind CSS (configured for Shadcn UI).
- **Backend**: FastAPI, SQLAlchemy (declarative base, connection pooled), Pydantic Settings.
- **Database**: PostgreSQL (Dockerized).
- **Orchestration**: Docker Compose for single-command stack launch.

---

## 📁 Clean Folder Structure

```
AI Hospital Management System/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (endpoints)
│   │   ├── core/         # Settings configuration, database session setup
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── services/     # Business logic & AI integration layers
│   │   ├── __init__.py
│   │   └── main.py       # FastAPI app initialization
│   ├── Dockerfile
│   ├── requirements.txt  # Dependencies list
│   └── .env.example      # Backend secrets template
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/       # Static assets
│   │   ├── components/   # UI elements
│   │   ├── context/      # Theme/Auth contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Sidebar & Header layouts
│   │   ├── pages/        # Dashboard, Patient List, Diagnostic page components
│   │   ├── services/     # HTTP / Axios clients
│   │   ├── App.jsx       # App entry shell & React Router routes
│   │   ├── index.css     # CSS variables & Tailwind config
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json      # Dependencies and scripts
│   ├── vite.config.js    # Path aliases resolution (@/*)
│   ├── tailwind.config.js
│   └── .env.example
├── docker-compose.yml    # Development stack orchestrator
├── .gitignore
├── .env.example          # Multi-container root configurations
└── README.md
```

---

## 🚀 Running the Project Locally

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Launching the Stack
From the workspace root directory, run:
```bash
docker-compose up --build
```
This single command will:
1. Spin up the **PostgreSQL** database service and run a self-healing health check.
2. Build and launch the **FastAPI** backend on [http://localhost:8000](http://localhost:8000) (interactive Swagger docs available at [http://localhost:8000/docs](http://localhost:8000/docs)).
3. Build and launch the **React + Vite** frontend on [http://localhost:5173](http://localhost:5173).

---

## 🐙 Push to GitHub Guide

Follow these steps to link this project to your GitHub account and push it:

1. **Initialize Git repository locally** (already done if initialized by agent):
   ```bash
   git init
   git add .
   git commit -m "chore: initial modular monolith architecture setup"
   ```

2. **Create a remote repository on GitHub**:
   - Go to [GitHub](https://github.com/new) and create a new repository called `ai-hospital-management-system`.
   - Leave "Initialize this repository with..." options unchecked.

3. **Add the remote origin & push**:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ai-hospital-management-system.git
   git branch -M main
   git push -u origin main
   ```
