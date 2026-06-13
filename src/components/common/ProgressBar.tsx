import { cn } from '../../lib/utils';

interface Props {
  progress: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  variant?: 'default' | 'gradient';
}

export function ProgressBar({
  progress,
  label,
  size = 'md',
  showPercent = true,
  variant = 'gradient',
}: Props) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-slate-600">{label}</span>}
          {showPercent && <span className="text-slate-700 tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-100', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            variant === 'gradient'
              ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 shadow-sm'
              : 'bg-blue-600'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
