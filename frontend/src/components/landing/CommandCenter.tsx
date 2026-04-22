'use client';

import { motion } from 'framer-motion';

function LiveDot() {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#10B981',
        display: 'inline-block',
        animationName: 'pulse',
        animationDuration: '2s',
        animationIterationCount: 'infinite',
      }}
    />
  );
}

function CommandDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { label: 'Total Reports', val: '4,821', delta: '+8%', c: '#60A5FA' },
          { label: 'Patients', val: '312', delta: '+14%', c: '#34D399' },
          { label: 'Doctors', val: '28', delta: '+3', c: '#A78BFA' },
          { label: 'Alerts', val: '7', delta: '-2', c: 'var(--primary)' },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 9,
              padding: '9px 10px',
            }}
          >
            <p style={{ fontSize: 8, color: 'var(--muted-foreground)', marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#F9FAFB', lineHeight: 1 }}>{m.val}</p>
            <p style={{ fontSize: 8, color: m.c, marginTop: 3 }}>{m.delta}</p>
          </div>
        ))}
      </div>

      {/* Chart + activity */}
      <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>
        {/* Area chart */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 9,
            padding: '10px 10px 8px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>Report Inflow</p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 7.5,
                color: '#34D399',
                background: 'rgba(52,211,153,0.1)',
                padding: '2px 6px',
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              <LiveDot /> Live
            </div>
          </div>
          <svg viewBox="0 0 240 72" style={{ width: '100%', flexShrink: 0 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="cmd1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="cmd2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 58 C30 48 60 28 90 33 C120 38 150 18 180 20 C210 22 228 10 240 7 L240 72 L0 72 Z" fill="url(#cmd1)" />
            <path d="M0 58 C30 48 60 28 90 33 C120 38 150 18 180 20 C210 22 228 10 240 7" fill="none" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M0 68 C30 64 60 56 90 54 C120 52 150 42 180 39 C210 36 228 27 240 24 L240 72 L0 72 Z" fill="url(#cmd2)" />
            <path d="M0 68 C30 64 60 56 90 54 C120 52 150 42 180 39 C210 36 228 27 240 24" fill="none" stroke="#10B981" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Activity feed */}
        <div
          style={{
            width: 130,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 9,
            padding: '10px',
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: 8, color: 'var(--muted-foreground)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Activity
          </p>
          {[
            { name: 'CBC report', time: '2m', c: '#34D399' },
            { name: 'X-Ray upload', time: '6m', c: '#60A5FA' },
            { name: 'HbA1c alert', time: '14m', c: '#FC7F7F' },
            { name: 'Lipid panel', time: '22m', c: 'var(--primary)' },
            { name: 'Thyroid test', time: '38m', c: '#A78BFA' },
          ].map((a) => (
            <div
              key={a.name}
              style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}
            >
              <div
                style={{ width: 5, height: 5, borderRadius: '50%', background: a.c, flexShrink: 0 }}
              />
              <span style={{ fontSize: 9, color: '#D1D5DB', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.name}
              </span>
              <span style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 9,
          padding: '10px 12px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 0.9fr',
            fontSize: 7.5,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
            paddingBottom: 7,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 6,
          }}
        >
          <span>Patient</span>
          <span>Test</span>
          <span>Lab</span>
          <span>Status</span>
        </div>
        {[
          { patient: 'Rahul Sharma', test: 'CBC', lab: 'Apollo', status: 'Verified', c: '#34D399' },
          { patient: 'Priya Mehta', test: 'Thyroid', lab: 'SRL', status: 'Pending', c: 'var(--primary)' },
          { patient: 'Anil Kumar', test: 'HbA1c', lab: 'Thyrocare', status: 'Alert', c: '#FC7F7F' },
        ].map((r) => (
          <div
            key={r.patient}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1fr 0.9fr',
              fontSize: 9,
              padding: '5px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#E5E7EB', fontWeight: 500 }}>{r.patient}</span>
            <span style={{ color: '#9CA3AF' }}>{r.test}</span>
            <span style={{ color: '#9CA3AF' }}>{r.lab}</span>
            <span style={{ color: r.c, fontWeight: 600, fontSize: 8.5 }}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommandCenter() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 0', borderTop: '1px solid #F3F4F6' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 18 }}>
          {/* Large dark card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -3 }}
            style={{
              background: 'var(--foreground)',
              borderRadius: 16,
              padding: '26px 26px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              minHeight: 400,
              boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
              transition: 'transform 0.25s ease',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#34D399',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}
                >
                  AI-Powered by HealthScan
                </p>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#F9FAFB',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    marginBottom: 8,
                  }}
                >
                  The Patient Command Center
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', maxWidth: 300, lineHeight: 1.55 }}>
                  Access your entire medical history, track biomarkers in real time, and share reports across your care team.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  background: 'var(--secondary)',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#FDE047')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--secondary)')}
              >
                Explore Dashboard
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5H9M6.5 3L9 5.5L6.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>

            {/* Dashboard UI */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <CommandDashboard />
            </div>
          </motion.div>

          {/* Side cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Military Grade Privacy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.45 }}
              whileHover={{ y: -3 }}
              style={{
                flex: 1,
                background: '#1C2333',
                borderRadius: 16,
                padding: '22px 22px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'transform 0.25s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(250,204,21,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3.5 5V10c0 4.09 2.91 7.86 6.5 9 3.59-1.14 6.5-4.91 6.5-9V5L10 2Z" stroke="var(--secondary)" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M7 10l2.2 2.2L13 8" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#F9FAFB',
                    marginBottom: 7,
                    letterSpacing: '-0.015em',
                  }}
                >
                  Military Grade Privacy
                </h4>
                <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  AES-256 encryption at rest and in transit. True zero-knowledge architecture — your data, your keys.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                {['AES-256', 'Zero-Trust', 'E2E'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: 'var(--primary)',
                      background: 'rgba(251,191,36,0.1)',
                      padding: '3px 9px',
                      borderRadius: 20,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Lab Integration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18, duration: 0.45 }}
              whileHover={{ y: -3 }}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #F3F4F6',
                borderRadius: 16,
                padding: '22px 22px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.25s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="5" width="16" height="10" rx="2" stroke="var(--primary)" strokeWidth="1.6" />
                  <path d="M6 10.5h1.5M9.5 10.5H13M6 13h3" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--foreground)',
                    marginBottom: 7,
                    letterSpacing: '-0.015em',
                  }}
                >
                  Lab Integration
                </h4>
                <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  Connect with Apollo, SRL, Thyrocare and 200+ labs. Reports sync automatically.
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 7,
                  marginTop: 'auto',
                }}
              >
                {['Apollo', 'SRL', 'Labs+'].map((lab) => (
                  <div
                    key={lab}
                    style={{
                      textAlign: 'center',
                      padding: '6px 0',
                      borderRadius: 8,
                      background: '#F9FAFB',
                      border: '1px solid #F3F4F6',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
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
