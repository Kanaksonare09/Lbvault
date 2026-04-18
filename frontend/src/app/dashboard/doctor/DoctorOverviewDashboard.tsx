'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/lib/AuthContext';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';

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
        const reports = reportsRes.data || [];
        
        setStats({
          totalPatients: patients.length,
          totalReports: reports.length,
          urgentCases: reports.filter((r: any) => !r.doctorComment).length
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

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#1F2933] tracking-tight leading-none mb-3">
            Welcome back, <span className="text-[#2B59FF]">Dr. {doctorName}</span>
          </h1>
          <p className="text-[#6B7280] font-medium text-lg">Here is your clinical overview for today.</p>
        </div>
        <div className="flex gap-4">
           <Link href="/dashboard/doctor/patients" className="bg-[#1F2933] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">
             Open Workspace
           </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Patients', val: stats.totalPatients, icon: '👥', color: 'bg-blue-50 text-blue-600' },
          { label: 'Shared Reports', val: stats.totalReports, icon: '📄', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Action Required', val: stats.urgentCases, icon: '🚨', color: 'bg-rose-50 text-rose-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[40px] p-10 border border-[#E2E8F0] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="relative z-10 space-y-4">
              <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl shadow-inner`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F6F6F] mb-1">{s.label}</p>
                <p className="text-4xl font-black text-[#1F2933]">{s.val}</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 text-[#E2E8F0]/20 group-hover:text-[#E2E8F0]/40 transition-colors pointer-events-none transform group-hover:scale-110 duration-500">
               <span className="text-9xl font-black tracking-tighter leading-none">{s.val}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Reports List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-[#4F6F6F] uppercase tracking-[0.2em]">Incoming Clinical Data</h3>
            <Link href="/dashboard/doctor/shared-reports" className="text-xs font-black text-[#2B59FF] hover:underline uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="bg-white rounded-[40px] border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#F6F7F5]">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="p-8 animate-pulse bg-gray-50 m-4 rounded-2xl h-24" />)
            ) : recentReports.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <p className="text-lg font-bold text-[#1F2933]">No recent reports</p>
                <p className="text-sm text-[#6B7280]">When patients share reports, they will appear here.</p>
              </div>
            ) : (
              recentReports.map((r) => (
                <div 
                  key={r._id} 
                  onClick={() => router.push(`/dashboard/doctor/shared-reports`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/doctor/shared-reports`)}
                  className="flex items-center justify-between p-8 hover:bg-gray-50 transition-all group cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#F6F7F5] rounded-2xl flex items-center justify-center text-xl group-hover:bg-[#2B59FF] group-hover:text-white transition-colors duration-300">
                      📄
                    </div>
                    <div>
                      <h4 className="font-black text-[#1F2933] group-hover:text-[#2B59FF] transition-colors">{r.reportName}</h4>
                      <p className="text-xs text-[#6B7280] font-medium uppercase tracking-widest">
                        {r.patientId?.name} • {new Date(r.reportDate || r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      !r.doctorComment ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {!r.doctorComment ? 'Urgent Review' : 'Reviewed'}
                    </div>
                    {/* QUICK VOICE ACCESS */}
                    <div onClick={(e) => e.stopPropagation()}>
                       <VoiceSummaryButton 
                          patientId={r.patientId?._id}
                          isIcon={true}
                          label="Trajectory"
                       />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Updates */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-black text-[#4F6F6F] uppercase tracking-[0.2em] px-2">Medical Bulletins</h3>
          <div className="bg-[#1F2933] rounded-[40px] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="pb-6 border-b border-white/10">
                <p className="text-[10px] font-black text-[#8FB9A8] uppercase tracking-widest mb-1">Update v2.4</p>
                <h4 className="text-lg font-black leading-tight">Grounded AI Summaries are now active.</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">Model 4.0 now processes biomarkers with 98% accuracy.</p>
              </div>
              <div className="pb-6 border-b border-white/10">
                <p className="text-[10px] font-black text-[#8FB9A8] uppercase tracking-widest mb-1">System Alert</p>
                <h4 className="text-lg font-black leading-tight">Patient data encryption synchronized.</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">End-to-end handshake complete for all active clinical vaults.</p>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2B59FF]/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
