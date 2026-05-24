import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface TrendValue {
  date: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
}

interface TrendChartProps {
  parameter: string;
  data: TrendValue[];
}

const TrendChart: React.FC<TrendChartProps> = ({ parameter, data }) => {
  if (!data || data.length < 2) return null;

  const chartData = data.map(d => ({
    val: d.value,
    displayDate: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    originalDate: d.date,
    unit: d.unit,
    isAbnormal: d.isAbnormal
  }));

  const gradientId = `grad-${parameter.replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
         <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-wide">{parameter}</p>
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--muted-foreground)]">{data.length} measurements</span>
            {data[data.length - 1].isAbnormal && (
               <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
         </div>
      </div>
      <div className="h-[180px] w-full bg-[#F8FAF9] rounded-[30px] p-6 border border-[var(--background)] group hover:border-[var(--secondary)]/30 transition-colors">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={chartData}>
             <defs>
               <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                 <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
             <XAxis 
                dataKey="displayDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#A0AEC0' }}
                dy={10}
             />
             <YAxis hide domain={['auto', 'auto']} />
             <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 900, color: 'var(--primary)' }}
                labelStyle={{ fontSize: '10px', fontWeight: 700, color: '#A0AEC0', marginBottom: '4px' }}
                formatter={(value: any, name: any, props: any) => [`${value} ${props.payload.unit}`, 'Value']}
             />
             <Area 
                type="monotone" 
                dataKey="val" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill={`url(#${gradientId})`} 
                animationDuration={1500}
             />
           </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
