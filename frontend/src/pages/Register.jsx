import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldAlert, 
  Loader2, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Heart, 
  Users, 
  Shield,
  Moon,
  Sun
} from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('patient');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const { register, error, setError, addToast, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // Premium Grid Selector Roles List
  const rolesList = [
    { id: 'patient', name: 'Patient', desc: 'Book consultations & view history', icon: UserIcon },
    { id: 'doctor', name: 'Practitioner', desc: 'Review triages & EMR files', icon: Heart },
    { id: 'staff', name: 'Staff Member', desc: 'Manage scheduling & beds', icon: Users },
    { id: 'admin', name: 'System Admin', desc: 'Complete console orchestration', icon: Shield },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!fullName || !email || !password || !role) {
      setValidationError('Please fill in all details.');
      addToast('Validation failed. Please enter all details.', 'error');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must contain at least 6 characters.');
      addToast('Validation failed. Password too short.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register(fullName, email, password, role);
      setSuccess(true);
      addToast('Account created successfully!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-300">
      
      {/* ----------------- LEFT PANEL: EXPERIENCE & BRANDING ----------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 p-16 flex-col justify-between relative overflow-hidden border-r border-slate-200 dark:border-slate-900 select-none">
        
        {/* Immersive mesh circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        {/* Logo and Tag */}
        <div className="flex items-center gap-3 relative z-10 animate-in fade-in duration-700">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-white text-lg tracking-tight block">MedOS</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mt-0.5">AI Healthcare Platform</span>
          </div>
        </div>

        {/* Branding text details */}
        <div className="my-auto relative z-10 animate-in slide-in-from-left-8 duration-1000">
          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-3xl rounded-[32px] p-8 max-w-md shadow-2xl relative">
            <div className="absolute -top-3 -right-3 bg-cyan-500 text-slate-950 p-1.5 rounded-xl shadow-lg">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider inline-block">
              Clinical Core Model v3.5
            </span>
            <h2 className="text-2xl font-bold text-white mt-4 leading-tight">
              Create Your Unified Portal Profile
            </h2>
            <p className="text-slate-350 mt-2 text-sm leading-relaxed font-semibold">
              Unlock access to real-time clinical workflows. Registering binds your account to the backend SQLite engine, routing your navigation according to your specific hospital credentials.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 relative z-10 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Instant Schema Sync Setup
          </span>
          <span>Security Protocol AES-256</span>
        </div>
      </div>

      {/* ----------------- RIGHT PANEL: AUTHENTICATION FORM ----------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto min-h-screen transition-colors duration-300">
        
        {/* Floating Theme Switcher top right */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 dark:border-slate-850 dark:hover:bg-slate-900 transition text-slate-500 dark:text-slate-400 cursor-pointer shadow-sm bg-white dark:bg-slate-900"
          title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5 text-indigo-500 animate-swing" /> : <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" />}
        </button>

        {/* Background graphic for mobile screens */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none lg:hidden"></div>

        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-xl dark:shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Mobile Header Branding */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white mb-2 shadow-lg">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create MedOS Account</h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Clinical Profile</h1>
            <p className="text-slate-550 dark:text-slate-400 mt-1 text-xs font-medium">
              Complete the registration form below. Select your active role to calibrate your MedOS console dashboard.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-8 rounded-[28px] text-center space-y-4 animate-in zoom-in-95 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-400">
              <div className="flex justify-center">
                <div className="bg-emerald-100 p-3 rounded-full dark:bg-emerald-500/20">
                  <CheckCircle className="w-12 h-12 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Profile Synchronized</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                Your medical credentials have been successfully mapped to the relational database. We are redirecting you to the console login portal...
              </p>
            </div>
          ) : (
            <>
              {/* Validation Warnings */}
              {validationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs mb-6 flex items-start gap-3 dark:bg-rose-950/40 dark:border-rose-500/20 dark:text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse"></span>
                  <span className="font-semibold">{validationError}</span>
                </div>
              )}

              {/* Error Banner */}
              {error && !validationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs mb-6 flex items-start gap-3 dark:bg-rose-950/40 dark:border-rose-500/20 dark:text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse"></span>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Full Name</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-3 w-4 h-4 text-slate-450 group-focus-within:text-blue-500 transition" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Alexander Fleming"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition text-xs shadow-inner font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-655"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3 w-4 h-4 text-slate-450 group-focus-within:text-blue-500 transition" />
                      <input
                        type="email"
                        required
                        placeholder="alexander@medos.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition text-xs shadow-inner font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-655"
                      />
                    </div>
                  </div>
                </div>

                {/* VISUAL CUSTOM ROLE CARD SELECTOR GRID */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Select System Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {rolesList.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = role === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRole(item.id)}
                          className={`flex flex-col items-start p-3 rounded-2xl border text-left transition select-none cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/30'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-950/50 dark:border-slate-800 dark:hover:border-slate-700/50'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg mb-2 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-450 dark:bg-slate-900 dark:border-slate-800'
                          }`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-bold block ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.name}
                          </span>
                          <span className="text-[9px] text-slate-450 font-semibold leading-tight block mt-0.5">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Choose Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3 w-4 h-4 text-slate-455 group-focus-within:text-blue-500 transition" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="•••••••• (Min 6 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition text-xs shadow-inner font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-655"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password constraint feedback */}
                  {password && password.length < 6 && (
                    <span className="text-[9px] font-bold text-rose-500 dark:text-rose-405 block mt-1">
                      ⚠️ Password must be at least 6 characters.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-2xl text-xs font-bold hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-3 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Creating Security Profile...
                    </>
                  ) : (
                    <>
                      Synchronize Profile Credentials
                      <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Screen */}
              <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-850 pt-4">
                <p className="text-[11px] text-slate-500 font-semibold dark:text-slate-450">
                  Already mapped credentials to MedOS?{' '}
                  <Link to="/login" className="text-blue-650 font-bold hover:underline hover:text-blue-550 transition ml-1 dark:text-blue-500 dark:hover:text-blue-400">
                    Sign in to portal
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
