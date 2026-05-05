const steps = [
  {
    title: "Create Account",
    description:
      "Set up your organization's workspace and invite your team in under two minutes.",
    accent: "bg-indigo-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M15 14c2.67 0 8 1.33 8 4v2H7v-2c0-2.67 5.33-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8zM5 13.28l-1.5-1.5L1.78 13.5 5 16.72l6.22-6.22-1.5-1.5L5 13.28z" />
      </svg>
    ),
  },
  {
    title: "Submit Verification",
    description:
      "We verify all credentials to maintain a high-trust, brand-safe environment for our student network.",
    accent: "bg-amber-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
    ),
  },
  {
    title: "Start Posting Events",
    description:
      "Launch your first campaign and track reach, RSVPs, and engagement with our real-time analytics.",
    accent: "bg-violet-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "Direct Engagement",
    description:
      "Bypass noisy social algorithms. Send instant updates and notifications directly to your student community.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
  },
  {
    title: "Analytics Dashboard",
    description:
      "Deep-dive into demographic data, conversion rates, and engagement heatmaps to optimize your outreach.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
      </svg>
    ),
  },
  {
    title: "Secure & Verified",
    description:
      "A trusted, privacy-first platform that ensures your data is protected and your brand is represented safely.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
  },
];



import GoogleSignInButton from '@/components/GoogleSignInButton'

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] rotate-[2deg]">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-300/45 via-white to-violet-300/55 blur-3xl" />
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_rgba(58,37,177,0.18)] backdrop-blur-sm">
        <div className="overflow-hidden rounded-[1.6rem] bg-slate-950 p-4 text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.35)] ring-1 ring-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">SOF Dashboard</p>
              <h3 className="mt-1 text-2xl font-semibold">Organizer Dashboard</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Audience Growth</span>
                <span>+24% this month</span>
              </div>
              <div className="mt-3 grid grid-cols-12 gap-1.5">
                {[22, 36, 28, 44, 54, 66, 52, 70, 84, 68, 76, 92].map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="rounded-t-lg bg-gradient-to-t from-cyan-400 to-indigo-400"
                    style={{ height: `${value}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Upcoming Campaigns</span>
                  <span>04 live</span>
                </div>
                <div className="mt-3 space-y-2">
                  {["Career fair reminders", "Mentor sign-up drive", "Weekend workshop push"].map((item, index) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl bg-white/6 px-3 py-2 text-sm text-slate-200">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      <span className="flex-1">{item}</span>
                      <span className="text-xs text-slate-400">0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-3">
                <p className="text-xs text-slate-300">Live Response</p>
                <div className="mt-3 space-y-3">
                  {[["Reach", "82%"], ["CTR", "19%"], ["RSVP", "1.4k"]].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                        <span>{label}</span><span>{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400"
                          style={{ width: value === "82%" ? "82%" : value === "19%" ? "64%" : "90%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'organizer' || userData?.role === 'admin') {
      redirect('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#faf8ff_0%,_#f6f5ff_42%,_#ffffff_100%)] text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-16 pt-6 sm:px-6 lg:px-8 min-h-[90vh]">
        {/* ── Navbar ── */}
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-10">
            <p className="text-lg font-bold tracking-tight text-slate-900">SOF</p>
            <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex">
              <a className="text-slate-900 font-semibold transition hover:text-indigo-600" href="#platform">Platform</a>
              <a className="transition hover:text-slate-900" href="#pricing">Pricing</a>
              <a className="transition hover:text-slate-900" href="#resources">Resources</a>
            </nav>
          </div>
          <GoogleSignInButton className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
            Log In
          </GoogleSignInButton>
        </header>

        {/* ── Hero ── */}
        <section className="grid items-center gap-12 pb-12 pt-4 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pt-8">
          {/* Left: Text */}
          <div className="flex flex-col items-start">
            <h1 className="max-w-lg text-5xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              Post Opportunities.
              <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                Reach the Right Students.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-slate-500">
              Post internships, events, and courses to reach thousands of Cambodian students in minutes.
            </p>

            <GoogleSignInButton className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-7 py-4 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-[0_12px_28px_rgba(79,70,229,0.35)] active:translate-y-0">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".85"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".7"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".85"/>
              </svg>
              Create Organizer Account
            </GoogleSignInButton>

            <p className="mt-4 text-[13px] text-slate-400">
              Free to join · Verified organizations only
            </p>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="flex items-center justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </section>
      </section>

      {/* ── Streamlined Onboarding ── */}
      <section className="border-y border-indigo-100/70 bg-[linear-gradient(180deg,#f4f1ff_0%,#ede9ff_100%)] pt-10 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-black tracking-[-0.04em] text-indigo-800 sm:text-5xl">
              Start reaching students today.
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              From idea to impact in three simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-white/80 bg-white/90 p-7 shadow-[0_16px_50px_rgba(79,70,229,0.08)]"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.accent} text-white shadow-lg shadow-black/10`}>
                  {step.icon}
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="platform" className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Advanced Platform Features
          </span>
          <h2 className="mt-5 max-w-lg text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
            Why Choose SOF?
          </h2>

          <div className="mt-10 space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow-sm">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr] sm:items-start">
          <div className="relative overflow-hidden rounded-[2rem] shadow-[0_22px_60px_rgba(79,70,229,0.22)]">
            <img
              src="/team-meeting.png"
              alt="Team of professionals collaborating in a modern workspace"
              className="h-[360px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-indigo-800/40 mix-blend-multiply" />
          </div>

          <div className="overflow-hidden rounded-[2rem] shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
            <img
              src="/businessman.png"
              alt="Professional businessman in modern office"
              className="h-[360px] w-full object-cover grayscale"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] bg-[linear-gradient(135deg,#2f1a9a_0%,#3d1db7_38%,#4a2bd6_100%)] px-6 py-16 text-center text-white shadow-[0_30px_80px_rgba(63,34,170,0.3)] sm:px-12">
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Ready to post your first opportunity?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Join the fastest-growing platform connecting organizations with Cambodian students.
          </p>
          <GoogleSignInButton className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-semibold text-indigo-800 shadow-lg shadow-black/10 transition hover:-translate-y-0.5">
            Create Organizer Account
          </GoogleSignInButton>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-indigo-100/80 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SOF Organizer Portal. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <a className="transition hover:text-slate-900" href="#privacy">
              Privacy Policy
            </a>
            <a className="transition hover:text-slate-900" href="#terms">
              Terms of Service
            </a>
            <a className="transition hover:text-slate-900" href="#support">
              Contact Support
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a className="transition hover:text-slate-900" href="#" aria-label="Website">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </a>
            <a className="transition hover:text-slate-900" href="#" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a className="transition hover:text-slate-900" href="#" aria-label="Community">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
