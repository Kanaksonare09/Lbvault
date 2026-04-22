'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const columns = [
  {
    eyebrow: 'For patients',
    title: 'Everything for you',
    icon: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
        <circle cx="9.5" cy="6" r="3" stroke="var(--primary)" strokeWidth="1.6" />
        <path d="M3.5 17.5c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    iconBg: 'var(--accent-soft)',
    accentColor: 'var(--primary)',
    tickColor: 'var(--primary)',
    tickBg: 'var(--accent)',
    points: [
      'Instant access to all lab reports',
      'Secure sharing with doctors',
      'Health trend visualizations',
      'AI plain-language insights',
    ],
    cta: 'Start Your Access',
    ctaBg: '#F9FAFB',
    ctaBorder: '#E5E7EB',
    ctaColor: '#374151',
    ctaHref: '/signup',
  },
  {
    eyebrow: 'For doctors',
    title: 'Insights for doctors',
    icon: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
        <rect x="3" y="4" width="13" height="11" rx="2" stroke="var(--primary)" strokeWidth="1.6" />
        <path d="M6.5 9h6M6.5 12h4" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    iconBg: '#EFF6FF',
    accentColor: 'var(--primary)',
    tickColor: 'var(--primary)',
    tickBg: '#DBEAFE',
    points: [
      'Instant lab result notifications',
      'Full patient history at a glance',
      'Annotate & share reports',
      'HIPAA-compliant data access',
    ],
    cta: 'Clinician Demo',
    ctaBg: '#1D4ED8',
    ctaBorder: '#1D4ED8',
    ctaColor: '#ffffff',
    ctaHref: '/signup?role=doctor',
    featured: true,
  },
  {
    eyebrow: 'For labs',
    title: 'Streamlined for labs',
    icon: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
        <path d="M7 2.5V9L4 14.5h11L12 9V2.5H7Z" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 2.5h5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    iconBg: '#ECFDF5',
    accentColor: '#059669',
    tickColor: '#059669',
    tickBg: '#D1FAE5',
    points: [
      'One-click report distribution',
      'Secure digital record upload',
      'Patient directory management',
      'Privacy & compliance reports',
    ],
    cta: 'Lab Access',
    ctaBg: '#F9FAFB',
    ctaBorder: '#E5E7EB',
    ctaColor: '#374151',
    ctaHref: '/signup?role=lab',
  },
];

export default function Ecosystem() {
  return (
    <section
      id="solutions"
      style={{
        background: '#F9FAFB',
        borderTop: '1px solid #F3F4F6',
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
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 12,
            }}
          >
            Designed for the Entire Ecosystem
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
            Built for every stakeholder
          </h2>
          <p
            style={{
              fontSize: 14.5,
              color: 'var(--muted-foreground)',
              lineHeight: 1.65,
              maxWidth: 460,
              margin: '0 auto',
            }}
          >
            Whether you're a patient, clinician, or laboratory — HealthScan fits your workflow.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {columns.map((col, i) => (
            <motion.div
              key={col.eyebrow}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
              style={{
                background: '#ffffff',
                border: col.featured ? `1.5px solid ${col.accentColor}22` : '1px solid #F3F4F6',
                borderRadius: 14,
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: col.featured
                  ? `0 8px 32px ${col.accentColor}14`
                  : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              {/* Icon + eyebrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: col.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {col.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: col.accentColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 2,
                    }}
                  >
                    {col.eyebrow}
                  </p>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--foreground)',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {col.title}
                  </h3>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#F3F4F6' }} />

              {/* Bullet points */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {col.points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 5,
                        background: col.tickBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M2 4.5l1.8 1.8L7 3" stroke={col.tickColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{pt}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={col.ctaHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 0',
                  borderRadius: 9,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: col.ctaColor,
                  background: col.ctaBg,
                  border: `1px solid ${col.ctaBorder}`,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {col.cta}
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
