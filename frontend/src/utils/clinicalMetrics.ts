export interface ClinicalRange {
    min: number;
    max: number;
    unit: string;
    mildThreshold?: number; // Optional threshold where 'Safe' becomes 'Mild Concern'
}

export type SmartStatus = 'safe' | 'mild' | 'urgent';

export const CLINICAL_METRICS: Record<string, ClinicalRange> = {
    hemoglobin: { min: 13.5, max: 17.5, unit: "g/dL", mildThreshold: 12.5 },
    wbc: { min: 4000, max: 11000, unit: "/mcL", mildThreshold: 3500 },
    rbc: { min: 4.5, max: 5.9, unit: "mil/mcL", mildThreshold: 4.0 },
    platelets: { min: 150000, max: 450000, unit: "/mcL", mildThreshold: 130000 },
    hematocrit: { min: 40, max: 50, unit: "%", mildThreshold: 38 },
    glucose: { min: 70, max: 100, unit: "mg/dL", mildThreshold: 110 },
    cholesterol: { min: 125, max: 200, unit: "mg/dL", mildThreshold: 220 },
    sodium: { min: 136, max: 145, unit: "mEq/L" },
    potassium: { min: 3.5, max: 5.2, unit: "mEq/L" },
    chloride: { min: 96, max: 108, unit: "mEq/L" },
    calcium: { min: 8.5, max: 10.5, unit: "mg/dL" },
    creatinine: { min: 0.7, max: 1.4, unit: "mg/dL", mildThreshold: 1.6 },
    urea: { min: 4, max: 40, unit: "mg/dL", mildThreshold: 45 },
    'uric acid': { min: 2.7, max: 7.0, unit: "mg/dL", mildThreshold: 7.5 }
};

export const getMetricStatus = (key: string, value: number): SmartStatus => {
    const config = getMetricConfig(key);
    if (!config) return 'safe';

    const isHigh = value > config.max;
    const isLow = value < config.min;

    if (!isHigh && !isLow) return 'safe';

    // If there's a mild threshold, check if it's within that range
    if (config.mildThreshold) {
        if (isHigh && value <= config.mildThreshold) return 'mild';
        if (isLow && value >= config.mildThreshold) return 'mild';
    }

    return 'urgent';
};

export const getMetricConfig = (key: string) => {
    const k = key.toLowerCase();
    for (const [metric, config] of Object.entries(CLINICAL_METRICS)) {
        if (k.includes(metric)) return config;
    }
    return null;
};
