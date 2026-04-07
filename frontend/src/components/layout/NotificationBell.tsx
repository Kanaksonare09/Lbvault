'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import Link from 'next/link';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Simple polling every 60 seconds
        const timer = setInterval(fetchNotifications, 60000);
        return () => clearInterval(timer);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkRead = async (id: string | 'all') => {
        try {
            await notificationService.markAsRead(id);
            if (id === 'all') {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } else {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#6B7280] hover:text-[#4F6F6F] transition-colors relative p-2 rounded-full hover:bg-[#F6F7F5]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-[#E2E8F0] bg-[#F6F7F5]/50 flex justify-between items-center">
                            <h3 className="font-black text-[#1F2933] text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => handleMarkRead('all')}
                                    className="text-[10px] font-black text-[#4F6F6F] border-b border-[#4F6F6F] leading-tight"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-6 h-6 border-2 border-[#8FB9A8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-xs text-[#6B7280]">Fetching updates...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif._id} 
                                        onClick={() => handleMarkRead(notif._id)}
                                        className={`p-4 border-b border-[#E2E8F0] hover:bg-[#F6F7F5] transition-colors cursor-pointer group relative ${!notif.isRead ? 'bg-[#F6F7F5]/30' : ''}`}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-[#4F6F6F] rounded-full"></div>
                                        )}
                                        <Link href={notif.link || '#'} className="block">
                                            <p className={`text-sm font-bold leading-tight ${!notif.isRead ? 'text-[#1F2933]' : 'text-[#6B7280]'} group-hover:text-[#4F6F6F]`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-[#6B7280] mt-1.5 font-bold uppercase tracking-wider">
                                                {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-[#F6F7F5] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                                    </div>
                                    <p className="text-xs font-bold text-[#6B7280]">No new notifications</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 text-center border-t border-[#E2E8F0]">
                            <button className="text-xs font-bold text-[#4F6F6F] hover:underline">View All Notifications</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
