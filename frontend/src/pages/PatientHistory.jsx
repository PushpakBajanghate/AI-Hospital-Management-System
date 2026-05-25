import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowLeft, Loader2, FileText, Calendar, User, Clipboard, FileCheck, Stethoscope } from 'lucide-react';

export default function PatientHistory() {
  const { id } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { addToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/v1/doctor/patients/${id}/history`);
        setHistory(response.data);
      } catch (err) {
        console.error(err);
        addToast('Failed to retrieve patient EMR clinical history.', 'error');
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Querying EMR databases...</p>
        </div>
      </div>
    );
  }

  if (!history) return null;

  const { patient, prescriptions, appointments } = history;

  return (
    <div className="space-y-6">
      
      {/* Back navigation */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-semibold dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Ledger
      </button>

      {/* Patient demographics dossier header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row gap-5 items-center">
        <div className="absolute right-[-10%] bottom-[-20%] opacity-5 pointer-events-none">
          <Activity className="w-64 h-64 text-white" />
        </div>
        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0">
          {getInitials(patient.name)}
        </div>
        <div className="text-center sm:text-left space-y-1 relative z-10">
          <h2 className="text-2xl font-black">{patient.name}</h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-400 font-semibold pt-0.5">
            <span>{patient.age} yrs</span>
            <span>•</span>
            <span>{patient.gender}</span>
            <span>•</span>
            <span className="text-cyan-400">Blood Group: {patient.blood_group}</span>
          </div>
        </div>
      </div>

      {/* TIMELINE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Chronological Clinical Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Clipboard className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-slate-950 text-base dark:text-white">EMR Clinical Timeline</h3>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 dark:bg-slate-900 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-350 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">No Clinical Prescriptions Found</h4>
              <p className="text-xs text-slate-450 max-w-xs mx-auto">
                No medication, symptoms, or diagnoses have been logged for this patient profile yet.
              </p>
            </div>
          ) : (
            <div className="relative border-l border-slate-200 pl-6 space-y-8 ml-3 dark:border-slate-800">
              {prescriptions.map((pr, idx) => (
                <div key={pr.id} className="relative group">
                  
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[31px] top-1 bg-blue-600 ring-4 ring-slate-950 text-white p-1 rounded-full flex items-center justify-center z-10">
                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                  </span>

                  {/* Clinical Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition dark:bg-slate-900 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Consulting Physician</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 block">Dr. {pr.doctor_name}</span>
                      </div>
                      <span className="text-[10px] bg-slate-150 text-slate-650 px-2.5 py-1 rounded-xl font-bold dark:bg-slate-950 dark:text-slate-450 shrink-0">
                        {new Date(pr.created_at).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Symptoms & Diagnosis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Presented Symptoms</span>
                        <p className="text-xs text-slate-700 mt-1 font-semibold dark:text-slate-350">{pr.symptoms}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Clinical Diagnosis</span>
                        <p className="text-xs text-slate-800 mt-1 font-black text-blue-600 dark:text-blue-400">{pr.diagnosis}</p>
                      </div>
                    </div>

                    {/* Prescribed Medications */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 dark:bg-slate-950 dark:border-slate-800/80 space-y-2">
                      <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">Prescribed Medicines & Directives</span>
                      <pre className="text-xs text-slate-800 font-semibold whitespace-pre-line leading-relaxed font-sans dark:text-slate-300">
                        {pr.medicines}
                      </pre>
                      
                      <div className="border-t border-slate-200/50 pt-2 mt-2">
                        <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">Special Instructions</span>
                        <p className="text-xs text-slate-600 italic leading-relaxed mt-1 dark:text-slate-400">
                          {pr.instructions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Historical Consults Ledger */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-slate-950 text-base dark:text-white">Scheduled Visits</h3>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-400 italic">No scheduled visits on record.</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {appointments.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Time Slot</span>
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-300 mt-1 block">
                        {app.appointment_date} | {app.time_slot}
                      </span>
                    </div>
                    
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      app.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                        : app.status === 'cancelled'
                        ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300'
                        : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    <span className="font-bold">Attending:</span> Dr. {app.doctor_name} <br />
                    <span className="font-bold">Token:</span> Queue #{app.token_number}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
