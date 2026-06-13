import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  sublabel?: string;
}

const accentMap = {
  default: 'from-slate-50 to-white border-slate-200 text-slate-800',
  success: 'from-emerald-50 to-white border-emerald-200 text-emerald-700',
  warning: 'from-amber-50 to-white border-amber-200 text-amber-700',
  danger: 'from-rose-50 to-white border-rose-200 text-rose-700',
  info: 'from-sky-50 to-white border-sky-200 text-sky-700',
};

const iconAccent = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-rose-100 text-rose-600',
  info: 'bg-sky-100 text-sky-600',
};

export function StatCard({ label, value, icon: Icon, accent = 'default', sublabel }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
        accentMap[accent]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-500 truncate">{label}</div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
          {sublabel && <div className="mt-1 text-xs text-slate-400">{sublabel}</div>}
        </div>
        {Icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconAccent[accent])}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-current opacity-[0.04]" />
    </div>
  );
}
