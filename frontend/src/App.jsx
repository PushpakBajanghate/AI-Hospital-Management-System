import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, ShieldAlert, Users, Calendar, LayoutDashboard, Database } from 'lucide-react';

// Placeholder Pages
const Dashboard = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hospital Control Center</h1>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Welcome to your AI-powered smart healthcare command center.</p>
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
          System Initialized
        </span>
        <h2 className="text-2xl font-bold mt-4">Modular Monolith Setup Complete</h2>
        <p className="text-slate-300 mt-2 text-sm leading-relaxed">
          FastAPI & SQLAlchemy backend is fully configured. Vite, Tailwind CSS, and Shadcn integrations are active in this React shell. Initialize your Docker Compose stack to verify connection health.
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

const Patients = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patients Management</h1>
    <div className="bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-400">Patients list and AI risk triage features will be rendered here.</p>
    </div>
  </div>
);

const Diagnostics = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Diagnostics Lab</h1>
    <div className="bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-400">LLM & Medical Imaging agents setup placeholder.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
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
              to="/diagnostics"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ShieldAlert className="w-5 h-5 text-slate-400" />
              AI Diagnostics
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 dark:bg-slate-800">
              <Database className="w-4 h-4 text-emerald-500" />
              <div className="text-[11px]">
                <span className="font-bold text-slate-700 block dark:text-slate-300">Local DB Session</span>
                <span className="text-slate-400 font-medium">hospital_db:5432</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-400">Smart Hospital Management System</span>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                DR
              </div>
            </div>
          </header>

          <div className="p-8 max-w-6xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
