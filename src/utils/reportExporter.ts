import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { CheckSession, ComplianceIssue, DataField } from '../types';
import { SEVERITY_CONFIG, CATEGORY_LABELS } from '../types';

export function buildHTMLReport(session: CheckSession): string {
  const criticalCount = session.issues.filter((i) => i.severity === 'critical').length;
  const warningCount = session.issues.filter((i) => i.severity === 'warning').length;
  const infoCount = session.issues.filter((i) => i.severity === 'info').length;
  const piiFields = session.fields.filter((f) => f.isPersonalInfo).length;
  const fixedCount = session.issues.filter((i) => i.reviewResult === 'fixed').length;

  const formatDate = (ts: number) => new Date(ts).toLocaleString('zh-CN');
  const getLevelLabel = (score: number) => {
    if (score >= 90) return { label: '优秀', color: '#10b981' };
    if (score >= 75) return { label: '良好', color: '#0ea5e9' };
    if (score >= 60) return { label: '及格', color: '#f59e0b' };
    return { label: '不合格', color: '#dc2626' };
  };
  const level = getLevelLabel(session.score);

  const severityRows = (issues: ComplianceIssue[]) =>
    issues
      .map(
        (issue) => `
    <tr>
      <td style="padding:8px;border:1px solid #e5e7eb;width:80px;text-align:center;">
        <span style="display:inline-block;padding:2px 8px;border-radius:4px;color:#fff;font-size:12px;${
          issue.severity === 'critical'
            ? 'background:#dc2626'
            : issue.severity === 'warning'
              ? 'background:#f59e0b'
              : 'background:#0ea5e9'
        }">${SEVERITY_CONFIG[issue.severity].label}</span>
      </td>
      <td style="padding:8px;border:1px solid #e5e7eb;"><strong>${issue.title}</strong></td>
      <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#374151;">${issue.description}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;color:#1e3a5f;">${issue.suggestion}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px;">${
        issue.reviewResult === 'fixed' ? '✅ 已整改' : issue.reviewResult === 'accepted' ? '⚠️ 已接受' : issue.reviewResult === 'rejected' ? '❌ 驳回' : '⏳ 待处理'
      }</td>
    </tr>`
      )
      .join('');

  const fieldRows = (fields: DataField[]) =>
    fields
      .slice(0, 100)
      .map(
        (f) => `
    <tr>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;">${f.name}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;color:#6b7280;">${f.sampleValue || '—'}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:center;">
        ${f.isPersonalInfo ? `<span style="color:#dc2626;font-weight:bold;">🔴 ${f.personalInfoType || '个人信息'}</span>` : '<span style="color:#10b981;">✅ 非敏感</span>'}
      </td>
    </tr>`
      )
      .join('');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>数据要素合规检查报告 - ${session.name}</title>
<style>
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; color: #1e293b; max-width: 1100px; margin: 0 auto; padding: 40px 30px; background:#fff;}
  .header { border-bottom: 3px solid #1e3a5f; padding-bottom: 24px; margin-bottom: 32px; }
  .title { font-size: 32px; font-weight: 700; color: #1e3a5f; margin: 0; }
  .subtitle { font-size: 14px; color: #64748b; margin-top: 8px; }
  .score-box { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: #fff; border-radius: 16px; padding: 32px; margin-bottom: 32px; display:flex; align-items:center; justify-content:space-between; }
  .score-num { font-size: 72px; font-weight: 800; line-height: 1; }
  .score-label { font-size: 24px; opacity: 0.9; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card { padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
  .stat-label { font-size: 12px; color: #64748b; margin-bottom: 8px; }
  .stat-value { font-size: 28px; font-weight: 700; color: #1e293b; }
  .section { margin-bottom: 36px; }
  .section-title { font-size: 20px; font-weight: 700; color: #1e3a5f; border-left: 4px solid #2563eb; padding-left: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { background: #f1f5f9; padding: 10px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; color: #334155; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  .meta-info { background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
  .meta-item { display: flex; gap: 8px; }
  .meta-key { color: #64748b; font-weight: 500; }
</style>
</head>
<body>
  <div class="header">
    <h1 class="title">🛡️ 数据要素合规检查报告</h1>
    <div class="subtitle">Data Compliance Inspection Report · Generated by ComplianceCheck Pro</div>
  </div>

  <div class="score-box">
    <div>
      <div class="score-label">合规得分 / Compliance Score</div>
      <div class="score-num">${session.score}<span style="font-size:24px;">/100</span></div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:14px;opacity:0.8; margin-bottom:8px;">综合评级</div>
      <div style="font-size:36px;font-weight:700;color:${level.color};text-shadow:0 2px 12px rgba(255,255,255,0.3);">${level.label}</div>
    </div>
  </div>

  <div class="meta-info">
    <div class="meta-item"><span class="meta-key">📋 检查名称：</span><span>${session.name}</span></div>
    <div class="meta-item"><span class="meta-key">📄 源文件：</span><span>${session.fileName || '（手动输入）'}</span></div>
    <div class="meta-item"><span class="meta-key">📅 开始时间：</span><span>${formatDate(session.createdAt)}</span></div>
    <div class="meta-item"><span class="meta-key">✅ 完成时间：</span><span>${session.completedAt ? formatDate(session.completedAt) : '进行中'}</span></div>
    <div class="meta-item"><span class="meta-key">🏢 适用行业：</span><span>${session.industryRules.join('、') || '（未选）'}</span></div>
    <div class="meta-item"><span class="meta-key">📊 数据类型：</span><span>${session.dataTypeRules.join('、') || '（未选）'}</span></div>
  </div>

  <div class="stats-grid">
    <div class="stat-card"><div class="stat-label">识别字段总数</div><div class="stat-value">${session.fields.length}</div></div>
    <div class="stat-card"><div class="stat-label">疑似个人信息字段</div><div class="stat-value" style="color:#dc2626;">${piiFields}</div></div>
    <div class="stat-card"><div class="stat-label">发现问题总数</div><div class="stat-value" style="color:#f59e0b;">${session.issues.length}</div></div>
    <div class="stat-card"><div class="stat-label">已完成整改</div><div class="stat-value" style="color:#10b981;">${fixedCount}</div></div>
  </div>

  <div class="section">
    <div class="section-title">📌 问题分布概览</div>
    <table>
      <tr><th>严重程度</th><th>数量</th><th>权重</th><th>说明</th></tr>
      <tr><td style="color:#dc2626;font-weight:bold;">🔴 严重 Critical</td><td>${criticalCount}</td><td>×8</td><td>需立即整改，可能涉及重大合规风险</td></tr>
      <tr><td style="color:#f59e0b;font-weight:bold;">🟠 警告 Warning</td><td>${warningCount}</td><td>×3</td><td>建议整改，存在一定合规隐患</td></tr>
      <tr><td style="color:#0ea5e9;font-weight:bold;">🔵 提示 Info</td><td>${infoCount}</td><td>×1</td><td>可选优化，提升文档完整性</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">⚠️ 合规问题清单 (按严重程度排序)</div>
    <table>
      <tr>
        <th style="width:90px;">严重度</th><th>问题标题</th><th>问题描述</th><th>整改建议</th><th style="width:90px;">复查状态</th>
      </tr>
      ${severityRows(session.issues)}
    </table>
  </div>

  <div class="section">
    <div class="section-title">📋 识别字段清单 (${session.fields.length} 个字段，前100条)</div>
    <table>
      <tr><th style="width:30%;">字段名称</th><th>样例值</th><th style="width:180px;">敏感检测</th></tr>
      ${fieldRows(session.fields)}
    </table>
  </div>

  <div class="section">
    <div class="section-title">📝 整改与复查说明</div>
    <p style="line-height:1.8;color:#475569;">
      1. 请根据上方「整改建议」逐项处理，完成后在工具中标记为「已整改」；<br>
      2. 对于确认可接受的风险，标记为「已接受」并填写接受理由；<br>
      3. 所有「严重」等级问题建议在发布前全部完成整改；<br>
      4. 合规得分 = 100 − (严重×8 + 警告×3 + 提示×1)，≥60 分视为及格；<br>
      5. 本报告仅供内部自检参考，最终合规结论需以法务部门审核为准。
    </p>
  </div>

  <div class="footer">
    © ${new Date().getFullYear()} 数据要素合规检查工具 ComplianceCheck Pro · 本报告由系统自动生成
  </div>
</body>
</html>
`;
}

export function exportHTMLReport(session: CheckSession) {
  const html = buildHTMLReport(session);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `合规检查报告_${session.name}_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportPDFReport(session: CheckSession, reportRef: HTMLElement | null) {
  if (reportRef) {
    const canvas = await html2canvas(reportRef, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    pdf.save(`合规检查报告_${session.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } else {
    const html = buildHTMLReport(session);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }
}

export function printReport(session: CheckSession) {
  const html = buildHTMLReport(session);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}

export { CATEGORY_LABELS };
