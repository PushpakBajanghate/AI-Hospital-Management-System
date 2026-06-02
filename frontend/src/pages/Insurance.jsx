import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import safeLocalStorage from '../services/storage';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  X,
  Loader2,
  FileCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function Insurance() {
  const { user, addToast } = useAuth();
  const [claims, setClaims] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter keys
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Claim Wizard Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [provider, setProvider] = useState('Blue Cross');
  const [policyNumber, setPolicyNumber] = useState('');
  const [claimAmount, setClaimAmount] = useState('500');
  const [diagnosisCode, setDiagnosisCode] = useState('ICD-10-CM');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  // Claim details panel state
  const [activeClaim, setActiveClaim] = useState(null);

  const fetchInsuranceData = async () => {
    setLoading(true);
    try {
      const patientRes = await api.get('/api/v1/patients/');
      setPatients(patientRes.data);

      const localClaims = safeLocalStorage.getItem('medos_claims');
      if (localClaims) {
        setClaims(JSON.parse(localClaims));
      } else {
        const seededClaims = [
          {
            id: 'CLM-5011',
            patient_name: patientRes.data[0]?.name || 'Bruce Wayne',
            patient_id: patientRes.data[0]?.id || 1,
            provider: 'Blue Cross Blue Shield',
            policy_number: 'BC-99882211',
            claim_amount: 850,
            diagnosis_code: 'I10 (Essential Hypertension)',
            status: 'approved',
            date: '2026-05-27',
            reason: 'Cardiological diagnostics scanning and clinical follow-up coverage.'
          },
          {
            id: 'CLM-5012',
            patient_name: patientRes.data[1]?.name || 'Clark Kent',
            patient_id: patientRes.data[1]?.id || 2,
            provider: 'Aetna Clinical Premium',
            policy_number: 'AE-33441199',
            claim_amount: 1200,
            diagnosis_code: 'J45.909 (Unspecified Asthma)',
            status: 'pending',
            date: '2026-05-29',
            reason: 'Emergency ICU bed allocation and oxygen nebulization support claims.'
          }
        ];
        setClaims(seededClaims);
        safeLocalStorage.setItem('medos_claims', JSON.stringify(seededClaims));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to sync insurance claims registers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const handleCreateClaim = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!patientId || !policyNumber || !claimAmount) {
      setValidationError('Please select a patient, policy number, and specify the claim amount.');
      return;
    }

    const patient = patients.find(p => p.id === parseInt(patientId, 10));
    if (!patient) {
      setValidationError('Target patient profile not found.');
      return;
    }

    setSubmitting(true);
    const amount = parseFloat(claimAmount) || 0;

    const newClaim = {
      id: `CLM-${Math.floor(5000 + Math.random() * 4999)}`,
      patient_name: patient.name,
      patient_id: patient.id,
      provider,
      policy_number: policyNumber,
      claim_amount: amount,
      diagnosis_code: diagnosisCode,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      reason: reason || 'Standard diagnostic consultation claim.'
    };

    setTimeout(() => {
      const updated = [newClaim, ...claims];
      setClaims(updated);
      safeLocalStorage.setItem('medos_claims', JSON.stringify(updated));
      setSubmitting(false);
      setModalOpen(false);
      addToast(`Claim ${newClaim.id} successfully compiled and dispatched to provider!`, 'success');
      
      // Reset
      setPatientId('');
      setPolicyNumber('');
      setClaimAmount('500');
      setDiagnosisCode('ICD-10-CM');
      setReason('');
    }, 850);
  };

  const handleUpdateClaimStatus = (claimId, newStatus) => {
    const updated = claims.map(cl => {
      if (cl.id === claimId) {
        return { ...cl, status: newStatus };
      }
      return cl;
    });
    setClaims(updated);
    safeLocalStorage.setItem('medos_claims', JSON.stringify(updated));
    if (activeClaim && activeClaim.id === claimId) {
      setActiveClaim({ ...activeClaim, status: newStatus });
    }
    addToast(`Insurance claim ${claimId} marked as ${newStatus.toUpperCase()}!`, 'success');
  };

  const handleDeleteClaim = (claimId) => {
    if (window.confirm(`Are you absolutely sure you want to retract claim ${claimId}?`)) {
      const updated = claims.filter(cl => cl.id !== claimId);
      setClaims(updated);
      safeLocalStorage.setItem('medos_claims', JSON.stringify(updated));
      if (activeClaim && activeClaim.id === claimId) {
        setActiveClaim(null);
      }
      addToast(`Claim ${claimId} voided and deleted.`, 'success');
    }
  };

  const totalClaimsSum = claims.reduce((acc, curr) => acc + curr.claim_amount, 0);
  const totalApprovedSum = claims.filter(cl => cl.status === 'approved').reduce((acc, curr) => acc + curr.claim_amount, 0);
  const totalPendingSum = claims.filter(cl => cl.status === 'pending').reduce((acc, curr) => acc + curr.claim_amount, 0);

  const filteredClaims = claims.filter(cl => {
    const nameMatch = cl.patient_name.toLowerCase().includes(search.toLowerCase());
    const idMatch = cl.id.toLowerCase().includes(search.toLowerCase());
    const providerMatch = cl.provider.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === '' || cl.status === statusFilter;
    return (nameMatch || idMatch || providerMatch) && statusMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            Insurance Claims Desk
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Process outpatient insurance coverages, policy co-pays, and claim audits.</p>
        </div>
        
        <button
          onClick={() => {
            setValidationError('');
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Compile Claim
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Cleared Claim Recoveries", value: `$${totalApprovedSum.toLocaleString()}`, desc: "Approved balances received", icon: FileCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100" },
          { title: "Under Auditing Review", value: `$${totalPendingSum.toLocaleString()}`, desc: "Claims currently in processing", icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100" },
          { title: "Total Policy Indexes", value: `$${totalClaimsSum.toLocaleString()}`, desc: "Combined claims ledger assets", icon: TrendingUp, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-950 mt-2 dark:text-white">{card.value}</h3>
                <p className="text-[10px] text-slate-450 mt-1">{card.desc}</p>
              </div>
              <div className={`p-3 rounded-2xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Claims Registry & Audit Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Claims Registry */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 dark:border-slate-800">
            <h2 className="font-extrabold text-slate-950 dark:text-white text-base">Claim Submissions Registry</h2>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative group flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Provider or Patient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white w-full dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-500">Querying insurance desks...</span>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto dark:text-slate-700" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Claims Compiled</h3>
              <p className="text-xs text-slate-450">Submit a claim to starting auditing policies.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-6 py-4">Claim ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Provider / Policy</th>
                    <th className="px-6 py-4">Claim Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredClaims.map((cl) => (
                    <tr 
                      key={cl.id} 
                      onClick={() => setActiveClaim(cl)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition dark:hover:bg-slate-950/20 ${
                        activeClaim?.id === cl.id ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-emerald-650 text-xs dark:text-emerald-400 animate-pulse">
                        {cl.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs dark:text-slate-200">
                        {cl.patient_name}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-slate-800 block dark:text-slate-300">{cl.provider}</span>
                        <span className="text-[10px] text-slate-400">{cl.policy_number}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        ${cl.claim_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          cl.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300' :
                          cl.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300' :
                          'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                        }`}>
                          {cl.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          {cl.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateClaimStatus(cl.id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition active:scale-[0.98]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateClaimStatus(cl.id, 'rejected')}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition active:scale-[0.98]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteClaim(cl.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:hover:bg-slate-855"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Claim Audit timelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 min-h-[400px] flex flex-col justify-between">
            {activeClaim ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white text-base leading-tight">{activeClaim.id}</h3>
                    <span className="text-[10px] text-slate-400 block mt-1">{activeClaim.provider}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                    activeClaim.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300' :
                    activeClaim.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300' :
                    'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                  }`}>
                    {activeClaim.status.toUpperCase()}
                  </span>
                </div>

                {/* Claim details */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450 block">Attending Patient</span>
                      <span className="font-bold text-slate-850 dark:text-slate-200 mt-0.5 block">{activeClaim.patient_name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450 block">Policy ID</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-300 mt-0.5 block">{activeClaim.policy_number}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450 block">Claim Amount</span>
                      <span className="font-extrabold text-blue-650 dark:text-blue-400 mt-0.5 block">${activeClaim.claim_amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450 block">ICD Diagnostics</span>
                      <span className="font-semibold text-slate-850 dark:text-slate-300 mt-0.5 block truncate" title={activeClaim.diagnosis_code}>
                        {activeClaim.diagnosis_code}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[9px] uppercase font-bold text-slate-450 block">Clinical Reason / Diagnosis justification</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed text-[11px] font-medium">
                      {activeClaim.reason}
                    </p>
                  </div>
                </div>

                {/* Audit progress timeline */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <span className="text-[9px] uppercase font-bold text-slate-450 block tracking-wider">Claims Auditing Timeline</span>
                  
                  <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800 text-xs">
                    {[
                      { step: "Policy validated & Compiled", desc: `Drafted at MedOS on ${activeClaim.date}`, date: activeClaim.date, check: true },
                      { step: "Provider portal transmission", desc: `Received by ${activeClaim.provider} network`, date: activeClaim.date, check: true },
                      { step: "Medical necessity evaluation", desc: "Inspection of clinical necessity & co-pays", check: activeClaim.status !== 'pending' || false, active: activeClaim.status === 'pending' },
                      { step: "Settlement Release", desc: activeClaim.status === 'approved' ? 'Balance released to MedOS secure account' : activeClaim.status === 'rejected' ? 'Claim rejected by auditor' : 'Pending final decision check', check: activeClaim.status === 'approved', active: activeClaim.status === 'approved' || activeClaim.status === 'rejected' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <span className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-1.5 border-2 ${
                          step.check 
                            ? 'bg-emerald-500 border-emerald-200' 
                            : step.active 
                            ? 'bg-amber-500 border-amber-250 animate-pulse' 
                            : 'bg-slate-200 dark:bg-slate-800 border-slate-100'
                        }`}></span>
                        
                        <div className={`${step.check ? 'text-slate-900 dark:text-slate-200' : 'text-slate-450'} leading-none`}>
                          <span className="font-bold">{step.step}</span>
                          <span className="text-[9.5px] block text-slate-400 mt-1 leading-snug">{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="my-auto text-center space-y-3 py-16">
                <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto dark:text-slate-850" />
                <h4 className="text-xs font-bold text-slate-450">No Claim Inspected</h4>
                <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                  Click on any compiled claim entry in the ledger to view real-time transmission, approvals, and audits.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Claim submission wizard modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Compile Insurance Claim</h3>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleCreateClaim} className="p-6 space-y-4">
              
              {/* Select Patient */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">1. Patient Profile *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Phone: {p.phone_number})</option>
                  ))}
                </select>
              </div>

              {/* Provider & Policy details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">2. Primary Provider *</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs cursor-pointer"
                  >
                    <option value="Blue Cross Blue Shield">Blue Cross</option>
                    <option value="Aetna Clinical Premium">Aetna Premium</option>
                    <option value="Cigna HealthCare Corp">Cigna Health</option>
                    <option value="Medicare Advantage Plan">Medicare</option>
                    <option value="UnitedHealthcare Inc">UnitedHealth</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">3. Policy Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., BC-990022"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Claim Amount & ICD Code */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">4. Claim Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">5. Diagnosis Code *</label>
                  <input
                    type="text"
                    required
                    value={diagnosisCode}
                    onChange={(e) => setDiagnosisCode(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Reason for necessity */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">6. Medical Necessity Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Clinical diagnostic justifications supporting policy coverage claims..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs resize-none"
                />
              </div>

              {/* Submit triggers */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-end bg-slate-50 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 animate-spin" />}
                  Compile & Send
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
