'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/lib/AuthContext';

export default function DoctorOverviewDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalPatients: 0, totalReports: 0, urgentCases: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, reportsRes] = await Promise.all([
          api.get('/doctor/patients'),
          api.get('/doctor/shared-reports')
        ]);
        const patients = patientsRes.data || [];
        const reports  = reportsRes.data  || [];
        setStats({
          totalPatients: patients.length,
          totalReports:  reports.length,
          urgentCases:   reports.filter((r: any) => !r.doctorComment).length,
        });
        setRecentReports(reports.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const doctorName = user?.name?.split(' ').pop() ?? 'Doctor';

  const fmt = (d: any) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight leading-none mb-3">
            Welcome back, <span className="text-[var(--primary)]">Dr. {doctorName}</span>
          </h1>
          <p className="text-[#5C7C7C] font-medium text-lg">Here is your clinical overview for today.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/doctor/patients"
            className="bg-[var(--foreground)] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">
            Open Workspace
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Patients',  val: stats.totalPatients, icon: '👥', color: 'bg-[var(--secondary)]/20 text-[var(--primary)]' },
          { label: 'Shared Reports',  val: stats.totalReports,  icon: '📄', color: 'bg-[var(--secondary)]/10 text-[var(--primary)]' },
          { label: 'Action Required', val: stats.urgentCases,   icon: '🚨', color: 'bg-rose-50 text-rose-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[40px] p-10 border border-[var(--border)] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="relative z-10 space-y-4">
              <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl shadow-inner`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">{s.label}</p>
                <p className="text-4xl font-black text-[var(--foreground)]">{s.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports — full width (Medical Bulletins removed) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.2em]">Incoming Clinical Data</h3>
          <Link href="/dashboard/doctor/shared-reports"
            className="text-xs font-black text-[var(--primary)] hover:underline uppercase tracking-widest">
            View All
          </Link>
        </div>

        <div className="bg-white rounded-[40px] border border-[var(--border)] shadow-sm overflow-hidden divide-y divide-[#F1F5F5]">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="p-8 animate-pulse bg-gray-50 m-4 rounded-2xl h-24" />)
          ) : recentReports.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <p className="text-lg font-bold text-[var(--foreground)]">No recent reports</p>
              <p className="text-sm text-[#5C7C7C]">When patients share reports, they will appear here.</p>
            </div>
          ) : recentReports.map((r) => (
            <div
              key={r._id}
              onClick={() => router.push('/dashboard/doctor/shared-reports')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard/doctor/shared-reports')}
              className="flex items-center justify-between p-8 hover:bg-gray-50 transition-all group cursor-pointer outline-none"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#F1F5F5] rounded-2xl flex items-center justify-center text-xl group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300">
                  📄
                </div>
                <div>
                  <h4 className="font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{r.reportName}</h4>
                  <p className="text-xs text-[#5C7C7C] font-medium uppercase tracking-widest">
                    {r.patientId?.name} • {fmt(r.uploadDate || r.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  !r.doctorComment ? 'bg-rose-50 text-rose-600' : 'bg-[var(--secondary)]/10 text-[var(--primary)]'
                }`}>
                  {!r.doctorComment ? 'Urgent Review' : 'Reviewed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
