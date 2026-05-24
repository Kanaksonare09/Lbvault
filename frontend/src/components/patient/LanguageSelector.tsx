'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-[var(--foreground)]">{t('selectLanguage')}:</label>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-white border border-[var(--border)] rounded-xl px-3 py-1.5 text-sm font-bold text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
            >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="es">Español</option>
            </select>
</div>
    );
}
