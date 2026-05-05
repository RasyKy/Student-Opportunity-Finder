"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  UploadCloud,
  Link as LinkIcon,
  ChevronRight,
  Info,
  FileUp,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    org_name: '',
    category: 'University',
    official_email: '',
    website_url: '',
    linkedin_url: '',
    facebook_url: '',
  });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const { error: profileError } = await supabase
      .from('organizer_profiles')
      .upsert(
        { user_id: user.id, ...form, verification_status: 'pending' },
        { onConflict: 'user_id' }
      )

    if (profileError) {
      setError('Failed to submit your application. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard/verification/status')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Header Section --- */}
      <div className="space-y-4 px-2">
        <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-slate-400">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-[#3B329C]">Verification</span>
        </div>
        <h1 className="text-[44px] font-black text-slate-900 tracking-tight leading-tight">Verify your <br /> Organization</h1>
        <p className="text-slate-500 text-[17px] max-w-2xl font-medium leading-relaxed">
          Please provide the following details to verify your organization's identity and unlock full portal features.
        </p>
      </div>

      <div className="space-y-8">
        {/* --- Card 1: Organization Identity --- */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3B329C]">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Organization Identity</h2>
              <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mt-0.5">Basic Details</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="w-full">
              <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Organization Name</label>
              <input
                type="text"
                required
                value={form.org_name}
                onChange={set('org_name')}
                placeholder="e.g. Kirirom Institute of Technology"
                className="w-full px-6 py-4 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
              />
            </div>

            <div className="w-full relative">
              <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={set('category')}
                  className="w-full px-6 py-4 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 appearance-none focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
                >
                  <option>University</option>
                  <option>Non-Profit</option>
                  <option>Corporate</option>
                  <option>Student Club</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={form.official_email}
                  onChange={set('official_email')}
                  placeholder="contact@org.com"
                  className="w-full px-6 py-4 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Website URL</label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={set('website_url')}
                  placeholder="https://www.org.com"
                  className="w-full px-6 py-4 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Card 2: Document Upload (UI only — Storage integration pending) --- */}
        <div className="bg-[#f8f9ff] rounded-[32px] p-10 space-y-8 border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-[#3B329C]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-slate-900 tracking-tight leading-tight">Document Upload</h2>
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Verification Proof</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:border-[#3B329C]/30 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3B329C] group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-black text-slate-900">Click to upload or drag and drop</p>
              <p className="text-[14px] font-medium text-slate-400 mt-1">Official PDF, JPG or PNG (max. 10MB) — optional for now</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400 px-2 pt-2">
            <Info className="w-4 h-4 shrink-0" />
            <p className="text-[13px] font-medium leading-relaxed">Upload your official business license, incorporation certificate, or university registration document for review.</p>
          </div>
        </div>

        {/* --- Card 3: Social Profiles --- */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm">
              <LinkIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Social Profiles</h2>
              <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mt-0.5">Public Presence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[14px] font-bold text-slate-700 px-1">LinkedIn URL</label>
              <input
                type="text"
                value={form.linkedin_url}
                onChange={set('linkedin_url')}
                placeholder="https://linkedin.com/company/org"
                className="w-full px-6 py-4 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[14px] font-bold text-slate-700 px-1">Facebook URL</label>
              <input
                type="text"
                value={form.facebook_url}
                onChange={set('facebook_url')}
                placeholder="https://facebook.com/org"
                className="w-full px-6 py-4 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-center text-[14px] font-bold text-red-500">{error}</p>
      )}

      <div className="flex flex-col items-center gap-6 pt-10">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3B329C] hover:bg-[#2d257a] disabled:opacity-60 disabled:cursor-not-allowed text-white px-20 py-5 rounded-[24px] font-black text-[18px] transition-all active:scale-95 shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group w-full md:w-auto"
        >
          {loading ? 'Submitting...' : 'Submit Verification'}
          {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />}
        </button>
      </div>
    </form>
  );
}
