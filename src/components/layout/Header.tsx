import { Link, useLocation } from 'react-router-dom';
import { Shield, Plus, History, Bookmark, Sparkles } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { cn } from '../../lib/utils';

export function Header() {
  const { currentSession, createNewSession, loadDemo } = useComplianceStore();
  const loc = useLocation();

  const navItems = [
    { to: '/', label: '合规工作台', icon: Shield },
    { to: '/templates', label: '检查模板', icon: Bookmark },
    { to: '/history', label: '历史记录', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5 text-white" strokeWidth={2.3} />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-800 leading-none">ComplianceCheck</div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-widest mt-0.5">DATA · COMPLIANCE · PRO</div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = (item.to === '/' && loc.pathname === '/') || (item.to !== '/' && loc.pathname.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loc.pathname === '/' && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 max-w-[360px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">当前项目</span>
              <span className="text-xs font-semibold text-slate-700 truncate">{currentSession.name}</span>
            </div>
          )}

          <button
            onClick={loadDemo}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            载入演示
          </button>
          <button
            onClick={createNewSession}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.3} />
            新建检查
          </button>
        </div>
      </div>
    </header>
  );
}
