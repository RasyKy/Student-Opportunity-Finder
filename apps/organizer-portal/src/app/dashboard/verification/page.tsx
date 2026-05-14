"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  AlertTriangle, ArrowRight, Building2, Globe, User,
  CheckCircle2, ShieldCheck, Clock, XCircle, RotateCcw, Check,
} from 'lucide-react';

const REQUIREMENTS = [
  {
    icon: Building2,
    title: 'Organization details',
    desc: 'Your organization name and type for your public profile.',
  },
  {
    icon: User,
    title: 'Contact person',
    desc: 'Name and job title of the person responsible for this account.',
  },
  {
    icon: Globe,
    title: 'Website or social media',
    desc: 'A link to your official website, LinkedIn page, or primary social presence.',
  },
];

type VerificationStatus = 'pending' | 'verified' | 'rejected' | null;

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('organizer_profiles')
        .select('verification_status, rejection_reason')
        .eq('user_id', user.id)
        .maybeSingle();

      setStatus((data?.verification_status as VerificationStatus) ?? null);
      setRejectionReason(data?.rejection_reason ?? null);
      setLoading(false);
    }
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 rounded-full border-2 border-[#3B329C]/20 border-t-[#3B329C] animate-spin" />
      </div>
    );
  }

  const hasSubmitted = status !== null;
  const isDecided = status === 'verified' || status === 'rejected';

  // Progress line: 0 = none filled, 1 = left segment filled, 2 = both filled
  const progressSegments = hasSubmitted ? (isDecided ? 2 : 1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">Organization Verification</h1>
      </div>

      {/* ── Not yet submitted ── */}
      {!hasSubmitted && (
        <>
          <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-900">Action Required: Complete your profile verification</p>
              <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                Verification is required before you can post opportunities. This keeps our student community safe and ensures all listings come from legitimate organizations.
              </p>
            </div>
            <Link href="/dashboard/verification/registration" className="shrink-0">
              <button className="flex items-center gap-2 bg-[#3B329C] hover:bg-[#2D2580] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap">
                Start Verification
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Before You Begin</p>
              <h2 className="text-[15px] font-bold text-slate-900">What you'll need</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {REQUIREMENTS.map((req) => (
                <div key={req.title} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <req.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{req.title}</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[12px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verification typically takes 1–2 business days after submission.
            </p>
          </div>
        </>
      )}

      {/* ── Has submitted ── */}
      {hasSubmitted && (
        <>
          {/* 3-stage progress tracker */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-8">Application Progress</p>

            <div className="relative">
              {/* Track background */}
              <div className="absolute top-5 left-[16.67%] right-[16.67%] h-0.5 bg-slate-100" />
              {/* Track fill — left segment */}
              <div
                className="absolute top-5 left-[16.67%] h-0.5 bg-[#3B329C] transition-all duration-700"
                style={{ width: progressSegments >= 1 ? '33.33%' : '0%' }}
              />
              {/* Track fill — right segment */}
              <div
                className="absolute top-5 h-0.5 bg-[#3B329C] transition-all duration-700"
                style={{ left: '50%', width: progressSegments >= 2 ? '33.33%' : '0%' }}
              />

              <div className="relative grid grid-cols-3">
                {/* Stage 1 — Submitted */}
                <StageNode
                  index={1}
                  label="Submitted"
                  sublabel={hasSubmitted ? 'Application received' : '—'}
                  state="done"
                />

                {/* Stage 2 — In Review */}
                <StageNode
                  index={2}
                  label="In Review"
                  sublabel={isDecided ? 'Review complete' : 'Typically 1–2 days'}
                  state={isDecided ? 'done' : 'active'}
                />

                {/* Stage 3 — Final Decision */}
                <StageNode
                  index={3}
                  label={status === 'verified' ? 'Verified' : status === 'rejected' ? 'Not Approved' : 'Final Decision'}
                  sublabel={status === 'verified' ? 'Access granted' : status === 'rejected' ? 'See details below' : 'Pending review'}
                  state={status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'upcoming'}
                />
              </div>
            </div>
          </div>

          {/* Status detail card */}
          {status === 'pending' && (
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900">Your application is under review</p>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  Our team typically reviews submissions within 1–2 business days. We'll notify you once a decision is made.
                </p>
              </div>
              <span className="ml-auto shrink-0 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[12px] font-bold border border-amber-100">
                Pending
              </span>
            </div>
          )}

          {status === 'verified' && (
            <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900">Your organization is verified</p>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  You have full access to post opportunities and manage your listings.
                </p>
              </div>
              <span className="ml-auto shrink-0 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[12px] font-bold border border-emerald-100">
                Verified
              </span>
            </div>
          )}

          {status === 'rejected' && (
            <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm flex items-start gap-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-900">Verification not approved</p>
                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                  {rejectionReason ?? 'Your submission did not meet our requirements. Please review and resubmit.'}
                </p>
              </div>
              <Link href="/dashboard/verification/registration" className="shrink-0">
                <button className="flex items-center gap-2 bg-[#3B329C] hover:bg-[#2D2580] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all whitespace-nowrap">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resubmit
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type StageState = 'done' | 'active' | 'verified' | 'rejected' | 'upcoming';

function StageNode({ index, label, sublabel, state }: {
  index: number;
  label: string;
  sublabel: string;
  state: StageState;
}) {
  const circleClass =
    state === 'verified'
      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
      : state === 'rejected'
      ? 'bg-red-50 border-4 border-red-200 text-red-400'
      : state === 'done'
      ? 'bg-[#3B329C] text-white shadow-sm shadow-indigo-200'
      : state === 'active'
      ? 'bg-white border-4 border-[#3B329C] text-[#3B329C]'
      : 'bg-slate-100 text-slate-300';

  const labelClass =
    state === 'upcoming' ? 'text-slate-400' : 'text-slate-900';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${circleClass} ${state === 'active' ? 'animate-pulse' : ''}`}>
        {state === 'done' || state === 'verified' ? (
          <Check className="w-4 h-4" />
        ) : state === 'rejected' ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <span className="text-[13px] font-black">{index}</span>
        )}
      </div>
      <div className="text-center">
        <p className={`text-[13px] font-bold ${labelClass}`}>{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}
