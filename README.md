# 🏥 MedOS: AI-Powered Smart Hospital Management System

MedOS is a state-of-the-art, premium healthcare administration portal built as a highly scalable **Modular Monolith**. It is designed to be highly maintainable, modern, visually stunning, and simple to run out of the box using SQLite or PostgreSQL.

The system combines secure role-based access control, clinical bed allocations, real-time simulated Twilio SMS notifications, a high-fidelity virtual telemedicine desk, and an advanced **AI Clinical Assistant** powered by neural suggestion pipelines.

---

## 🎨 Design & Aesthetic Highlights
MedOS features a custom-designed clinical dashboard with premium UX aesthetics:
* **Glassmorphic Mesh Backgrounds**: Vibrant glows and clean backdrop-blur overlays.
* **Harmonious Dark/Light Palette**: HSL-tailored colors built on a premium slate-teal slate-indigo design system.
* **Micro-Animations**: Hover-scaling cards, active-ping notifications, and swinging bell indicators.
* **attending Breadcrumbs**: Dynamic timeline breadcrumbs representing the clinical route.

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Framework**: React.js (v18) + React Router v6
* **Bundler**: Vite (fully optimized with fast HMR)
* **Styling**: Tailwind CSS + Custom CSS Variables + CSS Layers
* **Icons**: Lucide React (featherlight, crisp SVGs)
* **Networking**: Axios HTTP client with unified request/response interceptors

### Backend Architecture
* **Framework**: FastAPI (Asynchronous Python ASGI)
* **Database ORM**: SQLAlchemy (Declarative Base, connection pooling)
* **Configuration**: Pydantic Settings (Environment validation)
* **Security**: JWT Bearer Tokens + Passlib (Bcrypt hashing) + Role Guards
* **Task Scheduling**: Asynchronous background cron poller for pending SMS delivery
* **SMS Gateway**: Twilio Integration (with automatic Sandbox mock fallback)
* **Intelligence**: OpenAI API (Custom dossier translation and suggestion engine)

---

## 📁 Clean Folder Structure

```
AI Hospital Management System/
├── backend/
│   ├── app/
│   │   ├── api/                  # Route handlers and API endpoints
│   │   │   ├── v1/               # Version 1 API routes
│   │   │   │   ├── endpoints/    # Auth, Patients, Appointments, Beds, etc.
│   │   │   │   └── api.py        # Centralized APIRouter registration
│   │   │   └── deps.py           # Dependency injection (JWT, Roles verification)
│   │   ├── core/                 # App core settings, security, and database sessions
│   │   ├── models/               # SQLAlchemy ORM relational models
│   │   ├── schemas/              # Pydantic schemas for request/response serialization
│   │   ├── services/             # Core business logic (AI assistant, SMS scheduling)
│   │   │   ├── ai_service.py     # OpenAI integration logic
│   │   │   ├── scheduler.py      # Background SMS cron poller
│   │   │   └── twilio_service.py # Twilio SMS client (with sandbox auto-fallback)
│   │   └── main.py               # FastAPI application initialization & DB seeder
│   ├── Dockerfile
│   ├── requirements.txt          # Python packages list
│   └── .env.example              # Template for backend variables
│
├── frontend/
│   ├── public/                   # Static browser assets
│   ├── src/
│   │   ├── assets/               # Local static styles/logos
│   │   ├── components/           # UI elements (Toast alerts, Protected Routes)
│   │   ├── context/              # Context providers (AuthContext, Theme states)
│   │   ├── hooks/                # Custom reusable React hooks
│   │   ├── pages/                # Page components:
│   │   │   ├── Analytics.jsx     # Clinical statistics and SVG charts
│   │   │   ├── Appointments.jsx  # Doctor bookings and token queuing
│   │   │   ├── BedManagement.jsx # ICU & general bed allocation dashboard
│   │   │   ├── Billing.jsx       # EMR invoice generation
│   │   │   ├── DoctorDashboard.jsx # Practitioner queue and clinical portal
│   │   │   ├── Insurance.jsx     # Claims and policy verification
│   │   │   ├── Login.jsx         # Secure authentication gate
│   │   │   ├── Notifications.jsx # Twilio SMS Hub (Instant & Scheduled alerts)
│   │   │   ├── PatientsList.jsx  # Integrated Patient ledger & EMR files
│   │   │   └── Telemedicine.jsx  # High-fidelity video call & live patient chat
│   │   ├── App.jsx               # Navigation Shell, Breadcrumbs, & router
│   │   ├── index.css             # Tailwind Directives & CSS Design System
│   │   └── main.jsx              # DOM client mounting point
│   ├── Dockerfile
│   ├── package.json              # NPM dependencies & running scripts
│   ├── postcss.config.js         # PostCSS configuration for compiling Tailwind
│   ├── tailwind.config.js        # Tailwind layout theme & font tokens
│   └── vite.config.js            # Path alias configurations (@/*)
│
├── docker-compose.yml            # Multi-container local deployment file
└── README.md                     # Central project instruction manual
```

