import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Loader2, X, AlertCircle } from 'lucide-react';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  
  // Form fields state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diseaseHistory, setDiseaseHistory] = useState('');
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { addToast } = useAuth();
  const navigate = useNavigate();

  // Load patients list
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/patients', {
        params: {
          search: search || undefined,
          gender: genderFilter || undefined,
          blood_group: bloodFilter || undefined,
        },
      });
      setPatients(response.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch patient registry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, genderFilter, bloodFilter]);

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingPatient(null);
    setName('');
    setAge('');
    setGender('Male');
    setBloodGroup('A+');
    setPhone('');
    setAddress('');
    setAllergies('');
    setDiseaseHistory('');
    setValidationError('');
    setFormOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setAge(patient.age);
    setGender(patient.gender);
    setBloodGroup(patient.blood_group);
    setPhone(patient.phone_number);
    setAddress(patient.address);
    setAllergies(patient.allergies || '');
    setDiseaseHistory(patient.disease_history || '');
    setValidationError('');
    setFormOpen(true);
  };

  // Handle Form submit (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name || !age || !phone || !address) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    const payload = {
      name,
      age: parseInt(age, 10),
      gender,
      blood_group: bloodGroup,
      phone_number: phone,
      address,
      allergies: allergies || null,
      disease_history: diseaseHistory || null,
    };

    try {
      if (editingPatient) {
        await api.put(`/api/v1/patients/${editingPatient.id}`, payload);
        addToast(`Patient record for ${name} updated.`, 'success');
      } else {
        await api.post('/api/v1/patients/', payload);
        addToast(`Patient record for ${name} successfully registered.`, 'success');
      }
      setFormOpen(false);
      fetchPatients();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to save patient record.';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Patient record
  const handleDeletePatient = async (id, patientName) => {
    if (window.confirm(`Are you absolutely sure you want to delete patient ${patientName}?`)) {
      try {
        await api.delete(`/api/v1/patients/${id}`);
        addToast(`Removed patient ${patientName} from registry.`, 'success');
        fetchPatients();
      } catch (err) {
        console.error(err);
        addToast('Failed to remove patient.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Main Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Patients Ledger</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Search, filter, and manage integrated patient clinical files.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow shadow-blue-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </button>
      </div>

      {/* SEARCH AND FILTERING ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          />
        </div>

        {/* Filter Grid */}
        <div className="flex gap-3 w-full md:w-auto items-center">
          
          {/* Filter Gender */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl dark:bg-slate-950 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer dark:text-slate-350"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Filter Blood Group */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl dark:bg-slate-950 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none cursor-pointer dark:text-slate-350"
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PATIENTS LEDGER DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Querying patient registry...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Patient Records</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any matches. Register a new patient or adjust filters to explore further.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-bold text-slate-500 tracking-wider dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Age / Gender</th>
                  <th className="px-6 py-4">Blood Group</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Allergies</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-950/20">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block text-sm dark:text-slate-200">{patient.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{patient.address}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-650 dark:text-slate-300">
                      {patient.age} yrs / {patient.gender}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300">
                        {patient.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {patient.phone_number}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {patient.allergies ? (
                        <span className="text-xs text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-md dark:bg-rose-950/20 dark:text-rose-300">
                          {patient.allergies}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition dark:hover:bg-slate-800"
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

      {/* ----------------- PATIENT REUSABLE ENTRY FORM MODAL ----------------- */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-base font-bold text-white">
                {editingPatient ? `Edit Profile: ${editingPatient.name}` : 'Register New Patient'}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Warning Alerts */}
            {validationError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Demographics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Bruce Wayne"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g., 34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-inner"
                  />
                </div>
              </div>

              {/* Categoricals Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biological Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs cursor-pointer"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Row */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Residential Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Street details, Apt block, City, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs resize-none"
                />
              </div>

              {/* Medical Row */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Known Allergies (Optional)</label>
                <input
                  type="text"
                  placeholder="Penicillin, Peanuts, Pollen (or none)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chronic/Disease History (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Diabetes Type 2, Hypertension, Asthma"
                  value={diseaseHistory}
                  onChange={(e) => setDiseaseHistory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex gap-3 justify-end bg-slate-900">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
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
                  {editingPatient ? 'Save Changes' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
