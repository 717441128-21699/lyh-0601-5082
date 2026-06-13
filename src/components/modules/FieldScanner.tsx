import { useState } from 'react';
import { Search, ScanLine, Play, RotateCcw, AlertTriangle, Shield, Plus, X, Loader2, Zap } from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { StatCard } from '../common/StatCard';
import { ProgressBar } from '../common/ProgressBar';
import { cn } from '../../lib/utils';
import type { DataField } from '../../types';

export function FieldScannerModule() {
  const { currentSession, scanProgress, runScan, setStep, manualAddField, removeField } = useComplianceStore();
  const [search, setSearch] = useState('');
  const [onlyPII, setOnlyPII] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const isScanning = currentSession.status === 'scanning';
  const fields: DataField[] = currentSession.fields.filter((f) => {
    if (onlyPII && !f.isPersonalInfo) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const piiCount = currentSession.fields.filter((f) => f.isPersonalInfo).length;
  const hasScanned = currentSession.status === 'completed';

  const canScan = currentSession.fileName && (currentSession.industryRules.length > 0 || currentSession.dataTypeRules.length > 0);

  const handleAdd = () => {
    if (!newFieldName.trim()) return;
    manualAddField(newFieldName.trim(), newFieldValue.trim());
    setNewFieldName('');
    setNewFieldValue('');
    setShowAdd(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ScanLine className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">③ 字段扫描</h3>
            <p className="text-xs text-slate-500 mt-0.5">识别字段名称和样例值，自动标记疑似个人信息</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasScanned && (
            <button
              onClick={() => runScan()}
              disabled={!canScan || isScanning}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className={cn('h-3.5 w-3.5', isScanning && 'animate-spin')} />
              重新扫描
            </button>
          )}
          <button
            onClick={() => runScan()}
            disabled={!canScan || isScanning}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all shadow-sm',
              canScan && !isScanning
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-emerald-200 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isScanning ? '扫描中…' : (hasScanned ? '再次扫描' : '一键执行合规扫描')}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {(isScanning || scanProgress > 0) && (
          <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50/80 to-cyan-50/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="h-4 w-4 text-sky-600 animate-spin" />
              <span className="text-xs font-semibold text-sky-800">正在执行合规扫描引擎…</span>
              <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            </div>
            <ProgressBar progress={scanProgress} />
            <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">
              {['📄 文档解析', '🔍 字段识别', '🛡️ 敏感检测', '📋 规则匹配'].map((s, i) => (
                <div key={s} className={cn(
                  'rounded-md py-1 px-2 text-center font-medium transition-colors',
                  scanProgress > (i + 1) * 20 ? 'bg-emerald-100 text-emerald-700' :
                  scanProgress > i * 20 ? 'bg-sky-100 text-sky-700 animate-pulse' :
                  'bg-slate-100 text-slate-400'
                )}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {hasScanned && (
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="识别字段" value={currentSession.fields.length} accent="info" />
            <StatCard label="疑似敏感字段" value={piiCount} accent="danger" icon={AlertTriangle} sublabel={currentSession.fields.length ? `${((piiCount / currentSession.fields.length) * 100).toFixed(0)}%` : ''} />
            <StatCard label="普通字段" value={currentSession.fields.length - piiCount} accent="success" icon={Shield} />
            <StatCard label="发现问题" value={currentSession.issues.length} accent="warning" icon={AlertTriangle} />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索字段名称…"
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
          </div>
          <label className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition-colors',
            onlyPII ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}>
            <input type="checkbox" className="hidden" checked={onlyPII} onChange={(e) => setOnlyPII(e.target.checked)} />
            <AlertTriangle className="h-3.5 w-3.5" />
            只看敏感字段
          </label>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            手动添加字段
          </button>
        </div>

        {showAdd && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 flex items-center gap-2">
            <input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="字段名称（如：会员等级）"
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <input
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              placeholder="样例值（可选）"
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button onClick={handleAdd} className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">确定</button>
            <button onClick={() => setShowAdd(false)} className="rounded-md bg-white border border-slate-200 px-2 py-1.5 text-slate-500">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="max-h-[380px] overflow-auto">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                <ScanLine className="h-12 w-12 opacity-40" />
                <div className="text-sm font-medium">暂无字段数据</div>
                <div className="text-xs">先上传文档并执行扫描，或手动添加字段</div>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-52">字段名称</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">样例值</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-44">敏感检测</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((f, i) => (
                    <tr key={f.id} className={cn('hover:bg-slate-50/60 transition-colors', f.isPersonalInfo && 'bg-rose-50/20')}>
                      <td className="px-4 py-2.5 text-xs text-slate-400 tabular-nums">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('font-semibold text-sm', f.isPersonalInfo ? 'text-rose-700' : 'text-slate-800')}>{f.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600 max-w-[260px] inline-block truncate align-middle">
                          {f.sampleValue || <span className="text-slate-300">（无样例）</span>}
                        </code>
                      </td>
                      <td className="px-4 py-2.5">
                        {f.isPersonalInfo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                            <AlertTriangle className="h-3 w-3" />
                            {f.personalInfoType || '个人信息'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <Shield className="h-3 w-3" />
                            非敏感
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => removeField(f.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            {hasScanned ? `✅ 扫描完成：${currentSession.fields.length} 个字段，其中 ${piiCount} 个疑似敏感字段` : '💡 扫描需要同时具备：已上传文档 + 已选择至少一项规则'}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              ← 上一步
            </button>
            {hasScanned && (
              <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                下一步：查看问题 →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
