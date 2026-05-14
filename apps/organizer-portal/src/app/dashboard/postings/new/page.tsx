"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PostingForm, { EMPTY_FORM, type PostingFormValues } from '@/components/PostingForm';

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('org_name')
        .eq('user_id', user.id)
        .single();
      setOrgName(profile?.org_name ?? '');
    }
    init();
  }, []);

  async function handleSave(values: PostingFormValues, status: string) {
    if (!values.title.trim()) { setError('Title is required.'); return; }
    if (!userId) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from('opportunities').insert({
      title: values.title.trim(),
      title_kh: values.title_kh.trim() || null,
      type: values.type,
      organization: orgName,
      description: values.description.trim() || null,
      description_kh: values.description_kh.trim() || null,
      eligibility: values.eligibility.trim() || null,
      target_group: values.target_group.length > 0 ? values.target_group : null,
      language: values.language.trim() || null,
      format: values.format,
      location: values.location.trim() || null,
      is_free: values.is_free,
      price_range: values.is_free ? null : (values.price_range.trim() || null),
      application_link: values.application_link.trim() || null,
      image_url: values.image_url.trim() || null,
      contact_info: values.contact_info.trim() || null,
      deadline: values.deadline || null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      subject_tags: values.subject_tags.length > 0 ? values.subject_tags : null,
      created_by: userId,
      status,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard/postings');
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/postings" className="text-slate-400 hover:text-[#3B329C] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Posting</h1>
          <p className="text-slate-500 text-[14px] mt-0.5">Fill out the details below to post a new opportunity</p>
        </div>
      </div>

      <PostingForm
        defaultValues={EMPTY_FORM}
        orgName={orgName}
        onSave={handleSave}
        loading={loading}
        error={error}
      />
    </div>
  );
}
