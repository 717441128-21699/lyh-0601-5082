import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 180 }: Props) {
  const getColor = (s: number) => {
    if (s >= 90) return '#10b981';
    if (s >= 75) return '#0ea5e9';
    if (s >= 60) return '#f59e0b';
    return '#dc2626';
  };
  const getLevel = (s: number) => {
    if (s >= 90) return '优秀';
    if (s >= 75) return '良好';
    if (s >= 60) return '及格';
    return '不合格';
  };
  const color = getColor(score);
  const level = getLevel(score);
  const pct = Math.max(0, Math.min(100, score));

  const data = [
    { name: '得分', value: pct },
    { name: '剩余', value: 100 - pct },
  ];

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.34}
            outerRadius={size * 0.46}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-extrabold tracking-tight" style={{ color }}>
          {pct}
          <span className="text-sm font-semibold text-slate-400 ml-0.5">/100</span>
        </div>
        <div
          className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ color, background: `${color}15` }}
        >
          {level}
        </div>
      </div>
    </div>
  );
}
