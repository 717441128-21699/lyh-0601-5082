import type { ComplianceIssue, IndustryRule, DataTypeRule, DataField, ParsedDocument, SeverityLevel } from '../types';

function uuid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface ScanContext {
  document: ParsedDocument;
  fields: DataField[];
  industryRules: IndustryRule[];
  dataTypeRules: DataTypeRule[];
  content: string;
}

type ScanStep = (ctx: ScanContext) => ComplianceIssue[];

function createIssue(
  severity: SeverityLevel,
  category: ComplianceIssue['category'],
  title: string,
  description: string,
  suggestion: string,
  extra: Partial<ComplianceIssue> = {}
): ComplianceIssue {
  return {
    id: uuid(),
    severity,
    category,
    title,
    description,
    suggestion,
    reviewed: false,
    createdAt: Date.now(),
    ...extra,
  };
}

const scanPersonalInfo: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];
  const includePersonal = ctx.dataTypeRules.includes('personal') || ctx.industryRules.includes('general');
  if (!includePersonal) return issues;

  ctx.fields.forEach((field) => {
    if (field.isPersonalInfo && field.personalInfoType) {
      issues.push(
        createIssue(
          'critical',
          'personal_info',
          `检测到疑似个人信息字段：${field.name}`,
          `字段 [${field.name}] 被识别为「${field.personalInfoType}」，样例值：${field.sampleValue || '（无）'}。根据《个人信息保护法》，该字段属于敏感个人信息范畴。`,
          `建议：1. 评估该字段是否为数据产品发布所必需；2. 若非必需，直接删除该字段；3. 若必需，需进行脱敏处理（如哈希、掩码）并在文档中补充脱敏方式说明；4. 确认已获得用户单独同意。`,
          { fieldId: field.id, location: `字段：${field.name}` }
        )
      );
    }
  });

  return issues;
};

const scanAuthPeriod: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];
  const { metadata, rawContent: content } = ctx.document;

  if (!metadata.hasAuthPeriod) {
    issues.push(
      createIssue(
        'warning',
        'auth_period',
        '缺少授权期限描述',
        '文档中未发现「授权期」「有效期」「使用期限」「到期日」等授权期限相关描述。根据《数据安全法》要求，数据交易需明确约定使用期限。',
        '建议：在文档中补充「授权期限」章节，明确约定数据使用的起止日期，如「自合同签订之日起12个月内有效」，并约定到期后的处理方式（删除或续签）。',
        { location: '文档整体' }
      )
    );
  } else {
    const durationPatterns = [
      /(?:授权期|有效期|使用期限)[^。；\n]*?(长期|永久|不限|无期限)/i,
      /有效期[：:]\s*(长期|永久)/i,
    ];
    for (const p of durationPatterns) {
      if (p.test(content)) {
        issues.push(
          createIssue(
            'warning',
            'auth_period',
            '授权期限描述为长期/永久',
            '文档中授权期限被描述为「长期」「永久」「无期限」。个人信息授权不得采用概括性永久授权，需符合最小必要原则。',
            '建议：将永久授权修改为明确的期限（如12个月、24个月），并设置到期后的自动删除机制和续约流程。',
            { location: '授权期限章节' }
          )
        );
        break;
      }
    }
  }

  return issues;
};

const scanUsageScope: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];
  const { metadata, rawContent: content } = ctx.document;

  if (!metadata.hasUsageScope) {
    issues.push(
      createIssue(
        'warning',
        'usage_scope',
        '用途范围描述缺失',
        '文档中未发现「用途」「使用场景」「适用范围」等用途范围相关描述。数据使用需遵循「目的限定」原则。',
        '建议：补充「数据用途」章节，明确列出数据的具体使用场景，例如「用于用户画像分析」「用于风控模型训练」等，禁止使用「用于业务发展」等概括性描述。',
        { location: '文档整体' }
      )
    );
  } else {
    const vaguePatterns = [
      /(?:用途|使用|场景|范围)[^。；\n]*?(业务发展|通用|等|其他用途|全方位|任意)/i,
      /用途[：:]\s*[^。；\n]{0,20}(等|等等|其他)/i,
    ];
    for (const p of vaguePatterns) {
      if (p.test(content)) {
        issues.push(
          createIssue(
            'info',
            'usage_scope',
            '用途范围描述模糊',
            '文档中用途范围使用了「等」「其他」「业务发展」等概括性模糊表述。',
            '建议：将用途范围具体化、清单化，删除「等」字，使用穷举方式列出全部使用场景。',
            { location: '用途范围章节' }
          )
        );
        break;
      }
    }
  }

  return issues;
};

