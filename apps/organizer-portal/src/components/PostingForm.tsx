"use client";

import { useState } from 'react';
import { Send, Save, Eye, EyeOff, AlertCircle, Plus, X } from 'lucide-react';
import TagPicker from '@/components/TagPicker';

const LIMITS = {
  title: 100,
  title_kh: 100,
  description: 3000,
  description_kh: 3000,
  eligibility: 300,
  language: 80,
  location: 100,
  price_range: 100,
  contact_info: 200,
  targetGroup: 50,
} as const;

function CharCounter({ current, max }: { current: number; max: number }) {
  const near = current >= max * 0.9;
  return (
    <span className={`text-[11px] font-medium tabular-nums ${near ? 'text-red-400' : 'text-slate-300'}`}>
      {current} / {max}
    </span>
  );
}

export interface PostingFormValues {
  type: string;
  title: string;
  title_kh: string;
  description: string;
  description_kh: string;
  eligibility: string;
  target_group: string[];
  language: string;
  format: string;
  location: string;
  is_free: boolean;
  price_range: string;
  application_link: string;
  image_url: string;
  contact_info: string;
  deadline: string;
  start_date: string;
  end_date: string;
  subject_tags: string[];
}

export const EMPTY_FORM: PostingFormValues = {
  type: 'internship',
  title: '',
  title_kh: '',
  description: '',
  description_kh: '',
  eligibility: '',
  target_group: [],
  language: '',
  format: 'online',
  location: '',
  is_free: true,
  price_range: '',
  application_link: '',
  image_url: '',
  contact_info: '',
  deadline: '',
  start_date: '',
  end_date: '',
  subject_tags: [],
};

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

const FORMATS = [
  { label: 'Online',         value: 'online' },
  { label: 'On-site',        value: 'onsite' },
  { label: 'Hybrid',         value: 'hybrid' },
  { label: 'Not specified',  value: 'unknown' },
];

const TARGET_GROUP_OPTIONS = [
  'High School', 'Undergraduate', 'Graduate', 'PhD',
  'Year 1–2', 'Year 3–4', 'Recent Graduates', 'All Levels',
];

