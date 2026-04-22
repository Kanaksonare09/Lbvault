'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────
   CLINICAL ILLUSTRATION — purely decorative CSS/SVG
───────────────────────────────────────────────────── */
function ClinicalIllustration() {
  return (
    <div className="relative w-[272px] h-[230px] mx-auto mt-7 mb-3">
      {/* Dark base card */}
      <div
        className="absolute inset-0 rounded-[16px] overflow-hidden"
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Warm radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 52% 52%, rgba(75,96,67,0.55) 0%, rgba(45,54,42,0.22) 50%, transparent 72%)',
          }}
        />
        {/* Secondary cool glow top-right */}
        <div
          className="absolute"
          style={{
            top: '8%', right: '10%', width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(80,120,220,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Connection lines SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 272 230"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Lines from center sphere outward */}
          {[
            [136, 115, 48, 44],
            [136, 115, 218, 52],
            [136, 115, 240, 138],
            [136, 115, 194, 192],
            [136, 115, 62, 180],
            [136, 115, 32, 110],
            [136, 115, 168, 36],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(144,161,125,0.25)"
              strokeWidth="0.8"
            />
          ))}
        </svg>

        {/* Center main sphere */}
        <div
          className="absolute rounded-full"
          style={{
            width: 64, height: 64,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle at 36% 32%, var(--secondary) 0%, #4B6043 55%, #1F2B1A 100%)',
            boxShadow: '0 0 32px rgba(200,120,10,0.65), 0 0 8px rgba(200,120,10,0.3) inset',
          }}
        />
        {/* Center sphere highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: 18, height: 12,
            top: 'calc(50% - 24px)', left: 'calc(50% - 14px)',
            background: 'radial-gradient(circle, rgba(255,240,180,0.4) 0%, transparent 100%)',
            transform: 'rotate(-20deg)',
          }}
        />

        {/* Satellite spheres — various sizes & opacity */}
        {[
          { x: 48, y: 44, r: 14, g: 'radial-gradient(circle at 35% 30%, #c47a08, #5a2c02)' },
          { x: 218, y: 52, r: 10, g: 'radial-gradient(circle at 35% 30%, #b06a06, #4a2001)' },
          { x: 240, y: 138, r: 16, g: 'radial-gradient(circle at 35% 30%, #d08208, #622e01)' },
          { x: 194, y: 192, r: 11, g: 'radial-gradient(circle at 35% 30%, #b87206, #502402)' },
          { x: 62, y: 180, r: 13, g: 'radial-gradient(circle at 35% 30%, #c07a07, #5a2c02)' },
          { x: 32, y: 110, r: 9, g: 'radial-gradient(circle at 35% 30%, #a06004, #3e1c01)' },
          { x: 168, y: 36, r: 8, g: 'radial-gradient(circle at 35% 30%, #b86c06, #4a2001)' },
          { x: 110, y: 32, r: 6, g: 'radial-gradient(circle at 35% 30%, #906004, #1F2B1A)' },
          { x: 88, y: 175, r: 7, g: 'radial-gradient(circle at 35% 30%, #a06804, #3e1c01)' },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s.r * 2, height: s.r * 2,
              left: s.x - s.r, top: s.y - s.r,
              background: s.g,
              boxShadow: `0 0 ${s.r + 4}px rgba(200,120,10,0.45)`,
            }}
          />
        ))}
      </div>

      {/* Frosted glass "VERIFIED" card — overlaps bottom edge */}
      <div
        className="absolute z-10 flex items-center gap-2.5"
        style={{
          bottom: -8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.92)',
          borderRadius: 12,
          padding: '8px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        }}
      >
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 22, height: 22,
            background: 'linear-gradient(135deg, #C97B06, var(--primary))',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M5.5 1L6.8 3.8H10L7.5 5.7L8.5 9L5.5 7.2L2.5 9L3.5 5.7L1 3.8H4.2L5.5 1Z"
              fill="white"
            />
          </svg>
        </div>
        <span
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            color: 'var(--foreground)', textTransform: 'uppercase',
          }}
        >
          Verified
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────────────────── */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const routes: Record<string, string> = {
        pathology: '/dashboard/pathology',
        doctor: '/dashboard/doctor',
        patient: '/dashboard/patient',
        SuperAdmin: '/dashboard/admin',
      };
      router.replace(routes[user.role] || '/dashboard/patient');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-shrink-0"
        style={{
          width: 468,
          background: 'var(--accent)',
          padding: '40px 40px 36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Very subtle texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,200,0.45) 0%, transparent 60%)',
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          {/* Medical cross / diamond icon */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #9b7c10, #C9A227)',
              borderRadius: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="6" y="2" width="4" height="12" rx="1.5" fill="white" />
              <rect x="2" y="6" width="12" height="4" rx="1.5" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#2a2200', letterSpacing: '-0.3px' }}>
            HealthScan
          </span>
        </Link>

        {/* Main heading */}
        <div className="relative z-10" style={{ marginTop: 28 }}>
          <h1
            style={{
              fontSize: 'clamp(30px, 3.2vw, 38px)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: '#0d1117',
              marginBottom: 0,
            }}
          >
            Secure Access
            <br />
            to Your{' '}
            <span style={{ color: 'var(--primary)' }}>
              Clinical
              <br />
              Sanctuary.
            </span>
          </h1>
        </div>

        {/* Illustration */}
        <div className="relative z-10">
          <ClinicalIllustration />
        </div>

        {/* Bottom text */}
        <div className="relative z-10" style={{ marginTop: 28 }}>
          <p
            style={{
              fontSize: 12.5,
              lineHeight: 1.62,
              color: 'var(--primary)',
              maxWidth: 300,
              marginBottom: 14,
            }}
          >
            Precision technology meeting human care to provide you
            the most secure health data management.
          </p>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
              textTransform: 'uppercase',
              opacity: 0.75,
            }}
          >
            Clinical Security Protocol V2.4.0
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div
        className="flex-1 bg-white flex flex-col"
        style={{ position: 'relative' }}
      >
        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-10 py-12">
          <div style={{ width: '100%', maxWidth: 390 }}>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ marginBottom: 32 }}
            >
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                Welcome Back
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                Please enter your clinical credentials to continue.
              </p>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 12, padding: '12px 14px',
                  marginBottom: 20, fontSize: 13, color: '#B91C1C',
                }}
              >
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="#EF4444" strokeWidth="1.2" />
                  <path d="M7.5 4.5v3.5M7.5 10v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            >
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="dr.smith@clinical.com"
                  required
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#F1F3FA',
                    border: '1px solid transparent',
                    borderRadius: 14,
                    padding: '13px 16px',
                    fontSize: 14,
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#F1F3FA';
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label
                    htmlFor="password"
                    style={{
                      fontSize: 10.5, fontWeight: 600, color: '#374151',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    required
                    suppressHydrationWarning
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F1F3FA',
                      border: '1px solid transparent',
                      borderRadius: 14,
                      padding: '13px 44px 13px 16px',
                      fontSize: 14,
                      color: 'var(--foreground)',
                      outline: 'none',
                      transition: 'border-color 0.18s, box-shadow 0.18s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)';
                      e.target.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#F1F3FA';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9CA3AF', padding: 4, lineHeight: 0,
                    }}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 22, cursor: 'pointer',
                }}
              >
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${rememberMe ? 'var(--primary)' : '#D1D5DB'}`,
                    background: rememberMe ? 'var(--primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {rememberMe && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13.5, color: '#374151' }}>Remember this device</span>
              </label>

              {/* Sign In button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ y: -1.5, boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'var(--primary)',
                  border: 'none', borderRadius: 14,
                  padding: '14px 0',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.75 : 1,
                  boxShadow: '0 4px 16px rgba(37,99,235,0.28)',
                  transition: 'box-shadow 0.2s, transform 0.15s',
                  letterSpacing: '-0.1px',
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4.5L13 8l-4 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '22px 0',
              }}
            >
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              <span style={{ fontSize: 12.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                Or clinical identity sign-in
              </span>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <motion.button
                type="button"
                whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: '#F5F6FA',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12, padding: '11px 0',
                  fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.18s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.638-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </motion.button>
            </div>

            {/* Request access */}
            <p
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--muted-foreground)',
                marginTop: 24,
              }}
            >
              Not a member of the clinic yet?{' '}
              <Link
                href="/signup"
                style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
              >
                Request Access
              </Link>
            </p>
          </div>
        </div>

        {/* Footer links — bottom right */}
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', gap: 24,
            padding: '14px 40px',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          {['Privacy Policy', 'Security', 'Support'].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                fontSize: 10, fontWeight: 600,
                color: '#9CA3AF', textTransform: 'uppercase',
                letterSpacing: '0.09em', textDecoration: 'none',
              }}
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
