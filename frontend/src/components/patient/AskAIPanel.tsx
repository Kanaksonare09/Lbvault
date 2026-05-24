'use client';

import React, { useState, useRef, useEffect } from 'react';
import api from '@/services/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AskAIPanelProps {
    reportId: string;
    reportName?: string;
    onClose: () => void;
}

const QUICK_QUESTIONS = [
    'What does this report mean for my health?',
    'Which values are outside normal range?',
    'What lifestyle changes should I make?',
    'Should I be worried about anything?',
    'What foods should I eat or avoid?',
];

export default function AskAIPanel({ reportId, reportName, onClose }: AskAIPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hello! I'm your HealthScan AI assistant. I've reviewed **${reportName || 'your report'}** and I'm ready to answer any questions you have about your results. What would you like to know? 🩺`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const question = (text || input).trim();
        if (!question || loading) return;

        const userMsg: Message = { role: 'user', content: question };
        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/ask', {
                reportId,
                question,
                // Send only the last 6 exchanges as history context
                history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ I\'m having trouble connecting to the AI right now. Please ensure Ollama is running and try again.'
            }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Simple markdown bold renderer (**text**)
    const renderContent = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh', minHeight: '60vh' }}>

                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-[#F1F5F9] bg-gradient-to-r from-[var(--primary)] to-[#6B8F8F]">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0">🩺</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-sm">Ask HealthScan AI</p>
                        <p className="text-white/70 text-[11px] font-medium truncate">{reportName || 'Report'} ·  powered by Llama 3.2</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 font-black mt-0.5 ${
                                msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)] text-[var(--primary)]'
                            }`}>
                                {msg.role === 'user' ? 'You' : '🤖'}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium ${
                                msg.role === 'user'
                                    ? 'bg-[var(--primary)] text-white rounded-tr-md'
                                    : 'bg-white border border-[var(--border)] text-[var(--foreground)] rounded-tl-md shadow-sm'
                            }`}>
                                {renderContent(msg.content)}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="flex gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-white border border-[var(--border)] flex items-center justify-center text-xs flex-shrink-0">🤖</div>
                            <div className="bg-white border border-[var(--border)] rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                                <div className="flex gap-1.5 items-center h-4">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick Questions (only show when first message) */}
                {messages.length === 1 && (
                    <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#F1F5F9]">
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider mb-2">Quick Questions</p>
                        <div className="flex gap-2 flex-wrap">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} onClick={() => sendMessage(q)}
                                    className="text-[11px] font-bold text-[var(--primary)] bg-white border border-[var(--border)] px-3 py-1.5 rounded-full hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-[#F1F5F9] bg-white">
                    <div className="flex items-end gap-2 bg-[#F8FAFC] rounded-2xl border border-[var(--border)] px-4 py-3 focus-within:border-[var(--primary)] transition-colors">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your report..."
                            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[#94A3B8] outline-none resize-none font-medium max-h-28"
                            style={{ lineHeight: '1.5' }}
                            disabled={loading}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            id="ask-ai-send-btn"
                            className="w-9 h-9 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--foreground)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] font-medium text-center mt-2">
                        AI answers are based on your report data. Always consult your doctor.
                    </p>
                </div>
            </div>
        </div>
    );
}
