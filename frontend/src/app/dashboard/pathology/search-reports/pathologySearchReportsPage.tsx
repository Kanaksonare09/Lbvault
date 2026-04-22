'use client';

export default function SearchReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Search Reports</h1>
                <p className="text-[var(--muted-foreground)] mt-1 text-lg font-medium">Quickly find specific lab results and archives.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[var(--border)] p-8 lg:p-12">
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Enter Report ID, Patient Name, or QR Code..."
                            className="w-full h-16 pl-16 pr-6 rounded-2xl border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none text-xl transition-all shadow-sm group-hover:shadow-md"
                        />
                        <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-3xl border border-dashed border-[var(--border)] bg-slate-50 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 flex items-center justify-center text-[var(--primary)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h.01" /><path d="M17 7h.01" /><path d="M7 17h.01" /><path d="M17 17h.01" /></svg>
                            </div>
                            <h4 className="font-bold text-[var(--foreground)]">Scan Report QR</h4>
                            <p className="text-sm text-[var(--muted-foreground)] mt-2 font-medium">Use the connected camera to automatically identify report records.</p>
                            <button className="mt-6 btn-secondary py-2 border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]">
                                Activate Camera
                            </button>
                        </div>

                        <div className="p-8 rounded-3xl border border-dashed border-[var(--border)] bg-slate-50 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 flex items-center justify-center text-[var(--primary)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.3-4.3" /><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><circle cx="11" cy="11" r="8" /></svg>
                            </div>
                            <h4 className="font-bold text-[var(--foreground)]">Advanced Filters</h4>
                            <p className="text-sm text-[var(--muted-foreground)] mt-2 font-medium">Refine search by date range, pathology branch, or test priority.</p>
                            <button className="mt-6 btn-secondary py-2 border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]">
                                Open Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
