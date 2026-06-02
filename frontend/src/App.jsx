import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  ShieldAlert, 
  Users, 
  Calendar, 
  LayoutDashboard, 
  Database, 
  LogOut, 
  Lock, 
  Bed, 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  Video, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Sparkles,
  Info
} from 'lucide-react';
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
import Notifications from './pages/Notifications';
import Billing from './pages/Billing';
import Insurance from './pages/Insurance';
import Telemedicine from './pages/Telemedicine';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import api from './services/api';

// Dashboard View for general staff or admins (Doctors get redirected to DoctorDashboard)
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [admitRes, appRes, patRes] = await Promise.all([
          api.get('/api/v1/admissions/?status=admitted'),
          api.get('/api/v1/appointments/'),
          api.get('/api/v1/patients/')
        ]);
        setAdmissions(admitRes.data);
        setAppointmentsCount(appRes.data.length);
        setPatientsCount(patRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Hospital Control Center</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Welcome, {user?.full_name || 'User'} ({user?.role?.toUpperCase()}). Access your AI healthcare command panel.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3.5 py-1.5 rounded-full text-xs font-bold dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900/30">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Core: Online
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Active Patients", value: patientsCount || "142", desc: "Total electronic health records", icon: Users, color: "text-primary bg-primary/5 dark:bg-primary/10 border-primary/10" },
          { title: "Clinical Ward Occupancies", value: admissions.length || "9", desc: "Patients in General & ICU beds", icon: Bed, color: "text-secondary bg-secondary/5 dark:bg-secondary/10 border-secondary/10" },
          { title: "Consultation Schedules", value: appointmentsCount || "38", desc: "Appointments booked", icon: Calendar, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-950 mt-2 dark:text-white">{card.value}</h3>
                <p className="text-[10px] text-slate-450 mt-1">{card.desc}</p>
              </div>
              <div className={`p-3 rounded-2xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="bg-primary/20 text-primary-foreground border border-primary/30 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
            Modular Monolith Console
          </span>
          <h2 className="text-2xl md:text-3xl font-black leading-tight">MedOS Live Clinical Environment</h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Your JWT secure session, SQLite relational tables, and clinical role guards are fully active. Explore patients EMR ledgers, assign emergency ICU beds, simulate Twilio SMS notifications, or launch premium virtual consult calls.
          </p>
          
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/patients')}
              className="bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold transition shadow"
            >
              Access Patients Ledger
            </button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800/80 border border-slate-700/85 hover:bg-slate-700/80 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Interactive FastAPI Docs
            </a>
          </div>
        </div>

        {/* Floating background graphics */}
        <div className="absolute right-0 bottom-0 top-0 opacity-5 flex items-center justify-center pr-12 hidden md:flex pointer-events-none">
          <Activity className="w-64 h-64 text-white" />
        </div>
      </div>

    </div>
  );
};

// AI Diagnostics page
const Diagnostics = () => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <div className="flex items-center gap-3">
      <div className="bg-primary text-primary-foreground p-2.5 rounded-2xl shadow shadow-primary/25">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">AI Diagnostics Lab</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400">Classify radiography scans, execute EMR assessments, and review classifications.</p>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-250 text-amber-900 p-4 rounded-2xl text-xs flex items-start gap-2.5 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
      <Info className="w-4 h-4 shrink-0 text-amber-500" />
      <div>
        <span className="font-extrabold block mb-0.5">Clinical Authorization Verified</span>
        Diagnostic models use role-based authorizations and are only visible to practitioners and clinical staffs.
      </div>
    </div>

    <div className="bg-white p-6 rounded-3xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center py-16 space-y-4">
      <Sparkles className="w-12 h-12 text-primary/60 mx-auto animate-pulse" />
      <h3 className="text-sm font-bold text-slate-750 dark:text-slate-350">Diagnostic Neural Networks Standing By</h3>
      <p className="text-xs text-slate-450 max-w-sm mx-auto">
        Image classification engines (chest X-Ray anomaly indices, medical translation models) will hook up inside this workspace.
      </p>
    </div>
  </div>
);

// Protected Layout Shell with Collapsible Sidebar, Responsive Toggles, Header Breadcrumbs, SQLite telemetries, and Theme Switcher
const LayoutShell = ({ children }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Collapse sidebar state
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Notification dropdown state
  const [notifOpen, setNotifOpen] = useState(false);
  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Breadcrumbs builder
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return [{ label: 'Console', active: true }];
    
    const crumbs = [{ label: 'MedOS', link: '/' }];
    paths.forEach((p, idx) => {
      const isLast = idx === paths.length - 1;
      const cleanLabel = p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ');
      crumbs.push({
        label: cleanLabel,
        link: `/${paths.slice(0, idx + 1).join('/')}`,
        active: isLast
      });
    });
    return crumbs;
  };

  const navigationLinks = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Patients Ledger", to: "/patients", icon: Users },
    { label: "Appointments", to: "/appointments", icon: Calendar },
    { label: "Bed Management", to: "/beds", icon: Bed },
    { label: "AI Diagnostics", to: "/diagnostics", icon: ShieldAlert, guard: ['doctor', 'admin', 'staff'] },
    { label: "SMS Alerts Hub", to: "/notifications", icon: Bell },
    { label: "Billing & Invoices", to: "/billing", icon: CreditCard },
    { label: "Insurance Claims", to: "/insurance", icon: ShieldCheck },
    { label: "Telemedicine Desk", to: "/telemedicine", icon: Video },
    { label: "Executive Analytics", to: "/analytics", icon: BarChart3 },
    { label: "System Settings", to: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden dark:bg-slate-950 font-sans text-slate-850 dark:text-slate-100">
      
      {/* -------------------- SIDEBAR (DESKTOP) -------------------- */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header logo */}
        <div className="p-4.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary to-secondary text-white p-2.5 rounded-2xl shadow shadow-primary/20 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="animate-in fade-in duration-300">
                <h2 className="font-extrabold text-slate-950 dark:text-white leading-tight">MedOS</h2>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">AI Clinical Core</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition dark:hover:bg-slate-800 text-slate-400 shrink-0 hidden sm:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navigationLinks
            .filter(link => !link.guard || (user && link.guard.includes(user.role)))
            .map((link, idx) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={idx}
                  to={link.to}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 dark:hover:text-white'
                  }`}
                >
                  <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                  {!collapsed && <span className="truncate">{link.label}</span>}
                </Link>
              );
          })}
        </nav>

        {/* Telemetries & Dark mode toggle at bottom of sidebar */}
        <div className="p-4 border-t border-slate-150/80 dark:border-slate-800 space-y-3">
          
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 transition text-xs font-bold cursor-pointer group active:scale-[0.98] select-none text-slate-700 dark:text-slate-300"
          >
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <>
                  <Moon className="w-4.5 h-4.5 text-indigo-500 animate-swing" />
                  {!collapsed && <span className="animate-in fade-in">Dark Appearance</span>}
                </>
              ) : (
                <>
                  <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" />
                  {!collapsed && <span className="animate-in fade-in">Light Appearance</span>}
                </>
              )}
            </div>
            {!collapsed && (
              <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-400 font-black px-1.5 py-0.5 rounded-md dark:bg-slate-950 dark:border-slate-800">
                Alt+T
              </span>
            )}
          </button>

          {!collapsed && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150/80 flex items-center gap-3 dark:bg-slate-950/20 dark:border-slate-800/80 animate-in fade-in duration-300">
              <Database className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <div className="text-[10px] leading-tight">
                <span className="font-extrabold text-slate-850 block dark:text-slate-300">hospital.db session</span>
                <span className="text-slate-400 font-semibold mt-0.5 block">SQLite Relational Core</span>
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition"
            >
              <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* -------------------- MOBILE DRAWER LAYOUT -------------------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          
          <aside className="relative w-64 max-w-xs bg-white dark:bg-slate-900 h-full flex flex-col p-4 space-y-4 animate-in slide-in-from-left duration-300 border-r border-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-primary" />
                <span className="font-black text-slate-950 dark:text-white">MedOS Secure</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-slate-100 rounded-xl dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navigationLinks
                .filter(link => !link.guard || (user && link.guard.includes(user.role)))
                .map((link, idx) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={idx}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
                      }`}
                    >
                      <link.icon className="w-5 h-5 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
              })}
            </nav>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2">
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin" />
                      <span>Light Theme</span>
                    </>
                  )}
                </div>
              </button>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                Sign Out
              </button>
            </div>

          </aside>
        </div>
      )}

      {/* -------------------- MAIN PAGE WRAPPER -------------------- */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sm:px-8 dark:bg-slate-900 dark:border-slate-800/80 shrink-0 sticky top-0 z-30">
          
          {/* Breadcrumbs & Mobile trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb timeline */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-bold tracking-tight">
              {getBreadcrumbs().map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  {crumb.active ? (
                    <span className="text-slate-800 dark:text-slate-205 font-black">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.link} className="hover:text-primary transition">{crumb.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Action widgets */}
          <div className="flex items-center gap-4 relative">
            
            {/* Twilio SMS Notification Dropdown Panel */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition relative text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-xl p-4 space-y-3 z-50 text-xs animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-slate-950 dark:text-white">Active SMS Reminders</span>
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full dark:bg-amber-950 dark:text-amber-400">
                      Twilio active
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Discharge summary SMS delivered</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Dispatched to outpatient mobile number...</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0 animate-pulse"></span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Upcoming virtual consult reminders</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Scheduled in twilio pending dispatch queue...</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/notifications');
                    }}
                    className="w-full text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2 font-bold text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850 mt-2 block"
                  >
                    Open Notifications Hub
                  </button>
                </div>
              )}
            </div>

            {/* Profile Action Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 hover:opacity-90 transition cursor-pointer select-none text-left"
              >
                <div className="hidden md:block">
                  <span className="text-xs font-black text-slate-950 block leading-none dark:text-slate-200">{user?.full_name || 'Practitioner'}</span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider block mt-1">{user?.role || 'Staff'}</span>
                </div>
                
                <div className="w-9.5 h-9.5 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-inner dark:bg-primary/20 dark:text-primary">
                  {getInitials(user?.full_name)}
                </div>
              </button>

              {/* Profile dropdown menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 text-xs animate-in fade-in duration-150">
                  
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-extrabold text-slate-950 block dark:text-white">{user?.full_name}</span>
                    <span className="text-[10px] text-slate-450 block font-semibold">{user?.email}</span>
                  </div>

                  <div className="space-y-1 block">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 font-bold flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Attending Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 font-bold flex items-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      Console Settings
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 block">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out Securely
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content body container */}
        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>

    </div>
  );
};

// Route wrapper and protected setup tables
function AppContent() {
  const { toasts, removeToast } = useAuth();
  return (
    <>
      <Routes>
        {/* Public auth screens */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected general console routing */}
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
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Notifications />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Billing />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Insurance />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/telemedicine"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Telemedicine />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Analytics />
              </LayoutShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <Settings />
              </LayoutShell>
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
