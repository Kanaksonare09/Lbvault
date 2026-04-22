'use client';

import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export type ChartType = 'area' | 'line' | 'bar';

interface DataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

interface ReferenceRange {
  min: number;
  max: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  type?: ChartType;
  height?: number;
  unit?: string;
  referenceRange?: ReferenceRange;
  showGrid?: boolean;
  gradient?: boolean;
  title?: string;
  subtitle?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--foreground)] text-white rounded-2xl px-4 py-3 shadow-2xl text-xs">
        <p className="font-black text-[var(--secondary)] mb-1">{label}</p>
        <p className="font-black text-lg">
          {payload[0]?.value}
          {unit && <span className="text-xs ml-1 opacity-70">{unit}</span>}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart({
  data,
  dataKey = 'value',
  color = 'var(--primary)',
  type = 'area',
  height = 200,
  unit = '',
  referenceRange,
  showGrid = true,
  gradient = true,
  title,
  subtitle,
}: AnalyticsChartProps) {
  const gradientId = `grad-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 7)}`;

  const axisStyle = { fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 700 };
  const gridStyle = { stroke: '#F0F2F4', strokeDasharray: '4 4' };

  const commonProps = {
    data,
    margin: { top: 8, right: 8, bottom: 0, left: -10 },
  };

  const xAxis = (
    <XAxis
      dataKey="label"
      tick={axisStyle}
      axisLine={false}
      tickLine={false}
      interval="preserveStartEnd"
    />
  );
  const yAxis = (
    <YAxis
      tick={axisStyle}
      axisLine={false}
      tickLine={false}
      tickFormatter={(v) => `${v}${unit}`}
      width={48}
    />
  );
  const tooltip = <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4' }} />;
  const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} vertical={false} /> : null;

  const refLines = referenceRange ? (
    <>
      <ReferenceLine y={referenceRange.min} stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Min', fill: 'var(--primary)', fontSize: 10, fontWeight: 700 }} />
      <ReferenceLine y={referenceRange.max} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Max', fill: '#EF4444', fontSize: 10, fontWeight: 700 }} />
    </>
  ) : null;

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart {...commonProps}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {refLines}
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      );
    }

    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {refLines}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      );
    }

    // default: area
    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={gradient ? 0.25 : 0} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {refLines}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    );
  };

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <p className="text-sm font-black text-[var(--foreground)]">{title}</p>}
          {subtitle && <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
