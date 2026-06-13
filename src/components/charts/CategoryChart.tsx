import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { ComplianceIssue } from '../../types';
import { CATEGORY_LABELS } from '../../types';

interface Props {
  issues: ComplianceIssue[];
  height?: number;
}

export function CategoryChart({ issues, height = 200 }: Props) {
  const counts: Record<string, number> = {};
  issues.forEach((i) => {
    counts[i.category] = (counts[i.category] || 0) + 1;
  });
  const data = Object.entries(counts).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]?.label || key,
    value,
    color: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]?.color || '#64748b',
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400">
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(30,58,95,0.06)' }}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v} 项`, '问题数量']}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
