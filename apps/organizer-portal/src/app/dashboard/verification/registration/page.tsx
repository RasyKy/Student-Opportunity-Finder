"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Globe,
  ImageIcon,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = ['University', 'Non-Profit', 'Corporate', 'Student Club', 'Government', 'Other'];

const BLOCKED_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];

function isPersonalEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
}

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    org_name: '',
    category: 'University',
    official_email: '',
    website_url: '',
    social_link: '',
  });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isPersonalEmail(form.official_email)) {
      setError('Please use your organization email address, not a personal one (Gmail, Yahoo, etc.).');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    const { error: profileError } = await supabase
      .from('organizer_profiles')
      .upsert(
        { user_id: user.id, ...form, verification_status: 'pending' },
        { onConflict: 'user_id' }
      );

    if (profileError) {
      setError('Failed to submit your application. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/verification/status');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 mb-3">
          <span>Verification</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#3B329C]">Registration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Verify your Organization</h1>
        <p className="text-[14px] text-slate-500 mt-1">
          Complete the three steps below to submit your verification request.
        </p>
      </div>

      {/* Card 1 — Logo & Profile Details */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Logo &amp; Profile Details</p>
            <p className="text-[11px] text-slate-400">Step 1 of 3</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Name</label>
            <input
              type="text"
              required
              value={form.org_name}
              onChange={set('org_name')}
              placeholder="e.g. Acme Corporation"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={set('category')}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* Logo upload — UI only, storage integration pending */}
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Logo</label>
            <div className="flex items-center justify-center gap-3 border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 cursor-pointer hover:border-[#3B329C]/30 hover:bg-slate-50 transition-all">
              <Building2 className="w-5 h-5 text-slate-300" />
              <p className="text-[13px] text-slate-400 font-medium">Click to upload logo <span className="text-slate-300">— PNG or JPG, max 2 MB</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 — Official Email */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Official Email Address</p>
            <p className="text-[11px] text-slate-400">Step 2 of 3</p>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Work Email</label>
          <input
            type="email"
            required
            value={form.official_email}
            onChange={set('official_email')}
            placeholder="contact@yourorg.com"
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
          <p className="mt-2 text-[12px] text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Must be a work address — Gmail, Yahoo, and personal providers are not accepted.
          </p>
        </div>
      </div>

      {/* Card 3 — Website or Social Media */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Website or Social Media Page</p>
            <p className="text-[11px] text-slate-400">Step 3 of 3</p>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Link</label>
          <input
            type="url"
            required
            value={form.website_url}
            onChange={set('website_url')}
            placeholder="https://www.yourorg.com or linkedin.com/company/yourorg"
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
          <p className="mt-2 text-[12px] text-slate-400">
            Accepted: official website, LinkedIn, Facebook, or Instagram page.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[13px] font-medium text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#3B329C] hover:bg-[#2D2580] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-[14px] shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        {loading ? 'Submitting…' : 'Submit Verification Request'}
        {!loading && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );
}
