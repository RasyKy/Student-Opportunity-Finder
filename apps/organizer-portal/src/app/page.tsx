const steps = [
  {
    title: "Create Account",
    description:
      "Register your organization profile with our intuitive onboarding wizard in under two minutes.",
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
      "Our trust team reviews your credentials to ensure a safe, high-quality ecosystem for all students.",
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
      "Launch your first campaign and watch your engagement grow with our real-time marketing tools.",
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
    title: "Ethical Sourcing",
    description:
      "A privacy-first platform that ensures data integrity and ethical interaction standards for all users.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
  },
];

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] rotate-[2deg]">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-300/45 via-white to-violet-300/55 blur-3xl" />
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_rgba(58,37,177,0.18)] backdrop-blur-sm">
        <div className="overflow-hidden rounded-[1.6rem] bg-slate-950 p-4 text-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.35)] ring-1 ring-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                SOF Dashboard
              </p>
              <h3 className="mt-1 text-2xl font-semibold">
                Organizer Dashboard
              </h3>
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
                {[22, 36, 28, 44, 54, 66, 52, 70, 84, 68, 76, 92].map(
                  (value, index) => (
                    <div
                      key={`${value}-${index}`}
                      className="rounded-t-lg bg-gradient-to-t from-cyan-400 to-indigo-400"
                      style={{ height: `${value}px` }}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Upcoming Campaigns</span>
                  <span>04 live</span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    "Career fair reminders",
                    "Mentor sign-up drive",
                    "Weekend workshop push",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-xl bg-white/6 px-3 py-2 text-sm text-slate-200"
                    >
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
                  {[
                    ["Reach", "82%"],
                    ["CTR", "19%"],
                    ["RSVP", "1.4k"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400"
                          style={{
                            width:
                              value === "82%"
                                ? "82%"
                                : value === "19%"
                                  ? "64%"
                                  : "90%",
                          }}
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
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#faf8ff_0%,_#f6f5ff_42%,_#ffffff_100%)] text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        {/* ── Navbar ── */}
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-8">
            <p className="text-lg font-bold tracking-tight text-slate-900">SOF</p>

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
              <a className="border-b-2 border-indigo-600 pb-0.5 text-slate-900" href="#platform">
                Platform
              </a>
              <a className="transition hover:text-slate-900" href="#pricing">
                Pricing
              </a>
              <a className="transition hover:text-slate-900" href="#resources">
                Resources
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold">
            <a className="rounded-full px-4 py-2 text-slate-600 transition hover:bg-slate-100" href={`/dashboard`}>
              Login
            </a>
            <a
              className="rounded-full bg-gradient-to-r from-indigo-700 to-violet-700 px-5 py-2.5 text-white shadow-lg shadow-indigo-500/25 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-500/30"
              href={`/dashboard`}
            >
              Sign Up
            </a>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="grid items-center gap-14 pb-10 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-12">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-amber-300/70 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
              For Community Leaders
            </span>

            <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
              Amplify Your Impact.
              <span className="mt-2 block bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600 bg-clip-text text-transparent">
                Reach More Students.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              The definitive platform for organizers to connect with the next generation.
              Professional tools for event scaling, ethical engagement, and deep-dive analytics.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 px-6 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(79,70,229,0.3)]"
                href={`/dashboard`}
              >
                Request Organizer Account
              </a>
              <a
                className="inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white px-6 py-4 text-base font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
                href="#resources"
              >
                View Case Studies
              </a>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <DashboardMockup />
          </div>
        </section>
      </section>

      {/* ── Streamlined Onboarding ── */}
      <section className="border-y border-indigo-100/70 bg-[linear-gradient(180deg,#f4f1ff_0%,#ede9ff_100%)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black tracking-[-0.04em] text-indigo-800 sm:text-5xl">
              Streamlined Onboarding
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
            Ready to transform your engagement strategy?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Join 500+ organizations already reaching thousands of students daily on SOF.
          </p>
          <a
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-semibold text-indigo-800 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
            href={`/dashboard`}
          >
            Get Started Today
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-indigo-100/80 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 SOF Organizer Portal. All rights reserved.</p>
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
