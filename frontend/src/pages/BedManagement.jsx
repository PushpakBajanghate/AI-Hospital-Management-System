import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bed as BedIcon, 
  Plus, 
  X, 
  Loader2, 
  Search, 
  ArrowLeftRight, 
  LogOut, 
  CheckCircle, 
  User, 
  Activity, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ShieldAlert,
  Flame,
  HeartPulse,
  Info
} from 'lucide-react';

export default function BedManagement() {
  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  // Primary Data State
  const [beds, setBeds] = useState([]);
  const [activeAdmissions, setActiveAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter Tab
  const [selectedTab, setSelectedTab] = useState('All');

  // Modal Toggles & Targets
  const [admitOpen, setAdmitOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);

  const [targetBed, setTargetBed] = useState(null);
  const [targetAdmission, setTargetAdmission] = useState(null);

  // Form State: Admission
  const [patientId, setPatientId] = useState('');
  const [severity, setSeverity] = useState('normal');
  const [reason, setReason] = useState('');
  const [roomType, setRoomType] = useState('General');
  const [emergencyAllotment, setEmergencyAllotment] = useState(false);
  const [manualBedId, setManualBedId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // Form State: Transfer
  const [transferTargetBedId, setTransferTargetBedId] = useState('');

  // Form State: Discharge
  const [dischargeNotes, setDischargeNotes] = useState('');

  // Validation States
  const [validationError, setValidationError] = useState('');

  // Enforce roles
  const canManage = user && ['doctor', 'nurse', 'admin', 'staff'].includes(user.role);

  // Load All Primary Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [bedsRes, admissionsRes, patientsRes] = await Promise.all([
        api.get('/api/v1/beds/'),
        api.get('/api/v1/admissions/?status=admitted'),
        api.get('/api/v1/patients/')
      ]);
      setBeds(bedsRes.data);
      setActiveAdmissions(admissionsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to synchronize ward beds and admissions ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Modal Open Handlers
  const handleOpenAdmit = (bed = null) => {
    if (!canManage) {
      addToast('Admission management is restricted to clinical practitioners.', 'error');
      return;
    }
    setValidationError('');
    setPatientId('');
    setSeverity(bed ? (bed.room_type === 'ICU' ? 'critical' : 'normal') : 'normal');
    setReason('');
    setRoomType(bed ? bed.room_type : 'General');
    setEmergencyAllotment(bed ? false : true);
    setManualBedId(bed ? bed.id.toString() : '');
    setPatientSearch('');
    setTargetBed(bed);
    setAdmitOpen(true);
  };

  const handleOpenTransfer = (admission) => {
    if (!canManage) {
      addToast('Room transfers are restricted to clinical practitioners.', 'error');
      return;
    }
    setValidationError('');
    setTransferTargetBedId('');
    setTargetAdmission(admission);
    setTransferOpen(true);
  };

  const handleOpenDischarge = (admission) => {
    if (!canManage) {
      addToast('Patient discharge is restricted to clinical practitioners.', 'error');
      return;
    }
    setValidationError('');
    setDischargeNotes('');
    setTargetAdmission(admission);
    setDischargeOpen(true);
  };

  // Submit Handler: Admission
  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!patientId) {
      setValidationError('Please select a patient.');
      return;
    }
    if (!reason.trim()) {
      setValidationError('Please outline the primary reason for admission.');
      return;
    }
    if (!emergencyAllotment && !manualBedId) {
      setValidationError('Please choose a vacant bed or select emergency allotment.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patient_id: parseInt(patientId, 10),
        severity,
        reason,
        emergency_allotment: emergencyAllotment,
        bed_id: emergencyAllotment ? null : parseInt(manualBedId, 10)
      };

      await api.post('/api/v1/admissions/admit', payload);
      addToast('Patient admitted successfully and bed status updated.', 'success');
      setAdmitOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to complete patient admission.';
      setValidationError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Handler: Room Transfer
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!transferTargetBedId) {
      setValidationError('Please select a target vacant bed.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/api/v1/beds/transfer/${targetAdmission.id}`, {
        target_bed_id: parseInt(transferTargetBedId, 10)
      });
      addToast('Room transfer logged successfully. Bed statuses transitioned.', 'success');
      setTransferOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to complete room transfer.';
      setValidationError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Handler: Discharge
  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!dischargeNotes.trim()) {
      setValidationError('Please enter discharge instructions and clinical outcome notes.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/v1/admissions/discharge/${targetAdmission.id}`, {
        discharge_notes: dischargeNotes
      });
      addToast('Patient discharged successfully. Bed freed for next allotment.', 'success');
      setDischargeOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to complete discharge.';
      setValidationError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const filteredBeds = selectedTab === 'All' 
    ? beds 
    : beds.filter(b => b.room_type === selectedTab);

  // Statistics calculation
  const totalBedsCount = beds.length;
  const vacantBedsCount = beds.filter(b => b.status === 'vacant').length;
  const occupiedBedsCount = beds.filter(b => b.status === 'occupied').length;
  const maintenanceBedsCount = beds.filter(b => b.status === 'maintenance').length;
  const icuBeds = beds.filter(b => b.room_type === 'ICU');
  const icuOccupiedCount = icuBeds.filter(b => b.status === 'occupied').length;

  // Filter vacant beds of current room type for manual assignment selection
  const vacantBedsForRoomType = beds.filter(
    b => b.status === 'vacant' && b.room_type === roomType
  );

  // Filter patients based on simple search
  const filteredPatients = patients.filter(p => {
    const isAdmitted = activeAdmissions.some(a => a.patient_id === p.id);
    const matchesSearch = p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
                          p.phone_number.includes(patientSearch);
    return !isAdmitted && matchesSearch;
  });

  // Top Critical ICU cases
  const icuCriticalAdmissions = activeAdmissions.filter(
    a => a.bed?.room_type === 'ICU' && a.severity === 'critical'
  );

  if (loading && beds.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Synchronizing clinical ward statuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admission & Bed Management
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Monitor real-time bed availability, execute triage admissions, discharges, and patient room transfers.
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => handleOpenAdmit()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-2xl transition shadow hover:shadow-indigo-500/10 active:scale-[0.98] inline-flex items-center gap-2 text-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Admit Patient
          </button>
        )}
      </div>

      {/* STATS OVERVIEW PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Beds", val: totalBedsCount, sub: "Total clinical capacity", color: "text-slate-900 border-slate-200 dark:text-white dark:border-slate-800" },
          { label: "Available Beds", val: vacantBedsCount, sub: "Vacant & ready for admit", color: "text-teal-600 border-teal-100 bg-teal-50/10 dark:text-teal-400 dark:border-teal-900/30" },
          { label: "Occupied Beds", val: occupiedBedsCount, sub: "Currently serving patients", color: "text-indigo-600 border-indigo-100 bg-indigo-50/10 dark:text-indigo-400 dark:border-indigo-900/30" },
          { label: "Maintenance", val: maintenanceBedsCount, sub: "Undergoing sanitization", color: "text-amber-600 border-amber-100 bg-amber-50/10 dark:text-amber-400 dark:border-amber-900/30" },
          { label: "ICU Triage Load", val: `${icuOccupiedCount}/${icuBeds.length}`, sub: `${icuBeds.length - icuOccupiedCount} critical care beds left`, color: "text-rose-600 border-rose-100 bg-rose-50/10 dark:text-rose-400 dark:border-rose-900/30" }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-4 rounded-2xl border shadow-sm dark:bg-slate-900 ${stat.color}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{stat.label}</span>
            <h3 className="text-2xl font-black mt-1.5 leading-none">{stat.val}</h3>
            <span className="text-[9px] block mt-1.5 opacity-60 leading-tight">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* ACTIVE ICU CRITICAL TRACKING CARDS */}
      {icuCriticalAdmissions.length > 0 && (
        <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-3xl dark:bg-rose-950/10 dark:border-rose-900/20 space-y-4">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-extrabold text-sm">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            Critical Care (ICU) Real-Time Monitoring
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {icuCriticalAdmissions.map((adm) => (
              <div 
                key={adm.id}
                className="bg-white border border-rose-200/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition relative overflow-hidden dark:bg-slate-900 dark:border-rose-900/20"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-5 h-5 opacity-40 shrink-0" />
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md dark:bg-rose-950/40 dark:text-rose-400">
                      Bed: {adm.bed?.bed_number}
                    </span>
                    <h4 className="font-extrabold text-slate-950 dark:text-white text-sm mt-1">{adm.patient?.name}</h4>
                    <p className="text-[10px] text-slate-400">{adm.patient?.age} yrs · {adm.patient?.gender} · Blood: {adm.patient?.blood_group}</p>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-2 text-[10px]">
                    <span className="font-bold text-slate-450 block uppercase tracking-wider">Admission Triage Details</span>
                    <p className="text-slate-700 mt-1 dark:text-slate-300 font-medium">{adm.reason}</p>
                  </div>

                  <div className="text-[9px] text-slate-400 flex justify-between items-center bg-slate-50 p-2 rounded-xl dark:bg-slate-950">
                    <span>Clinician: Dr. {adm.doctor?.full_name || 'Staff'}</span>
                    <span>Admitted: {new Date(adm.admission_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WARDS NAVIGATION TABS & GRID */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        
        {/* Tab switcher */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BedIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="font-extrabold text-slate-950 dark:text-white text-base">Ward Room Directory</h2>
          </div>
          
          <div className="flex flex-wrap items-center bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl dark:bg-slate-950 dark:border-slate-850 gap-1">
            {['All', 'ICU', 'General', 'Private', 'Semi-Private'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedTab === tab 
                    ? 'bg-white text-indigo-600 shadow dark:bg-slate-900 dark:text-indigo-400' 
                    : 'text-slate-450 hover:text-slate-850 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Wards grid view */}
        <div className="p-6">
          {filteredBeds.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <BedIcon className="w-12 h-12 text-slate-350 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Beds Listed</h3>
              <p className="text-xs text-slate-450 max-w-xs mx-auto">
                No clinical beds found matching the selected room criteria. Check dynamic seeding or insert rows.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredBeds.map((bed) => {
                // Find matching active admission if occupied
                const matchingAdmission = activeAdmissions.find(
                  adm => adm.bed_id === bed.id && adm.status === 'admitted'
                );
                
                return (
                  <div 
                    key={bed.id}
                    className={`border rounded-2xl p-4 shadow-inner flex flex-col justify-between h-44 relative transition-all duration-300 ${
                      bed.status === 'occupied' 
                        ? 'border-indigo-200 bg-indigo-50/5 hover:border-indigo-300 dark:border-indigo-950/30' 
                        : bed.status === 'maintenance'
                        ? 'border-amber-200 bg-amber-50/5 hover:border-amber-300 dark:border-amber-950/30'
                        : 'border-slate-150 hover:border-teal-400/70 hover:shadow-md dark:border-slate-800'
                    }`}
                  >
                    
                    {/* Top Row: Bed number and Room Type badge */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold text-slate-900 block text-sm dark:text-slate-100">
                          Bed: {bed.bed_number}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 uppercase tracking-wide">
                          {bed.room_type} Room
                        </span>
                      </div>
                      
                      {/* Bed Status Pill */}
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        bed.status === 'occupied' 
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                          : bed.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                      }`}>
                        {bed.status}
                      </span>
                    </div>

                    {/* Middle Row: Patient information OR Vacant illustration */}
                    <div className="my-3">
                      {bed.status === 'occupied' && matchingAdmission ? (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Active Occupant</span>
                          <span className="font-black text-slate-950 text-xs block truncate dark:text-slate-200">
                            {matchingAdmission.patient?.name || 'Unknown Patient'}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                              matchingAdmission.severity === 'critical'
                                ? 'bg-rose-150 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                                : matchingAdmission.severity === 'urgent'
                                ? 'bg-amber-150 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {matchingAdmission.severity}
                            </span>
                            <span className="text-[9px] text-slate-450 font-semibold">
                              Dr. {matchingAdmission.doctor?.full_name || 'Staff'}
                            </span>
                          </div>
                        </div>
                      ) : bed.status === 'maintenance' ? (
                        <div className="space-y-1">
                          <span className="text-[9px] text-amber-500 font-bold block uppercase tracking-wider">Sanitization Lock</span>
                          <p className="text-[10px] text-slate-450 leading-relaxed">
                            Undergoing deep sanitation clean. Unavailable for triages.
                          </p>
                        </div>
                      ) : (
                        <div className="py-2">
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            Ready for Triage Allotment
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 justify-end">
                      {bed.status === 'occupied' && matchingAdmission ? (
                        <>
                          <button
                            onClick={() => handleOpenTransfer(matchingAdmission)}
                            title="Transfer Patient to New Room"
                            className="p-1.5 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition dark:border-slate-800 dark:hover:bg-indigo-950/20"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDischarge(matchingAdmission)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition inline-flex items-center gap-1 active:scale-[0.98] shadow-sm hover:shadow-indigo-500/10"
                          >
                            <LogOut className="w-3 h-3" />
                            Discharge
                          </button>
                        </>
                      ) : bed.status === 'maintenance' ? (
                        <button
                          disabled
                          className="text-[10px] font-bold text-slate-350 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl cursor-not-allowed dark:bg-slate-950 dark:border-slate-900"
                        >
                          Unavailable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAdmit(bed)}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 active:scale-[0.98] shadow-sm hover:shadow-teal-500/10"
                        >
                          <Plus className="w-3 h-3" />
                          Admit Here
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ------------------- ADMIT PATIENT MODAL FORM ------------------- */}
      {admitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Admit Patient Dossier</h3>
              </div>
              <button
                onClick={() => setAdmitOpen(false)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Alerts */}
            {validationError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleAdmitSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Patient Selection Search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">1. Search & Select Patient *</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by patient name or phone number..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs shadow-inner"
                  />
                </div>
                
                {/* Search Results Dropdown List */}
                {patientSearch && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden max-h-36 overflow-y-auto divide-y divide-slate-850">
                    {filteredPatients.length === 0 ? (
                      <div className="p-3 text-[10px] text-slate-500 text-center">
                        No vacant unregistered patient records found.
                      </div>
                    ) : (
                      filteredPatients.map((pat) => (
                        <button
                          key={pat.id}
                          type="button"
                          onClick={() => {
                            setPatientId(pat.id.toString());
                            setPatientSearch(pat.name);
                          }}
                          className={`w-full text-left p-2.5 hover:bg-slate-850/50 flex justify-between items-center text-xs transition ${
                            patientId === pat.id.toString() ? 'bg-indigo-950/30 text-indigo-400' : 'text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold block">{pat.name}</span>
                            <span className="text-[10px] text-slate-500">{pat.age} yrs · {pat.gender} · Blood: {pat.blood_group}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{pat.phone_number}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                
                {patientId && !patientSearch && (
                  <div className="bg-indigo-950/20 border border-indigo-500/25 p-2 rounded-xl text-[10px] text-indigo-300 font-bold flex items-center justify-between">
                    <span>Selected: {patients.find(p => p.id.toString() === patientId)?.name}</span>
                    <button 
                      type="button" 
                      onClick={() => { setPatientId(''); setPatientSearch(''); }}
                      className="text-slate-450 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Severity and Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">2. Triage Severity *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 text-xs shadow-inner"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent (Triage)</option>
                    <option value="critical">Critical (ICU Request)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">3. Requested Room Type *</label>
                  <select
                    value={roomType}
                    disabled={targetBed !== null}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 text-xs shadow-inner disabled:opacity-50"
                  >
                    <option value="General">General Ward</option>
                    <option value="ICU">ICU</option>
                    <option value="Private">Private Room</option>
                    <option value="Semi-Private">Semi-Private Room</option>
                  </select>
                </div>
              </div>

              {/* Emergency allotment vs Manual allotment */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={targetBed !== null}
                    checked={emergencyAllotment}
                    onChange={(e) => setEmergencyAllotment(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-800 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">Emergency Auto-Allotment</span>
                    <span className="text-[9px] text-slate-450 block mt-0.5">
                      Check this to let the system auto-assign the first vacant bed matching criteria.
                    </span>
                  </div>
                </label>

                {!emergencyAllotment && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-850 animate-in fade-in duration-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Choose Vacant Bed *</label>
                    <select
                      value={manualBedId}
                      onChange={(e) => setManualBedId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs shadow-inner"
                    >
                      <option value="">-- Select Vacant Bed --</option>
                      {targetBed && (
                        <option value={targetBed.id}>{targetBed.bed_number} ({targetBed.room_type})</option>
                      )}
                      {vacantBedsForRoomType
                        .filter(b => targetBed ? b.id !== targetBed.id : true)
                        .map((b) => (
                          <option key={b.id} value={b.id}>{b.bed_number} (Vacant)</option>
                      ))}
                    </select>
                    {vacantBedsForRoomType.length === 0 && !targetBed && (
                      <span className="text-[9px] text-amber-400 block mt-1 leading-snug">
                        Warning: No vacant beds are currently available in the {roomType} ward. Toggle auto-allotment.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Admission Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">4. Chief Complaint & Admission Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Identify chief medical complaints, clinical symptoms, and initial diagnosis justifying patient admission..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setAdmitOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 animate-spin" />}
                  Submit Admission
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------- ROOM TRANSFER MODAL FORM ------------------- */}
      {transferOpen && targetAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Execute Patient Room Transfer</h3>
              </div>
              <button
                onClick={() => setTransferOpen(false)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Alerts */}
            {validationError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              
              {/* Patient dossier brief */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-white block">{targetAdmission.patient?.name}</span>
                  <span className="text-slate-400 block mt-0.5">
                    Currently in bed: <strong className="text-indigo-400 font-black">{targetAdmission.bed?.bed_number}</strong> ({targetAdmission.bed?.room_type})
                  </span>
                </div>
              </div>

              {/* Vacant Bed Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose New Target Vacant Bed *</label>
                <select
                  required
                  value={transferTargetBedId}
                  onChange={(e) => setTransferTargetBedId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 text-xs shadow-inner"
                >
                  <option value="">-- Choose New Vacant Bed --</option>
                  {beds
                    .filter(b => b.status === 'vacant' && b.id !== targetAdmission.bed_id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bed_number} - {b.room_type} Room (Vacant)
                      </option>
                  ))}
                </select>
                <span className="text-[9px] text-slate-450 block mt-1.5 leading-snug">
                  Note: Transferring the patient immediately vacates bed <strong className="text-slate-300">{targetAdmission.bed?.bed_number}</strong> and locks the selected target bed.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-850 text-slate-355 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 animate-spin" />}
                  Transfer Bed
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------- DISCHARGE PATIENT MODAL FORM ------------------- */}
      {dischargeOpen && targetAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Discharge Patient & Free Bed</h3>
              </div>
              <button
                onClick={() => setDischargeOpen(false)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Alerts */}
            {validationError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleDischargeSubmit} className="p-6 space-y-4">
              
              {/* Patient dossier brief */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-rose-600/10 text-rose-400 p-2.5 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-white block">{targetAdmission.patient?.name}</span>
                  <span className="text-slate-400 block mt-0.5">
                    Admitted: {new Date(targetAdmission.admission_date).toLocaleDateString()} to bed: <strong className="text-rose-400 font-bold">{targetAdmission.bed?.bed_number}</strong>
                  </span>
                </div>
              </div>

              {/* Treatment Notes Summary */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Discharge Summary Notes *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline clinical treatment resolution, follow-up instructions, prescription recovery plan, and final status of the discharged patient..."
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
                <span className="text-[9.5px] text-slate-450 block mt-1 leading-snug flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  Note: Discharging will change admission status to "discharged" and free Bed {targetAdmission.bed?.bed_number} immediately.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setDischargeOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-850 text-slate-350 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 animate-spin" />}
                  Confirm Discharge
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
