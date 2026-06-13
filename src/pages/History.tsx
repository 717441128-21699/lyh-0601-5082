import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { useComplianceStore } from '../store/complianceStore';
import { History as HistoryIcon, Clock, FileText, Trash2, Play, Search, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge } from '../components/common/SeverityBadge';

export default function History() {
  const { sessions, loadSession, deleteSession } = useComplianceStore();
  const nav = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = sessions
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const scoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s >= 75) return 'text-sky-600 bg-sky-50 border-sky-200';
    if (s >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };
  const scoreLabel = (s: number) => {
    if (s >= 90) return '优秀';
    if (s >= 75) return '良好';
    if (s >= 60) return '及格';
    return '不合格';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/30">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200">
                <HistoryIcon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              历史检查记录
            </h1>
            <p className="mt-2 text-sm text-slate-500 ml-14">查看已完成的合规检查历史，最近 {sessions.length} 条记录保存在本地浏览器</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索检查名称…"
              className="w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-20 text-center">
              <Clock className="h-14 w-14 mx-auto text-slate-300 mb-4" />
              <div className="text-base font-semibold text-slate-500">暂无历史检查记录</div>
              <p className="mt-2 text-sm text-slate-400">完成一次合规检查后将自动保存在此处</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50/80 to-white">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">检查名称</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-28">合规得分</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-44">问题统计</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-36">检查时间</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 w-28">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const critical = s.issues.filter((i) => i.severity === 'critical').length;
                  const warning = s.issues.filter((i) => i.severity === 'warning').length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 group-hover:from-indigo-100 group-hover:to-violet-100 group-hover:text-indigo-600 transition-colors">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{s.name}</div>
                            <div className="mt-0.5 text-xs text-slate-400 truncate flex items-center gap-1.5">
                              {s.fileName && <span className="inline-flex items-center gap-1">📄 {s.fileName}</span>}
                              {s.industryRules.length > 0 && <span className="inline-flex items-center gap-1">· 🏢 {s.industryRules.length}项</span>}
                              {s.dataTypeRules.length > 0 && <span className="inline-flex items-center gap-1">· 📊 {s.dataTypeRules.length}项</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-bold tabular-nums', scoreColor(s.score))}>
                          <span className="text-base">{s.score}</span>
                          <span className="text-[10px] opacity-70">/ {scoreLabel(s.score)}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold', critical > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500')}>
                            <AlertTriangle className="h-3 w-3" />
                            {critical}
                          </span>
                          <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold', warning > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500')}>
                            ⚠ {warning}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 font-semibold text-sky-700">
                            🔍 {s.fields.length}字段
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400 ml-5">
                          {new Date(s.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { loadSession(s.id); nav('/'); }}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="查看详情"
                          >
                            <Play className="h-3 w-3" />
                            查看
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除此记录？')) deleteSession(s.id);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
