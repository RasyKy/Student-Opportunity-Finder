"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Save, 
  Send, 
  Calendar,
  ArrowLeft
} from 'lucide-react';

export default function CreateOpportunityPage() {
  const [type, setType] = useState('Internship');
  const [location, setLocation] = useState('Remote');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-2">
           <Link href="/dashboard/postings" className="text-slate-400 hover:text-[#3B329C] transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Opportunity</h1>
        </div>
        <p className="text-slate-500 text-[14px]">Fill out the form below to post a new internship opportunity</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 space-y-8">
        
        {/* Opportunity Type */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Type</label>
          <div className="flex gap-2">
            {['Internship', 'Event', 'Course'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-6 py-2 rounded-xl text-[14px] font-bold transition-all border cursor-pointer ${
                  type === t 
                  ? 'bg-[#3B329C] text-white border-[#3B329C]' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
          <input 
            type="text" 
            placeholder="e.g., Summer Engineering Internship 2025"
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
        </div>

        {/* Organization Name */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Organization Name</label>
          <div className="space-y-2">
            <input 
              type="text" 
              defaultValue="Kirirom Institute of Technology"
              readOnly
              className="w-full md:w-[500px] bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-500 font-medium focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 font-medium">Auto-filled from your profile</p>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
          <div className="flex gap-0 rounded-xl border border-slate-100 overflow-hidden w-fit">
            {['Remote', 'On-site'].map((l) => (
              <button
                key={l}
                onClick={() => setLocation(l)}
                className={`px-8 py-2 text-[14px] font-bold transition-all cursor-pointer ${
                  location === l 
                  ? 'bg-[#4F46E5] text-white font-bold' 
                  : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Description & Requirements</label>
          <textarea 
            rows={6}
            placeholder="Describe the opportunity, key responsibilities, requirements, and any additional information..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all resize-none"
          />
        </div>

        {/* Application URL */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Application / Registration URL</label>
          <input 
            type="text" 
            placeholder="https://example.com/apply"
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
        </div>

        {/* Deadline */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Deadline</label>
          <div className="relative w-full md:w-[500px]">
            <input 
              type="text" 
              placeholder="Select date"
              className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 pl-12 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
            />
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Tags</label>
          <input 
            type="text" 
            placeholder="Add tags... (press Enter)"
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B329C]/10 focus:border-[#3B329C] transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all cursor-pointer">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-all cursor-pointer">
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold text-[14px] shadow-lg shadow-indigo-200 hover:bg-[#4338CA] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
            <Send className="w-4 h-4" />
            Submit for Approval
          </button>
        </div>

      </div>
    </div>
  );
}
