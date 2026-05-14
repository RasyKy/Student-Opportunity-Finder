"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Globe,
  FileText,
  ArrowRight,
  AlertCircle,
  ChevronRight,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ORG_TYPES = ['University', 'Non-Profit', 'Corporate', 'Student Club', 'Government', 'Other'];

export default function RegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    org_name: '',
    org_type: 'University',
    contact_name: '',
    contact_title: '',
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
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      return;
    }

    let document_url: string | null = null;

    if (docFile) {
      const ext = docFile.name.split('.').pop();
      const path = `${user.id}/verification.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(path, docFile, { upsert: true });

      if (uploadError) {
        setError('Failed to upload document. Please try again.');
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(path);
      document_url = urlData.publicUrl;
    }

    const { error: profileError } = await supabase
      .from('organizer_profiles')
      .upsert(
        {
          user_id: user.id,
          email: user.email ?? null,
          org_name: form.org_name,
          org_type: form.org_type,
          contact_name: form.contact_name,
          contact_title: form.contact_title,
          website_url: form.website_url || null,
          social_link: form.social_link || null,
          document_url,
          verification_status: 'pending',
        },
        { onConflict: 'user_id' }
      );

    if (profileError) {
      setError('Failed to submit your application. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/verification');
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
          Complete the steps below to submit your verification request.
        </p>
      </div>

      {/* Card 1 — Organization Details */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Organization Details</p>
            <p className="text-[11px] text-slate-400">Step 1 of 4</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Name *</label>
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
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Type *</label>
            <div className="relative">
              <select
                value={form.org_type}
                onChange={set('org_type')}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
              >
                {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 — Contact Person */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Contact Person</p>
            <p className="text-[11px] text-slate-400">Step 2 of 4</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={form.contact_name}
              onChange={set('contact_name')}
              placeholder="e.g. Jane Smith"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Job Title *</label>
            <input
              type="text"
              required
              value={form.contact_title}
              onChange={set('contact_title')}
              placeholder="e.g. Program Manager"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 3 — Online Presence */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Online Presence</p>
            <p className="text-[11px] text-slate-400">Step 3 of 4</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Website URL</label>
            <input
              type="url"
              value={form.website_url}
              onChange={set('website_url')}
              placeholder="https://www.yourorg.com"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Social Media Link</label>
            <input
              type="url"
              value={form.social_link}
              onChange={set('social_link')}
              placeholder="https://linkedin.com/company/yourorg"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>
          <p className="text-[12px] text-slate-400">At least one link is recommended for faster verification.</p>
        </div>
      </div>

      {/* Card 4 — Supporting Document */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-[#3B329C]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">Supporting Document</p>
            <p className="text-[11px] text-slate-400">Step 4 of 4 — Optional</p>
          </div>
        </div>

        <div>
          <label
            htmlFor="doc-upload"
            className={`flex flex-col items-center justify-center gap-3 border border-dashed rounded-xl p-6 cursor-pointer transition-all ${
              docFile
                ? 'border-[#3B329C]/40 bg-indigo-50/40'
                : 'border-slate-200 bg-slate-50/50 hover:border-[#3B329C]/30 hover:bg-slate-50'
            }`}
          >
            {docFile ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#3B329C]" />
                <p className="text-[13px] font-medium text-slate-700">{docFile.name}</p>
                <p className="text-[12px] text-slate-400">Click to replace</p>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-300" />
                <p className="text-[13px] text-slate-400 font-medium">
                  Click to upload <span className="text-slate-300">— PDF, JPG or PNG, max 10 MB</span>
                </p>
              </>
            )}
          </label>
          <input
            id="doc-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-[12px] text-slate-400 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
            Business license, incorporation certificate, or university registration document.
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
