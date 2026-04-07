'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pathologyService } from '@/services/pathologyService';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend 
} from 'recharts';

const CHART_COLORS = ['#4F6F6F', '#8FB9A8', '#C0D6DF', '#1F2933', '#6B7280'];

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await pathologyService.getAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const stats = [
        {
            name: 'Reports Today',
            value: analytics?.uploadedToday || '0',
            change: analytics?.reportTrend || '+12%',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            )
        },
        {
            name: 'Total Patients',
            value: analytics?.totalPatients || '0',
            change: analytics?.patientTrend || '+5%',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            )
        },
        {
            name: 'Total Reports',
            value: analytics?.totalReports || '0',
            change: 'Overall',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
            )
        },
        {
            name: 'System Status',
            value: analytics?.systemStatus || 'Active',
            change: '100% Uptime',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            )
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F6F7F5]">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#4F6F6F] font-bold">Synchronizing Lab Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-[#1F2933]">Pathology Command Center</h1>
                <p className="text-[#6B7280] mt-1 text-lg font-medium">Real-time diagnostic analytics and provider management.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-[#F6F7F5] text-[#4F6F6F] rounded-2xl border border-[#E2E8F0]">
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-tighter">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-[#6B7280] text-xs font-black uppercase tracking-widest">{stat.name}</h3>
                        <p className="text-3xl font-black text-[#1F2933] mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Area Chart: Volume Trend */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-[#1F2933]">Activity Volume</h2>
                            <p className="text-sm text-[#6B7280] font-medium">Daily report uploads for the last 7 days</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <div className="w-3 h-3 rounded-full bg-[#4F6F6F]"></div>
                             <span className="text-xs font-bold text-[#1F2933]">Uploads</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.volumeHistory || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F6F6F" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#4F6F6F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}}
                                    dy={10}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', {weekday: 'short'})}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1F2933', color: '#fff'}}
                                    itemStyle={{color: '#8FB9A8', fontWeight: 900}}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4F6F6F" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Diagnostics Breakdown */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] flex flex-col">
                    <h2 className="text-xl font-black text-[#1F2933] mb-1">Diagnostic Mix</h2>
                    <p className="text-sm text-[#6B7280] font-medium mb-8">Test category distribution</p>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.categoryDistribution || [{name: 'General', value: 1}]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {(analytics?.categoryDistribution || [{name: 'General', value: 1}]).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 900}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                    <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
                        <h2 className="text-xl font-black text-[#1F2933]">Live Upload Feed</h2>
                        <Link href="/dashboard/pathology/reports" className="text-xs font-black text-[#4F6F6F] uppercase tracking-widest hover:bg-[#F6F7F5] px-4 py-2 rounded-xl transition-all">View All Vaults</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#F6F7F5]">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-wider">Patient Identity</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-wider">Analysis Type</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-[#6B7280] uppercase tracking-wider">Record</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {analytics?.recentUploads?.map((report: any) => (
                                    <tr key={report.reportId} className="hover:bg-[#F6F7F5] transition-colors group">
                                        <td className="px-6 py-4">
                                             <p className="text-sm font-black text-[#1F2933]">{report.patientName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black px-2 py-1 rounded bg-[#E2E8F0] text-[#4F6F6F] uppercase">
                                                {report.testType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[#6B7280] font-bold">
                                            {new Date(report.uploadDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-[#4F6F6F] hover:text-[#1F2933] font-black text-xs"
                                            >
                                                OPEN VAULT
                                                <svg className="ml-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar Widget: Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-[#1F2933] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-xl font-black mb-2 relative z-10 text-[#8FB9A8]">Ingest Record</h3>
                        <p className="text-[#6B7280] text-xs mb-8 relative z-10 font-bold leading-relaxed">Securely upload and link new patient lab results to the digital medical vault.</p>
                        <Link href="/dashboard/pathology/upload-report" className="inline-flex items-center justify-center w-full bg-[#4F6F6F] text-white font-black py-4 rounded-2xl hover:bg-[#8FB9A8] hover:text-[#1F2933] transition-all shadow-lg active:scale-95 group relative z-10 uppercase text-xs tracking-widest">
                            New Upload
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E2E8F0]">
                        <h3 className="text-sm font-black text-[#1F2933] uppercase tracking-widest mb-6">Shortcuts</h3>
                        <div className="space-y-1">
                            <Link href="/dashboard/pathology/patients" className="flex items-center p-4 rounded-2xl hover:bg-[#F6F7F5] transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-[#F6F7F5] text-[#4F6F6F] flex items-center justify-center mr-4 group-hover:bg-[#4F6F6F] group-hover:text-white transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                </div>
                                <span className="text-xs font-black text-[#1F2933] uppercase tracking-tight">Patient Directory</span>
                            </Link>
                            <Link href="/dashboard/pathology/doctors" className="flex items-center p-4 rounded-2xl hover:bg-[#F6F7F5] transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-[#F6F7F5] text-[#4F6F6F] flex items-center justify-center mr-4 group-hover:bg-[#4F6F6F] group-hover:text-white transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 10v6" /><path d="M14 2h-1a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h1" /></svg>
                                </div>
                                <span className="text-xs font-black text-[#1F2933] uppercase tracking-tight">Doctor Directory</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
