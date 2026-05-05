"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  verification_status: string;
  rejection_reason: string | null;
}

export default function VerificationStatusPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('organizer_profiles')
        .select('verification_status, rejection_reason')
        .eq('user_id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  const status = profile?.verification_status ?? 'pending'
  const rejectionReason = profile?.rejection_reason

  const isRejected = status === 'rejected'

  const steps = [
    {
      title: 'Submitted',
      date: 'Completed',
      status: 'completed',
      icon: CheckCircle2,
      color: 'bg-[#3B329C] text-white shadow-indigo-200',
    },
    {
      title: 'In Review',
      date: isRejected ? 'Reviewed' : 'In progress',
      status: isRejected ? 'completed' : 'active',
      icon: Clock,
      color: isRejected
        ? 'bg-[#3B329C] text-white shadow-indigo-200'
        : 'bg-white text-[#3B329C] border-4 border-[#3B329C] shadow-indigo-100',
    },
    {
      title: 'Decision',
      date: isRejected ? 'Rejected' : 'Pending',
      status: isRejected ? 'rejected' : 'waiting',
      icon: FileText,
      color: isRejected
        ? 'bg-red-50 text-red-500 border-4 border-red-100'
        : 'bg-slate-50 text-slate-300 border-4 border-white shadow-sm',
    },
    {
      title: 'Verified',
      date: 'Locked',
      status: 'waiting',
      icon: ShieldCheck,
      color: 'bg-slate-50 text-slate-300 border-4 border-white shadow-sm',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#3B329C]/20 border-t-[#3B329C] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Breadcrumbs --- */}
      <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-slate-400">
        <span>Portal</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#3B329C]">Application Status</span>
      </div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[44px] font-black text-slate-900 tracking-tight leading-tight">Track your <br /> Verification</h1>
          <p className="text-slate-500 text-[17px] font-medium max-w-md leading-relaxed">
            {isRejected
              ? 'Your application was not approved. Please review the feedback below and resubmit.'
              : 'We are currently reviewing your organization details. This usually takes 2–3 business days.'}
          </p>
        </div>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-sm ${isRejected ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isRejected ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className={`text-[14px] font-black uppercase tracking-wider ${isRejected ? 'text-red-600' : 'text-slate-700'}`}>
            Status: {isRejected ? 'Rejected' : 'Under Review'}
          </span>
        </div>
      </div>

      {/* --- Progress Card --- */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-16">
        <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Application Progress</h2>

        <div className="relative px-4">
          <div className="absolute top-10 left-0 right-0 h-1 bg-slate-100 -z-0 rounded-full" />
          <div className={`absolute top-10 left-0 h-1 -z-0 rounded-full transition-all duration-1000 bg-[#3B329C] ${isRejected ? 'w-[55%]' : 'w-[40%]'}`} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-6">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all duration-500 ${step.color} ${step.status === 'active' ? 'scale-110' : ''}`}>
                  <step.icon className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className={`font-black text-[17px] tracking-tight ${step.status === 'waiting' ? 'text-slate-300' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-[12px] font-bold ${step.status === 'waiting' ? 'text-slate-200' : step.status === 'rejected' ? 'text-red-400' : 'text-slate-400'}`}>{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Rejection / Support Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 rounded-[40px] border p-10 space-y-8 relative overflow-hidden ${isRejected ? 'bg-[#FEF2F2] border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${isRejected ? 'text-red-500' : 'text-slate-400'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-[19px] font-black text-slate-900 tracking-tight">
              {isRejected ? 'Rejection Feedback' : 'What happens next?'}
            </h3>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/40">
            <p className="text-[15px] text-slate-700 font-medium leading-relaxed italic">
              {isRejected
                ? (rejectionReason ?? 'Your application did not meet our verification requirements. Please review your details and resubmit.')
                : 'Our team will review your submitted details and documents. You will be notified once a decision has been made. In the meantime, feel free to contact support if you have any questions.'}
            </p>
            {isRejected && (
              <div className="mt-6 flex items-center justify-between border-t border-red-50 pt-4">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Application Rejected</span>
                <Link href="/dashboard/verification/registration">
                  <button className="flex items-center gap-2 text-[13px] font-black text-[#3B329C] hover:underline">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resubmit Application
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

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
