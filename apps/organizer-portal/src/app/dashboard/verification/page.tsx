"use client";

import Link from 'next/link';
import {
  CheckCircle, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-wider mb-6">
          <Zap className="w-3 h-3" />
          Onboarding Process
        </div>
        <h1 className="text-[48px] font-black leading-[1.1] text-slate-900 tracking-tight">
          Verify your Organization to <span className="text-[#3B329C]">Start Posting.</span>
        </h1>
        <p className="mt-6 text-[18px] text-slate-500 leading-relaxed max-w-2xl font-medium">
          Unlock the full potential of SOF. Verified organizations get priority placement, advanced analytics, and the trusted verification badge.
        </p>
      </div>

      {/* Hero Action Card */}
      <div className="relative rounded-[40px] bg-[#3B329C] p-12 overflow-hidden shadow-2xl shadow-indigo-200 min-h-[420px] flex flex-col justify-center group">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[60%] bg-indigo-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-xl">
          <div className="w-16 h-16 rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white mb-8">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-[44px] font-black text-white leading-[1.1] tracking-tight mb-8">
            Ready to reach <br />
            <span className="text-amber-400">10,000+ students</span>?
          </h2>
          <p className="text-indigo-100 text-[17px] leading-relaxed mb-10 max-w-[460px] font-medium opacity-90">
            Our verification process is designed to be seamless. Submit your documents once and gain permanent access to the student ecosystem.
          </p>
          <Link href="/dashboard/verification/registration">
            <button className="group flex items-center gap-4 bg-white text-[#3B329C] hover:bg-indigo-50 px-10 py-5 rounded-[20px] font-black transition-all shadow-xl shadow-black/10 active:scale-95 text-[16px]">
              Start Verification
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Floating Badge Mockup */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block">
           <div className="w-[300px] bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-8 rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="h-2.5 w-24 bg-white/40 rounded-full mb-2" />
                  <div className="h-2 w-16 bg-white/20 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-2/3 bg-white/10 rounded-full" />
              </div>
           </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Verification Perks</h3>
            <p className="text-slate-400 font-bold text-[14px]">Everything you get as a trusted partner</p>
          </div>
          <div className="h-px flex-1 bg-slate-100 mx-10 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Unlimited Postings",
              desc: "Share as many opportunities as you want without any restrictions.",
              icon: Zap,
              color: "bg-amber-50 text-amber-600"
            },
            {
              title: "Rich Analytics",
              desc: "See exactly how students interact with your posts and optimize reach.",
              icon: BarChart3,
              color: "bg-indigo-50 text-indigo-600"
            },
            {
              title: "Verified Badge",
              desc: "Build instant trust with the community through our official checkmark.",
              icon: ShieldCheck,
              color: "bg-emerald-50 text-emerald-600"
            }
          ].map((benefit, i) => (
            <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
              <div className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-8 shadow-sm`}>
                <benefit.icon className="w-7 h-7" />
              </div>
              <h4 className="text-[19px] font-black text-slate-900 mb-3 tracking-tight">{benefit.title}</h4>
              <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Footer */}
      <div className="bg-slate-900 rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-[18px] font-black tracking-tight">Need help with verification?</h4>
            <p className="text-white/50 font-medium text-[15px]">Our dedicated support team is available 24/7 to assist you.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-[14px]">
            View FAQ
          </button>
          <button className="flex-1 md:flex-none px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black transition-all shadow-xl shadow-indigo-500/20 text-[14px]">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
