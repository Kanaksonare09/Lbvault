'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types';
import api from '@/services/api';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sharedCount, setSharedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pts, reports] = await Promise.allSettled([
          patientService.getDoctorPatients(),
          api.get('/doctor/shared-reports'),
        ]);
        if (pts.status === 'fulfilled') setPatients(pts.value || []);
        if (reports.status === 'fulfilled') {
          const data = reports.value.data || [];
          setSharedCount(data.length);
          setRecentReports(data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingCount = recentReports.filter((r: any) => !r.doctorComment).length;
  const doctorLastName = user?.name?.split(' ').pop() ?? 'Doctor';

  const scheduleItems = [
    { time: '09:00', title: 'General Consult', sub: 'Room 402 • David K.', accent: 'bg-[#4A6FA5]' },
    { time: '10:30', title: 'Lab Review', sub: 'Remote • Sarah J.', accent: 'bg-[#A8C5DA]' },
    { time: '13:00', title: 'Surgical Planning', sub: 'Main OR • Team Alpha', accent: 'bg-[#F5C842]' },
  ];

  return (
    <div className="-m-8 flex-1 bg-[#F5F7FA] min-h-screen">
      {/* Hero Section — cream/warm gradient top area */}
      <div className="bg-gradient-to-br from-[#FFFDF5] to-[#F0F4FF] px-10 pt-10 pb-8">
        {/* Greeting + Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1a1a2e] leading-tight">
              {getGreeting()},{' '}
              <span className="text-[#B8860B]">Dr. {doctorLastName}</span>
            </h1>
            <p className="text-gray-500 mt-2 text-base max-w-lg leading-relaxed">
              Your sanctuary for patient care and clinical excellence. You have{' '}
              <span className="font-semibold text-gray-700">{pendingCount} reviews pending</span> for this afternoon.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 mt-1">
            <Link
              href="/dashboard/doctor/shared-reports"
              className="flex items-center gap-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Review Reports
            </Link>
            <button className="flex items-center gap-2.5 bg-[#F5C842] text-[#1a1a2e] font-semibold text-sm px-5 py-3 rounded-2xl shadow-sm hover:bg-[#f0c030] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M16 11h6"/>
              </svg>
              Add Patient
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Patients */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Patients</p>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '—' : patients.length.toLocaleString()}</p>
          </div>

          {/* Shared Reports */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3799" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">New</span>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Shared Reports</p>
            <p className="text-3xl font-extrabold text-gray-800">{loading ? '—' : sharedCount}</p>
          </div>

          {/* Pending Reviews — highlighted yellow */}
          <div className="bg-[#FFFBDC] rounded-2xl p-6 shadow-sm border border-yellow-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="11" y2="15"/>
                </svg>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">Urgent</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Pending Reviews</p>
            <p className="text-3xl font-extrabold text-gray-800">
              {loading ? '—' : String(pendingCount).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Patient Reports — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Recent Patient Reports</h2>
              <Link href="/dashboard/doctor/shared-reports" className="text-sm font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="py-20 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : recentReports.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-gray-400 font-medium text-sm">No shared reports yet.</p>
                </div>
              ) : recentReports.map((report: any) => {
                const patientName = report.patientId?.name || 'Anonymous Patient';
                const initial = patientName.charAt(0).toUpperCase();
                const hasComment = !!report.doctorComment;
                const date = new Date(report.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <div key={report._id} className="flex items-center gap-4 px-7 py-4 hover:bg-gray-50 transition-all group">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600 text-base shrink-0">
                      {initial}
                    </div>

                    {/* Name & Report */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{patientName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{report.reportName || report.testType}</p>
                    </div>

                    {/* Date + Status */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs text-gray-500 font-medium">{date}</p>
                      {hasComment ? (
                        <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Ready</span>
                      ) : report.status === 'processing' ? (
                        <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Processing</span>
                      ) : (
                        <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Urgent</span>
                      )}
                    </div>

                    {/* Arrow */}
                    <Link
                      href="/dashboard/doctor/shared-reports"
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all ml-2 shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-800 mb-5">Today's Schedule</h3>
              <div className="space-y-3">
                {scheduleItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 w-10 shrink-0">{item.time}</span>
                    <div className={`flex-1 ${item.accent === 'bg-[#F5C842]' ? 'bg-[#FFFBDC]' : item.accent === 'bg-[#A8C5DA]' ? 'bg-[#F0F6FF]' : 'bg-[#F0F4FF]'} rounded-xl px-4 py-3 relative overflow-hidden`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.accent} rounded-l-xl`} />
                      <p className="text-sm font-semibold text-gray-700 pl-1">{item.title}</p>
                      <p className="text-xs text-gray-400 pl-1 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Insights */}
            <div className="bg-[#1E3799] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-2">Practice Insights</h3>
                <p className="text-sm text-blue-200 leading-relaxed mb-5">
                  You've reached 98% patient satisfaction this month. Keep it up!
                </p>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-5">
                  <div className="h-full bg-[#F5C842] w-[98%] rounded-full" />
                </div>
                <button className="flex items-center gap-2 text-sm font-semibold text-white hover:text-[#F5C842] transition-colors">
                  Full Analytics
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </button>
              </div>
              {/* Decorative star */}
              <div className="absolute bottom-4 right-4 opacity-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
