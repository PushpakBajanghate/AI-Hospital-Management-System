import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Plus, User, UserCheck, X, CheckCircle, AlertCircle, Loader2, ArrowRight, BookOpen, Trash2, Edit2, Play, CheckSquare } from 'lucide-react';

const STANDARD_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  // Dashboard queue monitor filters
  const [activeQueueDoctor, setActiveQueueDoctor] = useState('');
  const [activeQueueDate, setActiveQueueDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  
  // Reschedule targeting
  const [targetAppointment, setTargetAppointment] = useState(null);

  // Booking fields state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Booked slots tracking
  const [bookedSlots, setBookedSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { addToast } = useAuth();

  // Load baseline resources
  const fetchBaseline = async () => {
    try {
      const [doctorsRes, patientsRes] = await Promise.all([
        api.get('/api/v1/auth/doctors'),
        api.get('/api/v1/patients')
      ]);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);

      if (doctorsRes.data.length > 0) {
        setSelectedDoctorId(doctorsRes.data[0].id);
        setActiveQueueDoctor(doctorsRes.data[0].id);
      }
      if (patientsRes.data.length > 0) {
        setSelectedPatientId(patientsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load clinic configuration resources.', 'error');
    }
  };

  // Fetch appointments list
  const fetchAppointmentsList = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/appointments/');
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve appointment schedule ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      await fetchBaseline();
      await fetchAppointmentsList();
    };
    initPage();
  }, []);

  // Monitor slot availability dynamically
  useEffect(() => {
    const fetchSlotsAvailability = async () => {
      if (!selectedDoctorId || !appointmentDate) return;
      setFetchingSlots(true);
      try {
        const response = await api.get('/api/v1/appointments/', {
          params: {
            doctor_id: selectedDoctorId,
            appointment_date: appointmentDate
          }
        });
        // Filter out slots that are currently active (i.e. status != cancelled)
        const booked = response.data
          .filter(app => app.status !== 'cancelled')
          .map(app => app.time_slot);
        setBookedSlots(booked);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingSlots(false);
      }
    };
    fetchSlotsAvailability();
  }, [selectedDoctorId, appointmentDate, bookingOpen]);

  // Fetch slots during rescheduling
  useEffect(() => {
    const fetchRescheduleAvailability = async () => {
      if (!targetAppointment || !appointmentDate) return;
      setFetchingSlots(true);
      try {
        const response = await api.get('/api/v1/appointments/', {
          params: {
            doctor_id: targetAppointment.doctor_id,
            appointment_date: appointmentDate
          }
        });
        const booked = response.data
          .filter(app => app.status !== 'cancelled' && app.id !== targetAppointment.id)
          .map(app => app.time_slot);
        setBookedSlots(booked);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingSlots(false);
      }
    };
    fetchRescheduleAvailability();
  }, [targetAppointment, appointmentDate, rescheduleOpen]);

  // Open booking workflow
  const handleOpenBooking = () => {
    setSelectedSlot('');
    setNotes('');
    setValidationError('');
    setAppointmentDate(new Date().toISOString().split('T')[0]);
    if (doctors.length > 0) setSelectedDoctorId(doctors[0].id);
    if (patients.length > 0) setSelectedPatientId(patients[0].id);
    setBookingOpen(true);
  };

  // Submit appointment booking
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedPatientId || !selectedDoctorId || !appointmentDate || !selectedSlot) {
      setValidationError('Please select a doctor, patient, date, and available time slot.');
      return;
    }

    setFormSubmitting(true);
    try {
      await api.post('/api/v1/appointments/', {
        patient_id: parseInt(selectedPatientId, 10),
        doctor_id: parseInt(selectedDoctorId, 10),
        appointment_date: appointmentDate,
        time_slot: selectedSlot,
        notes: notes || null
      });
      addToast('Appointment scheduled successfully!', 'success');
      setBookingOpen(false);
      fetchAppointmentsList();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to book slot.';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Reschedule workflow
  const handleOpenReschedule = (app) => {
    setTargetAppointment(app);
    setAppointmentDate(app.appointment_date);
    setSelectedSlot(app.time_slot);
    setValidationError('');
    setRescheduleOpen(true);
  };

  // Submit Rescheduling details
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedSlot || !appointmentDate) {
      setValidationError('Please select a valid date and available time slot.');
      return;
    }

    setFormSubmitting(true);
    try {
      await api.put(`/api/v1/appointments/${targetAppointment.id}`, {
        appointment_date: appointmentDate,
        time_slot: selectedSlot
      });
      addToast('Rescheduled appointment and reset token in doctor queue.', 'success');
      setRescheduleOpen(false);
      fetchAppointmentsList();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to reschedule slot.';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Update Status parameters (Check-In, Complete, Cancel)
  const handleUpdateStatus = async (id, statusValue, patientName) => {
    try {
      await api.put(`/api/v1/appointments/${id}`, {
        status: statusValue
      });
      addToast(`Updated appointment for ${patientName} to ${statusValue.toUpperCase()}`, 'success');
      fetchAppointmentsList();
    } catch (err) {
      console.error(err);
      addToast('Failed to update appointment status.', 'error');
    }
  };

  // Delete appointment completely
  const handleDeleteAppointment = async (id, patientName) => {
    if (window.confirm(`Are you absolutely sure you want to remove appointment for ${patientName}?`)) {
      try {
        await api.delete(`/api/v1/appointments/${id}`);
        addToast(`Removed appointment for ${patientName}.`, 'success');
        fetchAppointmentsList();
      } catch (err) {
        console.error(err);
        addToast('Failed to delete appointment record.', 'error');
      }
    }
  };

  // ----------------- QUEUE METRICS COMPILATION -----------------
  const getQueueMetrics = () => {
    // Filter active appointments matching the selected queue filter date and doctor
    const filteredApps = appointments.filter(app => 
      app.doctor_id == activeQueueDoctor && 
      app.appointment_date === activeQueueDate &&
      app.status !== 'cancelled'
    ).sort((a, b) => a.token_number - b.token_number);

    const totalActive = filteredApps.length;
    
    // Now serving: find lowest active scheduled or checked_in token
    const servingApp = filteredApps.find(app => app.status === 'checked_in') || 
                       filteredApps.find(app => app.status === 'scheduled');
                       
    // Next in Line
    const remainingApps = filteredApps.filter(app => 
      app.status === 'scheduled' || 
      (servingApp && app.token_number > servingApp.token_number && app.status !== 'completed')
    );
    const nextApp = remainingApps[0]?.id === servingApp?.id ? remainingApps[1] : remainingApps[0];

    return {
      totalActive,
      serving: servingApp ? `Token #${servingApp.token_number} (${servingApp.patient?.name})` : 'No active queue',
      next: nextApp ? `Token #${nextApp.token_number} (${nextApp.patient?.name})` : 'None scheduled',
      servingStatus: servingApp?.status || null
    };
  };

  const queue = getQueueMetrics();

  const getStatusPill = (statusVal) => {
    const styles = {
      scheduled: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300',
      checked_in: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-300',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-300',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-300',
    };
    return styles[statusVal] || styles.scheduled;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Clinic Schedule</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Book consultations, schedule slots, and monitor live serving queues.</p>
        </div>
        <button
          onClick={handleOpenBooking}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow shadow-blue-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Book Consultation
        </button>
      </div>

      {/* ----------------- QUEUE MONITOR DASHBOARD CARD ----------------- */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Dynamic header toggles inside queue metrics */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold">Active Practitioner Queue Monitor</h2>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            {/* Choose Doctor */}
            <select
              value={activeQueueDoctor}
              onChange={(e) => setActiveQueueDoctor(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.full_name}</option>
              ))}
            </select>
            
            {/* Choose Date */}
            <input
              type="date"
              value={activeQueueDate}
              onChange={(e) => setActiveQueueDate(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Visual Queue Monitor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Queue Status</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full ${queue.totalActive > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`}></span>
              <span className="text-lg font-extrabold">{queue.totalActive > 0 ? 'Active serving' : 'Idle Queue'}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1.5">{queue.totalActive} active consulting bookings for today</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Now Consulting</span>
            <h3 className="text-lg font-black text-cyan-400 mt-2 truncate">{queue.serving}</h3>
            {queue.servingStatus && (
              <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                Status: {queue.servingStatus.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>

          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Next in Line</span>
            <h3 className="text-lg font-bold text-slate-300 mt-2 truncate">{queue.next}</h3>
            <span className="text-[10px] text-slate-500 block mt-1">Ready for clinical dispatch</span>
          </div>
        </div>
      </div>

      {/* ----------------- SCHEDULE LEDGER TABLE ----------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Querying schedule...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto dark:text-slate-700" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Appointments Booked</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clinic schedule is empty. Click "Book Consultation" to set up patient visits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-4">Token #</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Practitioner (Doctor)</th>
                  <th className="px-6 py-4">Date & Time Slot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-800 text-sm dark:text-slate-350">
                        Token #{app.token_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-xs dark:text-slate-200">
                      {app.patient?.name || `Patient ID: ${app.patient_id}`}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-650 dark:text-slate-300">
                      {app.doctor?.full_name || `Doctor ID: ${app.doctor_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 text-xs block dark:text-slate-200">
                        {app.appointment_date}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {app.time_slot}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`border text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusPill(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                      {app.notes || <span className="text-slate-350 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        
                        {/* Dynamic Status checks action pills */}
                        {app.status === 'scheduled' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'checked_in', app.patient?.name)}
                            title="Check-In Patient"
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition dark:hover:bg-slate-800"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {app.status === 'checked_in' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'completed', app.patient?.name)}
                            title="Complete Consultation"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition dark:hover:bg-slate-800"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}

                        {app.status !== 'completed' && app.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleOpenReschedule(app)}
                              title="Reschedule Visit"
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'cancelled', app.patient?.name)}
                              title="Cancel Appointment"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition dark:hover:bg-slate-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteAppointment(app.id, app.patient?.name)}
                          title="Delete Appointment"
                          className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ----------------- SCHEDULING BOOKING MODAL ----------------- */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-base font-bold text-white">Book Clinic Consultation</h3>
              <button
                onClick={() => setBookingOpen(false)}
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

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Select Patient & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
                  >
                    {patients.map(pat => (
                      <option key={pat.id} value={pat.id}>{pat.name} (Age: {pat.age})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Doctor *</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
                  >
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Date *</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs shadow-inner"
                />
              </div>

              {/* DYNAMIC SLOT SELECTOR GRID */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Time Slots *</label>
                
                {fetchingSlots ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-400">Scanning doctor schedule...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {STANDARD_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-xl text-[10px] font-bold border transition text-center ${
                            isBooked
                              ? 'bg-rose-950/20 border-rose-900/30 text-rose-500/50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          {slot}
                          {isBooked && <span className="block text-[8px] font-medium text-rose-500 opacity-60">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Consult notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notes / Reason for Visit</label>
                <textarea
                  rows={2}
                  placeholder="Routine cardiovascular check-up, headache follow-up, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end bg-slate-900">
                <button
                  type="button"
                  onClick={() => setBookingOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-3 animate-spin" />}
                  Schedule Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- RESCHEDULING MODAL OVERLAY ----------------- */}
      {rescheduleOpen && targetAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-base font-bold text-white">Reschedule Appointment</h3>
              <button
                onClick={() => setRescheduleOpen(false)}
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

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Patient</span>
                <span className="text-xs font-semibold text-white block">{targetAppointment.patient?.name}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Practitioner</span>
                <span className="text-xs font-semibold text-white block">{targetAppointment.doctor?.full_name}</span>
              </div>

              {/* Select Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Reschedule Date *</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs shadow-inner"
                />
              </div>

              {/* DYNAMIC SLOT SELECTOR */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Available Time Slot *</label>
                
                {fetchingSlots ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-400">Scanning doctor schedule...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {STANDARD_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-xl text-[10px] font-bold border transition text-center ${
                            isBooked
                              ? 'bg-rose-950/20 border-rose-900/30 text-rose-500/50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          {slot}
                          {isBooked && <span className="block text-[8px] font-medium text-rose-500 opacity-60">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end bg-slate-900">
                <button
                  type="button"
                  onClick={() => setRescheduleOpen(false)}
                  className="px-4 py-2 border border-slate-850 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-3 animate-spin" />}
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
