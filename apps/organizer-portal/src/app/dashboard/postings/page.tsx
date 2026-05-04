"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit2, 
  ExternalLink, 
  Trash2
} from 'lucide-react';

const postings = [
  {
    id: 1,
    title: "Software Engineering Internship — Summer 20...",
    type: "Internship",
    status: "Live",
    clicks: 156,
    datePosted: "Jan 8, 2025",
  },
  {
    id: 2,
    title: "Tech Leadership Workshop",
    type: "Event",
    status: "Live",
    clicks: 98,
    datePosted: "Jan 5, 2025",
  },
  {
    id: 3,
    title: "Full-Stack Development Course",
    type: "Course",
    status: "Pending",
    clicks: 0,
    datePosted: "Jan 10, 2025",
  },
  {
    id: 4,
    title: "Product Management Fellowship",
    type: "Internship",
    status: "Draft",
    clicks: 0,
    datePosted: "Jan 12, 2025",
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Live: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Draft: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

export default function PostingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Postings</h1>
          <p className="text-slate-500 text-[14px] mt-1">Manage and track all your opportunities</p>
        </div>
        <Link href="/dashboard/postings/new" className="bg-[#3B329C] hover:bg-[#2D2580] text-white px-5 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
          <Plus className="w-4 h-4" />
          Create New
        </Link>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Clicks</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Date Posted</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {postings.map((post) => (
                <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-bold text-slate-700 group-hover:text-[#3B329C] transition-colors cursor-pointer">
                      {post.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-slate-500 font-medium">
                    {post.type}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[14px] font-bold text-slate-700">{post.clicks}</span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-slate-500 font-medium">
                    {post.datePosted}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-[#3B329C] hover:bg-indigo-50 rounded-lg transition-all cursor-pointer" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-[#3B329C] hover:bg-indigo-50 rounded-lg transition-all cursor-pointer" title="View">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
