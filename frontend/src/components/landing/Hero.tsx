'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

/* ─── Floating micro-cards ────────────────────────────────────────── */

function AlertBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.45, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: -18,
        right: -12,
        zIndex: 30,
        background: '#ffffff',
        border: '1px solid #F3F4F6',
        borderRadius: 12,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        width: 168,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1.5L11.5 11H1.5L6.5 1.5Z" fill="#EF4444" />
          <path d="M6.5 5.5V8M6.5 9.2V9.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>High HbA1c Alert</p>
        <p style={{ fontSize: 9, color: '#9CA3AF', lineHeight: 1.4, marginTop: 1 }}>Flagged · just now</p>
      </div>
    </motion.div>
  );
}

function VerifiedBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.45, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        bottom: -18,
        left: -12,
        zIndex: 30,
        background: '#ffffff',
        border: '1px solid #F3F4F6',
        borderRadius: 12,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        width: 182,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: '#F0FDF4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" fill="#DCFCE7" />
          <path d="M4.2 6.8L5.8 8.4L9 5.2" stroke="#16A34A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>Report Verified</p>
        <p style={{ fontSize: 9, color: '#9CA3AF', lineHeight: 1.4, marginTop: 1 }}>CBC · Dr. Mehta · 2m ago</p>
      </div>
    </motion.div>
  );
}

function VitalsBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.3, duration: 0.45, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '42%',
        right: -36,
        zIndex: 30,
        background: '#ffffff',
        border: '1px solid #F3F4F6',
        borderRadius: 12,
        padding: '10px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        width: 128,
        transform: 'translateY(-50%)',
      }}
    >
      <p
        style={{
          fontSize: 8.5,
          fontWeight: 600,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 7,
        }}
      >
        Vitals
      </p>
      {[
        { l: 'Blood Pressure', v: '118/76', c: 'var(--primary)' },
        { l: 'SpO₂', v: '98%', c: '#10B981' },
        { l: 'Heart Rate', v: '72 bpm', c: 'var(--primary)' },
      ].map((row) => (
        <div
          key={row.l}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
          }}
        >
          <span style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>{row.l}</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: row.c }}>{row.v}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Dashboard mock inside the 3D card ──────────────────────────── */
