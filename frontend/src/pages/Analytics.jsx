import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Users, 
  Database, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  DollarSign,
  Loader2,
  Bed
} from 'lucide-react';

export default function Analytics() {
  const { user, addToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePatients: 142,
    bedsOccupied: 9,
    bedsTotal: 15,
    aiAccuracy: "99.86%",
    aiSpeed: "18.4ms",
    revenueThisMonth: "$12,450",
  });

  useEffect(() => {
    // Simulate fetching analytical metrics
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Premium Custom HSL Styled SVG Chart datasets
  const activeAdmissionsDataset = [
    { label: "Mon", value: 4 },
    { label: "Tue", value: 7 },
    { label: "Wed", value: 9 },
    { label: "Thu", value: 6 },
    { label: "Fri", value: 8 },
    { label: "Sat", value: 10 },
    { label: "Sun", value: 9 }
  ];

  const revenueDataset = [
    { label: "Jan", amount: 4500 },
    { label: "Feb", amount: 6200 },
    { label: "Mar", amount: 8900 },
    { label: "Apr", amount: 11200 },
    { label: "May", amount: 12450 }
  ];

  const aiProcessingDataset = [
    { label: "EMR Index", rate: 99.8 },
    { label: "X-Ray", rate: 98.4 },
    { label: "Diagnostics", rate: 99.9 },
    { label: "SMS Queue", rate: 100.0 }
  ];

  const maxAdmissions = Math.max(...activeAdmissionsDataset.map(d => d.value));
  const maxRevenue = Math.max(...revenueDataset.map(d => d.amount));

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Querying clinical analytics and EMR indexing registers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Executive Analytics Desk
        </h1>
        <p className="text-slate-500 mt-1 dark:text-slate-400">Review EMR processing velocities, diagnostic model success ratings, and hospital revenues.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "EMR Active Index", value: stats.activePatients, desc: "+12% from yesterday", icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-955/20 border-blue-100" },
          { title: "Ward Occupancy", value: `${stats.bedsOccupied}/${stats.bedsTotal}`, desc: `${stats.bedsTotal - stats.bedsOccupied} vacant slots`, icon: Bed, color: "text-teal-600 bg-teal-50 dark:bg-teal-955/20 border-teal-100" },
          { title: "AI Core Classification", value: stats.aiAccuracy, desc: "Avg EMR parsing success", icon: Sparkles, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-955/20 border-indigo-100 animate-pulse" },
          { title: "Revenues (MTD)", value: stats.revenueThisMonth, desc: "Total claims and co-pays", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-955/20 border-emerald-100" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-950 mt-2 dark:text-white">{card.value}</h3>
                <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic SVG Custom HSL Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Graph 1: Active Wards Admissions (8 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between h-[360px]">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-950 text-base dark:text-white">Active Ward Admissions</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Daily occupied bed loads in General, Private, and ICU rooms.</p>
          </div>

          {/* SVG line / bar chart simulator */}
          <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 h-48 pt-6 px-4">
            {activeAdmissionsDataset.map((day, idx) => {
              const heightPct = (day.value / maxAdmissions) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  {/* Tooltip */}
                  <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md transition pointer-events-none z-10">
                    {day.value} Beds occupied
                  </span>
                  
                  {/* Bar */}
                  <div 
                    className="w-10 rounded-t-lg bg-gradient-to-t from-teal-600 to-emerald-500 group-hover:from-teal-500 group-hover:to-emerald-400 transition-all duration-500"
                    style={{ height: `${heightPct}%`, minHeight: '6%' }}
                  ></div>
                  
                  <span className="text-[10px] text-slate-450 font-bold block mt-3 select-none">{day.label}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 mt-4">
            <span>Average Occupancy Rate: <strong className="text-slate-750 dark:text-slate-350">60.2%</strong></span>
            <span>Last Sync: Real-time SQLite session</span>
          </div>
        </div>

        {/* Graph 2: Monthly revenues (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between h-[360px]">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-950 text-base dark:text-white">Revenue Collections</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Monthly aggregate of hospital co-pays and insurance claim clearances.</p>
          </div>

          {/* SVG line / bar chart simulator */}
          <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 h-48 pt-6 px-4">
            {revenueDataset.map((mon, idx) => {
              const heightPct = (mon.amount / maxRevenue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  {/* Tooltip */}
                  <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md transition pointer-events-none z-10">
                    ${mon.amount.toLocaleString()}
                  </span>
                  
                  {/* Bar */}
                  <div 
                    className="w-10 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-500 shadow-inner"
                    style={{ height: `${heightPct}%`, minHeight: '6%' }}
                  ></div>
                  
                  <span className="text-[10px] text-slate-450 font-bold block mt-3 select-none">{mon.label}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 mt-4">
            <span>Aggregated Year-to-date: <strong className="text-slate-750 dark:text-slate-350">$43,200</strong></span>
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +14% vs Q1
            </span>
          </div>
        </div>

      </div>

      {/* Bottom section: AI Diagnostic Index */}
      <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
        
        {/* Glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">AI Clinical Model Index Statistics</h3>
          </div>
          
          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl font-medium">
            Review accuracy scores, clinical classification latency, and SMS notification dispatch speeds. Deep learning models evaluate diagnostic classification in real-time under AES-256 secure sandboxes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {aiProcessingDataset.map((model, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between h-24">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{model.label}</span>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-indigo-400">{model.rate.toFixed(1)}%</h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
