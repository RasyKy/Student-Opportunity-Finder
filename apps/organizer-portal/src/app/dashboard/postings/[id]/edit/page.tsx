"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PostingForm, { type PostingFormValues } from '@/components/PostingForm';

// Map old location-as-format values to the format column
const LOCATION_TO_FORMAT: Record<string, string> = {
  Remote: 'online',
  'On-site': 'onsite',
  Hybrid: 'hybrid',
};

export default function EditOpportunityPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [defaultValues, setDefaultValues] = useState<PostingFormValues | null>(null);
  const [defaultStatus, setDefaultStatus] = useState('private');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Migrate old location-as-format data if needed
      const rawLocation: string = posting.location ?? '';
      const isMigratable = rawLocation in LOCATION_TO_FORMAT;
      const format = posting.format || (isMigratable ? LOCATION_TO_FORMAT[rawLocation] : 'unknown');
      const location = isMigratable ? '' : rawLocation;

      setDefaultValues({
        type: posting.type ?? 'internship',
        title: posting.title ?? '',
        title_kh: posting.title_kh ?? '',
        description: posting.description ?? '',
        description_kh: posting.description_kh ?? '',
        eligibility: posting.eligibility ?? '',
        target_group: posting.target_group ?? [],
        language: posting.language ?? '',
        format,
        location,
        is_free: posting.is_free ?? true,
        price_range: posting.price_range ?? '',
        application_link: posting.application_link ?? '',
        image_url: posting.image_url ?? '',
        contact_info: posting.contact_info ?? '',
        deadline: posting.deadline ?? '',
        start_date: posting.start_date ?? '',
        end_date: posting.end_date ?? '',
        subject_tags: posting.subject_tags ?? [],
      });
      setDefaultStatus(posting.status ?? 'private');
      setOrgName(profile?.org_name ?? '');
    }
    load();
  }, [id, router]);

  async function handleSave(values: PostingFormValues, status: string) {
    if (!values.title.trim()) { setError('Title is required.'); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({
        title: values.title.trim(),
        title_kh: values.title_kh.trim() || null,
        type: values.type,
        status,
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

  if (!defaultValues) {
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

      <PostingForm
        defaultValues={defaultValues}
        orgName={orgName}
        isEdit
        defaultStatus={defaultStatus}
        onSave={handleSave}
        loading={loading}
        error={error}
      />
    </div>
  );
}
