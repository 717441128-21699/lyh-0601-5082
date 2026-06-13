import type { SeverityLevel } from '../../types';
import { SEVERITY_CONFIG } from '../../types';

interface Props {
  severity: SeverityLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function SeverityBadge({ severity, size = 'md', showLabel = true }: Props) {
  const cfg = SEVERITY_CONFIG[severity];
  const dot = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold text-white shadow-sm ring-1 ring-inset ${cfg.bg} ${cfg.ring} ${padding}`}
    >
      <span className={`rounded-full ${dot} bg-white/80`} />
      {showLabel && cfg.label}
    </span>
  );
}
