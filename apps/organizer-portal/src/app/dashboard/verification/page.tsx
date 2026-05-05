"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  AlertTriangle, ArrowRight, Mail, Globe, ImageIcon,
  CheckCircle2, ShieldCheck, Clock, XCircle, RotateCcw,
} from 'lucide-react';

const REQUIREMENTS = [
  {
    icon: Mail,
    title: 'Official organization email',
    desc: 'A work email tied to your domain — no Gmail, Yahoo, or personal providers.',
  },
  {
    icon: Globe,
    title: 'Website or social media page',
    desc: 'A link to your official website, LinkedIn page, or primary social presence.',
  },
  {
    icon: ImageIcon,
    title: 'Logo and profile details',
    desc: 'Your organization name, category, and logo for your public profile.',
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
        .single();

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">Organization Verification</h1>
      </div>

      {/* Status banner — varies by state */}
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

      {status === 'pending' && (
        <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Verification under review</p>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Your submission is being reviewed. This typically takes 1–2 business days.
            </p>
          </div>
          <span className="ml-auto shrink-0 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[12px] font-bold border border-amber-100">
            Pending
          </span>
        </div>
      )}

      {status === 'rejected' && (
        <div className="bg-white border border-red-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-900">Verification not approved</p>
              <p className="text-[13px] text-slate-500 mt-0.5">
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
        </div>
      )}

      {status === null && (
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
      )}

      {/* Requirements checklist — only shown when not yet verified */}
      {status !== 'verified' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Before You Begin</p>
            <h2 className="text-[15px] font-bold text-slate-900">Verification Requirements</h2>
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
      )}
    </div>
  );
}
