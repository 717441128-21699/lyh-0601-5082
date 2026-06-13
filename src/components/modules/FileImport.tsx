import { useCallback, useRef, useState } from 'react';
import {
  Upload, FileText, FileSpreadsheet, FileJson, CheckCircle2,
  X, Sparkles, FolderUp, Eye, Trash2
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { cn } from '../../lib/utils';

const ACCEPTED = {
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.json': 'application/json',
};

export function FileImportModule() {
  const { currentSession, uploadFile, loadSampleFile, setStep } = useComplianceStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!(ext in ACCEPTED)) {
      alert(`不支持的文件格式：${ext}。支持格式：.md .txt .csv .json`);
      return;
    }
    const fileType = ext === '.csv' ? 'csv' : ext === '.json' ? 'json' : 'md';
    const content = await file.text();
    uploadFile(file.name, fileType, content);
  }, [uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const IconForExt = (ext: string) => {
    if (ext === 'csv') return FileSpreadsheet;
    if (ext === 'json') return FileJson;
    return FileText;
  };

  const hasFile = !!currentSession.fileName;
  const FileIcon = IconForExt(currentSession.fileType || 'md');

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <FolderUp className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">① 文件导入</h3>
            <p className="text-xs text-slate-500 mt-0.5">导入待发布说明文档（支持 Markdown / TXT / CSV / JSON）</p>
          </div>
        </div>
        <button
          onClick={loadSampleFile}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          载入示例文档
        </button>
      </div>

      <div className="p-6 space-y-5">
        {!hasFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'group relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 py-12 px-6',
              dragOver
                ? 'border-sky-400 bg-sky-50/60 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/40 hover:border-sky-300 hover:bg-sky-50/40'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".md,.txt,.csv,.json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center text-center gap-4">
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-all duration-300',
                dragOver
                  ? 'bg-sky-500 text-white scale-110 shadow-sky-200 shadow-xl'
                  : 'bg-white text-sky-500 border border-slate-200 group-hover:bg-sky-50 group-hover:text-sky-600'
              )}>
                <Upload className="h-7 w-7" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">拖拽文件到此处，或 <span className="text-sky-600">点击选择文件</span></div>
                <div className="mt-1.5 text-xs text-slate-500">建议使用 Markdown (.md) 格式，字段说明以表格形式呈现效果最佳</div>
              </div>
              <div className="flex items-center gap-2">
                {['MD', 'TXT', 'CSV', 'JSON'].map((fmt) => (
                  <span key={fmt} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {fmt === 'MD' && <FileText className="h-3 w-3" />}
                    {fmt === 'CSV' && <FileSpreadsheet className="h-3 w-3" />}
                    {fmt === 'JSON' && <FileJson className="h-3 w-3" />}
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <FileIcon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 truncate">{currentSession.fileName}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span>格式：{currentSession.fileType?.toUpperCase()}</span>
                  <span>·</span>
                  <span>识别字段：<strong className="text-slate-700 tabular-nums">{currentSession.fields.length}</strong> 个</span>
                  <span>·</span>
                  <span>大小：{((currentSession.fileContent?.length || 0) / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-800 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  预览
                </button>
                <button
                  onClick={() => { uploadFile('', '', ''); }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-white hover:text-rose-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  移除
                </button>
              </div>
            </div>

            {showPreview && currentSession.fileContent && (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-600">文档内容预览（前 600 字）</span>
                  <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <pre className="max-h-60 overflow-auto p-4 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                  {currentSession.fileContent.slice(0, 600)}
                  {currentSession.fileContent.length > 600 && <span className="text-slate-400">……（共 {currentSession.fileContent.length} 字符）</span>}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            {hasFile ? '✅ 文件解析成功，可进入下一步或继续完善文档' : '💡 小提示：文档中字段以 Markdown 表格形式组织，字段名和示例值列可自动识别'}
          </div>
          <button
            disabled={!hasFile}
            onClick={() => setStep(1)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
              hasFile
                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm hover:shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            下一步：选择规则 →
          </button>
        </div>
      </div>
    </section>
  );
}