function DashboardMock() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--foreground)',
        borderRadius: 14,
        overflow: 'hidden',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: 'rgba(144, 161, 125, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)' }} />
          </div>
          <span style={{ fontSize: 9.5, color: 'var(--muted-foreground)', fontWeight: 500 }}>HealthScan Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#EF4444', 'var(--primary)', '#10B981'].map((c) => (
            <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[
          { label: 'Reports', val: '142', trend: '+12%', c: 'var(--primary)' },
          { label: 'Patients', val: '38', trend: '+5', c: '#10B981' },
          { label: 'Alerts', val: '3', trend: '-2', c: 'var(--primary)' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            <p style={{ fontSize: 8, color: 'var(--muted-foreground)', marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', lineHeight: 1 }}>{s.val}</p>
            <p style={{ fontSize: 8, color: s.c, marginTop: 2 }}>{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8,
          padding: '10px',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>Report Volume — Last 7 days</p>
          <span
            style={{
              fontSize: 7.5,
              fontWeight: 600,
              color: 'var(--primary)',
              background: 'rgba(59,130,246,0.1)',
              padding: '2px 6px',
              borderRadius: 20,
            }}
          >
            Live
          </span>
        </div>
        <svg viewBox="0 0 220 56" style={{ width: '100%', height: 48 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.38" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 48 C20 40 40 22 70 26 C100 30 130 14 160 16 C185 18 205 8 220 5 L220 56 L0 56 Z"
            fill="url(#hg1)"
          />
          <path
            d="M0 48 C20 40 40 22 70 26 C100 30 130 14 160 16 C185 18 205 8 220 5"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Recent reports */}
      <div>
        <p
          style={{
            fontSize: 8,
            fontWeight: 600,
            color: '#4B5563',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 5,
          }}
        >
          Recent Reports
        </p>
        {[
          { name: 'CBC Report', lab: 'Apollo Diagnostics', status: 'Verified', c: '#10B981' },
          { name: 'Lipid Profile', lab: 'Thyrocare', status: 'Pending', c: 'var(--primary)' },
          { name: 'HbA1c Test', lab: 'SRL Labs', status: 'Alert', c: '#EF4444' },
        ].map((r) => (
          <div
            key={r.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 7,
              padding: '6px 8px',
              marginBottom: 4,
            }}
          >
            <div>
              <p style={{ fontSize: 9, fontWeight: 600, color: '#F9FAFB' }}>{r.name}</p>
              <p style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>{r.lab}</p>
            </div>
            <span
              style={{
                fontSize: 8,
                fontWeight: 600,
                color: r.c,
                background: `${r.c}18`,
                padding: '2px 7px',
                borderRadius: 20,
              }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */
export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    animate(mouseX, x, { duration: 0.35, ease: 'easeOut' });
    animate(mouseY, y, { duration: 0.35, ease: 'easeOut' });
  }

  function handleMouseLeave() {
    animate(mouseX, 0, { duration: 0.7, ease: 'easeOut' });
    animate(mouseY, 0, { duration: 0.7, ease: 'easeOut' });
  }

  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 52px)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Subtle bg gradients */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(144, 161, 125, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          left: -60,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '72px 28px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        {/* ── Left copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 11px',
              borderRadius: 20,
              background: 'var(--accent-soft)',
              border: '1px solid var(--border)',
              marginBottom: 22,
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--primary)',
                letterSpacing: '0.04em',
              }}
            >
              HIPAA Compliant · SOC 2 Certified
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              color: 'var(--foreground)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 18,
              margin: '0 0 18px 0',
            }}
          >
            Your Health Data,{' '}
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 60%, #5C7C7C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Secured &amp; Simplified.
            </span>
          </h1>

          {/* Sub-text */}
          <p
            style={{
              fontSize: 15,
              color: 'var(--muted-foreground)',
              lineHeight: 1.65,
              maxWidth: 420,
              marginBottom: 32,
              margin: '0 0 32px 0',
            }}
          >
            HealthScan connects your medical records with clinical precision. Experience the
            security of modern healthcare management for patients and professionals.
          </p>

          {/* Single CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <motion.div whileHover={{ scale: 1.025, y: -1.5 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '11px 22px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: '#1C1917',
                  background: 'linear-gradient(145deg, var(--secondary) 0%, var(--primary) 100%)',
                  boxShadow: '0 4px 18px rgba(245,158,11,0.32)',
                  textDecoration: 'none',
                  letterSpacing: '-0.1px',
                }}
              >
                Get Started Free
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2.5 6.5H10.5M7.5 3.5L10.5 6.5L7.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', marginRight: 0 }}>
              {[
                { bg: '#93C5FD', label: 'A' },
                { bg: '#6EE7B7', label: 'R' },
                { bg: '#F9A8D4', label: 'P' },
                { bg: '#FCD34D', label: 'S' },
              ].map((av, i) => (
                <div
                  key={i}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: '2px solid #ffffff',
                    background: av.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#374151',
                    marginLeft: i === 0 ? 0 : -8,
                    flexShrink: 0,
                  }}
                >
                  {av.label}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', fontWeight: 500 }}>
              Trusted by{' '}
              <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>10,000+</span>{' '}
              medical practitioners
            </p>
          </div>
        </motion.div>

        {/* ── Right: 3D Dashboard card ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}
        >
          {/* Glow behind card */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(144, 161, 125, 0.14) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* 3D floating card */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              perspective: 1000,
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: 420,
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
            }}
          >
            {/* Drop shadow layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 20,
                background: 'rgba(0,0,0,0.18)',
                filter: 'blur(28px)',
                transform: 'translateY(20px) scaleX(0.9)',
                zIndex: -1,
              }}
            />

            {/* Glass frame */}
            <div
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.85)',
                borderRadius: 20,
                padding: 8,
                boxShadow:
                  '0 2px 0 0 rgba(255,255,255,0.9) inset, 0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
              }}
            >
              <div style={{ borderRadius: 14, overflow: 'hidden', height: 340 }}>
                <DashboardMock />
              </div>
            </div>

            {/* Floating micro-cards */}
            <AlertBadge />
            <VerifiedBadge />
            <VitalsBadge />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
