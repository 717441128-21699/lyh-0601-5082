import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { useComplianceStore } from '../store/complianceStore';
import { BookmarkPlus, Trash2, Play, Calendar, Tag, Plus, X, Search } from 'lucide-react';
import { INDUSTRY_RULE_LABELS, DATATYPE_RULE_LABELS } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Templates() {
  const { templates, deleteTemplate, loadTemplate, saveCurrentAsTemplate } = useComplianceStore();
  const nav = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!name.trim()) return;
    saveCurrentAsTemplate(name.trim(), desc.trim());
    setShowAdd(false);
    setName('');
    setDesc('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/30">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200">
                <BookmarkPlus className="h-5 w-5" strokeWidth={2.2} />
              </span>
              检查模板管理
            </h1>
            <p className="mt-2 text-sm text-slate-500 ml-14">保存常用的合规规则组合，下次检查一键套用</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索模板…"
                className="w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
              />
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-md shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              新建模板
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white/50 p-16 text-center">
              <BookmarkPlus className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <div className="text-sm font-medium text-slate-500">暂无匹配的模板</div>
            </div>
          )}
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-amber-100/50 via-transparent to-violet-100/30 -translate-y-8 translate-x-8 rounded-full" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {t.name}
                  </h3>
                  <button
                    onClick={() => {
                      if (confirm('确定删除此模板？')) deleteTemplate(t.id);
                    }}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 h-8">
                  {t.description || '（暂无模板描述）'}
                </p>

                <div className="space-y-2 mb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">行业规则</div>
                    <div className="flex flex-wrap gap-1">
                      {t.industryRules.length === 0 && <span className="text-[10px] text-slate-400">无</span>}
                      {t.industryRules.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 border border-violet-100">
                          <Tag className="h-2.5 w-2.5" />
                          {INDUSTRY_RULE_LABELS[r].label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">数据类型</div>
                    <div className="flex flex-wrap gap-1">
                      {t.dataTypeRules.length === 0 && <span className="text-[10px] text-slate-400">无</span>}
                      {t.dataTypeRules.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-100">
                          <Tag className="h-2.5 w-2.5" />
                          {DATATYPE_RULE_LABELS[r].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    更新于 {new Date(t.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                  <button
                    onClick={() => { loadTemplate(t.id); nav('/'); }}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                      'bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md'
                    )}
                  >
                    <Play className="h-3 w-3" />
                    套用模板
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">新建检查模板</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">模板名称 *</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：金融风控数据检查"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">模板描述</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  placeholder="适用场景、检查要点等…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                />
              </div>
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 border border-amber-100">
                💡 将保存当前工作台选择的「行业规则」和「数据类型规则」作为模板内容
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">取消</button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className={cn(
                  'rounded-xl px-4 py-2 text-xs font-semibold transition-all',
                  name.trim() ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                创建模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
