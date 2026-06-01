import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Search, 
  Filter, 
  User, 
  Calendar,
  X,
  Loader2,
  Printer
} from 'lucide-react';

export default function Billing() {
  const { user, addToast } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Invoice modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [consultationFee, setConsultationFee] = useState('150');
  const [roomCharges, setRoomCharges] = useState('0');
  const [labCharges, setLabCharges] = useState('0');
  const [pharmacyCharges, setPharmacyCharges] = useState('0');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  // Invoice Detail view
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Mock initial invoices if DB has none, or fetch them
  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // Since backend doesn't have an explicit billing table, we will fetch patients and appointments
      // and generate/read mock billing invoices cached in localStorage to prevent loss on reload
      const patientRes = await api.get('/api/v1/patients/');
      setPatients(patientRes.data);

      const localInvoices = localStorage.getItem('medos_invoices');
      if (localInvoices) {
        setInvoices(JSON.parse(localInvoices));
      } else {
        // Seed default mock invoices linked to real/mock patients
        const seeded = [
          {
            id: 'INV-1001',
            patient_name: patientRes.data[0]?.name || 'Bruce Wayne',
            patient_id: patientRes.data[0]?.id || 1,
            consultation_fee: 150,
            room_charges: 350,
            lab_charges: 120,
            pharmacy_charges: 85,
            total_amount: 705,
            status: 'paid',
            date: '2026-05-28',
            description: 'Routine general cardiac checkup and diagnostic blood profiling.'
          },
          {
            id: 'INV-1002',
            patient_name: patientRes.data[1]?.name || 'Clark Kent',
            patient_id: patientRes.data[1]?.id || 2,
            consultation_fee: 150,
            room_charges: 0,
            lab_charges: 450,
            pharmacy_charges: 180,
            total_amount: 780,
            status: 'pending',
            date: '2026-05-29',
            description: 'AI classification classification scans and subsequent allergy treatments.'
          }
        ];
        setInvoices(seeded);
        localStorage.setItem('medos_invoices', JSON.stringify(seeded));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to sync billing registers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!patientId) {
      setValidationError('Please select a patient.');
      return;
    }

    const patient = patients.find(p => p.id === parseInt(patientId, 10));
    if (!patient) {
      setValidationError('Target patient record not found.');
      return;
    }

    setSubmitting(true);

    const cFee = parseFloat(consultationFee) || 0;
    const rFee = parseFloat(roomCharges) || 0;
    const lFee = parseFloat(labCharges) || 0;
    const pFee = parseFloat(pharmacyCharges) || 0;
    const total = cFee + rFee + lFee + pFee;

    const newInvoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_name: patient.name,
      patient_id: patient.id,
      consultation_fee: cFee,
      room_charges: rFee,
      lab_charges: lFee,
      pharmacy_charges: pFee,
      total_amount: total,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: description || 'Hospital clinical care consultation.'
    };

    setTimeout(() => {
      const updated = [newInvoice, ...invoices];
      setInvoices(updated);
      localStorage.setItem('medos_invoices', JSON.stringify(updated));
      setSubmitting(false);
      setModalOpen(false);
      addToast(`Invoice ${newInvoice.id} generated successfully!`, 'success');
      
      // Reset form
      setPatientId('');
      setConsultationFee('150');
      setRoomCharges('0');
      setLabCharges('0');
      setPharmacyCharges('0');
      setDescription('');
    }, 800);
  };

  const handlePayInvoice = (invoiceId) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'paid' };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem('medos_invoices', JSON.stringify(updated));
    if (activeInvoice && activeInvoice.id === invoiceId) {
      setActiveInvoice({ ...activeInvoice, status: 'paid' });
    }
    addToast(`Invoice ${invoiceId} marked as SETTLED! Receipt dispatched.`, 'success');
  };

  const handleDeleteInvoice = (invoiceId) => {
    if (window.confirm(`Are you sure you want to void and delete invoice ${invoiceId}?`)) {
      const updated = invoices.filter(inv => inv.id !== invoiceId);
      setInvoices(updated);
      localStorage.setItem('medos_invoices', JSON.stringify(updated));
      if (activeInvoice && activeInvoice.id === invoiceId) {
        setActiveInvoice(null);
      }
      addToast(`Invoice ${invoiceId} has been successfully voided.`, 'success');
    }
  };

  // Metrics
  const totalOutstanding = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const totalCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;

  const filteredInvoices = invoices.filter(inv => {
    const nameMatch = inv.patient_name.toLowerCase().includes(search.toLowerCase());
    const idMatch = inv.id.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === '' || inv.status === statusFilter;
    return (nameMatch || idMatch) && statusMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            Financial & Billing Hub
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Generate patient invoices, track co-pay balances, and settle accounts.</p>
        </div>
        
        <button
          onClick={() => {
            setValidationError('');
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow shadow-blue-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Total Revenue Collected", value: `$${totalCollected.toLocaleString()}`, desc: "Invoice payments cleared", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100" },
          { title: "Pending Outstandings", value: `$${totalOutstanding.toLocaleString()}`, desc: `${pendingCount} invoices awaiting co-pay`, icon: Activity, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100" },
          { title: "Invoice Settle Rate", value: invoices.length ? `${Math.round((invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100)}%` : '100%', desc: "General clearance index", icon: TrendingUp, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100" },
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

      {/* Registry Table & Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Invoices Registry */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 flex flex-col">
          
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 dark:border-slate-800">
            <h2 className="font-extrabold text-slate-950 dark:text-white text-base">Invoices Ledger</h2>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative group flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID or Patient..."
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-500">Querying financial records...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto dark:text-slate-700" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400">No Invoices Found</h3>
              <p className="text-xs text-slate-450">Generate a billing invoice or modify your filter settings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => setActiveInvoice(inv)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition dark:hover:bg-slate-950/20 ${
                        activeInvoice?.id === inv.id ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-blue-650 text-xs dark:text-blue-400">
                        {inv.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs dark:text-slate-200">
                        {inv.patient_name}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-450">
                        {inv.date}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-xs text-slate-800 dark:text-slate-200">
                        ${inv.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          {inv.status === 'pending' && (
                            <button
                              onClick={() => handlePayInvoice(inv.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition active:scale-[0.98]"
                            >
                              Settle
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:hover:bg-slate-850"
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

        {/* Right Column - Invoice Receipt Detail panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-[400px]">
            {activeInvoice ? (
              <div className="space-y-6">
                
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white text-base leading-tight">{activeInvoice.id}</h3>
                    <span className="text-[10px] text-slate-400 block mt-1">Hospital EMR Clearance Receipt</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    activeInvoice.status === 'paid'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                      : 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-350'
                  }`}>
                    {activeInvoice.status.toUpperCase()}
                  </span>
                </div>

                {/* Patient / Date dossier */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Patient Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{activeInvoice.patient_name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Issue Date</span>
                    <span className="font-semibold text-slate-650 dark:text-slate-350 mt-0.5 block">{activeInvoice.date}</span>
                  </div>
                </div>

                {/* Breakdowns */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-450 block tracking-wider">Fee breakdown</span>
                  {[
                    { label: "Consultation Fee", value: activeInvoice.consultation_fee },
                    { label: "Clinical Bed / Room Charges", value: activeInvoice.room_charges },
                    { label: "Clinical Lab Diagnostic Fees", value: activeInvoice.lab_charges },
                    { label: "EMR Pharmacy / Medication Charges", value: activeInvoice.pharmacy_charges }
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-600 dark:text-slate-350">
                      <span>{row.label}</span>
                      <span className="font-semibold">${row.value.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-blue-600 dark:text-blue-400">${activeInvoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Clinical Notes brief */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-850">
                  <span className="font-extrabold text-slate-700 dark:text-slate-350 block mb-1">Billing Summary / Notes</span>
                  {activeInvoice.description}
                </div>

                {/* Print/Download triggers */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      addToast('Initiating printer setup dialogue...', 'info');
                      window.print();
                    }}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 rounded-xl py-2 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                  {activeInvoice.status === 'pending' && (
                    <button
                      onClick={() => handlePayInvoice(activeInvoice.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 text-xs font-bold transition shadow"
                    >
                      Settle Balance
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="my-auto text-center space-y-3 py-16">
                <FileText className="w-12 h-12 text-slate-200 mx-auto dark:text-slate-850" />
                <h4 className="text-xs font-bold text-slate-450">No Active Receipt Selected</h4>
                <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                  Click on any invoice row in the registry ledger to inspect billing co-pays and generate printouts.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice creation modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Generate Hospital Invoice</h3>
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
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              
              {/* Select Patient */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Patient *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="">-- Select Patient Profile --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Phone: {p.phone_number})</option>
                  ))}
                </select>
              </div>

              {/* Grid Fees details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bed/Room Charges ($)</label>
                  <input
                    type="number"
                    value={roomCharges}
                    onChange={(e) => setRoomCharges(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostics Lab Fee ($)</label>
                  <input
                    type="number"
                    value={labCharges}
                    onChange={(e) => setLabCharges(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pharmacy Charges ($)</label>
                  <input
                    type="number"
                    value={pharmacyCharges}
                    onChange={(e) => setPharmacyCharges(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of treatment, medications, surgery clearance, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Generate Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
