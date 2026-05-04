"use client";

import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function VerificationStatusPage() {
  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Breadcrumbs --- */}
      <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-slate-400">
        <Link href="/dashboard" className="hover:text-[#3B329C] transition-colors">Portal</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#3B329C]">Application Status</span>
      </div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[44px] font-black text-slate-900 tracking-tight leading-tight">Track your <br /> Verification</h1>
          <p className="text-slate-500 text-[17px] font-medium max-w-md leading-relaxed">
            We are currently reviewing your organization details. This usually takes 2-3 business days.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[14px] font-black text-slate-700 uppercase tracking-wider">Status: Under Review</span>
        </div>
      </div>

      {/* --- Current Application Card --- */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-16 group hover:border-[#3B329C]/10 transition-all">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Application Progress</h2>
          <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">ID: APP-8291-KIT</span>
        </div>
        
        <div className="relative px-4">
          {/* Progress Line Background */}
          <div className="absolute top-10 left-0 right-0 h-1 bg-slate-100 -z-0 rounded-full" />
          {/* Active Progress Line */}
          <div className="absolute top-10 left-0 w-[40%] h-1 bg-[#3B329C] -z-0 rounded-full transition-all duration-1000" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {[
              {
                title: "Submitted",
                date: "Oct 24, 2023",
                status: "completed",
                icon: CheckCircle2,
                color: "bg-[#3B329C] text-white shadow-indigo-200"
              },
              {
                title: "In Review",
                date: "Started Oct 25",
                status: "active",
                icon: Clock,
                color: "bg-white text-[#3B329C] border-4 border-[#3B329C] shadow-indigo-100"
              },
              {
                title: "Decision",
                date: "Pending",
                status: "waiting",
                icon: FileText,
                color: "bg-slate-50 text-slate-300 border-4 border-white shadow-sm"
              },
              {
                title: "Verified",
                date: "Unlocked",
                status: "waiting",
                icon: ShieldCheck,
                color: "bg-slate-50 text-slate-300 border-4 border-white shadow-sm"
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6 group/step">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all duration-500 ${step.color} ${step.status === 'active' ? 'scale-110' : ''}`}>
                  <step.icon className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-black text-[17px] tracking-tight ${step.status === 'waiting' ? 'text-slate-300' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-[12px] font-bold ${step.status === 'waiting' ? 'text-slate-200' : 'text-slate-400'}`}>{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Help & History Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rejection History / Previous Attempts */}
        <div className="lg:col-span-2 bg-[#FEF2F2] rounded-[40px] border border-red-100 p-10 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-500 shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-black text-slate-900 tracking-tight">Previous Application Insight</h3>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/40">
              <p className="text-[15px] text-slate-700 font-medium leading-relaxed italic">
                "Incomplete business documentation. Please ensure all required fields are filled and documents are up-to-date with current fiscal year registration."
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-red-50 pt-4">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Rejected: Sep 15, 2023</span>
                <Link href="/dashboard/verification/registration">
                  <button className="flex items-center gap-2 text-[13px] font-black text-[#3B329C] hover:underline">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restart Application
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Support Sidebar */}
        <div className="bg-[#3B329C] rounded-[40px] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Clock className="w-7 h-7 text-indigo-200" />
            </div>
            <h3 className="text-[24px] font-black leading-tight tracking-tight">Need it <br /> faster?</h3>
            <p className="text-indigo-100/60 font-medium text-[15px] leading-relaxed">
              Standard review takes 48 hours. If you have an urgent event, contact our priority support.
            </p>
          </div>
          <button className="mt-10 w-full py-4 bg-white text-[#3B329C] rounded-2xl font-black text-[14px] hover:bg-indigo-50 transition-all active:scale-95">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
