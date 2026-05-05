"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Posting = {
  id: string;
  title: string;
  type: string | null;
  status: string | null;
  deadline: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  published:      'bg-emerald-50 text-emerald-600 border-emerald-100',
  pending_review: 'bg-amber-50 text-amber-600 border-amber-100',
  private:        'bg-slate-100 text-slate-500 border-slate-200',
  deleted:        'bg-red-50 text-red-500 border-red-100',
};

const STATUS_LABELS: Record<string, string> = {
  published:      'Live',
  pending_review: 'Pending',
  private:        'Private',
  deleted:        'Deleted',
};

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'draft';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold border ${STATUS_STYLES[s] ?? STATUS_STYLES.draft}`}>
      {STATUS_LABELS[s] ?? s}
    </span>
  );
}

const TYPE_LABELS: Record<string, string> = {
  internship:            'Internship',
  volunteer:             'Volunteering',
  event:                 'Event',
  course:                'Course',
  scholarship:           'Scholarship',
  job:                   'Job',
  fellowship:            'Fellowship',
  competition_hackathon: 'Competition & Hackathon',
  exchange_program:      'Exchange Program',
  other:                 'Other',
};

function formatDate(str: string | null) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostingsPage() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchPostings(); }, []);

  async function fetchPostings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('opportunities')
      .select('id, title, type, status, deadline, created_at')
      .eq('created_by', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    setPostings(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('opportunities').update({ status: 'deleted' }).eq('id', id);
    setPostings(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 rounded-full border-2 border-[#3B329C]/20 border-t-[#3B329C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Postings</h1>
          <p className="text-slate-500 text-[14px] mt-1">Manage and track all your opportunities</p>
        </div>
        <Link
          href="/dashboard/postings/new"
          className="bg-[#3B329C] hover:bg-[#2D2580] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Create New
        </Link>
      </div>

      {postings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-700">No postings yet</p>
            <p className="text-[13px] text-slate-400 mt-1">Create your first opportunity to start reaching students.</p>
          </div>
          <Link
            href="/dashboard/postings/new"
            className="mt-2 bg-[#3B329C] hover:bg-[#2D2580] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Posting
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Posted</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {postings.map((post) => (
                  <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 max-w-[280px]">
                      <span className="text-[14px] font-bold text-slate-700 group-hover:text-[#3B329C] transition-colors line-clamp-1 block">
                        {post.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-500 font-medium whitespace-nowrap">
                      {post.type ? (TYPE_LABELS[post.type] ?? post.type) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-500 font-medium whitespace-nowrap">
                      {formatDate(post.deadline)}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-slate-500 font-medium whitespace-nowrap">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {deletingId === post.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[12px] text-slate-500 font-medium">Delete?</span>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-bold hover:bg-red-600 transition-all"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-bold hover:bg-slate-200 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/postings/${post.id}/edit`}
                            className="p-2 text-slate-400 hover:text-[#3B329C] hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeletingId(post.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
