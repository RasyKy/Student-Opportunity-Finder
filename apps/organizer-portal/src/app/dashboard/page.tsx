"use client";

import { useEffect, useState } from 'react';
import { ArrowUpRight, FileText, Users, Bookmark, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  volunteer: 'Volunteering',
  event: 'Event',
  course: 'Course',
  scholarship: 'Scholarship',
  job: 'Job',
  fellowship: 'Fellowship',
  competition_hackathon: 'Competition',
  exchange_program: 'Exchange Program',
  other: 'Other',
};

interface Stats {
  activePosts: number;
  totalApplications: number;
  totalBookmarks: number;
}

interface TopPost {
  id: string;
  title: string;
  type: string | null;
  applicationCount: number;
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Round 1 — active post count + all opp IDs in parallel
      const [activeRes, oppsRes] = await Promise.all([
        supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .eq('status', 'published'),
        supabase
          .from('opportunities')
          .select('id, title, type')
          .eq('created_by', user.id)
          .neq('status', 'deleted'),
      ]);

      const oppIds = (oppsRes.data ?? []).map(o => o.id);

      if (oppIds.length === 0) {
        setStats({ activePosts: activeRes.count ?? 0, totalApplications: 0, totalBookmarks: 0 });
        setTopPosts([]);
        setLoading(false);
        return;
      }

      // Round 2 — applications and bookmarks in parallel
      const [appsCountRes, bookmarksCountRes, appsDetailRes] = await Promise.all([
        supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('opportunity_id', oppIds),
        supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true })
          .in('opportunity_id', oppIds),
        supabase
          .from('applications')
          .select('opportunity_id')
          .in('opportunity_id', oppIds),
      ]);

      // Build per-opportunity application counts for top posts
      const countMap: Record<string, number> = {};
      (appsDetailRes.data ?? []).forEach(({ opportunity_id }) => {
        countMap[opportunity_id] = (countMap[opportunity_id] ?? 0) + 1;
      });

      const top = [...(oppsRes.data ?? [])]
        .sort((a, b) => (countMap[b.id] ?? 0) - (countMap[a.id] ?? 0))
        .slice(0, 3)
        .map(o => ({ id: o.id, title: o.title, type: o.type, applicationCount: countMap[o.id] ?? 0 }));

      setStats({
        activePosts: activeRes.count ?? 0,
        totalApplications: appsCountRes.count ?? 0,
        totalBookmarks: bookmarksCountRes.count ?? 0,
      });
      setTopPosts(top);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm h-36 animate-pulse">
              <div className="h-3 w-24 bg-slate-100 rounded-full mb-4" />
              <div className="h-8 w-16 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm h-56 animate-pulse" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Posts',
      value: stats?.activePosts ?? 0,
      icon: FileText,
      note: 'Currently published',
    },
    {
      label: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon: Users,
      note: 'Across all your posts',
    },
    {
      label: 'Total Bookmarks',
      value: stats?.totalBookmarks ?? 0,
      icon: Bookmark,
      note: 'Students saved your posts',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                {stat.label}
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <h3 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">
              {stat.value}
            </h3>
            <p className="text-[12px] font-medium text-slate-400 mt-2">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Top posts by applications */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-black text-slate-900 tracking-tight">Most Applied To</h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">Your top posts by application count</p>
          </div>
          <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>

        {topPosts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-slate-400">No posts yet — create your first opportunity to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {topPosts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group">
                <div className="space-y-0.5 min-w-0 mr-4">
                  <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#3B329C] transition-colors truncate">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {TYPE_LABELS[post.type ?? ''] ?? post.type ?? '—'}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[18px] font-black text-slate-900 leading-none">{post.applicationCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      {post.applicationCount === 1 ? 'applicant' : 'applicants'}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3B329C] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
