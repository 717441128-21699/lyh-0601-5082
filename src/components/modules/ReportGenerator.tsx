import { useRef, useState } from 'react';
import {
  FileText, Download, Printer, BookmarkPlus, Sparkles,
  CheckCircle, XCircle, AlertCircle, FileOutput, PanelBottomOpen
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { ScoreGauge } from '../charts/ScoreGauge';
import { CategoryChart } from '../charts/CategoryChart';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatCard } from '../common/StatCard';
import { CATEGORY_LABELS, SEVERITY_CONFIG } from '../../types';
import { cn } from '../../lib/utils';
import { exportHTMLReport, exportPDFReport, printReport, buildHTMLReport } from '../../utils/reportExporter';

export function ReportGeneratorModule() {
  const { currentSession, saveCurrentAsTemplate, setStep } = useComplianceStore();
  const [showTplModal, setShowTplModal] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const criticalCount = currentSession.issues.filter((i) => i.severity === 'critical').length;
  const warningCount = currentSession.issues.filter((i) => i.severity === 'warning').length;
  const infoCount = currentSession.issues.filter((i) => i.severity === 'info').length;
  const piiFields = currentSession.fields.filter((f) => f.isPersonalInfo).length;
  const fixedCount = currentSession.issues.filter((i) => i.reviewResult === 'fixed').length;
  const pendingCount = currentSession.issues.filter((i) => !i.reviewResult).length;

  const getGrade = (score: number) => {
    if (score >= 90) return { label: '优秀', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: '合规状态良好，可进入发布流程' };
    if (score >= 75) return { label: '良好', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', desc: '存在少量待改进项，建议处理警告级问题后发布' };
    if (score >= 60) return { label: '及格', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', desc: '需整改警告级问题，建议法务复核后发布' };
    return { label: '不合格', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', desc: '存在严重合规风险，必须完成整改后方可发布' };
  };
  const grade = getGrade(currentSession.score);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveTemplate = () => {
    if (!tplName.trim()) return;
    saveCurrentAsTemplate(tplName.trim(), tplDesc.trim());
    setShowTplModal(false);
    setTplName('');
    setTplDesc('');
    showToast('✅ 检查模板已保存到模板库');
  };

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleString('zh-CN') : '-';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-xl animate-[slideIn_0.3s_ease-out]">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <FileOutput className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">⑤ 报告生成</h3>
            <p className="text-xs text-slate-500 mt-0.5">合规检查完成，生成报告并导出，支持保存常用检查模板</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTplModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            保存为模板
          </button>
          <button
            onClick={() => printReport(currentSession)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            打印
          </button>
          <button
            onClick={() => { exportHTMLReport(currentSession); showToast('📄 HTML 报告已开始下载'); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            导出 HTML
          </button>
          <button
            onClick={() => { exportPDFReport(currentSession, reportRef.current); showToast('📑 PDF 报告生成中…'); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 text-xs font-semibold text-white hover:shadow-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            导出 PDF 报告
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div ref={reportRef} className="space-y-5">
          <div className={cn('rounded-2xl border p-5 flex items-center gap-6', grade.bg, grade.border)}>
            <ScoreGauge score={currentSession.score} size={170} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight truncate">{currentSession.name}</h2>
                <span className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold', grade.bg, grade.color, grade.border)}>
                  {grade.label === '优秀' && <CheckCircle className="h-3.5 w-3.5" />}
                  {grade.label === '不合格' && <XCircle className="h-3.5 w-3.5" />}
                  {(grade.label === '良好' || grade.label === '及格') && <AlertCircle className="h-3.5 w-3.5" />}
                  {grade.label}
                </span>
              </div>
              <p className={cn('text-sm font-medium mb-4', grade.color)}>{grade.desc}</p>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-0.5">源文件</div>
                  <div className="font-semibold text-slate-700 truncate">{currentSession.fileName || '（未导入）'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">检查完成时间</div>
                  <div className="font-semibold text-slate-700">{formatDate(currentSession.completedAt)}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">适用行业</div>
                  <div className="font-semibold text-slate-700">{currentSession.industryRules.join('、') || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">数据类型</div>
                  <div className="font-semibold text-slate-700">{currentSession.dataTypeRules.join('、') || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3">
            <StatCard label="识别字段" value={currentSession.fields.length} accent="info" />
            <StatCard label="敏感字段" value={piiFields} accent="danger" />
            <StatCard label="问题总数" value={currentSession.issues.length} accent="warning" />
            <StatCard label="已整改" value={fixedCount} accent="success" icon={CheckCircle} />
            <StatCard label="待处理" value={pendingCount} accent="warning" />
            <StatCard label="复查进度" value={currentSession.issues.length ? `${Math.round((fixedCount / currentSession.issues.length) * 100)}%` : '—'} accent="default" icon={Sparkles} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="inline-block w-1 h-3 bg-violet-400 rounded-full" />
                问题严重程度分布
              </h4>
              <div className="space-y-3">
                {([
                  { k: 'critical', n: '严重', v: criticalCount, c: '#dc2626' },
                  { k: 'warning', n: '警告', v: warningCount, c: '#f59e0b' },
                  { k: 'info', n: '提示', v: infoCount, c: '#0ea5e9' },
                ] as const).map((row) => {
                  const pct = currentSession.issues.length ? (row.v / currentSession.issues.length) * 100 : 0;
                  return (
                    <div key={row.k}>
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <SeverityBadge severity={row.k} size="sm" />
                        <span className="font-semibold tabular-nums text-slate-600">{row.v} 项 · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: row.c }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="inline-block w-1 h-3 bg-sky-400 rounded-full" />
                问题分类统计
              </h4>
              <CategoryChart issues={currentSession.issues} height={170} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50/60">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span className="inline-block w-1 h-3 bg-amber-400 rounded-full" />
                Top 问题清单（按严重程度，前 6 条）
              </h4>
              <PanelBottomOpen className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="max-h-80 overflow-auto">
              {currentSession.issues.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">🎉 未发现任何合规问题</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500 w-16">级别</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500 w-24">分类</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500">问题</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-500 w-24">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSession.issues.slice(0, 6).map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2"><SeverityBadge severity={issue.severity} size="sm" showLabel={false} /></td>
                        <td className="px-4 py-2">
                          <span className={cn('rounded px-2 py-0.5 text-[10px] font-semibold text-white', CATEGORY_LABELS[issue.category].color)}>
                            {CATEGORY_LABELS[issue.category].label}
                          </span>
                        </td>
                        <td className={cn('px-4 py-2 font-medium truncate max-w-sm', issue.reviewResult === 'fixed' ? 'line-through text-slate-400' : 'text-slate-700')}>{issue.title}</td>
                        <td className="px-4 py-2">
                          {issue.reviewResult === 'fixed' && <span className="text-emerald-600 font-semibold text-[11px]">✓ 已整改</span>}
                          {issue.reviewResult === 'accepted' && <span className="text-amber-600 font-semibold text-[11px]">⚠ 已接受</span>}
                          {issue.reviewResult === 'rejected' && <span className="text-rose-500 font-semibold text-[11px]">✕ 误报</span>}
                          {!issue.reviewResult && <span className="text-slate-400 text-[11px]">待处理</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              合规整改建议摘要
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {criticalCount > 0 && (
                <div className="rounded-lg border border-rose-200 bg-white p-3">
                  <div className="font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                    立即处理（严重 {criticalCount} 项）
                  </div>
                  <p className="text-rose-600/90 leading-relaxed">
                    存在 {criticalCount} 项严重级别问题，涉及个人敏感信息或重大合规缺失。<strong>必须在发布前全部完成整改</strong>，建议法务部门参与审核。
                  </p>
                </div>
              )}
              {warningCount > 0 && (
                <div className="rounded-lg border border-amber-200 bg-white p-3">
                  <div className="font-bold text-amber-700 mb-1 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                    建议整改（警告 {warningCount} 项）
                  </div>
                  <p className="text-amber-700/90 leading-relaxed">
                    存在 {warningCount} 项警告级问题，涵盖字段完整性、用途描述、授权期限等。建议在发布前处理完毕，以降低合规风险。
                  </p>
                </div>
              )}
              {piiFields > 0 && (
                <div className="rounded-lg border border-violet-200 bg-white p-3">
                  <div className="font-bold text-violet-700 mb-1 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-violet-500" />
                    个人信息保护
                  </div>
                  <p className="text-violet-700/90 leading-relaxed">
                    识别到 {piiFields} 个疑似个人信息字段。请确认已收集用户授权并实施脱敏措施，遵循《个人信息保护法》最小必要原则。
                  </p>
                </div>
              )}
              <div className="rounded-lg border border-sky-200 bg-white p-3">
                <div className="font-bold text-sky-700 mb-1 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
                  发布前确认清单
                </div>
                <ul className="text-sky-700/90 leading-relaxed space-y-0.5 list-disc list-inside">
                  <li>确认授权期限、使用范围均已书面明确</li>
                  <li>价格与更新频率描述无矛盾</li>
                  <li>数据字典完整，样例值已脱敏</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button onClick={() => setStep(3)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            ← 返回问题清单
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const html = buildHTMLReport(currentSession);
                const win = window.open('', '_blank');
                if (win) { win.document.write(html); win.document.close(); }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              在新窗口预览报告
            </button>
          </div>
        </div>
      </div>

      {showTplModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <h3 className="text-lg font-bold text-slate-800 mb-1">保存为检查模板</h3>
            <p className="text-xs text-slate-500 mb-4">将当前的行业规则和数据类型规则保存为模板，方便下次直接套用</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">模板名称 *</label>
                <input
                  autoFocus
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="例如：电商用户数据标准检查"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">模板描述</label>
                <textarea
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  rows={2}
                  placeholder="简要说明适用场景和检查要点"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none"
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
                <div>行业规则：<span className="font-semibold text-slate-700">{currentSession.industryRules.join('、') || '无'}</span></div>
                <div>数据类型：<span className="font-semibold text-slate-700">{currentSession.dataTypeRules.join('、') || '无'}</span></div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setShowTplModal(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">取消</button>
              <button
                onClick={handleSaveTemplate}
                disabled={!tplName.trim()}
                className={cn(
                  'rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                  tplName.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-md shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                保存模板
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </section>
  );
}
