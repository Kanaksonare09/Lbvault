'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: 1200, padding: '0 28px', height: 52 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5L10.5 6L6 10.5L1.5 6L6 1.5Z" fill="white" />
            </svg>
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--foreground)',
              letterSpacing: '-0.3px',
            }}
          >
            HealthScan
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center" style={{ gap: 36 }}>
          {['Platform', 'Solutions', 'Enterprise', 'Pricing'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: 'var(--muted-foreground)',
                textDecoration: 'none',
                transition: 'color 0.15s',
                letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <Link
            href="/login"
            className="hidden md:block"
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: 'var(--muted-foreground)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              background: 'var(--foreground)',
              padding: '7px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'all 0.15s',
              letterSpacing: '-0.1px',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#1f2937';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--foreground)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
