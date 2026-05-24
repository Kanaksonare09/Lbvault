'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

/* ─────────────────────────────────────────────
   HERO DASHBOARD MOCK
───────────────────────────────────────────── */
function HeroDashboard() {
  return (
    <div className="w-full h-full bg-[var(--foreground)] flex flex-col gap-2.5 p-3.5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-yellow-400/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          </div>
          <span className="text-[8.5px] text-gray-500 font-medium">HealthScan Dashboard</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-[var(--accent-soft)]0/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { l: 'Reports', v: '142', t: '+12%', c: '#60A5FA' },
          { l: 'Patients', v: '38', t: '+5', c: '#34D399' },
          { l: 'Alerts', v: '3', t: '-2', c: '#FBBF24' },
        ].map((s) => (
          <div key={s.l} className="bg-white/5 rounded-lg p-2">
            <p className="text-[7.5px] text-gray-500 mb-1">{s.l}</p>
            <p className="text-[15px] font-bold text-white leading-none">{s.v}</p>
            <p className="text-[7.5px] mt-1" style={{ color: s.c }}>{s.t}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 bg-white/[0.03] rounded-lg p-2.5 min-h-0">
        <p className="text-[7.5px] text-gray-600 mb-1.5">Report Volume — Last 7 days</p>
        <svg viewBox="0 0 210 52" className="w-full h-10" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 46 C28 38 55 20 85 24 C115 28 145 12 178 14 C192 15 203 8 210 5 L210 52 L0 52Z" fill="url(#hg)" />
          <path d="M0 46 C28 38 55 20 85 24 C115 28 145 12 178 14 C192 15 203 8 210 5" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Recent reports */}
      <div className="space-y-1">
        <p className="text-[7.5px] text-gray-600 uppercase tracking-widest font-semibold mb-1.5">Recent Reports</p>
        {[
          { n: 'CBC Report', l: 'Apollo Diagnostics', s: 'Verified', c: '#34D399' },
          { n: 'Lipid Profile', l: 'Thyrocare', s: 'Pending', c: '#FBBF24' },
          { n: 'HbA1c Test', l: 'SRL Labs', s: 'Alert', c: '#F87171' },
        ].map((r) => (
          <div key={r.n} className="flex items-center justify-between bg-white/[0.04] rounded px-2 py-1.5">
            <div>
              <p className="text-[9px] text-white font-semibold">{r.n}</p>
              <p className="text-[7.5px] text-gray-500">{r.l}</p>
            </div>
            <span
              className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ color: r.c, background: `${r.c}20` }}
            >
              {r.s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMMAND CENTER DASHBOARD MOCK
───────────────────────────────────────────── */
function CommandDashboard() {
  return (
    <div className="flex flex-col gap-2.5 h-full">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Total Reports', v: '4,821', d: '+8%', c: '#60A5FA' },
          { l: 'Patients', v: '312', d: '+14%', c: '#34D399' },
          { l: 'Doctors', v: '28', d: '+3', c: '#A78BFA' },
          { l: 'Alerts', v: '7', d: '-2', c: '#FBBF24' },
        ].map((m) => (
          <div key={m.l} className="bg-white/[0.06] rounded-lg p-2">
            <p className="text-[7.5px] text-gray-500 mb-1">{m.l}</p>
            <p className="text-[16px] font-bold text-white leading-none">{m.v}</p>
            <p className="text-[7.5px] mt-1" style={{ color: m.c }}>{m.d}</p>
          </div>
        ))}
      </div>

      {/* Chart + activity */}
      <div className="flex gap-2 flex-1 min-h-0">
        <div className="flex-1 bg-white/[0.04] rounded-lg p-2.5 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[7.5px] text-gray-500">Report Inflow</p>
            <span className="text-[7px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">● Live</span>
          </div>
          <svg viewBox="0 0 240 68" className="w-full flex-1" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 56 C30 46 60 26 90 30 C120 34 152 16 185 18 C210 20 230 10 240 7 L240 68 L0 68Z" fill="url(#cg1)" />
            <path d="M0 56 C30 46 60 26 90 30 C120 34 152 16 185 18 C210 20 230 10 240 7" fill="none" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M0 64 C30 60 60 54 90 52 C120 50 152 42 185 38 C210 34 230 26 240 22 L240 68 L0 68Z" fill="url(#cg2)" />
            <path d="M0 64 C30 60 60 54 90 52 C120 50 152 42 185 38 C210 34 230 26 240 22" fill="none" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="w-[118px] bg-white/[0.04] rounded-lg p-2.5 flex-shrink-0">
          <p className="text-[7.5px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Activity</p>
          <div className="space-y-1.5">
            {[
              { n: 'CBC report', t: '2m', c: '#34D399' },
              { n: 'X-Ray upload', t: '6m', c: '#60A5FA' },
              { n: 'HbA1c alert', t: '14m', c: '#F87171' },
              { n: 'Lipid panel', t: '22m', c: '#FBBF24' },
            ].map((a) => (
              <div key={a.n} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: a.c }} />
                <span className="text-[8.5px] text-gray-300 flex-1 truncate">{a.n}</span>
                <span className="text-[7.5px] text-gray-500">{a.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] rounded-lg px-3 py-2">
        <div className="grid grid-cols-4 text-[7.5px] text-gray-600 uppercase tracking-widest font-semibold pb-1.5 border-b border-white/[0.06]">
          <span>Patient</span><span>Test</span><span>Lab</span><span>Status</span>
        </div>
        {[
          { p: 'Rahul Sharma', t: 'CBC', l: 'Apollo', s: 'Verified', c: '#34D399' },
          { p: 'Priya Mehta', t: 'Thyroid', l: 'SRL', s: 'Pending', c: '#FBBF24' },
          { p: 'Anil Kumar', t: 'HbA1c', l: 'Thyrocare', s: 'Alert', c: '#F87171' },
        ].map((r) => (
          <div key={r.p} className="grid grid-cols-4 text-[8.5px] py-1.5 border-b border-white/[0.04] last:border-0 items-center">
            <span className="text-gray-200 font-medium truncate pr-1">{r.p}</span>
            <span className="text-gray-500">{r.t}</span>
            <span className="text-gray-500">{r.l}</span>
            <span className="font-semibold text-[8px]" style={{ color: r.c }}>{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  return (
    <motion.nav
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L9 5L5 9L1 5L5 1Z" fill="white" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-gray-900 tracking-tight">HealthScan</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/login" className="text-[13.5px] font-medium text-gray-500 hover:text-gray-800 transition-colors">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-semibold bg-[var(--foreground)] text-white px-5 py-2.5 rounded-[8px] hover:bg-gray-800 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [-0.5, 0.5], [8, -8]);
  const ry = useTransform(mx, [-0.5, 0.5], [-8, 8]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    animate(mx, (e.clientX - r.left) / r.width - 0.5, { duration: 0.3 });
    animate(my, (e.clientY - r.top) / r.height - 0.5, { duration: 0.3 });
  }
  function onLeave() {
    animate(mx, 0, { duration: 0.6 });
    animate(my, 0, { duration: 0.6 });
  }

  return (
    <section className="relative bg-white overflow-hidden min-h-[88vh] flex items-center">
      {/* Bg glows */}
      <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-[var(--accent-soft)]/70 blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-[var(--accent-soft)]/50 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto px-6 w-full py-16 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">

        {/* LEFT — copy */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col"
        >
          <h1 className="text-[42px] lg:text-[50px] font-extrabold leading-[1.1] tracking-[-0.03em] text-gray-900 mb-4">
            Your Health Data,
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-400 bg-clip-text text-transparent">
              Secured &amp;
            </span>{' '}
            Simplified.
          </h1>

          <p className="text-[14.5px] text-gray-500 leading-[1.65] max-w-[400px] mb-8">
            HealthScan connects your medical records with clinical precision.
            Experience the security of modern healthcare management for
            patients and professionals.
          </p>

          {/* CTA */}
          <div className="mb-8">
            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-400 to-yellow-400 text-gray-900 font-bold text-[13.5px] px-5 py-3 rounded-[9px] shadow-lg shadow-amber-200/60 hover:shadow-amber-300/70 transition-shadow"
              >
                Get Started Free
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5H10.5M7.5 3.5L10.5 6.5L7.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {[
                { bg: '#93C5FD', l: 'A' }, { bg: '#6EE7B7', l: 'R' },
                { bg: '#F9A8D4', l: 'P' }, { bg: '#FCD34D', l: 'S' },
              ].map((av, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-700"
                  style={{ background: av.bg, marginLeft: i === 0 ? 0 : -8, zIndex: 4 - i, position: 'relative' }}
                >
                  {av.l}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-gray-500">
              Joined <span className="font-bold text-gray-800">20,000+</span> practitioners
            </p>
          </div>
        </motion.div>

        {/* RIGHT — 3D card */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex items-center justify-center lg:justify-end"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full bg-amber-200/20 blur-3xl" />
          </div>

          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 1100 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' } }}
            className="relative w-full max-w-[430px]"
          >
            {/* Drop shadow */}
            <div className="absolute inset-0 rounded-2xl bg-black/20 blur-2xl translate-y-5 scale-90 pointer-events-none" />

            {/* Glass frame */}
            <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 p-2 shadow-2xl"
              style={{ boxShadow: '0 2px 0 rgba(255,255,255,0.9) inset, 0 24px 60px rgba(0,0,0,0.14)' }}>
              <div className="rounded-[14px] overflow-hidden h-[336px]">
                <HeroDashboard />
              </div>
            </div>

            {/* Floating card — top right */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="absolute -top-4 -right-3 z-20 bg-white rounded-xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2 w-[160px]"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1.5L12 11H1L6.5 1.5Z" fill="#EF4444" />
                  <path d="M6.5 5V8M6.5 9.2V9.6" stroke="white" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-800 leading-tight">Full Set Report</p>
                <p className="text-[8.5px] text-gray-400 mt-0.5">Verified · 2m ago</p>
              </div>
            </motion.div>

            {/* Floating card — bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="absolute -bottom-4 -left-3 z-20 bg-white rounded-xl shadow-xl border border-gray-100 px-3 py-2 flex items-center gap-2 w-[175px]"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" fill="#D1FAE5" />
                  <path d="M4 6.8l1.8 1.8L9.2 5" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-800 leading-tight">CBC Report Verified</p>
                <p className="text-[8.5px] text-gray-400 mt-0.5">Dr. Mehta · Apollo</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES — "Seamless Medical Intelligence"
───────────────────────────────────────────── */
function Features() {
  const cards = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="3.5" stroke="#D97706" strokeWidth="1.7" />
          <path d="M11 8v6M8.5 10.5l2.5-2.5 2.5 2.5" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      iconBg: 'bg-[var(--accent-soft)]',
      title: 'Upload Report',
      desc: 'Drag-and-drop any format — PDF, JPEG, DICOM. Instant OCR extraction with zero data loss and automatic structuring.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="7.5" stroke="var(--primary)" strokeWidth="1.7" />
          <path d="M8 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="11" cy="11" r="1.3" fill="var(--primary)" />
        </svg>
      ),
      iconBg: 'bg-[var(--accent-soft)]',
      title: 'AI Analysis',
      desc: 'Your AI co-pilot scans biomarkers and highlights anomalies you need to know — in plain language you can understand.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="7.5" r="3.2" stroke="#B45309" strokeWidth="1.7" />
          <path d="M5 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#B45309" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-[var(--accent-soft)]',
      title: 'Doctor Insights',
      desc: 'Securely connect reports with your care team. Doctors get context-rich views and can annotate findings in real time.',
    },
  ];

  return (
    <section className="bg-white border-y border-gray-100 py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold text-[var(--primary)] uppercase tracking-[0.1em] mb-3">
            Seamless Medical Intelligence
          </p>
          <h2 className="text-[30px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight mb-3">
            Everything your health data needs
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-md mx-auto">
            Our platform provides a complete suite of tools to ingest, analyse, and act on medical data effectively.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.09)' }}
              className="bg-white rounded-[13px] border border-gray-100 p-6 flex flex-col gap-4 shadow-sm transition-all cursor-default"
            >
              <div className={`w-11 h-11 ${c.iconBg} rounded-[10px] flex items-center justify-center`}>
                {c.icon}
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-gray-900 mb-2 tracking-[-0.01em]">{c.title}</h3>
                <p className="text-[13px] text-gray-500 leading-[1.62]">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMMAND CENTER + SIDE CARDS
───────────────────────────────────────────── */
function CommandCenter() {
  return (
    <section className="bg-white py-20 border-b border-gray-100">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid lg:grid-cols-[1.62fr_1fr] gap-4">

          {/* Big dark card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="bg-[var(--foreground)] rounded-2xl p-6 flex flex-col gap-5 min-h-[400px] shadow-2xl transition-transform"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.08em] mb-2">
                  AI-POWERED BY LABVAULT
                </p>
                <h3 className="text-[20px] font-extrabold text-white tracking-[-0.02em] leading-tight mb-2">
                  The Patient Command Center
                </h3>
                <p className="text-[12.5px] text-gray-500 max-w-[300px] leading-relaxed">
                  Access your entire medical history, track biomarkers in real time, and share reports across your care team.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex-shrink-0 flex items-center gap-1.5 bg-amber-400 hover:bg-yellow-300 text-gray-900 font-semibold text-[12px] px-3.5 py-2 rounded-[8px] transition-colors cursor-pointer"
              >
                Explore Dashboard
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5H9M6.5 3L9 5.5L6.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>

            <div className="flex-1 min-h-0">
              <CommandDashboard />
            </div>
          </motion.div>

          {/* Right stacked cards */}
          <div className="flex flex-col gap-4">
            {/* Military Grade Privacy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="flex-1 bg-[#1C2333] rounded-2xl p-5 flex flex-col gap-4 shadow-xl transition-transform"
            >
              <div className="w-10 h-10 rounded-[10px] bg-amber-400/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3.5 4.5V10c0 4.09 2.91 7.86 6.5 8.5 3.59-.64 6.5-4.41 6.5-8.5V4.5L10 2Z"
                    stroke="#FBBF24" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M7 10l2.2 2.2 3.8-3.6" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white tracking-[-0.015em] mb-2">Military Grade Privacy</h4>
                <p className="text-[12.5px] text-gray-500 leading-relaxed">
                  AES-256 encryption at rest &amp; in transit. True zero-knowledge architecture — your data, your keys.
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap mt-auto">
                {['AES-256', 'Zero-Trust', 'E2E'].map((t) => (
                  <span key={t} className="text-[9.5px] font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Lab Integration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="flex-1 bg-[var(--accent-soft)] rounded-2xl p-5 flex flex-col gap-4 border border-[var(--border)] shadow-sm transition-transform"
            >
              <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="5" width="16" height="10" rx="2" stroke="var(--primary)" strokeWidth="1.6" />
                  <path d="M6 10.5h1.5M9.5 10.5H13M6 13h3" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 tracking-[-0.015em] mb-2">Lab Integration</h4>
                <p className="text-[12.5px] text-gray-600 leading-relaxed">
                  Connect with Apollo, SRL, Thyrocare and 200+ labs. Reports sync automatically to your vault.
                </p>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-1.5">
                {['Apollo', 'SRL', 'Labs+'].map((lab) => (
                  <div key={lab} className="text-center py-1.5 rounded-[7px] bg-white border border-[var(--border)] text-[10px] font-semibold text-gray-600">
                    {lab}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ECOSYSTEM
───────────────────────────────────────────── */
function Ecosystem() {
  const cols = [
    {
      eyebrow: 'Everything for you',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="6.5" r="3" stroke="#D97706" strokeWidth="1.6" />
          <path d="M4 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-[var(--accent-soft)]',
      points: ['Instant access to all lab reports', 'Secure sharing with doctors', 'Health trend visualizations', 'AI plain-language insights'],
      tickClr: '#D97706', tickBg: 'var(--accent)',
      cta: 'Start Your Access',
      ctaCls: 'border border-gray-200 text-gray-700 hover:border-gray-300 bg-white',
      href: '/signup',
      featured: false,
    },
    {
      eyebrow: 'Insights for doctors',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="12" rx="2" stroke="var(--primary)" strokeWidth="1.6" />
          <path d="M6.5 9.5h7M6.5 12.5h5" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-[var(--accent-soft)]',
      points: ['Instant lab result notifications', 'Full patient history at a glance', 'Annotate & share reports', 'HIPAA-compliant data access'],
      tickClr: 'var(--primary)', tickBg: '#DBEAFE',
      cta: 'Clinician Demo',
      ctaCls: 'bg-[var(--primary)] text-white hover:bg-blue-700 shadow-lg shadow-blue-100',
      href: '/signup?role=doctor',
      featured: true,
    },
    {
      eyebrow: 'Streamlined for labs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 3v8L4.5 16h11L12.5 11V3H7.5Z" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M7.5 3h5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-emerald-50',
      points: ['One-click report distribution', 'Secure digital record upload', 'Patient directory management', 'Throughput analytics dashboard'],
      tickClr: '#059669', tickBg: '#D1FAE5',
      cta: 'Lab Access',
      ctaCls: 'border border-gray-200 text-gray-700 hover:border-gray-300 bg-white',
      href: '/signup?role=lab',
      featured: false,
    },
  ];

  return (
    <section className="bg-[#F9FAFB] border-t border-gray-100 py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] mb-3">
            Designed for the Entire Ecosystem
          </p>
          <h2 className="text-[30px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight mb-3">
            Built for every stakeholder
          </h2>
          <p className="text-[14px] text-gray-500 max-w-sm mx-auto leading-relaxed">
            Whether you're a patient, clinician, or laboratory — HealthScan fits your workflow seamlessly.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-5">
          {cols.map((c, i) => (
            <motion.div
              key={c.eyebrow}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
              className={`bg-white rounded-[13px] border p-6 flex flex-col gap-5 transition-all shadow-sm ${
                c.featured ? 'border-blue-200 shadow-blue-50/80' : 'border-gray-100'
              }`}
            >
              {/* Icon + title */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${c.iconBg} rounded-[9px] flex items-center justify-center flex-shrink-0`}>
                  {c.icon}
                </div>
                <h3 className="text-[14px] font-bold text-gray-900 tracking-[-0.015em]">{c.eyebrow}</h3>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Bullets */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {c.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5">
                    <div
                      className="w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 mt-[1px]"
                      style={{ background: c.tickBg }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l1.6 1.6L6.5 2" stroke={c.tickClr} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[12.5px] text-gray-600 leading-[1.52]">{pt}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={c.href}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[9px] text-[12.5px] font-semibold transition-all ${c.ctaCls}`}
              >
                {c.cta}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5H9M6.5 3L9 5.5L6.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SECURITY
───────────────────────────────────────────── */
function Security() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 border-t border-gray-100 py-20 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[420px] h-[420px] rounded-full bg-emerald-100/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-100/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.48 }}
        >
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-[0.1em] mb-3">
            Enterprise-Grade Protection
          </p>
          <h2 className="text-[30px] font-extrabold text-gray-900 tracking-[-0.025em] leading-tight mb-4">
            Secure by Design.{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Premium by Performance.
            </span>
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-[380px] mb-8">
            Trust is our zero-tolerance zone. Any breach of your medical data is absolutely unacceptable — our entire infrastructure is built accordingly.
          </p>

          {/* Compliance badges */}
          <div className="flex flex-col gap-3 mb-8">
            {[
              {
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L3 3.75V9c0 3.68 2.62 7.07 6 7.65C15.38 16.07 18 12.68 18 9V3.75L9 1.5Z" fill="#D1FAE5" /><path d="M9 1.5L3 3.75V9c0 3.68 2.62 7.07 6 7.65C15.38 16.07 18 12.68 18 9V3.75L9 1.5Z" stroke="#059669" strokeWidth="1.3" strokeLinejoin="round" /><path d="M6.5 9l2 2 3.5-3.2" stroke="#059669" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                label: 'HIPAA Compliant', sub: 'Healthcare data protection certified',
                bg: 'bg-emerald-50', border: 'border-emerald-100',
              },
              {
                icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3.5" fill="#DBEAFE" /><rect x="2" y="2" width="14" height="14" rx="3.5" stroke="var(--primary)" strokeWidth="1.3" /><path d="M5.5 9l2 2 3.5-3.2" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
                label: 'SOC 2 Type II', sub: 'Independent audit verified annually',
                bg: 'bg-[var(--accent-soft)]', border: 'border-blue-100',
              },
            ].map((b) => (
              <div
                key={b.label}
                className={`flex items-center gap-3.5 ${b.bg} ${b.border} border rounded-xl px-4 py-3.5`}
              >
                <div className="flex-shrink-0">{b.icon}</div>
                <div className="flex-1">
                  <p className="text-[13.5px] font-bold text-gray-900">{b.label}</p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">{b.sub}</p>
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M2 4l1.6 1.6L6 2.4" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {['AES-256 Encryption', 'Zero-Knowledge Arch', 'Audit Logging', 'Role-Based Access', '99.99% Uptime SLA', 'Annual Pen Tests'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-[12.5px] text-gray-600 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Vault card */}
        <motion.div
          initial={{ opacity: 0, x: 22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-100/40 to-amber-50/30 blur-xl pointer-events-none" />
          <motion.div
            whileHover={{ y: -4 }}
            className="relative bg-white/85 backdrop-blur-xl border border-white/90 rounded-2xl overflow-hidden shadow-2xl transition-transform"
          >
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300" />
            <div className="p-7">
              <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-200/50">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="5" y="12" width="16" height="11" rx="2.5" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.8" />
                  <path d="M9 12V9.5C9 7.567 10.791 6 13 6s4 1.567 4 3.5V12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="13" cy="17.5" r="1.8" fill="white" />
                </svg>
              </div>
              <h4 className="text-[18px] font-extrabold text-gray-900 tracking-[-0.02em] mb-2.5">
                Zero-Knowledge Vault
              </h4>
              <p className="text-[13.5px] text-gray-500 leading-relaxed mb-7">
                No one — not even HealthScan engineers — can see your raw lab data. True cryptographic privacy with patient-held decryption keys.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Encryption layer', pct: 100, color: '#10B981' },
                  { label: 'Access control', pct: 100, color: 'var(--primary)' },
                  { label: 'Audit coverage', pct: 98, color: 'var(--primary)' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[12.5px] text-gray-600 font-medium">{r.label}</span>
                      <span className="text-[12.5px] font-bold text-gray-800">{r.pct}%</span>
                    </div>
                    <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: r.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
function Testimonials() {
  const items = [
    {
      quote: '"HealthScan changed how I manage my chronic condition. It saves me 3 trips to the clinic every year. My doctor can review my CBC results as soon as they\'re uploaded — auto-flagged anomalies are a lifesaver."',
      name: 'Shruti Venkatesan', role: 'Patient · Type 2 Diabetes',
      initials: 'SV', from: '#93C5FD', to: 'var(--primary)',
    },
    {
      quote: '"As a physician, the clarity HealthScan brings to patient history is remarkable. I spend less time chasing documents and more time making clinical decisions grounded in complete, real-time data."',
      name: 'Dr. Eira Rodrigues', role: 'Internal Medicine Physician',
      initials: 'ER', from: '#C4B5FD', to: '#7C3AED',
    },
  ];

  return (
    <section className="bg-white border-t border-gray-100 py-20">
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] mb-3">
            Trusted by Patients &amp; Providers
          </p>
          <h2 className="text-[30px] font-extrabold text-gray-900 tracking-[-0.025em]">
            Real stories. Real impact.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-5 max-w-[820px] mx-auto">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.11, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-[13px] border border-gray-100 p-6 flex flex-col gap-5 shadow-sm transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, si) => (
                  <svg key={si} width="13" height="13" viewBox="0 0 13 13" fill="var(--primary)">
                    <path d="M6.5 1l1.4 2.8L11 4.3 8.8 6.5l.5 3.1L6.5 8.3 3.7 9.6l.5-3.1L2 4.3l3.1-.5L6.5 1Z" />
                  </svg>
                ))}
              </div>

              <p className="text-[13.5px] text-gray-600 leading-[1.65] flex-1 italic">{t.quote}</p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{t.name}</p>
                  <p className="text-[11.5px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: 'Product', links: ['Features', 'Dashboard', 'Integrations', 'Changelog', 'Roadmap'] },
    { heading: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
    { heading: 'Compliance', links: ['HIPAA Policy', 'SOC 2 Report', 'Privacy Policy', 'Terms of Service', 'Security'] },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1100px] mx-auto px-6 py-12 grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-12">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-[5px] bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L9 5L5 9L1 5L5 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-[14px] font-bold text-gray-900 tracking-tight">HealthScan</span>
          </Link>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-[190px]">
            Secure, connected healthcare data management for the modern world.
          </p>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 self-start">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10.5px] font-semibold text-emerald-700">All systems operational</span>
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.heading} className="flex flex-col gap-4">
            <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.09em]">{col.heading}</p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-[13.5px] text-gray-500 hover:text-gray-900 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">
            &copy; {new Date().getFullYear()} HealthScan Digital Health. All rights reserved.
          </p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'HIPAA'].map((l) => (
              <a key={l} href="#" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <Navbar />
      <Hero />
      <Features />
      <CommandCenter />
      <Ecosystem />
      <Security />
      <Testimonials />
      <Footer />
    </div>
  );
}
