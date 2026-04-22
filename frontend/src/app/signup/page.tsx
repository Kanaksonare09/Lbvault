'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────
   SHIELD + HEART ICON (decorative left panel)
───────────────────────────────────────────────────── */
function ShieldHeart() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <path
        d="M30 5L8 14V29c0 13.6 8.8 26.2 22 29.6C43.2 55.2 52 42.6 52 29V14L30 5Z"
        fill="#7B6B0E"
      />
      <path
        d="M30 41L19.4 31.4c-1.8-1.7-3-4-3-6.4 0-3.4 2.7-6 6-6 2.1 0 4 1.1 5.2 2.8.2.3.6.3.8 0C29.6 20.1 31.5 19 33.6 19c3.3 0 6 2.6 6 6 0 2.4-1.2 4.7-3 6.4L30 41Z"
        fill="white"
      />
    </svg>
  );
}

type Role = '' | 'patient' | 'doctor' | 'pathology';

const ROLE_PILLS: { value: Role; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'pathology', label: 'Lab Partner' },
];

/* ─────────────────────────────────────────────────────
   SHARED STYLE HELPERS
───────────────────────────────────────────────────── */
const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#F0F2FA',
  border: '1.5px solid transparent',
  borderRadius: 13,
  padding: '12px 14px',
  fontSize: 14,
  color: 'var(--foreground)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.16s, box-shadow 0.16s, background 0.16s',
  display: 'block',
};

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#E8B020';
  e.target.style.boxShadow = '0 0 0 3px rgba(232,176,32,0.14)';
  e.target.style.background = '#ffffff';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'transparent';
  e.target.style.boxShadow = 'none';
  e.target.style.background = '#F0F2FA';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SIGNUP PAGE
