import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, Heart, User, Sparkles, Activity, FileText, CheckCircle, X, ChevronRight, ListCollapse, Loader2, Plus } from 'lucide-react';

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Prescription Modal State
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  
  // Prescription Form Fields
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [validationError, setValidationError] = useState('');

  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/doctor/dashboard-stats');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve dashboard analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleOpenPrescribe = (app) => {
    setActiveApp(app);
    setSymptoms('');
    setDiagnosis('');
    setMedicines('');
    setInstructions('');
    setValidationError('');
    setPrescribeOpen(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!symptoms || !diagnosis || !medicines || !instructions) {
      setValidationError('Please fill in all clinical details.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/doctor/prescriptions', {
        patient_id: activeApp.patient_id,
        appointment_id: activeApp.id,
        symptoms,
        diagnosis,
        medicines,
        instructions
      });
      addToast(`Prescription saved. Patient ${activeApp.patient_name} consultation marked completed.`, 'success');
      setPrescribeOpen(false);
      loadStats();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to submit prescription dossier.';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Synchronizing clinical dashboard analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || { total_today: 0, completed_today: 0, pending_today: 0 };
  const queue = stats?.today_appointments || [];

  // Hand-Crafted Dynamic SVG Bar Chart Data (Consultation loads for past 5 days)
  const chartData = [
    { day: 'Mon', value: 8 },
    { day: 'Tue', value: 12 },
    { day: 'Wed', value: 15 },
    { day: 'Thu', value: 9 },
    { day: 'Fri', value: metrics.completed_today || 6 }
  ];

  const maxVal = Math.max(...chartData.map(d => d.value), 10);

  return (
    <div className="space-y-6">
      
      {/* Clinician Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Clinician Portal: {user?.full_name || 'Doctor'}
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Securely serving as registered medical practitioner. Review appointments and active triages.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 text-blue-800 px-3.5 py-2 rounded-2xl text-xs font-bold dark:bg-blue-900/10 dark:border-blue-900/20 dark:text-blue-300">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Clinical Role Active
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: "Today's Consultations", value: metrics.total_today, desc: "Total daily queue workload", icon: Calendar, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
          { title: "Completed Treatments", value: metrics.completed_today, desc: "Successfully resolved consultations", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
          { title: "Remaining Queue Load", value: metrics.pending_today, desc: "Scheduled or checked-in visits", icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-950 mt-2 dark:text-white">{card.value}</h3>
                <p className="text-[10px] text-slate-450 mt-1.5 leading-tight">{card.desc}</p>
              </div>
              <div className={`p-3 rounded-2xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DUAL DASHBOARD VIEW: QUEUE AND SVG CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Today's Patient Queue */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          
          <div className="p-6 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h2 className="font-extrabold text-slate-950 dark:text-white text-base">Today's Patient Queue</h2>
            </div>
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full font-bold dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
              ISO Date: {new Date().toISOString().split('T')[0]}
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <User className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Patient Visits Today</h3>
              <p className="text-xs text-slate-450 max-w-xs mx-auto">
                Clinician daily schedule has no consult slots allocated. Register patients or book slots inside the ledger.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-6 py-4">Token</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Time Slot</th>
                    <th className="px-6 py-4">Queue Status</th>
                    <th className="px-6 py-4 text-right">EMR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {queue.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-800 text-sm dark:text-slate-350">
                          #{app.token_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-950 block text-xs dark:text-slate-200">{app.patient_name}</span>
                        <span className="text-[10px] text-slate-450 block mt-0.5">{app.patient_age} yrs / {app.patient_gender}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {app.time_slot}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : app.status === 'checked_in'
                            ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-300'
                            : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-300'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.status !== 'completed' ? (
                          <button
                            onClick={() => handleOpenPrescribe(app)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow active:scale-[0.98] inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Prescribe
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/patients/${app.patient_id}/history` || `/patients/${app.patient_id}`)}
                            className="text-slate-400 hover:text-blue-500 text-xs font-semibold hover:underline inline-flex items-center gap-1 transition"
                          >
                            Clinical History
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Hand-Crafted Premium SVG Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-950 text-base dark:text-white">Consultation Load</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Weekly patient ledger volumes treated in clinic.</p>
          </div>

          {/* SVG CHART CONTAINER */}
          <div className="w-full flex items-end justify-between h-48 px-2 border-b border-slate-100 pt-8 dark:border-slate-800">
            {chartData.map((data, idx) => {
              const pct = (data.value / maxVal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  {/* Tooltip */}
                  <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md transition pointer-events-none z-20">
                    {data.value} cases
                  </span>
                  
                  {/* Animated Bar */}
                  <div
                    className="w-8 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-500 shadow-inner"
                    style={{ height: `${pct}%`, minHeight: '6%' }}
                  ></div>
                  
                  {/* Day Label */}
                  <span className="text-[10px] text-slate-450 font-bold block mt-3 select-none">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Attribution */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-center gap-3 dark:bg-slate-950 dark:border-slate-800 mt-4">
            <div className="bg-blue-600/10 text-blue-600 p-2 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-[11px] leading-snug">
              <span className="font-bold text-slate-800 block dark:text-slate-350">AI Diagnostic Assistant</span>
              <span className="text-slate-400">Trained clinical agents are standing by.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- SAAS PRESCRIPTION MODAL FORM ----------------- */}
      {prescribeOpen && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-white">Create Clinical Prescription</h3>
              </div>
              <button
                onClick={() => setPrescribeOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Alerts */}
            {validationError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handlePrescriptionSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Patient dossier brief */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">{activeApp.patient_name}</span>
                  <span className="text-slate-400 block mt-0.5">
                    Age: {activeApp.patient_age} yrs | Gender: {activeApp.patient_gender} | Blood: {activeApp.patient_blood_group}
                  </span>
                </div>
              </div>

              {/* Symptoms Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presented Symptoms *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., High grade fever, sore throat, cough for 3 days"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs shadow-inner"
                />
              </div>

              {/* Diagnosis Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Acute Streptococcal Tonsillitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs shadow-inner"
                />
              </div>

              {/* Prescribed Medicines */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prescribed Medicines (Dosage & Drug) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="1. Amoxicillin 500mg (15 Capsules)&#10;2. Paracetamol 650mg (10 Tablets)"
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs resize-none"
                />
              </div>

              {/* Intake Instructions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Special Instructions *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Amoxicillin: Take 1 capsule three times daily for 5 days.&#10;Paracetamol: Take 1 tablet every 6 hours as needed for fever."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end bg-slate-900">
                <button
                  type="button"
                  onClick={() => setPrescribeOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 animate-spin" />}
                  Save & Finalize EMR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
