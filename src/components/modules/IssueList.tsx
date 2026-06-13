import { useState } from 'react';
import {
  AlertOctagon, ChevronDown, ChevronUp, Check, Ban, Lightbulb,
  FileWarning, Filter, MessageSquare, Clock, XCircle
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { SeverityBadge } from '../common/SeverityBadge';
import { CATEGORY_LABELS, SEVERITY_CONFIG } from '../../types';
import type { ComplianceIssue, IssueCategory, SeverityLevel } from '../../types';
import { cn } from '../../lib/utils';

export function IssueListModule() {
  const {
    currentSession, activeFilterSeverity, activeFilterCategory,
    expandedIssueId, setFilterSeverity, setFilterCategory, setExpandedIssue, updateIssue, setStep
  } = useComplianceStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const issues = currentSession.issues.filter((i) => {
    if (activeFilterSeverity !== 'all' && i.severity !== activeFilterSeverity) return false;
    if (activeFilterCategory !== 'all' && i.category !== activeFilterCategory) return false;
    return true;
  });

  const countsBySeverity = {
    all: currentSession.issues.length,
    critical: currentSession.issues.filter((i) => i.severity === 'critical').length,
    warning: currentSession.issues.filter((i) => i.severity === 'warning').length,
    info: currentSession.issues.filter((i) => i.severity === 'info').length,
  };

  const reviewLabel: Record<string, { label: string; icon: any; cls: string }> = {
    fixed: { label: '已整改', icon: Check, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    accepted: { label: '已接受', icon: Ban, cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    rejected: { label: '已驳回', icon: XCircle, cls: 'bg-rose-100 text-rose-700 border-rose-200' },
    pending: { label: '待处理', icon: Clock, cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const startEditNote = (issue: ComplianceIssue) => {
    setEditingNoteId(issue.id);
    setNoteDraft(issue.reviewNote || '');
  };

  const saveNote = (id: string) => {
    updateIssue(id, { reviewNote: noteDraft });
    setEditingNoteId(null);
    setNoteDraft('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <FileWarning className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">④ 问题清单</h3>
            <p className="text-xs text-slate-500 mt-0.5">按严重程度排序，逐项复查并记录整改结果</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 border border-rose-100 font-semibold">
            <AlertOctagon className="h-3 w-3" /> 严重 {countsBySeverity.critical}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 border border-amber-100 font-semibold">
            警告 {countsBySeverity.warning}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 border border-sky-100 font-semibold">
            提示 {countsBySeverity.info}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <div className="flex items-center gap-1 rounded-lg bg-slate-100/70 p-0.5">
            {(Object.keys(countsBySeverity) as Array<keyof typeof countsBySeverity>).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={cn(
                  'rounded-md px-3 py-1 text-[11px] font-semibold transition-all',
                  activeFilterSeverity === sev
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {sev === 'all' ? '全部' : SEVERITY_CONFIG[sev as SeverityLevel]?.label} {countsBySeverity[sev]}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <select
            value={activeFilterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">全部分类</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div className="ml-auto text-[11px] text-slate-400">
            共 {issues.length} 条问题
          </div>
        </div>

        <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Check className="h-12 w-12 opacity-30 text-emerald-400" />
              <div className="text-sm font-medium">当前筛选条件下无问题</div>
              <div className="text-xs">恭喜！所有项目通过合规检查，或尝试调整筛选条件</div>
            </div>
          ) : (
            issues.map((issue, idx) => {
              const expanded = expandedIssueId === issue.id;
              const sevCfg = SEVERITY_CONFIG[issue.severity];
              const catCfg = CATEGORY_LABELS[issue.category];
              const status = issue.reviewResult || 'pending';
              const statusCfg = reviewLabel[status];
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  key={issue.id}
                  className={cn(
                    'group rounded-xl border transition-all duration-200 overflow-hidden',
                    expanded ? `border-l-[3px] ring-1 ${sevCfg.border} ${sevCfg.ring}` : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
                    issue.reviewResult === 'fixed' && 'opacity-75'
                  )}
                  style={expanded ? { borderLeftColor: sevCfg.label === '严重' ? '#dc2626' : sevCfg.label === '警告' ? '#f59e0b' : '#0ea5e9' } : {}}
                >
                  <div
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                      expanded ? 'bg-slate-50/80' : 'bg-white hover:bg-slate-50/40'
                    )}
                    onClick={() => setExpandedIssue(expanded ? null : issue.id)}
                  >
                    <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 tabular-nums w-5 text-center">#{idx + 1}</span>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <SeverityBadge severity={issue.severity} size="sm" />
                            <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white', catCfg.color)}>
                              {catCfg.label}
                            </span>
                            <h4 className={cn('text-sm font-bold inline', issue.reviewResult === 'fixed' && 'line-through text-slate-400')}>
                              {issue.title}
                            </h4>
                          </div>
                          {issue.location && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                              <FileWarning className="h-3 w-3" />
                              <span>{issue.location}</span>
                            </div>
                          )}
                        </div>
                        <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold', statusCfg.cls)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 space-y-4">
                      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 leading-relaxed">
                        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">问题详情</div>
                        {issue.description}
                      </div>

                      <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white p-3 text-xs leading-relaxed">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          <Lightbulb className="h-3 w-3" /> 整改建议
                        </div>
                        <div className="text-emerald-900/85 whitespace-pre-line">{issue.suggestion}</div>
                      </div>

                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">复查结果：</span>
                          <button
                            onClick={() => updateIssue(issue.id, { reviewed: true, reviewResult: 'fixed' })}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                              status === 'fixed' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
                            )}
                          >
                            <Check className="h-3 w-3" /> 已整改
                          </button>
                          <button
                            onClick={() => updateIssue(issue.id, { reviewed: true, reviewResult: 'accepted' })}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                              status === 'accepted' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50'
                            )}
                          >
                            <Ban className="h-3 w-3" /> 接受风险
                          </button>
                          <button
                            onClick={() => updateIssue(issue.id, { reviewed: true, reviewResult: 'rejected' })}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                              status === 'rejected' ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50'
                            )}
                          >
                            <XCircle className="h-3 w-3" /> 误报
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                          <MessageSquare className="h-3 w-3" /> 复查备注
                        </div>
                        {editingNoteId === issue.id ? (
                          <div className="flex items-start gap-2">
                            <textarea
                              autoFocus
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="填写整改说明或风险接受理由…"
                              rows={2}
                              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => saveNote(issue.id)} className="rounded-md bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600">保存</button>
                              <button onClick={() => { setEditingNoteId(null); setNoteDraft(''); }} className="rounded-md bg-white border border-slate-200 px-3 py-1 text-[11px] text-slate-500 hover:bg-slate-50">取消</button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => { e.stopPropagation(); startEditNote(issue); }}
                            className={cn(
                              'rounded-md border px-3 py-2 text-xs cursor-text min-h-[34px]',
                              issue.reviewNote
                                ? 'border-slate-200 bg-white text-slate-700'
                                : 'border-dashed border-slate-300 bg-slate-50/60 text-slate-400 hover:border-emerald-300 hover:bg-white hover:text-slate-500'
                            )}
                          >
                            {issue.reviewNote || '点击添加复查备注…（可选）'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            💡 严重等级权重：严重(×8分) · 警告(×3分) · 提示(×1分) ，从 100 分中扣分得到合规得分
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              ← 上一步
            </button>
            {currentSession.status === 'completed' && (
              <button onClick={() => setStep(5)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                下一步：生成报告 →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
