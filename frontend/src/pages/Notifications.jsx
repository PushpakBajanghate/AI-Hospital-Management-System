import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Send, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  Search, 
  MessageSquare, 
  Play, 
  Loader2, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total_sent: 0,
    total_pending: 0,
    total_failed: 0,
    success_rate: 100.0
  });
  const [loading, setLoading] = useState(true);
  const [triggeringQueue, setTriggeringQueue] = useState(false);
  const [activeTab, setActiveTab] = useState('composer'); // 'composer' or 'scheduler'

  // Instant Composer Form State
  const [instantPatientId, setInstantPatientId] = useState('');
  const [instantMessage, setInstantMessage] = useState('');
  const [instantSubmitting, setInstantSubmitting] = useState(false);

  // Scheduler Form State
  const [schedulePatientId, setSchedulePatientId] = useState('');
  const [scheduleType, setScheduleType] = useState('appointment');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  const { addToast } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, statsRes, patientRes] = await Promise.all([
        api.get('/api/v1/notifications/'),
        api.get('/api/v1/notifications/stats'),
        api.get('/api/v1/patients/')
      ]);
      setNotifications(notifRes.data);
      setStats(statsRes.data);
      setPatients(patientRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch notification system records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Send Instant SMS
  const handleSendInstant = async (e) => {
    e.preventDefault();
    if (!instantPatientId || !instantMessage.trim()) {
      addToast('Please select a patient and enter a message.', 'warning');
      return;
    }
    setInstantSubmitting(true);
    try {
      const response = await api.post('/api/v1/notifications/send-instant', {
        patient_id: parseInt(instantPatientId, 10),
        message: instantMessage.trim()
      });
      addToast('Instant SMS dispatched successfully!', 'success');
      setInstantMessage('');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to dispatch instant SMS.', 'error');
    } finally {
      setInstantSubmitting(false);
    }
  };

  // Schedule SMS Reminder
  const handleScheduleReminder = async (e) => {
    e.preventDefault();
    if (!schedulePatientId || !scheduleDate || !scheduleTime || !scheduleMessage.trim()) {
      addToast('Please fill in all scheduling fields.', 'warning');
      return;
    }
    setScheduleSubmitting(true);
    try {
      const selectedPatient = patients.find(p => p.id === parseInt(schedulePatientId, 10));
      if (!selectedPatient) throw new Error('Patient not found');

      // Construct timezone-aware datetime in UTC
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);

      await api.post('/api/v1/notifications/schedule', {
        patient_id: parseInt(schedulePatientId, 10),
        type: scheduleType,
        message: scheduleMessage.trim(),
        phone_number: selectedPatient.phone_number,
        scheduled_time: scheduledDateTime.toISOString()
      });

      addToast('SMS Reminder scheduled successfully!', 'success');
      setSchedulePatientId('');
      setScheduleDate('');
      setScheduleTime('');
      setScheduleMessage('');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to schedule reminder SMS.', 'error');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // Manually Trigger Pending Queue
  const handleTriggerQueue = async () => {
    setTriggeringQueue(true);
    try {
      const response = await api.post('/api/v1/notifications/trigger-pending');
      const processedCount = response.data.length;
      addToast(`Queue triggered! Delivered ${processedCount} pending SMS reminders.`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Error processing pending SMS reminders.', 'error');
    } finally {
      setTriggeringQueue(false);
    }
  };

  // Cancel/Delete Notification
  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to cancel this scheduled SMS notification?')) {
      try {
        await api.delete(`/api/v1/notifications/${id}`);
        addToast('Scheduled SMS notification cancelled.', 'success');
        fetchData();
      } catch (err) {
        console.error(err);
        addToast('Failed to cancel notification.', 'error');
      }
    }
  };

  // Helper to load templates
  const applyTemplate = (type, patientId) => {
    const patient = patients.find(p => p.id === parseInt(patientId, 10));
    const patientName = patient ? patient.name : '[Patient Name]';
    
    const templates = {
      appointment: `Dear ${patientName}, this is a reminder for your upcoming appointment. Please arrive 15 minutes before your slot. Reply HELP for info.`,
      discharge: `MedOS Alert: Dear ${patientName}, you have been discharged from MedOS Hospital. Please follow post-care instructions and rest.`,
      follow_up: `Dear ${patientName}, we hope you are recovering well since your discharge! Please schedule a follow-up consultation at your convenience.`,
    };

    if (activeTab === 'composer') {
      setInstantMessage(templates[type] || '');
    } else {
      setScheduleMessage(templates[type] || '');
    }
  };

  // Format Timestamps
  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logs by search term
  const filteredNotifications = notifications.filter(n => {
    const patientName = n.patient?.name?.toLowerCase() || '';
    const phone = n.phone_number?.toLowerCase() || '';
    const message = n.message?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return patientName.includes(query) || phone.includes(query) || message.includes(query);
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-8 h-8 text-blue-600 animate-swing" />
            SMS Notification Hub
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Send instant alerts, manage automated templates, and schedule future-dated Twilio SMS reminders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:shadow transition dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleTriggerQueue}
            disabled={triggeringQueue || stats.total_pending === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-400 disabled:to-slate-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggeringQueue ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Trigger Pending Queue ({stats.total_pending})
          </button>
        </div>
      </div>

      {/* Hero Analytics Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Delivered SMS", value: stats.total_sent, desc: "Successfully sent logs", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" },
          { title: "Pending Queue", value: stats.total_pending, desc: "Schedules waiting", icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" },
          { title: "Delivery Failures", value: stats.total_failed, desc: "Error logs flagged", icon: AlertTriangle, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30" },
          { title: "Delivery Success", value: `${stats.success_rate}%`, desc: "Avg twilio delivery", icon: Sparkles, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2 dark:text-white">{card.value}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand side Form Composers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            
            {/* Tab selector */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('composer')}
                className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'composer' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Instant Composer
              </button>
              <button
                onClick={() => setActiveTab('scheduler')}
                className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'scheduler' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-900 dark:text-blue-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Reminder Scheduler
              </button>
            </div>

            {/* TAB 1: INSTANT COMPOSER */}
            {activeTab === 'composer' && (
              <form onSubmit={handleSendInstant} className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Send Direct SMS</h3>
                  <p className="text-xs text-slate-400">Compose and dispatch custom SMS alerts instantly using Twilio.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Patient *</label>
                  <select
                    required
                    value={instantPatientId}
                    onChange={(e) => setInstantPatientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="">-- Choose registered patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phone_number})</option>
                    ))}
                  </select>
                </div>

                {instantPatientId && (
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-wrap gap-2 justify-between items-center dark:bg-slate-950/20 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Templates:</span>
                    <div className="flex gap-1.5">
                      {['appointment', 'discharge', 'follow_up'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => applyTemplate(t, instantPatientId)}
                          className="bg-white border border-slate-200 px-2 py-1 rounded-md text-[9px] font-bold text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850"
                        >
                          {t.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMS Message Body *</label>
                  <textarea
                    required
                    rows={4}
                    maxLength={160}
                    placeholder="Enter message body (Max 160 characters)..."
                    value={instantMessage}
                    onChange={(e) => setInstantMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs resize-none"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Twilio SMS standard charges apply.</span>
                    <span className={instantMessage.length >= 140 ? "text-rose-500 font-bold" : ""}>
                      {instantMessage.length}/160 chars
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={instantSubmitting || !instantPatientId || !instantMessage.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow active:scale-[0.98]"
                >
                  {instantSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Dispatch Instant SMS
                </button>
              </form>
            )}

            {/* TAB 2: REMINDER SCHEDULER */}
            {activeTab === 'scheduler' && (
              <form onSubmit={handleScheduleReminder} className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Schedule Alert Reminder</h3>
                  <p className="text-xs text-slate-400">Automate future SMS alerts for outpatient follow-ups and diagnostics.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Patient *</label>
                  <select
                    required
                    value={schedulePatientId}
                    onChange={(e) => setSchedulePatientId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="">-- Choose registered patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phone_number})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reminder Type *</label>
                    <select
                      value={scheduleType}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
                    >
                      <option value="appointment">Appointment</option>
                      <option value="discharge">Discharge care</option>
                      <option value="follow_up">Outpatient Follow-up</option>
                      <option value="custom">Custom SMS alert</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule Time Slot *</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        required
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-[10px]"
                      />
                      <input
                        type="time"
                        required
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                {schedulePatientId && (
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex flex-wrap gap-2 justify-between items-center dark:bg-slate-950/20 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Templates:</span>
                    <div className="flex gap-1.5">
                      {['appointment', 'discharge', 'follow_up'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => applyTemplate(t, schedulePatientId)}
                          className="bg-white border border-slate-200 px-2 py-1 rounded-md text-[9px] font-bold text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850"
                        >
                          {t.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMS Message Body *</label>
                  <textarea
                    required
                    rows={3}
                    maxLength={160}
                    placeholder="Enter reminder body (Max 160 characters)..."
                    value={scheduleMessage}
                    onChange={(e) => setScheduleMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-white focus:outline-none focus:border-blue-500 text-xs resize-none"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Twilio scheduled reminder pipeline active.</span>
                    <span className={scheduleMessage.length >= 140 ? "text-rose-500 font-bold" : ""}>
                      {scheduleMessage.length}/160 chars
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={scheduleSubmitting || !schedulePatientId || !scheduleDate || !scheduleTime || !scheduleMessage.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-300 disabled:to-slate-300 text-white py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow active:scale-[0.98]"
                >
                  {scheduleSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5" />
                  )}
                  Schedule Twilio Reminder
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Hand side SMS Log & Table */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            
            {/* Search filter Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">SMS Communications Log</h3>
                <p className="text-xs text-slate-400">Review status and audit history of patient mobile notifications.</p>
              </div>
              
              {/* Search bar */}
              <div className="relative w-full sm:max-w-[240px] group">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue-500 transition" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Table Content */}
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm font-semibold text-slate-500">Querying SMS databases...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-350 mx-auto dark:text-slate-700" />
                <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">No Notifications Logged</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  There are no text notifications matching your search parameters. Schedule or compose one to get started!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                      <th className="px-5 py-3">Patient</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Message</th>
                      <th className="px-5 py-3">Scheduled / Sent</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredNotifications.map((notif) => (
                      <tr key={notif.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-950/20 text-xs">
                        
                        {/* Patient info */}
                        <td className="px-5 py-3">
                          <span className="font-bold text-slate-800 block dark:text-slate-200">
                            {notif.patient?.name || 'Deleted Patient'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            {notif.phone_number}
                          </span>
                        </td>

                        {/* Type pill */}
                        <td className="px-5 py-3 font-semibold">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            notif.type === 'appointment' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                            notif.type === 'discharge' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                            notif.type === 'follow_up' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300' :
                            'bg-slate-50 text-slate-700 dark:bg-slate-850 dark:text-slate-350'
                          }`}>
                            {notif.type.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Message body with clip */}
                        <td className="px-5 py-3 max-w-[200px] truncate" title={notif.message}>
                          {notif.message}
                        </td>

                        {/* Time columns */}
                        <td className="px-5 py-3 text-[10px] text-slate-500 dark:text-slate-450">
                          {notif.status === 'pending' ? (
                            <span className="flex items-center gap-1 text-amber-600 font-semibold" title="Scheduled For">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(notif.scheduled_time)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1" title="Sent At">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              {formatDateTime(notif.sent_time)}
                            </span>
                          )}
                        </td>

                        {/* Status badging */}
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                            notif.status === 'sent' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' :
                            notif.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' :
                            'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450'
                          }`} title={notif.error_message || undefined}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              notif.status === 'sent' ? 'bg-emerald-500' :
                              notif.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                              'bg-rose-500'
                            }`}></span>
                            {notif.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDeleteNotification(notif.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:hover:bg-slate-800"
                              title="Delete Record"
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
        </div>
      </div>
    </div>
  );
}
