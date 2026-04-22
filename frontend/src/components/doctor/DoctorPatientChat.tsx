'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DoctorPatientChatProps {
  patientId: string;
  patientName: string;
  reportCount?: number;
}

const QUICK_QUESTIONS = [
  'Give me an overview of this patient\'s health history',
  'What are the most concerning abnormalities?',
  'Are there any worsening trends I should watch?',
  'What follow-up tests would you recommend?',
  'Summarize the latest report findings',
];

export default function DoctorPatientChat({ patientId, patientName, reportCount = 0 }: DoctorPatientChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextInfo, setContextInfo] = useState<{ reportCount: number; abnormalCount: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Auto-trigger overview on first open
      sendMessage('Give me a clinical overview of this patient\'s entire health history', true);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const sendMessage = async (text: string, isAuto = false) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    const newMessages: Message[] = isAuto
      ? messages
      : [...messages, { role: 'user', content: userMessage }];

    if (!isAuto) {
      setMessages(newMessages);
      setInput('');
    }

    setLoading(true);

    try {
      const res = await api.post(`/doctor/patient/${patientId}/chat`, {
        message: userMessage,
        history: newMessages.slice(-8),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.answer,
      };

      setMessages(prev => [
        ...(isAuto ? prev : prev),
        ...(isAuto ? [{ role: 'assistant' as const, content: res.data.answer }] : [assistantMessage]),
      ]);

      if (res.data.contextUsed) {
        setContextInfo(res.data.contextUsed);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Clinical AI is currently unavailable. Please try again.';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="doctor-chat-fab"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#2B4BC4] text-white shadow-xl hover:bg-[#2240a8] transition-all hover:scale-105 flex items-center justify-center group"
        title="Ask Clinical AI about this patient"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {/* Pulse ring */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#F5C842] rounded-full border-2 border-white" />
      </button>

      {/* Chat Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window */}
          <div className="relative w-full max-w-[460px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-[#2B4BC4] text-white shrink-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] leading-tight">Clinical AI</p>
                <p className="text-[11px] text-blue-200 truncate">
                  {patientName}
                  {contextInfo ? ` · ${contextInfo.reportCount} reports · ${contextInfo.abnormalCount} abnormal findings` : ` · ${reportCount} report${reportCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F8F9FD]">

              {/* Quick questions (show only if no messages yet) */}
              {messages.length === 0 && !loading && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Clinical Quick Questions</p>
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-100 text-[12px] text-gray-700 hover:border-[#2B4BC4] hover:text-[#2B4BC4] hover:bg-[var(--accent-soft)] transition-all shadow-sm font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#2B4BC4] flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#2B4BC4] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}>
                    {/* Render assistant text with basic bold support */}
                    {msg.role === 'assistant' ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>'),
                        }}
                      />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#2B4BC4] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
                    </svg>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm border border-gray-100 px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#2B4BC4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#2B4BC4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#2B4BC4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick action chips (after first response) */}
            {messages.length > 0 && !loading && (
              <div className="px-4 py-2 bg-[#F8F9FD] border-t border-gray-100 flex gap-2 overflow-x-auto shrink-0">
                {['Key abnormalities', 'Worsening trends', 'Recommendations'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 hover:border-[#2B4BC4] hover:text-[#2B4BC4] transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0"
            >
              <input
                ref={inputRef}
                id="doctor-chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about this patient..."
                disabled={loading}
                className="flex-1 bg-[#F8F9FD] text-gray-800 text-[13px] rounded-xl px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-[#2B4BC4] focus:ring-1 focus:ring-[#2B4BC4]/20 disabled:opacity-50 transition-colors placeholder-gray-400"
              />
              <button
                type="submit"
                id="doctor-chat-send"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-[#2B4BC4] text-white flex items-center justify-center hover:bg-[#2240a8] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
