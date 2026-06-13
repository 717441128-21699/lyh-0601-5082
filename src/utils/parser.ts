import type { DataField, ParsedDocument } from '../types';
import { detectPII } from './piiDetector';

function uuid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function parseCSV(content: string): DataField[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
  const sampleLine = lines[1]?.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, '')) || [];

  return headers.map((name, idx) => {
    const sampleValue = sampleLine[idx] || '';
    const piiResult = detectPII(name, sampleValue);
    return {
      id: uuid(),
      name,
      sampleValue,
      isPersonalInfo: piiResult.isPII,
      personalInfoType: piiResult.type,
    };
  });
}

export function parseJSON(content: string): DataField[] {
  try {
    const data = JSON.parse(content);
    const firstObj = Array.isArray(data) ? data[0] : data;
    if (!firstObj || typeof firstObj !== 'object') return [];

    return Object.entries(firstObj).map(([key, value]) => {
      const sampleValue = value === null || value === undefined ? '' : String(value).slice(0, 100);
      const piiResult = detectPII(key, sampleValue);
      return {
        id: uuid(),
        name: key,
        sampleValue,
        isPersonalInfo: piiResult.isPII,
        personalInfoType: piiResult.type,
      };
    });
  } catch {
    return [];
  }
}

export function parseMarkdownOrText(content: string): DataField[] {
  const fields: DataField[] = [];
  const seen = new Set<string>();

  const tablePattern = /\|(.+)\|\n\|[\s:-]+\|\n((?:\|.+\|\n?)+)/g;
  let match;
  while ((match = tablePattern.exec(content)) !== null) {
    const headerRow = match[1].split('|').map((h) => h.trim().toLowerCase());
    const dataRows = match[2].split('\n').filter((l) => l.trim());

    const nameColIdx = headerRow.findIndex((h) =>
      h.includes('字段') || h.includes('名称') || h.includes('field') || h.includes('name') || h.includes('变量')
    );
    const valueColIdx = headerRow.findIndex((h) =>
      h.includes('示例') || h.includes('样例') || h.includes('例子') || h.includes('value') || h.includes('sample') || h.includes('默认值')
    ) || headerRow.findIndex((h) =>
      h !== '' && h !== headerRow[nameColIdx]
    ) || 1;
    const descColIdx = headerRow.findIndex((h) =>
      h.includes('说明') || h.includes('描述') || h.includes('desc') || h.includes('comment')
    );

    if (nameColIdx !== -1 && dataRows.length > 0) {
      for (const row of dataRows) {
        const cells = row.split('|').map((c) => c.trim());
        const fieldName = cells[nameColIdx];
        if (!fieldName || seen.has(fieldName) || /^[-\s:]+$/.test(fieldName)) continue;
        seen.add(fieldName);

        const sampleValue = cells[valueColIdx] || '';
        const description = descColIdx !== -1 ? cells[descColIdx] || '' : '';
        const piiResult = detectPII(fieldName, sampleValue);

        fields.push({
          id: uuid(),
          name: fieldName,
          sampleValue,
          isPersonalInfo: piiResult.isPII,
          personalInfoType: piiResult.type,
          description,
        });
      }
    } else {
      const headers = match[1].split('|').map((h) => h.trim()).filter(Boolean);
      const firstRow = dataRows[0]?.split('|').map((c) => c.trim()).filter(Boolean) || [];
      headers.forEach((h, idx) => {
        if (!h || seen.has(h)) return;
        seen.add(h);
        const sample = firstRow[idx] || '';
        const piiResult = detectPII(h, sample);
        fields.push({
          id: uuid(),
          name: h,
          sampleValue: sample,
          isPersonalInfo: piiResult.isPII,
          personalInfoType: piiResult.type,
        });
      });
    }
  }

  const listPattern = /^[-*•\d.]\s*([^：:：\n]+)[：:]([^\n]*)$/gm;
  while ((match = listPattern.exec(content)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    if (name && name.length < 50 && !seen.has(name)) {
      seen.add(name);
      const piiResult = detectPII(name, value);
      fields.push({
        id: uuid(),
        name,
        sampleValue: value.slice(0, 100),
        isPersonalInfo: piiResult.isPII,
        personalInfoType: piiResult.type,
      });
    }
  }

  const colonPattern = /^([A-Za-z_\u4e00-\u9fa5][A-Za-z0-9_\u4e00-\u9fa5]{0,30})[：:]\s*([^\n]+)$/gm;
  while ((match = colonPattern.exec(content)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    if (name && !seen.has(name) && !/^(字段|名称|说明|类型|示例)$/.test(name)) {
      seen.add(name);
      const piiResult = detectPII(name, value);
      fields.push({
        id: uuid(),
        name,
        sampleValue: value.slice(0, 100),
        isPersonalInfo: piiResult.isPII,
        personalInfoType: piiResult.type,
      });
    }
  }

  return fields;
}

export function extractMetadata(content: string): ParsedDocument['metadata'] {
  const prices: number[] = [];
  const pricePattern = /(?:价格|定价|单价|售价|费用|￥|¥|RMB|CNY|元)[：:\s]*(\d+(?:\.\d+)?)/g;
  let pm;
  while ((pm = pricePattern.exec(content)) !== null) {
    prices.push(parseFloat(pm[1]));
  }
  const altPricePattern = /(\d+(?:\.\d+)?)\s*(?:元|块)/g;
  while ((pm = altPricePattern.exec(content)) !== null) {
    prices.push(parseFloat(pm[1]));
  }

  const updateFrequencies: string[] = [];
  const freqPattern = /(?:更新频率|更新周期|刷新频率|同步频率)[：:\s]*([^\n，。；,;.]+)/g;
  let fm;
  while ((fm = freqPattern.exec(content)) !== null) {
    updateFrequencies.push(fm[1].trim());
  }
  const freqKeywords = ['实时', '每日', '每天', '每周', '每月', '每季度', '每年', '每小时', 'T+1', 'T+0'];
  freqKeywords.forEach((k) => {
    if (content.includes(k) && !updateFrequencies.includes(k)) {
      updateFrequencies.push(k);
    }
  });

  const hasAuthPeriod = /(授权期|有效期|使用期限|到期日|过期时间|截止日期|有效期限)/.test(content);
  const hasUsageScope = /(用途|使用场景|适用范围|使用范围|应用场景|数据用途)/.test(content);
  const hasPriceInfo = prices.length > 0;
  const hasUpdateFrequency = updateFrequencies.length > 0;

  return {
    hasAuthPeriod,
    hasUsageScope,
    hasPriceInfo,
    hasUpdateFrequency,
    prices,
    updateFrequencies,
  };
}

export function parseDocument(content: string, fileType: string): ParsedDocument {
  let fields: DataField[] = [];

  if (fileType === 'csv') {
    fields = parseCSV(content);
  } else if (fileType === 'json') {
    fields = parseJSON(content);
  } else {
    fields = parseMarkdownOrText(content);
  }

  if (fields.length === 0) {
    const lines = content.split(/\r?\n/).filter((l) => l.trim()).slice(0, 30);
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length > 2 && trimmed.length < 200) {
        const piiResult = detectPII(trimmed.slice(0, 30), trimmed);
        fields.push({
          id: uuid(),
          name: `字段_${idx + 1}`,
          sampleValue: trimmed.slice(0, 100),
          isPersonalInfo: piiResult.isPII,
          personalInfoType: piiResult.type,
        });
      }
    });
  }

  const metadata = extractMetadata(content);
  return { rawContent: content, fields, metadata };
}
