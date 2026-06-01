import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  User, 
  Plus, 
  Clock, 
  PhoneCall, 
  PhoneOff, 
  Check, 
  X, 
  Send, 
  Sparkles, 
  Activity, 
  Loader2, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function Telemedicine() {
  const { user, addToast } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Call simulator state
  const [activeSession, setActiveSession] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);

  // Chat simulator state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Diagnostic Note-taking state
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [proposedMeds, setProposedMeds] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Schedule wizard state
  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [consultDate, setConsultDate] = useState(new Date().toISOString().split('T')[0]);
  const [consultTime, setConsultTime] = useState('14:30');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTelemedicineData = async () => {
    setLoading(true);
    try {
      const patientRes = await api.get('/api/v1/patients/');
      setPatients(patientRes.data);

      const localSessions = localStorage.getItem('medos_virtual_consults');
      if (localSessions) {
        setSessions(JSON.parse(localSessions));
      } else {
        const seededSessions = [
          {
            id: 'VCON-2001',
            patient_name: patientRes.data[0]?.name || 'Bruce Wayne',
            patient_id: patientRes.data[0]?.id || 1,
            date: new Date().toISOString().split('T')[0],
            time: '02:30 PM',
            reason: 'Cardiovascular checkup and stress test review.',
            status: 'scheduled'
          },
          {
            id: 'VCON-2002',
            patient_name: patientRes.data[1]?.name || 'Clark Kent',
            patient_id: patientRes.data[1]?.id || 2,
            date: new Date().toISOString().split('T')[0],
            time: '04:00 PM',
            reason: 'Chronic dust allergy evaluation and EMR revision.',
            status: 'scheduled'
          }
        ];
        setSessions(seededSessions);
        localStorage.setItem('medos_virtual_consults', JSON.stringify(seededSessions));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load telemedicine consultations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemedicineData();
  }, []);

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!patientId || !consultDate || !consultTime) {
      addToast('Please specify a patient, date, and consult time.', 'warning');
      return;
    }

    const patient = patients.find(p => p.id === parseInt(patientId, 10));
    if (!patient) return;

    setSubmitting(true);

    // Format time into AM/PM
    const [hrs, mins] = consultTime.split(':');
    const hour = parseInt(hrs, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const cleanHour = hour % 12 || 12;
    const formattedTime = `${cleanHour}:${mins} ${suffix}`;

    const newSession = {
      id: `VCON-${Math.floor(2000 + Math.random() * 7999)}`,
      patient_name: patient.name,
      patient_id: patient.id,
      date: consultDate,
      time: formattedTime,
      reason: reason || 'General telemedicine follow-up.',
      status: 'scheduled'
    };

    setTimeout(() => {
      const updated = [newSession, ...sessions];
      setSessions(updated);
      localStorage.setItem('medos_virtual_consults', JSON.stringify(updated));
      setSubmitting(false);
      setModalOpen(false);
      addToast(`Virtual Consultation ${newSession.id} successfully scheduled!`, 'success');
      
      setPatientId('');
      setReason('');
    }, 700);
  };

  // Launch simulated video call room
  const handleJoinCall = (session) => {
    setActiveSession(session);
    setInCall(true);
    setVideoOn(true);
    setAudioOn(true);
    setMessages([
      { sender: 'system', text: `Clinical connection established. Encrypted via AES-256.` },
      { sender: 'patient', text: `Hello Dr. ${user?.full_name || 'Practitioner'}, can you hear me?` }
    ]);
    setClinicalNotes('');
    setProposedMeds('');
    addToast(`Clinical virtual room ${session.id} launched successfully!`, 'success');
  };

  const handleEndCall = () => {
    setInCall(false);
    
    // Complete session status
    const updated = sessions.map(se => {
      if (se.id === activeSession.id) {
        return { ...se, status: 'completed' };
      }
      return se;
    });
    setSessions(updated);
    localStorage.setItem('medos_virtual_consults', JSON.stringify(updated));

    addToast(`Telemedicine consult ${activeSession.id} closed. Consultation logged.`, 'info');
    setActiveSession(null);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'doctor', text: chatInput.trim() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate patient response
    setTimeout(() => {
      const replies = [
        "Understood doctor. I've been taking the capsules after meals.",
        "Yes, the chest pain has decreased significantly since starting the medications.",
        "I will schedule a physical laboratory diagnostic profiling next week.",
        "Thank you! I will follow the lifestyle directions closely."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { sender: 'patient', text: randomReply }]);
    }, 1200);
  };

  const handleSaveEMRNotes = () => {
    setSavingNotes(true);
    setTimeout(() => {
      setSavingNotes(false);
      addToast('Telemedicine diagnostics note successfully linked to EMR timeline!', 'success');
    }, 1000);
  };

  const handleDeleteSession = (id) => {
    if (window.confirm('Are you sure you want to cancel this scheduled telemedicine appointment?')) {
      const updated = sessions.filter(se => se.id !== id);
      setSessions(updated);
      localStorage.setItem('medos_virtual_consults', JSON.stringify(updated));
      addToast('Virtual appointment cancelled.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      {!inCall && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Video className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              Telemedicine Portal
            </h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400">Coordinate and host encrypted video consultations with homebound patients.</p>
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Schedule Virtual Visit
          </button>
        </div>
      )}

      {/* CALLING INTERFACE MODE */}
      {inCall && activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-900 shadow-2xl animate-in zoom-in-95 duration-300 text-white">
          
          {/* LEFT SECTION (9 COLUMNS on large): VIDEO STREAMS & CALL ACTIONS */}
          <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
            
            {/* Split video cameras container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[440px]">
              
              {/* Box 1: Patient Mock Cam */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
                {videoOn ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-cyan-900/30 to-blue-900/30">
                    {/* Simulated Patient Avatar/Stream */}
                    <div className="text-center space-y-3">
                      <div className="w-24 h-24 rounded-full bg-cyan-600/10 text-cyan-400 border border-cyan-500/25 flex items-center justify-center text-4xl font-extrabold mx-auto animate-pulse">
                        {activeSession.patient_name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-200">{activeSession.patient_name}</h4>
                        <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">Patient Connection: HD 1080p</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <VideoOff className="w-12 h-12" />
                    <span className="text-xs font-semibold">Patient camera is disabled</span>
                  </div>
                )}
                
                {/* Floating identity badge */}
                <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  {activeSession.patient_name} (Patient)
                </div>
              </div>

              {/* Box 2: Doctor Mock Cam */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
                {videoOn ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-950/40 to-slate-900/40">
                    {/* Doctor Camera */}
                    <div className="text-center space-y-3">
                      <div className="w-24 h-24 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/25 flex items-center justify-center text-4xl font-extrabold mx-auto">
                        DR
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-200">Dr. {user?.full_name}</h4>
                        <span className="text-[10px] text-blue-400 font-bold block mt-0.5">attending Practitioner (Local stream)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <VideoOff className="w-12 h-12" />
                    <span className="text-xs font-semibold">Attending camera disabled</span>
                  </div>
                )}

                {/* Floating identity */}
                <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Dr. {user?.full_name} (Attending Physician)
                </div>
              </div>

            </div>

            {/* Bottom Actions Drawer */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
              
              {/* Call identity brief */}
              <div className="hidden sm:block text-xs">
                <span className="text-slate-450 block font-bold">Encrypted Telemedicine Meeting</span>
                <span className="font-extrabold text-cyan-400 block mt-0.5">{activeSession.id}</span>
              </div>

              {/* Toggles */}
              <div className="flex gap-3 items-center mx-auto sm:mx-0">
                <button
                  onClick={() => setAudioOn(!audioOn)}
                  className={`p-3 rounded-2xl transition active:scale-[0.96] ${
                    audioOn ? 'bg-slate-800 text-slate-200 hover:bg-slate-750' : 'bg-rose-900/40 text-rose-400 border border-rose-500/20'
                  }`}
                  title={audioOn ? "Mute Mic" : "Unmute Mic"}
                >
                  {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setVideoOn(!videoOn)}
                  className={`p-3 rounded-2xl transition active:scale-[0.96] ${
                    videoOn ? 'bg-slate-800 text-slate-200 hover:bg-slate-750' : 'bg-rose-900/40 text-rose-400 border border-rose-500/20'
                  }`}
                  title={videoOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="bg-rose-600 hover:bg-rose-500 text-white p-3.5 rounded-2xl shadow-xl shadow-rose-600/10 active:scale-[0.95] transition flex items-center gap-2 text-xs font-bold"
                  title="Hang Up Consultation"
                >
                  <PhoneOff className="w-5 h-5" />
                  Hang Up Call
                </button>
              </div>

              {/* Quick tele health info */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-950/40 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-slate-400 font-bold">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                EMR Link: Active
              </div>

            </div>

          </div>

          {/* RIGHT SECTION: DUAL COLUMN - TELEMEDICINE NOTES & LIVE CHAT SIM */}
          <div className="lg:col-span-4 flex flex-col h-[520px] justify-between divide-y divide-slate-850">
            
            {/* Section A: EMR Diagnosis note taking */}
            <div className="pb-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  attending Physician EMR Notes
                </span>
                
                <div className="space-y-2 mt-2">
                  <textarea
                    rows={4}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Document clinical symptoms, complaints, physical observations..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
                  />
                  <input
                    type="text"
                    value={proposedMeds}
                    onChange={(e) => setProposedMeds(e.target.value)}
                    placeholder="Enter prescribed drugs (e.g. Amoxicillin)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEMRNotes}
                disabled={savingNotes || !clinicalNotes.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save & Link to EMR
              </button>
            </div>

            {/* Section B: Encrypted chat panel */}
            <div className="pt-4 flex flex-col h-[260px] justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Live Patient Secure Chat
              </span>

              {/* Chat window */}
              <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-2.5 max-h-[160px]">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col ${
                      msg.sender === 'doctor' ? 'items-end' : msg.sender === 'system' ? 'items-center' : 'items-start'
                    }`}
                  >
                    {msg.sender === 'system' ? (
                      <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold block">
                        {msg.text}
                      </span>
                    ) : (
                      <div className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[11px] leading-relaxed ${
                        msg.sender === 'doctor' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800'
                      }`}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter message secure chat..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-750 text-white p-2 rounded-xl transition"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                </button>
              </form>

            </div>

          </div>

        </div>
      ) : (
        /* STANDARD REGISTER VIEW (Lists virtual consultations) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
            <h2 className="font-extrabold text-slate-950 dark:text-white text-base">Scheduled Telemedicine Consultations</h2>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-500">Querying virtual clinics...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <VideoOff className="w-12 h-12 text-slate-300 mx-auto dark:text-slate-700" />
              <h3 className="text-sm font-bold text-slate-750 dark:text-slate-300">No Virtual Consultations</h3>
              <p className="text-xs text-slate-450">Schedule a telemedicine call or click "Virtual Visit".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-6 py-4">Session ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Consultation Time</th>
                    <th className="px-6 py-4">Chief Complaint / Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Clinical Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sessions.map((se) => (
                    <tr key={se.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-950/20">
                      <td className="px-6 py-4 font-extrabold text-xs text-blue-650 dark:text-blue-400">
                        {se.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs dark:text-slate-200">
                        {se.patient_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 text-xs block dark:text-slate-200">{se.date}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {se.time}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={se.reason}>
                        {se.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          se.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300'
                        }`}>
                          {se.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {se.status !== 'completed' ? (
                            <button
                              onClick={() => handleJoinCall(se)}
                              className="bg-blue-600 hover:bg-blue-505 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow active:scale-[0.98]"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-white" />
                              Launch Call
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold block py-1.5 flex items-center gap-1 justify-end">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Consult Done
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteSession(se.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition dark:hover:bg-slate-850"
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
      )}

      {/* Schedule booking modal wizard */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-base font-bold text-white">Book Virtual Consultation</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              
              {/* Select Patient */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Profile *</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Phone: {p.phone_number})</option>
                  ))}
                </select>
              </div>

              {/* Consultation Time details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Date *</label>
                  <input
                    type="date"
                    required
                    value={consultDate}
                    onChange={(e) => setConsultDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultation Time *</label>
                  <input
                    type="time"
                    required
                    value={consultTime}
                    onChange={(e) => setConsultTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs shadow-inner"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason for virtual consultation</label>
                <textarea
                  rows={3}
                  placeholder="Summarize complaints justifying telemedicine session..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs resize-none"
                />
              </div>

              {/* Submit triggers */}
              <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end bg-slate-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  Schedule Consultation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
