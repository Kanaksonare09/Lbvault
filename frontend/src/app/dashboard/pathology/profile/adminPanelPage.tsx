'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';

type Tab = 'users' | 'reports' | 'roles';

const ROLE_COLORS: Record<string, string> = {
  patient: 'bg-blue-50 text-blue-700 border-blue-100',
  doctor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pathology: 'bg-purple-50 text-purple-700 border-purple-100',
  admin: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function AdminPanelPage() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stats, setStats] = useState({ totalUsers: 0, totalReports: 0, patients: 0, doctors: 0, labs: 0 });
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/reports'),
      ]);

      let userList: any[] = [];
      if (usersRes.status === 'fulfilled') {
        userList = usersRes.value.data || [];
        setUsers(userList);
        setStats(s => ({
          ...s,
          totalUsers: userList.length,
          patients: userList.filter((u: any) => u.role === 'patient').length,
          doctors: userList.filter((u: any) => u.role === 'doctor').length,
          labs: userList.filter((u: any) => u.role === 'pathology' || u.role === 'admin').length,
        }));
      }

      if (reportsRes.status === 'fulfilled') {
        const repList = reportsRes.value.data || [];
        setReports(repList);
        setStats(s => ({ ...s, totalReports: repList.length }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role. Check backend permissions.');
    } finally {
      setChangingRole(null);
    }
  };

  const filteredUsers = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredReports = reports.filter(r =>
    (r.reportName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (typeof r.patientId === 'object' ? r.patientId?.name : '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">System Administration</h1>
          <p className="text-[#6B7280] mt-1 font-medium">Manage users, roles, and monitor all reports across the platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'text-[#1F2933]' },
          { label: 'Total Reports', value: stats.totalReports, color: 'text-[#4F6F6F]' },
          { label: 'Patients', value: stats.patients, color: 'text-blue-600' },
          { label: 'Doctors', value: stats.doctors, color: 'text-emerald-600' },
          { label: 'Labs / Admins', value: stats.labs, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F6F7F5] p-1 rounded-2xl w-fit">
        {(['users', 'reports', 'roles'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(''); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${tab === t ? 'bg-white text-[#1F2933] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2933]'}`}
          >
            {t === 'users' ? '👥 Users' : t === 'reports' ? '📄 Reports' : '🔑 Roles'}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-medium outline-none focus:border-[#4F6F6F] transition-all"
          />
        </div>
        {tab === 'users' && (
          <div className="flex gap-2">
            {['all', 'patient', 'doctor', 'pathology'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-3 rounded-2xl text-xs font-black capitalize transition-all ${roleFilter === r ? 'bg-[#4F6F6F] text-white shadow-md' : 'bg-white border border-[#E2E8F0] text-[#6B7280] hover:border-[#4F6F6F]/30'}`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
        </div>
      ) : tab === 'users' ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F6F7F5] flex items-center justify-between">
            <h2 className="text-lg font-black text-[#1F2933]">All Users ({filteredUsers.length})</h2>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280] font-medium">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F7F5]">
                  <tr>
                    {['Name', 'Email', 'Role', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-black text-[#6B7280] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F7F5]">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-[#F6F7F5] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#8FB9A8]/20 rounded-full flex items-center justify-center font-black text-[#4F6F6F]">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-black text-[#1F2933]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280] font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${ROLE_COLORS[u.role] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={e => changeRole(u._id, e.target.value)}
                          disabled={changingRole === u._id}
                          className="text-xs font-bold text-[#4F6F6F] bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="pathology">Pathology</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : tab === 'reports' ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F6F7F5]">
            <h2 className="text-lg font-black text-[#1F2933]">All Reports ({filteredReports.length})</h2>
          </div>
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280] font-medium">No reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F7F5]">
                  <tr>
                    {['Report', 'Patient', 'Test Type', 'Uploaded', 'File'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-black text-[#6B7280] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F7F5]">
                  {filteredReports.map(r => (
                    <tr key={r._id} className="hover:bg-[#F6F7F5] transition-colors">
                      <td className="px-6 py-4 text-sm font-black text-[#1F2933]">{r.reportName}</td>
                      <td className="px-6 py-4 text-sm text-[#4F6F6F] font-bold">
                        {typeof r.patientId === 'object' ? r.patientId?.name : r.patientId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280] font-medium">{r.testType}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280] font-medium">
                        {r.uploadDate ? new Date(r.uploadDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {r.fileUrl && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${r.fileUrl}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs font-black text-[#4F6F6F] hover:underline"
                          >
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Roles Tab */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p className="text-sm font-bold text-amber-800">Role changes take effect immediately. Use care when modifying admin roles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { role: 'Patient', color: '#3B82F6', icon: '🧑‍⚕️', desc: 'Can upload reports, view AI summaries, share with doctors, listen to audio.', count: stats.patients },
              { role: 'Doctor', color: '#10B981', icon: '👨‍⚕️', desc: 'Can view shared patient reports, add clinical notes, view biomarker trends.', count: stats.doctors },
              { role: 'Pathology', color: '#8B5CF6', icon: '🧪', desc: 'Can upload reports for patients, register patients, view lab analytics.', count: stats.labs },
              { role: 'Admin', color: '#EF4444', icon: '🛠️', desc: 'Full system access — manage users, view all reports, change roles.', count: 1 },
            ].map(r => (
              <div key={r.role} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <h3 className="font-black text-[#1F2933]">{r.role}</h3>
                    <span className="text-xs font-black" style={{ color: r.color }}>{r.count} users</span>
                  </div>
                </div>
                <p className="text-sm text-[#6B7280] font-medium leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
