'use client';

import { motion } from 'framer-motion';

export default function Security() {
  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #F0FDF4 0%, #FFFFFF 45%, #EFF6FF 100%)',
        borderTop: '1px solid #F3F4F6',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle bg decorations */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          left: '20%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,243,208,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          right: '15%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191,219,254,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          {/* Left: copy + badges */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 14,
              }}
            >
              Enterprise-Grade Protection
            </p>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 34px)',
                fontWeight: 800,
                color: 'var(--foreground)',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                marginBottom: 14,
              }}
            >
              Secure by Design.{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #059669, #10B981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Premium by Performance.
              </span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--muted-foreground)',
                lineHeight: 1.65,
                maxWidth: 400,
                marginBottom: 32,
              }}
            >
              Trust is our zero-tolerance zone. Any breach of your medical data is unacceptable — our entire infrastructure is built accordingly.
            </p>

            {/* Compliance badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M11 2.5L4 5.5V11c0 4.09 2.91 7.86 7 9 4.09-1.14 7-4.91 7-9V5.5L11 2.5Z" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 11l2.2 2.2L14 9" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: 'HIPAA Compliant',
                  sub: 'Healthcare data protection certified',
                  bg: '#F0FDF4',
                  border: '#BBF7D0',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="4" y="4" width="14" height="14" rx="3.5" fill="#DBEAFE" stroke="var(--primary)" strokeWidth="1.5" />
                      <path d="M8 11l2.2 2.2L14 9" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  label: 'SOC 2 Type II',
                  sub: 'Independent audit verified annually',
                  bg: '#EFF6FF',
                  border: '#BFDBFE',
                },
              ].map((b) => (
                <motion.div
                  key={b.label}
                  whileHover={{ y: -2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: b.bg,
                    border: `1px solid ${b.border}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>{b.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--foreground)', marginBottom: 2 }}>{b.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{b.sub}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                    <circle cx="8" cy="8" r="6.5" stroke="#374151" strokeWidth="1.2" />
                    <path d="M5.5 8.5L7.5 10.5L10.5 6.5" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              ))}
            </div>

            {/* Feature dots */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
              {['AES-256 Encryption', 'Zero-Knowledge Arch', 'Audit Logging', 'Role-Based Access', '99.99% Uptime SLA', 'Annual Pen Tests'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Zero-Knowledge Vault glass card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ position: 'relative' }}
          >
            {/* Outer glow */}
            <div
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: 28,
                background: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(251,191,36,0.06))',
                filter: 'blur(16px)',
                pointerEvents: 'none',
              }}
            />

            <motion.div
              whileHover={{ y: -4 }}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.25s ease',
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  height: 4,
                  background: 'linear-gradient(90deg, var(--secondary), var(--primary), var(--primary))',
                }}
              />

              <div style={{ padding: '28px 28px 24px' }}>
                {/* Lock icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    boxShadow: '0 6px 20px rgba(245,158,11,0.30)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2.5" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.7" />
                    <path d="M8.5 11V8.5C8.5 6.567 10.067 5 12 5s3.5 1.567 3.5 3.5V11" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.6" fill="white" />
                  </svg>
                </div>

                <h4
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: 'var(--foreground)',
                    letterSpacing: '-0.02em',
                    marginBottom: 8,
                  }}
                >
                  Zero-Knowledge Vault
                </h4>
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--muted-foreground)',
                    lineHeight: 1.65,
                    marginBottom: 24,
                  }}
                >
                  No one — not even HealthScan engineers — can see your raw lab data. True cryptographic privacy with patient-held decryption keys.
                </p>

                {/* Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Encryption layer', pct: 100, color: '#10B981' },
                    { label: 'Access control', pct: 100, color: 'var(--primary)' },
                    { label: 'Audit coverage', pct: 98, color: 'var(--primary)' },
                  ].map((row) => (
                    <div key={row.label}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{row.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--foreground)' }}>{row.pct}%</span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: '#F3F4F6',
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${row.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            borderRadius: 10,
                            background: row.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