const scanPriceInconsistency: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];
  const { prices } = ctx.document.metadata;

  if (prices.length >= 2) {
    const unique = Array.from(new Set(prices.map((p) => p.toFixed(2))));
    if (unique.length > 1) {
      issues.push(
        createIssue(
          'warning',
          'price_inconsistency',
          '价格信息描述不一致',
          `文档中发现 ${prices.length} 处价格提及，但存在 ${unique.length} 种不同的价格数值：¥${unique.join(' / ¥')}。价格信息不一致可能导致交易纠纷。`,
          '建议：统一文档中所有价格描述，建议使用表格形式集中呈现计费规则、单价、计价单位、总价等信息，删除冲突的价格表述。',
          { location: '价格相关章节' }
        )
      );
    }
  } else if (prices.length === 0) {
    issues.push(
      createIssue(
        'info',
        'price_inconsistency',
        '未检测到价格信息',
        '文档中未发现明确的价格/定价描述，建议确认是否已包含交易价格。',
        '建议：补充「价格与计费」章节，明确数据产品的单价、计费方式、优惠政策等信息。',
        { location: '文档整体' }
      )
    );
  }

  return issues;
};

const scanUpdateFrequency: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];
  const { updateFrequencies } = ctx.document.metadata;

  if (updateFrequencies.length >= 2) {
    issues.push(
      createIssue(
        'warning',
        'update_frequency',
        '更新频率描述不一致',
        `文档中发现多种更新频率表述：${updateFrequencies.join('、')}。不一致的更新频率会影响买方的预期管理。`,
        '建议：统一更新频率表述，并补充「数据更新 SLA」，包括更新时间点、延迟范围、失败重试机制等。',
        { location: '数据更新章节' }
      )
    );
  } else if (updateFrequencies.length === 0) {
    issues.push(
      createIssue(
        'warning',
        'update_frequency',
        '缺少更新频率描述',
        '文档中未发现「更新频率」「刷新周期」等描述，买方无法评估数据时效性。',
        '建议：补充「数据更新频率」章节，明确说明更新方式（全量/增量）、更新周期（T+1/实时/每小时）、更新时间窗口。',
        { location: '文档整体' }
      )
    );
  }

  return issues;
};

const scanFieldMissing: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];

  if (ctx.fields.length === 0) {
    issues.push(
      createIssue(
        'warning',
        'field_missing',
        '未识别到明确的字段列表',
        '系统未能从文档中识别出字段名称和字段定义。数据产品需要清晰的数据字典以便买方评估数据价值。',
        '建议：使用表格形式列出全部字段，包含「字段名」「字段类型」「示例值」「字段说明」四列。',
        { location: '数据字段章节' }
      )
    );
  } else {
    const noSample = ctx.fields.filter((f) => !f.sampleValue);
    if (noSample.length > 0) {
      issues.push(
        createIssue(
          'info',
          'field_missing',
          `有 ${noSample.length} 个字段缺少样例值`,
          `字段：${noSample.map((f) => f.name).join('、')} 未提供样例值，可能影响买方对字段含义的理解。`,
          '建议：为每个字段补充真实的脱敏样例值，便于买方理解字段含义和数据格式。',
          { location: '字段定义表' }
        )
      );
    }
  }

  return issues;
};

