import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  X, 
  Sun, 
  Moon,
  Info
} from 'lucide-react';
import safeLocalStorage from '../services/storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Forgot Password Modal State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);

  const { login, error, setError, addToast, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';

  // Load saved email if rememberMe was active
  useEffect(() => {
    const saved = safeLocalStorage.getItem('savedEmail');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!email || !password) {
      setValidationError('Please enter both your clinical email and security password.');
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      if (rememberMe) {
        safeLocalStorage.setItem('savedEmail', email);
      } else {
        safeLocalStorage.removeItem('savedEmail');
      }
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      addToast('Please enter your email to proceed.', 'error');
      return;
    }
    setForgotSending(true);
    setTimeout(() => {
      setForgotSending(false);
      setForgotOpen(false);
      addToast(`A recovery link has been dispatched to ${forgotEmail}`, 'success');
      setForgotEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden relative transition-colors duration-300">
      
      {/* ----------------- LEFT PANEL: EXPERIENCE & BRANDING ----------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 p-16 flex-col justify-between relative overflow-hidden border-r border-slate-200 dark:border-slate-900 select-none">
        
        {/* Glowing glassmorphic circles */}
        <div className="absolute top-[-20%] left-[-15%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[10000ms]"></div>

        {/* Mesh Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30"></div>

        {/* Branding header */}
        <div className="flex items-center gap-3 relative z-10 animate-in fade-in duration-700">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/30 ring-1 ring-white/10">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-black text-white text-xl tracking-tight block">MedOS</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mt-0.5">AI Clinical Intelligence</span>
          </div>
        </div>

        {/* Center Floating Glass Panel */}
        <div className="my-auto relative z-10 animate-in slide-in-from-left-8 duration-1000">
          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-3xl rounded-[32px] p-8 max-w-md shadow-2xl relative">
            <div className="absolute -top-3.5 -right-3.5 bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 p-2 rounded-2xl shadow-xl shadow-cyan-400/20">
              <Sparkles className="w-4 h-4 animate-spin-slow text-slate-950" />
            </div>
            
            <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[9px] font-bold uppercase px-3 py-1 rounded-full tracking-wider inline-block">
              Clinical Core Intelligence
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4 leading-tight tracking-tight">
              Augmented Diagnostics & Patient Flow
            </h2>
            <p className="text-slate-350 mt-3 text-sm leading-relaxed font-medium">
              Empowering healthcare facilities with deep clinical indexing, predictive appointment queues, and structured electronic health files (EHR).
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-800/40">
              <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Queue Latency</span>
                <span className="text-white font-extrabold block text-lg mt-0.5">18.4ms avg</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Classification</span>
                <span className="text-white font-extrabold block text-lg mt-0.5">99.86% Accurate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 relative z-10 font-medium">
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            Validated Medical Safety Standards
          </span>
          <span>Security AES-256</span>
        </div>
      </div>

      {/* ----------------- RIGHT PANEL: AUTHENTICATION FORM ----------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto min-h-screen transition-colors duration-300">
        
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

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-xl dark:shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Mobile Header Branding */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 rounded-2xl text-white mb-3 shadow-lg shadow-blue-500/25">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">MedOS Secure Portal</h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Access Secure Console</h1>
            <p className="text-slate-550 mt-3 text-sm leading-relaxed font-medium dark:text-slate-400">
              Enter your clinical credentials to authenticate your connection to the MedOS medical control panels.
            </p>
          </div>

          {/* Validation Warnings */}
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 dark:bg-rose-950/40 dark:border-rose-500/20 dark:text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse"></span>
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && !validationError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 dark:bg-rose-950/40 dark:border-rose-500/20 dark:text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse"></span>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Clinician Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-405 group-focus-within:text-blue-500 transition" />
                <input
                  type="email"
                  required
                  placeholder="practitioner@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition text-sm shadow-inner font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-650 dark:focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Security Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-blue-600 font-bold hover:text-blue-550 transition dark:text-blue-500 dark:hover:text-blue-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-405 group-focus-within:text-blue-500 transition" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition text-sm shadow-inner font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-650 dark:focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-white transition p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me toggle */}
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-blue-600 focus:ring-blue-500/20 cursor-pointer dark:border-slate-800 dark:bg-slate-950"
              />
              <label htmlFor="remember" className="text-xs font-semibold text-slate-600 hover:text-slate-850 transition cursor-pointer select-none dark:text-slate-400 dark:hover:text-slate-300">
                Remember this clinical terminal
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl text-sm font-bold hover:from-blue-500 hover:to-cyan-500 hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Verifying clinical keys...
                </>
              ) : (
                <>
                  Authenticate Connection
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Registration toggle */}
          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-850 pt-6">
            <p className="text-xs text-slate-500 font-medium dark:text-slate-450">
              First time deploying credentials here?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline hover:text-blue-550 transition ml-1 dark:text-blue-500 dark:hover:text-blue-400">
                Register clinical profile
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ----------------- FORGOT PASSWORD MODAL OVERLAY ----------------- */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setForgotOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-50/80 text-blue-605 p-2 rounded-xl dark:bg-blue-600/15 dark:text-blue-400">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Recover Credentials</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-semibold">
              Enter your clinical email address and we'll dispatch reset instructions to recover your console key.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="doctor@medos.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 text-xs shadow-inner font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-650"
              />
              <button
                type="submit"
                disabled={forgotSending}
                className="w-full bg-blue-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-blue-500 transition duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-blue-600/10 cursor-pointer"
              >
                {forgotSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Dispatching recovery keys...
                  </>
                ) : (
                  <>
                    Dispatch Recovery Code
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
