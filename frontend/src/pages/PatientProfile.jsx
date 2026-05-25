import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowLeft, Loader2, Phone, MapPin, User, AlertTriangle, ShieldAlert, Heart, Calendar, Clock } from 'lucide-react';

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { addToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/v1/patients/${id}`);
        setPatient(response.data);
      } catch (err) {
        console.error(err);
        addToast('Failed to load patient dossier.', 'error');
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientDetails();
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
          <p className="text-sm font-semibold text-slate-500">Retrieving patient medical records...</p>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="space-y-6">
      
      {/* Back button and navigation */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-semibold dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Ledger
      </button>

      {/* ----------------- PATIENT DOSSIER CARD ----------------- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        
        {/* Dossier Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          
          {/* Background graphics */}
          <div className="absolute right-[-10%] bottom-[-20%] opacity-10 flex items-center justify-center pointer-events-none">
            <Activity className="w-96 h-96 text-white" />
          </div>

          {/* Initials badge */}
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-lg text-white">
            {getInitials(patient.name)}
          </div>

          {/* Demographics Summary */}
          <div className="text-center md:text-left space-y-1 z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">{patient.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-sm text-slate-350 font-semibold pt-1">
              <span>{patient.age} yrs old</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span>{patient.gender}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Blood Group: {patient.blood_group}
              </span>
            </div>
          </div>
        </div>

        {/* Dossier Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Grid Panel 1 & 2: Primary Data */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Demographic Parameters Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 dark:bg-slate-950 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demographic Profile</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="flex items-center gap-3.5">
                  <div className="bg-blue-100/50 p-2.5 rounded-xl text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Contact Number</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{patient.phone_number}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="bg-blue-100/50 p-2.5 rounded-xl text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Residential Address</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight block">{patient.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="bg-blue-100/50 p-2.5 rounded-xl text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Patient Identification</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">MED-PT-{patient.id.toString().padStart(4, '0')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="bg-blue-100/50 p-2.5 rounded-xl text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Registry Created</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(patient.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Disease History */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-slate-850 dark:text-slate-100">
                <Heart className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-slate-800 text-sm dark:text-slate-100">Chronic & Disease History</h3>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl dark:bg-slate-950 dark:border-slate-800">
                {patient.disease_history ? (
                  <p className="text-slate-700 text-xs leading-relaxed font-medium dark:text-slate-300">
                    {patient.disease_history}
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    No documented chronic diseases or historical clinical cases entered in EHR file.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Grid Panel 3: Medical Alert Divisions */}
          <div className="space-y-6">
            
            {/* Allergies Red Alert Box */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 dark:bg-rose-950/20 dark:border-rose-900/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Allergy Warnings</h3>
              </div>
              
              {patient.allergies ? (
                <div className="bg-white/60 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs font-bold leading-relaxed dark:bg-slate-950/40 dark:border-rose-900/30 dark:text-rose-300">
                  {patient.allergies}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No active allergy records reported by the patient.
                </div>
              )}
            </div>

            {/* Clinician Attribution */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 dark:bg-slate-950 dark:border-slate-800 space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinician Attribution</h3>
              
              <div className="flex items-center gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 dark:bg-slate-850 dark:text-slate-300">
                  CL
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block leading-none">Registered Clinician</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 block">ID: #{patient.created_by_id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
