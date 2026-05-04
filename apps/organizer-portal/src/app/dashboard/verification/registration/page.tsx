"use client";

import Link from 'next/link';
import { 
  Building2, 
  UploadCloud, 
  Link as LinkIcon, 
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowRight,
  FileUp,
  Globe,
  Mail,
  LayoutGrid
} from 'lucide-react';

export default function RegistrationForm() {
  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Header Section --- */}
      <div className="space-y-4 px-2">
        <div className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-slate-400">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-[#3B329C]">Verification</span>
        </div>
        <h1 className="text-[44px] font-black text-slate-900 tracking-tight leading-tight">Verify your <br /> Organization</h1>
        <p className="text-slate-500 text-[17px] max-w-2xl font-medium leading-relaxed">
          Please provide the following details to verify your organization's identity and unlock full portal features.
        </p>
      </div>

      <div className="space-y-8">
        {/* --- Card 1: Organization Identity --- */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3B329C]">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Organization Identity</h2>
              <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mt-0.5">Basic Details</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="w-full">
              <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Organization Name</label>
              <input 
                type="text" 
                placeholder="e.g. Kirirom Institute of Technology"
                className="w-full px-6 py-4.5 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
              />
            </div>

            <div className="w-full relative">
              <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Category</label>
              <div className="relative">
                <select className="w-full px-6 py-4.5 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 appearance-none focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]">
                  <option>University</option>
                  <option>Non-Profit</option>
                  <option>Corporate</option>
                  <option>Student Club</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Official Email</label>
                <div className="relative group/input">
                  <input 
                    type="email" 
                    placeholder="contact@org.com"
                    className="w-full px-6 py-4.5 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-slate-700 mb-3 px-1">Website URL</label>
                <div className="relative group/input">
                  <input 
                    type="url" 
                    placeholder="https://www.org.com"
                    className="w-full px-6 py-4.5 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Card 2: Document Upload --- */}
        <div className="bg-[#f8f9ff] rounded-[32px] p-10 space-y-8 border border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-[#3B329C]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-slate-900 tracking-tight leading-tight">Document Upload</h2>
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Verification Proof</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center space-y-6 cursor-pointer hover:border-[#3B329C]/30 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3B329C] group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-black text-slate-900">Click to upload or drag and drop</p>
              <p className="text-[14px] font-medium text-slate-400 mt-1">Official PDF, JPG or PNG (max. 10MB)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400 px-2 pt-2">
            <Info className="w-4 h-4 shrink-0" />
            <p className="text-[13px] font-medium leading-relaxed">Upload your official business license, incorporation certificate, or university registration document for review.</p>
          </div>
        </div>

        {/* --- Card 3: Social Profiles --- */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 space-y-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm">
              <LinkIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-900 tracking-tight">Social Profiles</h2>
              <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase mt-0.5">Public Presence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[14px] font-bold text-slate-700 px-1">LinkedIn URL</label>
              <input 
                type="text" 
                placeholder="https://linkedin.com/company/org"
                className="w-full px-6 py-4.5 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[14px] font-bold text-slate-700 px-1">Facebook URL</label>
              <input 
                type="text" 
                placeholder="https://facebook.com/org"
                className="w-full px-6 py-4.5 rounded-2xl border-none bg-[#f1f4ff]/50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B329C]/20 outline-none transition-all font-medium text-[15px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10">
        <Link href="/dashboard/verification/status" className="w-full md:w-auto">
          <button className="bg-[#3B329C] hover:bg-[#2d257a] text-white px-20 py-5 rounded-[24px] font-black text-[18px] transition-all active:scale-95 shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group w-full md:w-auto">
            Submit Verification
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </Link>
        <Link href="/dashboard/verification" className="text-[14px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
          Discard and Return
        </Link>
      </div>
    </div>
  );
}
