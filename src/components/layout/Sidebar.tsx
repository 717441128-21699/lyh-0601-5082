import { FolderUp, Settings, ScanLine, FileWarning, FileOutput, Check } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { cn } from '../../lib/utils';

interface Props {
  compact?: boolean;
}

const STEPS = [
  { id: 0, title: '文件导入', subtitle: '导入说明文档', icon: FolderUp, color: 'from-sky-400 to-blue-500' },
  { id: 1, title: '规则选择', subtitle: '配置检查规则', icon: Settings, color: 'from-violet-400 to-indigo-500' },
  { id: 2, title: '字段扫描', subtitle: '执行合规检测', icon: ScanLine, color: 'from-emerald-400 to-teal-500' },
  { id: 3, title: '问题清单', subtitle: '复查整改项', icon: FileWarning, color: 'from-amber-400 to-orange-500' },
  { id: 4, title: '报告生成', subtitle: '导出合规报告', icon: FileOutput, color: 'from-indigo-400 to-purple-500' },
];

export function Sidebar({ compact }: Props) {
  const { currentStep, setStep } = useComplianceStore();

  if (compact) {
    return (
      <aside className="hidden xl:block w-16 shrink-0 py-6">
        <div className="flex flex-col items-center gap-5">
          {STEPS.map((step) => {
            const active = currentStep === step.id;
            const done = currentStep > step.id;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setStep(step.id)}
                className={cn(
                  'group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all',
                  active
                    ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-105`
                    : done
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                )}
                title={step.title}
              >
                {done ? <Check className="h-4.5 w-4.5" strokeWidth={2.5} /> : <Icon className="h-4.5 w-4.5" strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0 py-6 pr-4">
      <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-sm p-4 shadow-sm space-y-2">
        <div className="mb-3 px-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">检查流程</div>
          <div className="mt-1 text-xs text-slate-500">点击任意步骤跳转</div>
        </div>

        {STEPS.map((step, idx) => {
          const active = currentStep === step.id;
          const done = currentStep > step.id;
          const Icon = step.icon;
          const isLast = idx === STEPS.length - 1;
          return (
            <div key={step.id} className="relative">
              <button
                onClick={() => setStep(step.id)}
                className={cn(
                  'w-full group relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all',
                  active
                    ? `bg-gradient-to-r ${step.color} text-white shadow-lg shadow-slate-200`
                    : done
                      ? 'bg-emerald-50/60 text-emerald-700 hover:bg-emerald-50'
                      : 'hover:bg-slate-50 text-slate-500'
                )}
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all',
                  active
                    ? 'bg-white/20 backdrop-blur-sm text-white'
                    : done
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                )}>
                  {done && !active ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" strokeWidth={2} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'text-[13px] font-bold leading-tight flex items-center gap-1.5',
                    active ? 'text-white' : done ? 'text-emerald-800' : 'text-slate-700'
                  )}>
                    <span className={cn(
                      'text-[10px] opacity-60 font-semibold',
                      active && 'opacity-80'
                    )}>0{idx + 1}</span>
                    {step.title}
                  </div>
                  <div className={cn(
                    'mt-0.5 text-[11px]',
                    active ? 'text-white/80' : done ? 'text-emerald-600/80' : 'text-slate-400'
                  )}>
                    {step.subtitle}
                  </div>
                </div>
              </button>
              {!isLast && (
                <div className="absolute left-7 top-full h-3 w-px -translate-y-0.5 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-violet-50/50 to-purple-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">合规小贴士</div>
        <p className="text-xs text-indigo-900/70 leading-relaxed">
          {currentStep <= 1 && '字段说明使用 Markdown 表格形式可提升识别准确率至 95% 以上'}
          {currentStep === 2 && '个人信息字段包括手机号、身份证、邮箱、住址等 14 类敏感信息'}
          {currentStep === 3 && '严重级问题每项扣 8 分，警告扣 3 分，提示扣 1 分，60 分及格'}
          {currentStep >= 4 && '所有检查记录会自动保存在本地浏览器，可在历史记录中查看'}
        </p>
      </div>
    </aside>
  );
}
