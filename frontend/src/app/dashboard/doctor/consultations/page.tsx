'use client';

import React from 'react';

const CLR = {
  primary: '#2B59FF',
  sage: '#4F6F6F',
  bg: '#F6F7F5',
  card: '#FFFFFF',
  border: '#E2E8F0',
  dark: '#1F2933',
  muted: '#6B7280',
};

export default function ConsultationsPage() {
  const consultations = [
    { id: 1, time: '09:00 AM', patient: 'Alice Johnson', type: 'Follow-up', status: 'Upcoming' },
    { id: 2, time: '10:30 AM', patient: 'Robert Smith', type: 'Initial Consultation', status: 'Urgent' },
    { id: 3, time: '01:00 PM', patient: 'Elena Rodriguez', type: 'Lab Review', status: 'Confirmed' },
    { id: 4, time: '03:15 PM', patient: 'David Chen', type: 'General Checkup', status: 'Upcoming' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Consultations</h1>
        <p className="text-[#6B7280] font-medium">Manage your daily clinical schedule and patient interactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#F6F7F5] flex justify-between items-center">
              <h3 className="text-sm font-black text-[#4F6F6F] uppercase tracking-widest">Today's Schedule</h3>
              <span className="text-xs font-bold text-[#2B59FF] bg-blue-50 px-3 py-1 rounded-full">October 18, 2026</span>
            </div>
            <div className="divide-y divide-[#F6F7F5]">
              {consultations.map((c) => (
                <div key={c.id} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="text-center w-20">
                      <p className="text-xs font-black text-[#1F2933]">{c.time}</p>
                    </div>
                    <div>
                      <p className="font-black text-[#1F2933]">{c.patient}</p>
                      <p className="text-xs text-[#6B7280] font-medium">{c.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      c.status === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {c.status}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#1F2933] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-lg font-black mb-2">Next appointment in</h4>
              <p className="text-5xl font-black text-[#8FB9A8] mb-4">42m</p>
              <p className="text-sm text-gray-400 font-medium">With Robert Smith for Initial Consultation</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#2B59FF]/20 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-[32px] border border-[#E2E8F0] p-8 shadow-sm">
            <h4 className="text-xs font-black text-[#4F6F6F] uppercase tracking-widest mb-6">Calendar Insights</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#F6F7F5] rounded-2xl">
                <span className="text-sm font-bold text-[#1F2933]">Avg. Session</span>
                <span className="text-sm font-black text-[#2B59FF]">24 min</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#F6F7F5] rounded-2xl">
                <span className="text-sm font-bold text-[#1F2933]">Total Hours</span>
                <span className="text-sm font-black text-[#2B59FF]">6.5 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