───────────────────────────────────────────────────── */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as Role,
    age: '',
    gender: 'Male',
    medicalLicenseNumber: '',
    specialization: '',
    labName: '',
    registrationNumber: '',
    address: '',
    hospitalName: '',
    degreeCertificate: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const routes: Record<string, string> = {
        pathology: '/dashboard/pathology',
        doctor: '/dashboard/doctor',
        patient: '/dashboard/patient',
      };
      router.replace(routes[user.role] || '/dashboard/patient');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      setError('Please select your role to continue.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      let res: Response;

      if (formData.role === 'doctor') {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            data.append(key, value as string | Blob);
          }
        });
        res = await fetch(`${apiUrl}/api/auth/signup/doctor`, { method: 'POST', body: data });
      } else {
        res = await fetch(`${apiUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          login(data.user, data.token);
        } else {
          alert('Registration successful! Your account is pending admin approval.');
          router.push('/login');
        }
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ flex: 1, display: 'flex' }}>

        {/* ── LEFT PANEL ─────────────────────────────────── */}
        <div
          className="hidden lg:flex"
          style={{
            width: 465,
            flexShrink: 0,
            background: 'var(--accent)',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '52px 44px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Soft top glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255,255,210,0.55) 0%, transparent 65%)',
          }} />

          {/* Shield icon card + heading */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* White rounded card */}
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                width: 118, height: 118,
                background: '#ffffff',
                borderRadius: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
                margin: '0 auto 30px',
              }}
            >
              <ShieldHeart />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontSize: 40, fontWeight: 800, color: '#1C1700',
                lineHeight: 1.12, letterSpacing: '-0.025em', marginBottom: 16,
              }}
            >
              Join the Future<br />of Personal<br />Health.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              style={{
                fontSize: 13.5, color: '#5A500A', lineHeight: 1.65,
                maxWidth: 300, margin: '0 auto',
              }}
            >
              Experience clinical precision meets human care.
              Your medical data is protected by military-grade
              encryption, giving you total peace of mind.
            </motion.p>
          </div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', position: 'relative', zIndex: 1 }}
          >
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1.5L2.5 4.5V10c0 5.6 3.4 10.8 7.5 12.5 4.1-1.7 7.5-6.9 7.5-12.5V4.5L10 1.5Z" fill="#7B6B0E" />
                    <path d="M7 10.5l2.2 2.2L13.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                eyebrow: 'PRIVACY FIRST',
                title: 'HIPAA Compliant',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="12" width="3.5" height="6" rx="1.2" fill="#7B6B0E" />
                    <rect x="8.25" y="8" width="3.5" height="10" rx="1.2" fill="#7B6B0E" />
                    <rect x="14.5" y="4" width="3.5" height="14" rx="1.2" fill="#7B6B0E" />
                  </svg>
                ),
                eyebrow: 'ADVANCED LABS',
                title: 'Real-time Analysis',
              },
            ].map((b) => (
              <div
                key={b.eyebrow}
                style={{
                  background: 'rgba(255,255,255,0.68)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,0.82)',
                }}
              >
                <div style={{ marginBottom: 6 }}>{b.icon}</div>
                <p style={{
                  fontSize: 9.5, fontWeight: 700, color: '#9B8B30',
                  textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 3,
                }}>
                  {b.eyebrow}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1700', letterSpacing: '-0.01em' }}>
                  {b.title}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────── */}
        <div style={{
          flex: 1, background: '#F5F7FA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px', overflowY: 'auto',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 390 }}
          >
            {/* Heading */}
            <div style={{ marginBottom: 26 }}>
              <h2 style={{
                fontSize: 30, fontWeight: 700, color: 'var(--foreground)',
                letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 8,
              }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                Start your journey toward data-driven wellness today.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 12, padding: '11px 14px',
                  marginBottom: 18, fontSize: 13, color: '#B91C1C',
                }}
              >
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="#EF4444" strokeWidth="1.2" />
                  <path d="M7.5 4.5v3.5M7.5 10v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Full Name */}
              <Field label="Full Name">
                <input
                  type="text" name="name" required placeholder="Dr. Jane Smith"
                  value={formData.name} onChange={handleChange}
                  style={inputBase} onFocus={focusIn} onBlur={focusOut}
                />
              </Field>

              {/* Email */}
              <Field label="Email">
                <input
                  type="email" name="email" required placeholder="jane@clinic.com"
                  value={formData.email} onChange={handleChange}
                  style={inputBase} onFocus={focusIn} onBlur={focusOut}
                />
              </Field>

              {/* Password */}
              <Field label="Password">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" required placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    style={{ ...inputBase, paddingRight: 44 }}
                    onFocus={focusIn} onBlur={focusOut}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
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
              </Field>

              {/* Role pills */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: '#374151', marginBottom: 10 }}>
                  I am a...
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ROLE_PILLS.map((r) => {
                    const selected = formData.role === r.value;
                    return (
                      <motion.button
                        key={r.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 20,
                          fontSize: 13.5,
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          background: selected ? '#E8B020' : '#E8EAF2',
                          color: selected ? '#1C1200' : 'var(--muted-foreground)',
                          boxShadow: selected ? '0 2px 10px rgba(232,176,32,0.32)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {r.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional role fields */}
              <AnimatePresence mode="wait">

                {/* ── DOCTOR ── */}
                {formData.role === 'doctor' && (
                  <motion.div
                    key="doctor"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Upload card */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        htmlFor="degreeCertificate"
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: 10, padding: '22px 16px',
                          border: '2px dashed #D1D5DB', borderRadius: 14,
                          background: '#ffffff', cursor: 'pointer',
                          transition: 'border-color 0.16s, background 0.16s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#E8B020';
                          e.currentTarget.style.background = '#FFFDF0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#D1D5DB';
                          e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        {/* Blue doc icon */}
                        <div style={{
                          width: 42, height: 42, borderRadius: 10,
                          background: '#EFF6FF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <path d="M5 3a1.5 1.5 0 011.5-1.5H13l5 5V19a1.5 1.5 0 01-1.5 1.5H6.5A1.5 1.5 0 015 19V3Z" fill="#DBEAFE" stroke="var(--primary)" strokeWidth="1" />
                            <path d="M13 1.5V7a.5.5 0 00.5.5H18" stroke="var(--primary)" strokeWidth="1" />
                            <path d="M8,12h6M8,15h4" stroke="var(--primary)" strokeWidth="1.1" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)', marginBottom: 3 }}>
                            {formData.degreeCertificate ? formData.degreeCertificate.name : 'Upload Medical License'}
                          </p>
                          <p style={{ fontSize: 12, color: '#9CA3AF' }}>PDF, JPG or PNG (max. 10MB)</p>
                        </div>
                      </label>
                      <input
                        type="file" id="degreeCertificate" name="degreeCertificate"
                        accept=".pdf,.jpg,.jpeg,.png" required
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFormData((prev) => ({ ...prev, degreeCertificate: e.target.files![0] }));
                          }
                        }}
                      />
                    </div>
                    {/* Doctor text fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                      <input type="text" name="medicalLicenseNumber" placeholder="Medical License Number" required
                        value={formData.medicalLicenseNumber} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                      <input type="text" name="hospitalName" placeholder="Hospital / Clinic Name" required
                        value={formData.hospitalName} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                      <input type="text" name="specialization" placeholder="Specialization (e.g. Cardiology)" required
                        value={formData.specialization} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── LAB PARTNER ── */}
                {formData.role === 'pathology' && (
                  <motion.div
                    key="pathology"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                      <input type="text" name="labName" placeholder="Lab Name" required
                        value={formData.labName} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                      <input type="text" name="registrationNumber" placeholder="Registration / License Number" required
                        value={formData.registrationNumber} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                      <input type="text" name="address" placeholder="Lab Full Address" required
                        value={formData.address} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── PATIENT ── */}
                {formData.role === 'patient' && (
                  <motion.div
                    key="patient"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                      <input type="number" name="age" placeholder="Your Age" required
                        value={formData.age} onChange={handleChange}
                        style={inputBase} onFocus={focusIn} onBlur={focusOut}
                      />
                      <select name="gender" required value={formData.gender} onChange={handleChange}
                        style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}
                        onFocus={(e) => { e.target.style.borderColor = '#E8B020'; e.target.style.boxShadow = '0 0 0 3px rgba(232,176,32,0.14)'; e.target.style.background = '#ffffff'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F0F2FA'; }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Get Started button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ y: -1.5, boxShadow: '0 10px 28px rgba(232,176,32,0.48)' }}
                whileTap={{ scale: 0.975 }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#E8B020',
                  border: 'none', borderRadius: 13,
                  padding: '14px 0', marginTop: 18, marginBottom: 20,
                  fontSize: 15, fontWeight: 700, color: '#1C1200',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.72 : 1,
                  boxShadow: '0 4px 18px rgba(232,176,32,0.32)',
                  transition: 'box-shadow 0.2s, transform 0.15s',
                  letterSpacing: '-0.1px',
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2.5px solid rgba(28,18,0,0.25)',
                      borderTopColor: '#1C1200',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4.5L13 8l-4 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted-foreground)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                  Login
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#F5F7FA',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        padding: '11px 16px',
        fontSize: 12, color: '#9CA3AF',
      }}>
        © 2024 HealthScan. Clinical precision meets human care.
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
