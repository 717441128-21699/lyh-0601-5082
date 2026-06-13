import { Landmark, Heart, ShoppingBag, ShieldCheck, User, CreditCard, Activity, Globe, Check, Bookmark, Settings } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { INDUSTRY_RULE_LABELS, DATATYPE_RULE_LABELS } from '../../types';
import type { IndustryRule, DataTypeRule } from '../../types';
import { cn } from '../../lib/utils';

const iconMap: Record<string, any> = { Landmark, Heart, ShoppingBag, ShieldCheck, User, CreditCard, Activity, Globe };

export function RuleSelectorModule() {
  const {
    currentSession, templates,
    setIndustryRules, setDataTypeRules, loadTemplate, setStep
  } = useComplianceStore();

  const toggleIndustry = (r: IndustryRule) => {
    const has = currentSession.industryRules.includes(r);
    setIndustryRules(has ? currentSession.industryRules.filter((x) => x !== r) : [...currentSession.industryRules, r]);
  };
  const toggleDataType = (r: DataTypeRule) => {
    const has = currentSession.dataTypeRules.includes(r);
    setDataTypeRules(has ? currentSession.dataTypeRules.filter((x) => x !== r) : [...currentSession.dataTypeRules, r]);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Settings className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">② 规则选择</h3>
            <p className="text-xs text-slate-500 mt-0.5">选择适用的行业规则与数据类型规则，可套用已有模板</p>
          </div>
        </div>
        {templates.length > 0 && (
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-500" />
            <select
              onChange={(e) => e.target.value && loadTemplate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
              defaultValue=""
            >
              <option value="">📋 套用检查模板…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-1 h-3.5 bg-violet-400 rounded-full" />
              行业合规规则 <span className="text-slate-400 font-normal normal-case">（可多选）</span>
            </h4>
            <span className="text-[11px] text-slate-400">已选 {currentSession.industryRules.length} 项</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(INDUSTRY_RULE_LABELS) as IndustryRule[]).map((key) => {
              const info = INDUSTRY_RULE_LABELS[key];
              const Icon = iconMap[info.icon];
              const active = currentSession.industryRules.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleIndustry(key)}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200',
                    active
                      ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-indigo-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    active ? 'bg-violet-500 text-white shadow-violet-200 shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  )}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn('text-sm font-bold', active ? 'text-violet-900' : 'text-slate-800')}>{info.label}</span>
                      {active && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">{info.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-1 h-3.5 bg-sky-400 rounded-full" />
              数据类型规则 <span className="text-slate-400 font-normal normal-case">（可多选）</span>
            </h4>
            <span className="text-[11px] text-slate-400">已选 {currentSession.dataTypeRules.length} 项</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(DATATYPE_RULE_LABELS) as DataTypeRule[]).map((key) => {
              const info = DATATYPE_RULE_LABELS[key];
              const Icon = iconMap[info.icon];
              const active = currentSession.dataTypeRules.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleDataType(key)}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200',
                    active
                      ? 'border-sky-400 bg-gradient-to-br from-sky-50 to-cyan-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    active ? 'bg-sky-500 text-white shadow-sky-200 shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  )}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn('text-sm font-bold', active ? 'text-sky-900' : 'text-slate-800')}>{info.label}</span>
                      {active && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-2">{info.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            💡 已选 <strong className="text-violet-600">{currentSession.industryRules.length}</strong> 项行业规则 + <strong className="text-sky-600">{currentSession.dataTypeRules.length}</strong> 项数据类型规则
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(0)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              ← 上一步
            </button>
            <button
              disabled={currentSession.industryRules.length === 0 && currentSession.dataTypeRules.length === 0}
              onClick={() => setStep(3)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                currentSession.industryRules.length > 0 || currentSession.dataTypeRules.length > 0
                  ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm hover:shadow-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              下一步：执行扫描 →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
