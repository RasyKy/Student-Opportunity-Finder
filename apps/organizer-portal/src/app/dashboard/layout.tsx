"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  LogOut,
  ChevronDown,
  Bell,
  HelpCircle,
  Lock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const PRE_VERIFICATION_PATHS = [
  '/dashboard/verification/registration',
  '/dashboard/verification/status',
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    async function checkVerification() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('organizer_profiles')
        .select('verification_status, org_name')
        .eq('user_id', user.id)
        .single()

      setIsVerified(profile?.verification_status === 'verified')
      setOrgName(profile?.org_name ?? user.user_metadata?.full_name ?? user.email ?? '')
    }
    checkVerification()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresVerification: true },
    { name: 'My Postings', href: '/dashboard/postings', icon: FileText, requiresVerification: true },
    { name: 'Verification', href: '/dashboard/verification', icon: CheckCircle, requiresVerification: false },
  ];

  // Minimal layout for pre-verified flow pages
  if (PRE_VERIFICATION_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] text-slate-900 font-sans">
        <header className="h-[68px] flex items-center justify-between px-8 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3B329C] flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">SOF</span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-[13px] font-medium text-slate-400">Organizer Portal</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all text-[13px] font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </header>
        <div className="max-w-[860px] mx-auto px-8 py-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] text-slate-900 font-sans overflow-hidden">
      {/* --- Sidebar --- */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[#3B329C] text-white z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#3B329C]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold tracking-tight">SOF</p>
                <p className="text-[11px] text-white/60 font-medium">Organizer Portal</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const locked = item.requiresVerification && isVerified === false;
            const isActive = !locked && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));

            if (locked) {
              return (
                <div
                  key={item.name}
                  title="Complete verification to unlock"
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-bold text-white/30 cursor-not-allowed select-none"
                >
                  <item.icon className="w-5 h-5 text-white/20" />
                  {item.name}
                  <Lock className="w-3.5 h-3.5 ml-auto text-white/20" />
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3.5 transition-all text-[14px] font-bold ${
                  isActive
                    ? 'bg-white text-[#3B329C] shadow-lg shadow-black/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#3B329C]' : 'text-white/60'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-4 py-6 mt-auto">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-white/70 hover:text-white hover:bg-white/10 transition-all text-[14px] font-bold"
          >
            <LogOut className="w-5 h-5 text-white/60" />
            Log Out
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[72px] flex-shrink-0 flex items-center justify-between px-8 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Company</p>
              <h2 className="text-[15px] font-bold text-slate-900">{orgName || '—'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:opacity-80 transition-opacity shadow-sm">
              <img src="https://i.pravatar.cc/100?img=11" alt="Avatar" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#f8f9fc]">
          <div className="p-8 max-w-[1200px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
