"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TagPicker from '@/components/TagPicker';

const TYPES = [
  { label: 'Internship',              value: 'internship' },
  { label: 'Volunteering',            value: 'volunteer' },
  { label: 'Event',                   value: 'event' },
  { label: 'Course',                  value: 'course' },
  { label: 'Scholarship',             value: 'scholarship' },
  { label: 'Job',                     value: 'job' },
  { label: 'Fellowship',              value: 'fellowship' },
  { label: 'Competition & Hackathon', value: 'competition_hackathon' },
  { label: 'Exchange Program',        value: 'exchange_program' },
  { label: 'Other',                   value: 'other' },
];

export default function EditOpportunityPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');

  const [postStatus, setPostStatus] = useState('private');
  const [type, setType] = useState('internship');
  const [location, setLocation] = useState('Remote');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const [{ data: posting }, { data: profile }] = await Promise.all([
        supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .eq('created_by', user.id)
          .single(),
        supabase
          .from('organizer_profiles')
          .select('org_name')
          .eq('user_id', user.id)
          .single(),
      ]);

      if (!posting) { router.push('/dashboard/postings'); return; }

      setPostStatus(posting.status ?? 'private');
      setTitle(posting.title ?? '');
      setType(posting.type ?? 'internship');
      setLocation(posting.location ?? 'Remote');
      setDescription(posting.description ?? '');
      setApplicationLink(posting.application_link ?? '');
      setContactInfo(posting.contact_info ?? '');
      setDeadline(posting.deadline ?? '');
      setStartDate(posting.start_date ?? '');
      setEndDate(posting.end_date ?? '');
      setEligibility(posting.eligibility ?? '');
      setTags(posting.subject_tags ?? []);
      setOrgName(profile?.org_name ?? '');
      setFetching(false);
    }
    load();
  }, [id, router]);

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        title: title.trim(),
        type,
        status: postStatus,
        location,
        description: description.trim() || null,
        application_link: applicationLink.trim() || null,
        contact_info: contactInfo.trim() || null,
        deadline: deadline || null,
        start_date: startDate || null,
        end_date: endDate || null,
        eligibility: eligibility.trim() || null,
        subject_tags: tags.length > 0 ? tags : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      setError('Failed to save changes. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/postings');
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 rounded-full border-2 border-[#3B329C]/20 border-t-[#3B329C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/postings" className="text-slate-400 hover:text-[#3B329C] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Posting</h1>
          <p className="text-slate-500 text-[14px] mt-0.5">Update the details for this opportunity</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">

        {/* Status */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
          <div>
            <p className="text-[13px] font-bold text-slate-700">Visibility</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              {postStatus === 'published' ? 'This posting is live and visible to students.' : 'This posting is private and not visible to students.'}
            </p>
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setPostStatus('private')}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all ${
                postStatus === 'private' ? 'bg-slate-700 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Private
            </button>
            <button
              type="button"
              onClick={() => setPostStatus('published')}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all ${
                postStatus === 'published' ? 'bg-[#3B329C] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Published
            </button>
          </div>
        </div>

        {/* Type */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Type</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                  type === t.value
                    ? 'bg-[#3B329C] text-white border-[#3B329C]'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
        </div>

        {/* Organization (read-only) */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Organization</label>
          <input
            type="text"
            value={orgName}
            readOnly
            className="w-full md:w-80 bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-400 font-medium focus:outline-none"
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
          <div className="flex rounded-xl border border-slate-100 overflow-hidden w-fit">
            {['Remote', 'On-site', 'Hybrid'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocation(l)}
                className={`px-6 py-2.5 text-[13px] font-bold transition-all ${
                  location === l ? 'bg-[#3B329C] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
          <textarea
            rows={6}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all resize-none"
          />
        </div>

        {/* Eligibility */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Eligibility</label>
          <input
            type="text"
            value={eligibility}
            onChange={e => setEligibility(e.target.value)}
            placeholder="e.g. Open to Year 2–4 students, any major"
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
        </div>

        {/* Application link + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Application / Registration URL</label>
            <input
              type="url"
              value={applicationLink}
              onChange={e => setApplicationLink(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Contact Info</label>
            <input
              type="text"
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Application Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
            <p className="text-[11px] text-slate-400">Last day to apply</p>
          </div>
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
            <p className="text-[11px] text-slate-400">When the opportunity begins</p>
          </div>
          <div className="space-y-3">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
            <p className="text-[11px] text-slate-400">When the opportunity ends</p>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Tags</label>
            {tags.length > 0 && (
              <span className="text-[12px] font-bold text-[#3B329C]">{tags.length} selected</span>
            )}
          </div>
          <TagPicker selected={tags} onChange={setTags} />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-[13px] font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 border-t border-slate-50 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3B329C] hover:bg-[#2D2580] text-white font-bold text-[14px] shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
