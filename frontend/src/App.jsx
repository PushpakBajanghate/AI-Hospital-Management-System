import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Users, Calendar, LayoutDashboard, Database, LogOut, Lock, Bed } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from './components/Toast';
import PatientsList from './pages/PatientsList';
import PatientProfile from './pages/PatientProfile';
import Appointments from './pages/Appointments';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientHistory from './pages/PatientHistory';
import BedManagement from './pages/BedManagement';

// Dashboard View
const Dashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hospital Control Center</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Welcome, {user?.full_name || 'User'} ({user?.role?.toUpperCase()}). Access your AI healthcare command panel.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Core: Online
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Active Patients", value: "142", desc: "+12% from yesterday", icon: Users, color: "text-blue-600 bg-blue-50" },
          { title: "AI Diagnostic Load", value: "18.4s", desc: "Avg processing speed", icon: Activity, color: "text-purple-600 bg-purple-50" },
          { title: "Schedules", value: "38", desc: "Scheduled for today", icon: Calendar, color: "text-amber-600 bg-amber-50" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2 dark:text-white">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Setup Health / Connection Check Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
            System Online
          </span>
          <h2 className="text-2xl font-bold mt-4">Modular Monolith Auth Active</h2>
          <p className="text-slate-300 mt-2 text-sm leading-relaxed">
            Your JWT validation, Bcrypt hashing, and role checks are active. The session token is cached inside localStorage and automatically appended to Axios headers. Try registering different accounts to test role permissions!
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold shadow hover:bg-slate-100 transition"
            >
              Interactive API Docs
            </a>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-12 hidden md:flex pointer-events-none">
          <Activity className="w-64 h-64 text-white" />
        </div>
      </div>
    </div>
  );
};

// Patients placeholder deleted in favor of PatientsList page module

const Diagnostics = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <ShieldAlert className="w-8 h-8 text-amber-500" />
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Diagnostics Lab</h1>
    </div>
    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm">
      <span className="font-bold">Access Restrained:</span> This panel uses Role-Based Access Control and is only visible to Doctors, Staff, or Admins.
    </div>
    <div className="bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-400">Diagnostic models (X-Ray classification, medical translation LLMs) will hook up here.</p>
    </div>
  </div>
);

// Protected Layout Shell
const LayoutShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col dark:bg-slate-900 dark:border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white leading-tight">MedOS</h2>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">AI Core Platform</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-400" />
            Dashboard
          </Link>
          <Link
            to="/patients"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Users className="w-5 h-5 text-slate-400" />
            Patients
          </Link>
          <Link
            to="/appointments"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Calendar className="w-5 h-5 text-slate-400" />
            Appointments
          </Link>
          <Link
            to="/beds"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bed className="w-5 h-5 text-slate-400" />
            Bed Management
          </Link>
          <Link
            to="/diagnostics"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ShieldAlert className="w-5 h-5 text-slate-400" />
            AI Diagnostics
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3 dark:border-slate-800">
          <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 dark:bg-slate-800">
            <Database className="w-4 h-4 text-emerald-500" />
            <div className="text-[11px]">
              <span className="font-bold text-slate-700 block dark:text-slate-300">Local DB Session</span>
              <span className="text-slate-400 font-medium">hospital_db:5432</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 dark:bg-slate-900 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-400">Smart Hospital Management System</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 block leading-tight dark:text-slate-200">{user?.full_name}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{user?.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {getInitials(user?.full_name)}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function AppContent() {
  const { toasts, removeToast } = useAuth();
  return (
    <>
      <Routes>
        {/* Public Views */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Console Views */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Dashboard />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <PatientsList />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Appointments />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <PatientProfile />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id/history"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['doctor', 'admin', 'staff']}>
                <LayoutShell>
                  <PatientHistory />
                </LayoutShell>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/beds"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <BedManagement />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diagnostics"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['doctor', 'admin', 'staff']}>
                <LayoutShell>
                  <Diagnostics />
                </LayoutShell>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
