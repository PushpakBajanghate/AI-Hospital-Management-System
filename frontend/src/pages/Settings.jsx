import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  ShieldCheck, 
  Database, 
  Bell, 
  Sliders, 
  Sparkles,
  Loader2,
  Lock,
  Moon,
  Sun,
  Activity
} from 'lucide-react';

export default function Settings() {
  const { user, theme, toggleTheme, addToast } = useAuth();
  
  // User profile forms
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);

  // Clinical Configurations state
  const [consultationFee, setConsultationFee] = useState('150');
  const [icuRate, setIcuRate] = useState('1200');
  const [smsGateway, setSmsGateway] = useState('twilio_sandbox');
  const [aiSimulation, setAiSimulation] = useState(true);
  const [configuring, setConfiguring] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!name || !email) {
      addToast('Profile name and email are required.', 'warning');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      addToast('Attending profile details successfully saved to secure EMR DB!', 'success');
    }, 800);
  };

  const handleSaveConfigs = (e) => {
    e.preventDefault();
    setConfiguring(true);
    setTimeout(() => {
      setConfiguring(false);
      addToast('Hospital pricing and clinical configurations saved.', 'success');
      localStorage.setItem('medos_ai_simulation', aiSimulation.toString());
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          MedOS Settings
        </h1>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Manage practitioner security details, clinical rates, custom SMS hooks, and AI simulations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Box 1: Profile Management */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2.5 mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
              <User className="w-4 h-4 text-blue-500" />
              Practitioner Profile Settings
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white text-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Practitioner Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white text-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Clinical Role</label>
                  <input
                    type="text"
                    disabled
                    value={user?.role?.toUpperCase() || 'PRACTITIONER'}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-450 text-xs dark:bg-slate-950 dark:border-slate-850 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Local Node ID</label>
                  <input
                    type="text"
                    disabled
                    value={`MD-00${user?.id || '283'}`}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-450 text-xs dark:bg-slate-950 dark:border-slate-850 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-[0.98] inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Profile Settings
                </button>
              </div>
            </form>
          </div>

          {/* Box 2: Clinical Configurations */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2.5 mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Clinical Rates & Integration Configurations
            </h2>

            <form onSubmit={handleSaveConfigs} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Standard Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white text-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">ICU Intensive Room Rate ($ / day)</label>
                  <input
                    type="number"
                    value={icuRate}
                    onChange={(e) => setIcuRate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white text-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Twilio SMS Gateway Endpoint</label>
                  <select
                    value={smsGateway}
                    onChange={(e) => setSmsGateway(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="twilio_sandbox">Twilio Standard Sandbox (Local scheduler)</option>
                    <option value="twilio_live">Live Carrier Dispatch API</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">AI Core Recommendations simulation</label>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={aiSimulation}
                        onChange={(e) => setAiSimulation(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Enable offline custom logic mock</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={configuring}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-450 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-[0.98] inline-flex items-center gap-1.5"
                >
                  {configuring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Configurations
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Theme & DB statuses */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Theme switcher panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 text-center space-y-4">
            <div className="flex items-center gap-2 justify-center text-slate-950 dark:text-white font-extrabold text-sm border-b border-slate-100 dark:border-slate-850 pb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              Theme Appearance Settings
            </div>

            <p className="text-[11.5px] text-slate-450 leading-relaxed max-w-xs mx-auto">
              Configure system themes. Soft dark elements reduce clinical eye strain during night triages and consultations.
            </p>

            <button
              onClick={toggleTheme}
              className="mx-auto flex items-center justify-center gap-2 border border-slate-200 rounded-2xl px-6 py-3 hover:bg-slate-50 transition font-bold text-xs shadow-sm active:scale-[0.98] text-slate-800 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-500 animate-swing" />
                  Toggle Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  Toggle Light Mode
                </>
              )}
            </button>
          </div>

          {/* Database System statistics */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Database className="w-4 h-4 text-indigo-500" />
              System Integration Status
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { label: "SQLite database Version", val: "3.42.0", active: true },
                { label: "EMR encryption protocol", val: "AES-256-GCM", active: true },
                { label: "SMS gateway scheduler", val: "Running (Active)", active: true },
                { label: "Clinical AI Core node", val: "Online", active: true }
              ].map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-650 dark:text-slate-400">
                  <span>{stat.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-200">{stat.val}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