const scanIndustryRules: ScanStep = (ctx) => {
  const issues: ComplianceIssue[] = [];

  if (ctx.industryRules.includes('finance')) {
    const financeKeywords = ['账户', '交易密码', '支付密码', 'CVV', 'cvv', '安全码'];
    ctx.fields.forEach((f) => {
      const name = f.name.toLowerCase();
      if (financeKeywords.some((k) => name.includes(k.toLowerCase()))) {
        issues.push(
          createIssue(
            'critical',
            'personal_info',
            `[金融合规] 检测到高度敏感字段：${f.name}`,
            `字段 [${f.name}] 属于金融行业高度敏感信息，受《金融数据安全 数据安全分级指南》最高级别监管要求。`,
            '强烈建议：1. 该字段原则上不得对外交易；2. 如确需提供，需签署专项保密协议并通过金融监管机构备案；3. 必须采用强加密传输和存储。',
            { fieldId: f.id, location: `字段：${f.name}` }
          )
        );
      }
    });
  }

  if (ctx.industryRules.includes('healthcare')) {
    const healthKeywords = ['病历', '诊断', '处方', '药品', '过敏史', '既往史', '家族病史'];
    ctx.fields.forEach((f) => {
      if (healthKeywords.some((k) => f.name.includes(k))) {
        issues.push(
          createIssue(
            'critical',
            'personal_info',
            `[医疗合规] 检测到健康医疗敏感数据：${f.name}`,
            `字段 [${f.name}] 属于健康医疗敏感数据，受《个人信息保护法》敏感个人信息及 HIPAA 类法规严格约束。`,
            '建议：1. 确认是否已取得患者知情同意；2. 进行不可逆脱敏（删除直接标识符）；3. 通过伦理委员会审查；4. 限制使用场景仅限医学研究。',
            { fieldId: f.id, location: `字段：${f.name}` }
          )
        );
      }
    });
  }

  if (ctx.industryRules.includes('ecommerce')) {
    const ecommerceKeywords = ['支付密码', '收货地址', '身份证', '银行卡', 'cvv'];
    ctx.fields.forEach((f) => {
      const name = f.name.toLowerCase();
      if (ecommerceKeywords.some((k) => name.includes(k.toLowerCase())) && f.isPersonalInfo) {
        issues.push(
          createIssue(
            'warning',
            'personal_info',
            `[电商合规] 交易敏感字段需脱敏：${f.name}`,
            `字段 [${f.name}] 属于电商交易敏感数据，需按照《网络安全法》进行脱敏处理后方可交易。`,
            '建议：收货地址只保留到区县一级，银行卡号保留前6后4位，身份证号保留前6后4位。',
            { fieldId: f.id, location: `字段：${f.name}` }
          )
        );
      }
    });
  }

  return issues;
};

export function calculateScore(issues: ComplianceIssue[]): number {
  const severityWeight = { critical: 8, warning: 3, info: 1 };
  const totalPenalty = issues.reduce((sum, issue) => {
    if (issue.reviewResult === 'fixed') return sum;
    return sum + severityWeight[issue.severity];
  }, 0);
  return Math.max(0, Math.min(100, Math.round(100 - totalPenalty)));
}

export function sortIssuesBySeverity(issues: ComplianceIssue[]): ComplianceIssue[] {
  const order = { critical: 0, warning: 1, info: 2 };
  return [...issues].sort((a, b) => {
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
    return b.createdAt - a.createdAt;
  });
}

export function runComplianceScan(
  document: ParsedDocument,
  industryRules: IndustryRule[],
  dataTypeRules: DataTypeRule[]
): { issues: ComplianceIssue[]; fields: DataField[]; score: number } {
  const ctx: ScanContext = {
    document,
    fields: document.fields,
    industryRules,
    dataTypeRules,
    content: document.rawContent,
  };

  const steps: ScanStep[] = [
    scanPersonalInfo,
    scanAuthPeriod,
    scanUsageScope,
    scanPriceInconsistency,
    scanUpdateFrequency,
    scanFieldMissing,
    scanIndustryRules,
  ];

  let allIssues: ComplianceIssue[] = [];
  for (const step of steps) {
    allIssues = allIssues.concat(step(ctx));
  }

  const sortedIssues = sortIssuesBySeverity(allIssues);
  const score = calculateScore(sortedIssues);

  return { issues: sortedIssues, fields: document.fields, score };
}
