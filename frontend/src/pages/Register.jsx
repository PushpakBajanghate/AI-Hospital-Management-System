import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User as UserIcon, ShieldAlert, Loader2, ArrowRight, CheckCircle } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!fullName || !email || !password || !role) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register(fullName, email, password, role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Graphic Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-blue-500/20">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm">Register a new profile in MedOS platform</p>
        </div>

        {/* Success State Indicator */}
        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl text-center space-y-3">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Registration Successful!</h3>
            <p className="text-sm text-slate-300">
              Your profile has been created. Redirecting to Login console...
            </p>
          </div>
        ) : (
          <>
            {/* Dynamic Alerts */}
            {(validationError || error) && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Alexander Flemming"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="alexander@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">System Role</label>
                <div className="relative">
                  <ShieldAlert className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm appearance-none cursor-pointer"
                  >
                    <option value="patient">Patient (Standard)</option>
                    <option value="doctor">Medical Practitioner (Doctor)</option>
                    <option value="staff">Administrative Staff</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="•••••••• (Min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering Profile...
                  </>
                ) : (
                  <>
                    Create Profile
                    <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Toggle */}
            <div className="mt-8 text-center border-t border-slate-900 pt-6">
              <p className="text-sm text-slate-400">
                Already registered with MedOS?{' '}
                <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
