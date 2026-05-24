'use client';

import Link from 'next/link';

const footerLinks = [
  {
    heading: 'Product',
    links: ['Features', 'Dashboard', 'Integrations', 'Changelog', 'Roadmap'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  },
  {
    heading: 'Compliance',
    links: ['HIPAA Policy', 'SOC 2 Report', 'Privacy Policy', 'Terms of Service', 'Security'],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #F3F4F6' }}>
      {/* Main columns */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '52px 28px 42px',
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr 1fr 1fr',
          gap: 48,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1.5L10.5 6L6 10.5L1.5 6L6 1.5Z" fill="white" />
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.3px' }}>
              HealthScan
            </span>
          </Link>

          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6, maxWidth: 200 }}>
            Secure, connected healthcare data management for the modern world.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 20,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              alignSelf: 'flex-start',
              marginTop: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>All systems operational</span>
          </div>
        </div>

        {/* Link columns */}
        {footerLinks.map((col) => (
          <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
              }}
            >
              {col.heading}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      fontSize: 13.5,
                      color: 'var(--muted-foreground)',
                      textDecoration: 'none',
                      fontWeight: 400,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #F3F4F6' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: 12.5, color: '#9CA3AF' }}>
            &copy; {new Date().getFullYear()} HealthScan Digital Health. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'HIPAA'].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 12.5,
                  color: '#9CA3AF',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
