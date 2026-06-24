## 🏥 MedOS – AI-Powered Smart Hospital Management System

**MedOS** is a modern, full-stack healthcare management platform designed to simplify hospital operations through automation, AI assistance, and intelligent patient management. Built with cutting-edge technologies, MedOS transforms hospital workflows from complex manual processes into streamlined, intelligent systems.

### Live Demo
🌐 **[Visit Live Application](https://ai-hospital-management-system-phi.vercel.app)**

---

## 🎯 Core Features

MedOS helps hospitals manage all critical operations through a unified platform:

- **🔐 Secure JWT Authentication & Role-Based Access Control**
- **👥 Patient Registration & Digital Medical Records (EMR)**
- **📅 Appointment Scheduling & Smart Queuing**
- **👨‍⚕️ Doctor Dashboard & Prescription Management**
- **🛏️ Intelligent Bed Allocation & Admission Tracking**
- **💳 Billing & Insurance Claims Management**
- **🤖 AI-Assisted Health Recommendations (OpenAI)**
- **📹 Telemedicine & Video Consultations**
- **📱 SMS Notifications & Appointment Reminders (Twilio)**
- **📊 Real-Time Analytics & Clinical Dashboards**
- **⚡ Responsive & Modern Healthcare Interface**

---

## 🛠️ Technology Stack

### **Frontend** (80% of codebase)
| Technology | Purpose |
|----------|---------|
| **React.js v18** | Modern UI framework with hooks |
| **Vite** | Lightning-fast build tool with HMR |
| **Tailwind CSS** | Utility-first CSS styling |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Beautiful, crisp SVG icons |
| **React Router v6** | Client-side routing |
| **Radix UI** | Accessible component primitives |

### **Backend** (19.5% of codebase)
| Technology | Purpose |
|----------|---------|
| **FastAPI** | High-performance async Python framework |
| **SQLAlchemy 2.0** | Modern ORM with async support |
| **PostgreSQL** | Production-grade relational database |
| **Pydantic v2** | Data validation & serialization |
| **JWT + Passlib** | Secure authentication & password hashing |
| **APScheduler** | Background task scheduling |
| **Twilio API** | SMS notifications & delivery |
| **OpenAI API** | AI-powered health recommendations |

### **DevOps & Deployment**
| Tool | Purpose |
|----------|---------|
| **Docker & Docker Compose** | Local containerized development |
| **PostgreSQL 15** | Database with health checks |
| **Render** | Backend hosting (FastAPI) |
| **Vercel** | Frontend hosting (React/Vite) |

---

## 📁 Project Structure

```
AI-Hospital-Management-System/
│
├── backend/                                    # FastAPI Backend Service
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py              # JWT Authentication
│   │   │   │   │   ├── patients.py          # Patient Management
│   │   │   │   │   ├── appointments.py      # Appointment Booking
│   │   │   │   │   ├── beds.py              # Bed Allocation
│   │   │   │   │   ├── doctors.py           # Doctor Operations
│   │   │   │   │   ├── prescriptions.py     # Prescription Management
│   │   │   │   │   ├── billing.py           # Billing & Invoices
│   │   │   │   │   ├── insurance.py         # Insurance Claims
│   │   │   │   │   └── notifications.py     # SMS & Alerts
│   │   │   │   └── api.py                   # Centralized API Router
│   │   │   └── deps.py                      # Dependency Injection
│   │   ├── core/
│   │   │   ├── config.py                    # Settings & Configuration
│   │   │   ├── security.py                  # JWT & Auth Utils
│   │   │   └── database.py                  # DB Connection & Sessions
│   │   ├── models/                          # SQLAlchemy ORM Models
│   │   │   ├── user.py
│   │   │   ├── patient.py
│   │   │   ├── appointment.py
│   │   │   ├── bed.py
│   │   │   ├── prescription.py
│   │   │   └── notification.py
│   │   ├── schemas/                         # Pydantic Request/Response Models
│   │   │   ├── user.py
│   │   │   ├── patient.py
│   │   │   ├── appointment.py
│   │   │   └── ... (more schemas)
│   │   ├── services/                        # Business Logic Layer
│   │   │   ├── ai_service.py               # OpenAI Integration
│   │   │   ├── scheduler.py                # Background SMS Scheduler
│   │   │   ├── twilio_service.py           # Twilio SMS Client
│   │   │   └── email_service.py            # Email Notifications
│   │   ├── migrations/                      # Alembic Database Migrations
│   │   └── main.py                          # FastAPI App & DB Seeder
│   ├── requirements.txt                     # Python Dependencies
│   ├── Dockerfile                           # Backend Container Image
│   └── .env.example                         # Environment Variables Template
│
├── frontend/                                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx              # Top Navigation
│   │   │   │   ├── Sidebar.jsx             # Side Menu
│   │   │   │   └── Layout.jsx              # App Shell
│   │   │   ├── auth/
│   │   │   │   ├── ProtectedRoute.jsx      # Route Guards
│   │   │   │   └── RoleBasedAccess.jsx     # Permission Checks
│   │   │   ├── common/Toast.jsx            # Alert Notifications
│   │   │   └── ... (more components)
│   │   ├── pages/
│   │   │   ├── Login.jsx                   # Authentication Gate
│   │   │   ├── Dashboard.jsx               # Hospital Control Center
│   │   │   ├── PatientsList.jsx            # Patient Ledger & EMR
│   │   │   ├── Appointments.jsx            # Appointment Booking
│   │   │   ├── BedManagement.jsx           # ICU & Ward Beds
│   │   │   ├── DoctorDashboard.jsx         # Doctor Portal
│   │   │   ├── Prescriptions.jsx           # Prescription Workflow
│   │   │   ├── Billing.jsx                 # Invoice Generation
│   │   │   ├── Insurance.jsx               # Claims Management
│   │   │   ├── Telemedicine.jsx            # Video Consultations
│   │   │   ├── Notifications.jsx           # SMS Hub
│   │   │   ├── Analytics.jsx               # Statistics & Charts
│   │   │   └── NotFound.jsx                # 404 Page
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             # Auth State Management
│   │   │   ├── ThemeContext.jsx            # Dark/Light Mode
│   │   │   └── NotificationContext.jsx     # Toast Notifications
│   │   ├── hooks/
│   │   │   ├── useAuth.js                  # Auth Hook
│   │   │   ├── useFetch.js                 # Data Fetching
│   │   │   └── useLocalStorage.js          # Safe Storage
│   │   ├── services/
│   │   │   └── api.js                      # Axios API Client
│   │   ├── assets/
│   │   │   ├── logos/
│   │   │   └── styles/
│   │   ├── App.jsx                         # Main Router Component
│   │   ├── index.css                       # Tailwind & Global Styles
│   │   └── main.jsx                        # React Entry Point
│   ├── public/                             # Static Assets
│   ├── package.json                        # NPM Dependencies
│   ├── vite.config.js                      # Vite Configuration
│   ├── tailwind.config.js                  # Tailwind Theme
│   ├── postcss.config.js                   # PostCSS Config
│   ├── Dockerfile                          # Frontend Container
│   ├── vercel.json                         # Vercel Deployment Config
│   └── .env.example                        # Frontend Env Template
│
├── docker-compose.yml                       # Local Dev Stack (3 services)
├── DEPLOYMENT.md                            # Deployment Instructions
├── DEPLOYMENT_GUIDE.md                      # Advanced Deployment
├── vercel.json                              # Root Vercel Config
├── render.yaml                              # Render Deployment Config
├── .gitignore                               # Git Ignore Rules
├── .env.example                             # Root Env Template
└── README.md                                # This File

```

---

## 🚀 Running the Project Locally

### Option 1️⃣: Zero-Config SQLite Setup (Fastest 🏃‍♂️)
Perfect for quick testing without Docker or external database setup.

#### Backend Setup:
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file (SQLite is pre-configured by default)
cp .env.example .env

# Start FastAPI server with auto-reload
uvicorn app.main:app --reload --port 8000
```

✅ Backend will be available at: **[http://localhost:8000](http://localhost:8000)**  
📚 Interactive API docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**

#### Frontend Setup:
```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start Vite dev server
npm run dev
```

✅ Frontend will be available at: **[http://localhost:5173](http://localhost:5173)**

---

### Option 2️⃣: Docker Compose Setup (Full Stack 🐳)
Complete development environment with PostgreSQL database, backend, and frontend in isolated containers.

#### Prerequisites:
- Docker Desktop installed and running

#### Start Everything:
```bash
# From repo root directory
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### Services:
| Service | URL | Purpose |
|---------|-----|---------|
| **PostgreSQL** | `localhost:5432` | Database with auto health checks |
| **FastAPI Backend** | `localhost:8000` | API Server with Swagger UI |
| **React Frontend** | `localhost:5173` | Web Application |

#### Stop Services:
```bash
docker-compose down

# Remove volumes too
docker-compose down -v
```

---

## 🌐 Production Deployment

### Backend Deployment (Render)
1. Connect GitHub repository to Render
2. Create PostgreSQL database on Render
3. Create Web Service with these settings:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Runtime | `Python 3.11` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

**Environment Variables:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
ENV=production
SECRET_KEY=<generate-random-secret>
ACCESS_TOKEN_EXPIRE_MINUTES=11520
BACKEND_CORS_ORIGINS=https://your-frontend-domain.vercel.app
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=<strong-password>
```

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set Root Directory to `frontend`
3. Set Build Command to `npm run build`

**Environment Variables:**
```
VITE_API_URL=https://your-backend-service.onrender.com
```

> See [**DEPLOYMENT.md**](./DEPLOYMENT.md) for detailed instructions

---

## 🧬 Key Modules Walkthrough

### 🏥 Hospital Control Center (Dashboard)
Real-time master control center displaying:
- Total registered patients
- Bed occupancy statistics
- Weekly treatment queue levels
- Custom SVG vector charts
- Key performance indicators

### 👥 Patient Ledger & EMR
Comprehensive electronic medical records system:
- Patient registration & onboarding
- Medical history tracking
- Allergy management
- Chronic disease profiles
- Medication records
- Instant patient lookup

### 🛏️ Intelligent Bed Management
Smart allocation system with:
- General ward & ICU bed tracking
- **Severity-Based Emergency Auto-Allocation**: Critical patients automatically assigned to first available ICU bed
- Real-time occupancy dashboard
- Discharge workflow automation

### 📅 Appointment Management
Efficient booking system featuring:
- Doctor availability slots
- Smart queuing algorithm
- Token-based patient management
- Automated SMS reminders
- Appointment history

### 👨‍⚕️ Doctor Dashboard
Physician portal with:
- Patient queue management
- Prescription writing interface
- EMR access and notes
- Vital signs tracking
- Referral management

### 📹 Telemedicine Desk
Secure virtual consultation platform:
- High-fidelity video call layout
- Simulated microphone/camera controls
- Live patient chat interface
- Real-time EMR note binding
- Session recording capabilities

### 📱 Twilio SMS Hub
Notification system featuring:
- Instant SMS alerts
- Scheduled appointment reminders
- Discharge instructions
- **Sandbox Mode**: Interactive terminal visualization (perfect for local testing without Twilio credentials)
- **Cron Poller**: Background job runs every 15 seconds to dispatch pending messages

### 🤖 OpenAI Clinical Assistant
AI-powered health recommendations:
- Analyzes patient medical history
- Considers age, allergies, chronic conditions
- Generates personalized dietary guidance
- Suggests exercise & fluid intake regimens
- Integrated in prescription workflow

### 💳 Billing & Insurance
Complete financial management:
- Invoice generation from EMR
- Automated billing calculations
- Insurance claim submission
- Payment tracking
- Refund management

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT (JSON Web Tokens)**: Industry-standard bearer token authentication
- **Role-Based Access Control (RBAC)**: Distinct roles — Admin, Doctor, Patient, Nurse, Receptionist
- **Bcrypt Hashing**: Secure password storage with salt rounds

### API Security
- **CORS Configuration**: Restricted to authorized domains only
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Pydantic schemas validate all requests
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries

### Data Protection
- **Encrypted Passwords**: Passlib + Bcrypt
- **JWT Secret Key**: Environment-based configuration
- **Secure Session Handling**: Stateless JWT architecture
- **HTTPS Ready**: Production-ready SSL/TLS support

---

## 🧪 Testing & Development

### Run Tests:
```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests  
cd frontend
npm test
```

### Code Quality:
```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
```

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. **Blank Page in Browser**
**Cause**: Stale browser cache  
**Solution**: 
- Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache and reload

#### 2. **API Calls Blocked**
**Cause**: Ad-blocker treating localhost as tracker  
**Solution**:
- Temporarily disable ad-blocker
- Whitelist `http://localhost:5173` and `http://localhost:8000`

#### 3. **Database Connection Error**
**Cause**: PostgreSQL service not running  
**Solution**:
```bash
# Using Docker Compose
docker-compose up db

# Or check PostgreSQL service status
psql --version
```

#### 4. **Vite HMR Not Working**
**Cause**: Network isolation in development  
**Solution**:
- Edit `frontend/vite.config.js`:
```javascript
export default {
  server: {
    hmr: {
      host: 'localhost',
      port: 5173
    }
  }
}
```

#### 5. **Missing Environment Variables**
**Solution**:
```bash
# Create .env files from templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## 📊 Project Stats

- **Repository**: [PushpakBajanghate/AI-Hospital-Management-System](https://github.com/PushpakBajanghate/AI-Hospital-Management-System)
- **Language Composition**:
  - JavaScript: **80%** (React Frontend)
  - Python: **19.5%** (FastAPI Backend)
  - Other: **0.5%** (Config files)
- **Last Updated**: June 2026
- **Live Demo**: [https://ai-hospital-management-system-phi.vercel.app](https://ai-hospital-management-system-phi.vercel.app)

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📞 Support & Contact

For questions, issues, or suggestions:
- **GitHub Issues**: [Report a bug](https://github.com/PushpakBajanghate/AI-Hospital-Management-System/issues)
- **GitHub Discussions**: [Ask a question](https://github.com/PushpakBajanghate/AI-Hospital-Management-System/discussions)

---

## 🙌 Acknowledgments

- **OpenAI** for powerful AI capabilities
- **Twilio** for reliable SMS services
- **Render & Vercel** for seamless deployment
- **FastAPI & React** communities for excellent frameworks
- All contributors and testers

---

**Built with ❤️ by Pushpak Bajanghate**

*Transform healthcare operations with intelligent automation.*
