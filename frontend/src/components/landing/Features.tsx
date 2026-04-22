'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="var(--primary)" strokeWidth="1.6" />
        <path d="M10 7.5v5M7.5 10l2.5-2.5 2.5 2.5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconBg: 'var(--accent-soft)',
    iconBorder: 'var(--border)',
    title: 'Upload Report',
    desc: 'Drag-and-drop any format — PDF, JPEG, DICOM. OCR extracts structured data instantly, zero manual entry.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="var(--primary)" strokeWidth="1.6" />
        <path d="M7.5 10c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="1" fill="var(--primary)" />
      </svg>
    ),
    iconBg: '#EFF6FF',
    iconBorder: '#BFDBFE',
    title: 'AI Analysis',
    desc: 'Your AI co-pilot scans biomarkers and highlights anomalies in plain-language summaries you can actually understand.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.5" r="3" stroke="#059669" strokeWidth="1.6" />
        <path d="M4.5 17c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    iconBg: '#ECFDF5',
    iconBorder: '#A7F3D0',
    title: 'Doctor Insights',
    desc: 'Securely connect reports to your care team. Doctors receive context-rich views and can annotate findings in real time.',
  },
];

export default function Features() {
  return (
    <section
      style={{
        background: '#F9FAFB',
        borderTop: '1px solid #F3F4F6',
        borderBottom: '1px solid #F3F4F6',
        padding: '80px 0',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 12,
            }}
          >
            Seamless Medical Intelligence
          </p>
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 34px)',
              fontWeight: 800,
              color: 'var(--foreground)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Everything your health data needs
          </h2>
          <p
            style={{
              fontSize: 14.5,
              color: 'var(--muted-foreground)',
              lineHeight: 1.65,
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            A complete suite to ingest, analyse, and act on your medical data — all in one place.
          </p>
        </motion.div>

        {/* Card grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.09)' }}
              style={{
                background: '#ffffff',
                border: '1px solid #F3F4F6',
                borderRadius: 14,
                padding: '24px 24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                cursor: 'default',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: f.iconBg,
                  border: `1px solid ${f.iconBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--foreground)',
                    marginBottom: 7,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.62 }}>{f.desc}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                <button
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#9CA3AF',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  Learn more
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5H9M6.5 3L9 5.5L6.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
