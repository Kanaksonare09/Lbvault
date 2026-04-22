'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      '"HealthScan changed how I manage my chronic condition. It saves me 3 trips to the clinic every year. My doctor can review my CBC results as soon as they\'re uploaded — and auto-flagged anomalies are a lifesaver."',
    name: 'Shruti Venkatesan',
    role: 'Patient · Type 2 Diabetes',
    initials: 'SV',
    gradFrom: '#93C5FD',
    gradTo: 'var(--primary)',
  },
  {
    quote:
      '"As a physician, the clarity HealthScan brings to patient history is remarkable. I spend less time chasing documents and more time making clinical decisions grounded in complete, real-time data."',
    name: 'Dr. Eira Rodrigues',
    role: 'Internal Medicine Physician',
    initials: 'ER',
    gradFrom: '#C4B5FD',
    gradTo: '#7C3AED',
  },
];

export default function Testimonials() {
  return (
    <section
      style={{
        background: '#ffffff',
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
          style={{ textAlign: 'center', marginBottom: 48 }}
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
            Trusted by Patients &amp; Providers
          </p>
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 34px)',
              fontWeight: 800,
              color: 'var(--foreground)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            Real stories. Real impact.
          </h2>
        </motion.div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 18,
            maxWidth: 860,
            margin: '0 auto',
          }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
              style={{
                background: '#ffffff',
                border: '1px solid #F3F4F6',
                borderRadius: 14,
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3 }}>
                {[...Array(5)].map((_, si) => (
                  <svg key={si} width="14" height="14" viewBox="0 0 14 14" fill="var(--primary)">
                    <path d="M7 1l1.545 3.09L12 4.635l-2.5 2.43.59 3.435L7 8.76l-3.09 1.74.59-3.435L2 4.635l3.455-.545L7 1Z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: 13.5,
                  color: '#374151',
                  lineHeight: 1.65,
                  flex: 1,
                  fontStyle: 'italic',
                }}
              >
                {t.quote}
              </p>

              {/* Author */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  paddingTop: 14,
                  borderTop: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.gradFrom}, ${t.gradTo})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{t.name}</p>
                  <p style={{ fontSize: 11.5, color: '#9CA3AF' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
