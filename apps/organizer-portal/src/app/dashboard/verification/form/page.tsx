import Link from 'next/link';

export default function OrganizationVerificationForm() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <div className="text-[13px] font-medium text-slate-500 mb-6">
        Portal <span className="mx-1.5">›</span> <span className="text-[#3d1db7] font-semibold">Organization Verification</span>
      </div>

      {/* Header */}
      <h1 className="text-[2.2rem] font-bold text-slate-900 mb-3 tracking-tight">
        Verify your Organization
      </h1>
      <p className="text-[15px] text-slate-500 mb-10 max-w-[500px] leading-relaxed">
        Please provide the following details to verify your organization's identity and unlock full portal features.
      </p>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Section 1: Organization Identity */}
        <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center text-[#3d1db7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">Organization Identity</h3>
              <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">Basic Details</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Organization Name</label>
              <input 
                type="text" 
                placeholder="e.g. Global Tech Solutions" 
                className="w-full bg-[#f8f9fc] border-0 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3d1db7] focus:bg-white transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Category</label>
              <div className="relative">
                <select className="w-full appearance-none bg-[#f8f9fc] border-0 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 focus:ring-2 focus:ring-[#3d1db7] focus:bg-white transition-colors">
                  <option>University</option>
                  <option>High School</option>
                  <option>Non-Profit</option>
                  <option>Corporate</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Official Email</label>
                <input 
                  type="email" 
                  placeholder="contact@org.com" 
                  className="w-full bg-[#f8f9fc] border-0 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3d1db7] focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Website URL</label>
                <input 
                  type="url" 
                  placeholder="https://www.org.com" 
                  className="w-full bg-[#f8f9fc] border-0 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3d1db7] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Document Upload */}
        <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center text-[#3d1db7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">Document Upload</h3>
              <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">Verification Proof</p>
            </div>
          </div>

          <div className="border-[1.5px] border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-[#f8f9fc] transition-colors cursor-pointer mb-5">
            <div className="w-12 h-12 rounded-full bg-[#f5f3ff] flex items-center justify-center text-[#3d1db7] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h4 className="text-[15px] font-bold text-slate-900 mb-1.5">Click to upload or drag and drop</h4>
            <p className="text-[13px] text-slate-500 font-medium">Official PDF, JPG or PNG (max. 10MB)</p>
          </div>
          
          <div className="flex items-start gap-2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[15px] h-[15px] flex-shrink-0 mt-[3px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-[12px] leading-relaxed font-medium">
              Upload your official business license, incorporation certificate, or university registration document for review.
            </p>
          </div>
        </div>

        {/* Section 3: Social Profiles */}
        <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#d97706]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">Social Profiles</h3>
              <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">Public Presence</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <input 
                type="url" 
                placeholder="LinkedIn URL" 
                className="w-full bg-[#f8f9fc] border-0 rounded-xl pl-12 pr-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3d1db7] focus:bg-white transition-colors"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <input 
                type="url" 
                placeholder="Facebook URL" 
                className="w-full bg-[#f8f9fc] border-0 rounded-xl pl-12 pr-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3d1db7] focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center">
        <button className="bg-[#2a138c] hover:bg-[#200e6c] text-white font-semibold px-10 py-3.5 rounded-[10px] text-[15px] shadow-sm transition-all">
          Submit Verification
        </button>
        <button className="mt-4 text-slate-500 text-[13px] font-medium hover:text-slate-800 transition-colors">
          Save as Draft and Exit
        </button>
      </div>
    </div>
  );
}
