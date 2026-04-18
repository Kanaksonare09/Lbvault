'use client';

import React from 'react';

export default function HelpPage() {
  const faqs = [
    { q: "How do I share a report with a patient?", a: "Go to the Reports section, select the report, and click 'Share'. The patient will receive an encrypted link." },
    { q: "What do the AI confidence scores mean?", a: "The confidence score represents the model's certainty based on clinical data patterns. Higher scores indicate stronger correlation with standard biomarkers." },
    { q: "How do I add a clinical note?", a: "Open any patient report dashboard. You'll find a clinical note section at the bottom for persistent observations." },
  ];

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Help & Support</h1>
        <p className="text-[#6B7280] font-medium text-lg">Everything you need to master the LabVault Clinical Suite.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] p-8 border border-[#E2E8F0] shadow-sm space-y-4 hover:border-[#2B59FF]/30 transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B59FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
          </div>
          <h3 className="text-xl font-black text-[#1F2933]">User Documentation</h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">Detailed guides on clinical workflows, AI interpretation, and patient management.</p>
          <button className="text-[11px] font-black uppercase tracking-widest text-[#2B59FF] flex items-center gap-2">Read Guide <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-[#E2E8F0] shadow-sm space-y-4 hover:border-[#2B59FF]/30 transition-all">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3 className="text-xl font-black text-[#1F2933]">Security & Compliance</h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">Learn about our End-to-End Encryption and HIPAA compliance protocols.</p>
          <button className="text-[11px] font-black uppercase tracking-widest text-[#10B981] flex items-center gap-2">Security Portal <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-[#4F6F6F] uppercase tracking-widest">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-[#E2E8F0]">
              <p className="font-black text-[#1F2933] mb-2">{f.q}</p>
              <p className="text-sm text-[#6B7280] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#4F6F6F] rounded-[40px] p-12 text-white text-center space-y-6">
        <h2 className="text-3xl font-black tracking-tight">Need immediate technical assistance?</h2>
        <p className="text-white/70 max-w-xl mx-auto font-medium">Our clinical support team is available 24/7 for critical system support.</p>
        <button className="bg-white text-[#4F6F6F] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-100 transition-all">Contact Support</button>
      </div>
    </div>
  );
}