interface Props {
  defaultValues: PostingFormValues;
  orgName: string;
  /** Edit mode: show visibility toggle + single Save button */
  isEdit?: boolean;
  defaultStatus?: string;
  onSave: (values: PostingFormValues, status: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function PostingForm({
  defaultValues,
  orgName,
  isEdit = false,
  defaultStatus = 'private',
  onSave,
  loading,
  error,
}: Props) {
  const [v, setV] = useState<PostingFormValues>(defaultValues);
  const [status, setStatus] = useState(defaultStatus);
  const [targetInput, setTargetInput] = useState('');

  function field<K extends keyof PostingFormValues>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setV(prev => ({ ...prev, [key]: e.target.value }));
  }

  function addTargetGroup(val: string) {
    const trimmed = val.trim();
    if (!trimmed || v.target_group.includes(trimmed)) return;
    setV(prev => ({ ...prev, target_group: [...prev.target_group, trimmed] }));
    setTargetInput('');
  }

  function removeTargetGroup(val: string) {
    setV(prev => ({ ...prev, target_group: prev.target_group.filter(t => t !== val) }));
  }

  const inputClass =
    'w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all';
  const labelClass = 'block text-[12px] font-bold text-slate-400 uppercase tracking-wider';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">

      {/* Visibility toggle — edit mode only */}
      {isEdit && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
          <div>
            <p className="text-[13px] font-bold text-slate-700">Visibility</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              {status === 'published'
                ? 'This posting is live and visible to students.'
                : 'This posting is private and not visible to students.'}
            </p>
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
            <button type="button" onClick={() => setStatus('private')}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all ${status === 'private' ? 'bg-slate-700 text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
              <EyeOff className="w-3.5 h-3.5" /> Private
            </button>
            <button type="button" onClick={() => setStatus('published')}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all ${status === 'published' ? 'bg-[#3B329C] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
              <Eye className="w-3.5 h-3.5" /> Published
            </button>
          </div>
        </div>
      )}

      {/* ── Type ── */}
      <div className="space-y-3">
        <label className={labelClass}>Opportunity Type</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => setV(p => ({ ...p, type: t.value }))}
              className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all border ${v.type === t.value ? 'bg-[#3B329C] text-white border-[#3B329C]' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Title ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Title <span className="text-red-400">*</span></label>
            <CharCounter current={v.title.length} max={LIMITS.title} />
          </div>
          <input type="text" value={v.title} onChange={field('title')} maxLength={LIMITS.title}
            placeholder="e.g. Summer Engineering Internship 2025" className={inputClass} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Title (Khmer)</label>
            <CharCounter current={v.title_kh.length} max={LIMITS.title_kh} />
          </div>
          <input type="text" value={v.title_kh} onChange={field('title_kh')} maxLength={LIMITS.title_kh}
            placeholder="ចំណងជើងជាភាសាខ្មែរ" className={inputClass} />
        </div>
      </div>

      {/* ── Organization ── */}
      <div className="space-y-3">
        <label className={labelClass}>Organization</label>
        <input type="text" value={orgName} readOnly
          className="w-full md:w-80 bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-400 font-medium focus:outline-none" />
        <p className="text-[11px] text-slate-400">Auto-filled from your verified profile</p>
      </div>

      {/* ── Description ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Description</label>
            <CharCounter current={v.description.length} max={LIMITS.description} />
          </div>
          <textarea rows={6} value={v.description} onChange={field('description')} maxLength={LIMITS.description}
            placeholder="Describe the opportunity, responsibilities, and what students can expect..."
            className={`${inputClass} resize-none`} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Description (Khmer)</label>
            <CharCounter current={v.description_kh.length} max={LIMITS.description_kh} />
          </div>
          <textarea rows={6} value={v.description_kh} onChange={field('description_kh')} maxLength={LIMITS.description_kh}
            placeholder="ការពិពណ៌នាជាភាសាខ្មែរ..."
            className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* ── Eligibility + Language ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Eligibility</label>
            <CharCounter current={v.eligibility.length} max={LIMITS.eligibility} />
          </div>
          <input type="text" value={v.eligibility} onChange={field('eligibility')} maxLength={LIMITS.eligibility}
            placeholder="e.g. Open to Year 2–4 students, any major" className={inputClass} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Language</label>
            <CharCounter current={v.language.length} max={LIMITS.language} />
          </div>
          <input type="text" value={v.language} onChange={field('language')} maxLength={LIMITS.language}
            placeholder="e.g. English, Khmer, English/Khmer" className={inputClass} />
        </div>
      </div>

      {/* ── Target Group ── */}
      <div className="space-y-3">
        <label className={labelClass}>Target Group</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {TARGET_GROUP_OPTIONS.map(opt => {
            const selected = v.target_group.includes(opt);
            return (
              <button key={opt} type="button"
                onClick={() => selected ? removeTargetGroup(opt) : addTargetGroup(opt)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all border ${selected ? 'bg-[#3B329C] text-white border-[#3B329C]' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                {opt}
              </button>
            );
          })}
        </div>
        {/* Custom target group input */}
        <div className="flex gap-2">
          <input type="text" value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTargetGroup(targetInput); } }}
            maxLength={LIMITS.targetGroup}
            placeholder="Add custom group…"
            className="flex-1 bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all" />
          <button type="button" onClick={() => addTargetGroup(targetInput)}
            className="px-4 py-2.5 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {v.target_group.filter(t => !TARGET_GROUP_OPTIONS.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {v.target_group.filter(t => !TARGET_GROUP_OPTIONS.includes(t)).map(t => (
              <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#3B329C] text-[12px] font-bold border border-indigo-100">
                {t}
                <button type="button" onClick={() => removeTargetGroup(t)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Format + Location ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className={labelClass}>Format</label>
          <div className="flex rounded-xl border border-slate-100 overflow-hidden w-fit">
            {FORMATS.map(f => (
              <button key={f.value} type="button" onClick={() => setV(p => ({ ...p, format: f.value }))}
                className={`px-4 py-2.5 text-[13px] font-bold transition-all ${v.format === f.value ? 'bg-[#3B329C] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Location</label>
            <CharCounter current={v.location.length} max={LIMITS.location} />
          </div>
          <input type="text" value={v.location} onChange={field('location')} maxLength={LIMITS.location}
            placeholder="e.g. Phnom Penh, Cambodia" className={inputClass} />
          <p className="text-[11px] text-slate-400">Physical location, if applicable</p>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="space-y-3">
        <label className={labelClass}>Pricing</label>
        <div className="flex rounded-xl border border-slate-100 overflow-hidden w-fit mb-3">
          <button type="button" onClick={() => setV(p => ({ ...p, is_free: true }))}
            className={`px-6 py-2.5 text-[13px] font-bold transition-all ${v.is_free ? 'bg-[#3B329C] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
            Free
          </button>
          <button type="button" onClick={() => setV(p => ({ ...p, is_free: false }))}
            className={`px-6 py-2.5 text-[13px] font-bold transition-all ${!v.is_free ? 'bg-[#3B329C] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
            Paid
          </button>
        </div>
        {!v.is_free && (
          <div className="space-y-1">
            <div className="flex justify-end">
              <CharCounter current={v.price_range.length} max={LIMITS.price_range} />
            </div>
            <input type="text" value={v.price_range} onChange={field('price_range')} maxLength={LIMITS.price_range}
              placeholder="e.g. $50–$200 or Free for scholarship recipients"
              className={inputClass} />
          </div>
        )}
      </div>

      {/* ── Links ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className={labelClass}>Application / Registration URL</label>
          <input type="url" value={v.application_link} onChange={field('application_link')}
            placeholder="https://example.com/apply" className={inputClass} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass}>Contact Info</label>
            <CharCounter current={v.contact_info.length} max={LIMITS.contact_info} />
          </div>
          <input type="text" value={v.contact_info} onChange={field('contact_info')} maxLength={LIMITS.contact_info}
            placeholder="e.g. hr@company.com or +855 12 345 678" className={inputClass} />
        </div>
      </div>

      {/* ── Image URL ── */}
      <div className="space-y-3">
        <label className={labelClass}>Cover Image URL</label>
        <input type="url" value={v.image_url} onChange={field('image_url')}
          placeholder="https://example.com/image.jpg" className={inputClass} />
        <p className="text-[11px] text-slate-400">Optional banner image shown on the opportunity card</p>
      </div>

      {/* ── Dates ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label className={labelClass}>Application Deadline</label>
          <input type="date" value={v.deadline} onChange={field('deadline')} className={inputClass} />
          <p className="text-[11px] text-slate-400">Last day to apply</p>
        </div>
        <div className="space-y-3">
          <label className={labelClass}>Start Date</label>
          <input type="date" value={v.start_date} onChange={field('start_date')} className={inputClass} />
          <p className="text-[11px] text-slate-400">When the opportunity begins</p>
        </div>
        <div className="space-y-3">
          <label className={labelClass}>End Date</label>
          <input type="date" value={v.end_date} onChange={field('end_date')} className={inputClass} />
          <p className="text-[11px] text-slate-400">When the opportunity ends</p>
        </div>
      </div>

      {/* ── Tags ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Subject Tags</label>
          {v.subject_tags.length > 0 && (
            <span className="text-[12px] font-bold text-[#3B329C]">{v.subject_tags.length} selected</span>
          )}
        </div>
        <TagPicker selected={v.subject_tags} onChange={tags => setV(p => ({ ...p, subject_tags: tags }))} />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-[13px] font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
        {isEdit ? (
          <button type="button" disabled={loading} onClick={() => onSave(v, status)}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3B329C] hover:bg-[#2D2580] text-white font-bold text-[14px] shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        ) : (
          <>
            <button type="button" disabled={loading} onClick={() => onSave(v, 'private')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all disabled:opacity-50">
              <Save className="w-4 h-4" />
              Save as Private
            </button>
            <button type="button" disabled={loading} onClick={() => onSave(v, 'published')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3B329C] hover:bg-[#2D2580] text-white font-bold text-[14px] shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
              <Send className="w-4 h-4" />
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
