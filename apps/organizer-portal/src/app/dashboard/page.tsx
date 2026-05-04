"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  Eye,
  MousePointer2,
  Calendar
} from 'lucide-react';

export default function OrganizerDashboard() {
  const stats = [
    {
      label: "Total Active Posts",
      value: "50",
      change: "+12.5%",
      trend: "up",
      note: "Trending up this month",
      icon: Calendar,
      color: "indigo"
    },
    {
      label: "Total Engagement",
      value: "3265",
      change: "+20%",
      trend: "up",
      note: "Down 20% this period", // Note: The image says "Down 20%" but shows "+20%" in the bubble? Actually image says +20% and "Down 20% this period". I'll follow image.
      icon: Eye,
      color: "violet"
    },
    {
      label: "Total Clicks",
      value: "500",
      change: "+12.5%",
      trend: "up",
      note: "Strong user retention",
      icon: MousePointer2,
      color: "blue"
    }
  ];

  const topPosts = [
    {
      title: "Software Engineering Internship — Summer 2025",
      type: "Internship",
      views: "892 views",
      clicks: "156",
      category: "Tech"
    },
    {
      title: "Tech Leadership Workshop",
      type: "Event",
      views: "524 views",
      clicks: "98",
      category: "Leadership"
    },
    {
      title: "Full-Stack Development Course",
      type: "Course",
      views: "421 views",
      clicks: "87",
      category: "Development"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{stat.label}</span>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black ${
                stat.trend === 'up' ? 'bg-slate-50 text-slate-700 border border-slate-100' : 'bg-red-50 text-red-600'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">{stat.value}</h3>
              <div className="flex items-center gap-1.5 pt-2">
                <p className="text-[12px] font-bold text-slate-600">{stat.note}</p>
                {stat.note.includes('up') ? (
                  <TrendingUp className="w-3.5 h-3.5 text-slate-900" />
                ) : stat.note.includes('Down') ? (
                  <TrendingDown className="w-3.5 h-3.5 text-slate-900" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-900" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {stat.label.includes('Engagement') ? 'Sum of all views' : 'Student Applications'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h2 className="text-[16px] font-black text-slate-900 tracking-tight">Top Performing Posts</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">Your 3 best-performing opportunities by click count</p>
        </div>
        
        <div className="divide-y divide-slate-50">
          {topPosts.map((post, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group">
              <div className="space-y-0.5">
                <h4 className="text-[14px] font-bold text-slate-800 group-hover:text-[#3B329C] transition-colors">{post.title}</h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {post.type} • {post.views} • {post.clicks} clicks
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[16px] font-black text-slate-900 leading-none">{post.clicks}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">clicks</p>
                </div>
                <div className="text-[#3B329C]/40 group-hover:text-[#3B329C] transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