---

## 🚀 Running the Project Locally

### 1. Zero-Config Local Setup (Recommended)
This setup runs without requiring Docker or any external PostgreSQL installation, using a local SQLite file (`hospital.db`).

#### Backend Setup:
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   *(By default, `DATABASE_URL` is set to `sqlite:///./hospital.db` which is fully pre-configured).*
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The interactive backend documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

#### Frontend Setup:
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Copy the frontend variables:
   ```bash
   cp .env.example .env
   ```
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.

---

### 🐳 2. Running via Docker Compose
If you have Docker Desktop running locally, you can spin up the entire multi-container stack (including a dedicated PostgreSQL database) in a single command.

From the root workspace directory, run:
```bash
docker-compose up --build
```
This orchestrates:
* **PostgreSQL Service** on port `5432` (with database health checks).
* **FastAPI Backend Service** on [http://localhost:8000](http://localhost:8000).
* **React Frontend Service** on [http://localhost:5173](http://localhost:5173).

---

## 🛠️ Troubleshooting & Browser Support

### Why does the page open in Incognito but look broken or blank in normal browsing mode?
If you can view the styled portal in Incognito, but your normal browser is either blank or unstyled, this is caused by:

1. **Stale Asset Cache (Highly Common)**:
   Modern browsers cache static scripts on `localhost` extremely aggressively. If you loaded the page before Tailwind compilation or ESM configurations were resolved, the browser cached the unstyled HTML/JS.
   * **Fix**: Force-clear your browser cache by pressing `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac). Alternatively, open your browser's Developer Tools (`F12`), right-click the refresh button, and select **Empty Cache and Hard Reload**.
2. **Local Network / Port Blocking Extensions**:
   Some ad-blockers (such as *uBlock Origin* or *Brave Shields*) treat cross-port calls (`http://localhost:5173` making requests to `http://localhost:8000`) as potential local trackers. Additionally, URLs containing words like `admissions` or `analytics` can trigger privacy filter rules.
   * **Fix**: Temporarily pause your ad-blocker or whitelist `http://localhost:5173` in your extension settings.
3. **Private Window Storage Safety**:
   In older builds, restrictive private browsing settings that deny `localStorage` read/write access caused React to crash on mount. MedOS now implements `safeLocalStorage` wrappers. If storage is blocked, the app automatically switches to secure memory storage, keeping all pages active!

---

## 🧬 Functional Modules Walkthrough

### 🏥 Hospital Control Center (Dashboard)
A master Command Center mapping total registered patients, bed occupancies, and weekly treatment queue levels represented via custom-rendered SVG vector bar graphs.

### 👥 Patients Ledger
A comprehensive EMR database. Clinical practitioners can register new outpatients, record historical diagnoses, chronic histories, and medication allergies, which are instantly mapped to the relational database.

### 🛏️ Bed Management (ICU / General Ward)
Assigns patients to general or intensive care beds. Features **Severity-Based Emergency Auto-Allocation**: critical patient triages automatically search for and reserve the first vacant ICU bed before looking at general wards.

### 📲 Twilio SMS Notification Hub
Send instant SMS text alerts to outpatients or schedule delayed reminders (such as appointment timings or discharge guides). 
* **Twilio Sandbox Mode**: If Twilio credentials are not configured, the console logs an interactive, styled mobile phone terminal visualization showing the exact text sent, perfect for local demo purposes.
* **Cron Poller**: The background thread wakes up every 15 seconds, automatically harvesting and dispatching all pending scheduled reminders.

### 📹 Encrypted Telemedicine Desk
Attending physicians can host virtual consult calls. Built with a high-fidelity video layout, simulated microphone/camera controls, live patient chat simulators, and active EMR note binders.

### 🧠 OpenAI Clinical Assistant
Embedded inside the prescription workflow. The assistant analyzes patient chronic histories, age, allergies, and the doctor's current diagnosis to compile custom dietary, fluid, and exercise guidelines, which the physician can instantly append to the EMR file with a single click.

---

## 🔒 Security
* **Authentication**: Industry-standard **JSON Web Tokens (JWT)**.
* **Encryption**: Bcrypt password hashing.
* **Role Safety**: API endpoints are strictly guarded. A user with a `patient` role cannot perform admissions or write prescriptions.
