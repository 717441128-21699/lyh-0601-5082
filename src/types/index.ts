export type SeverityLevel = 'critical' | 'warning' | 'info';

export type IssueCategory =
  | 'personal_info'
  | 'auth_period'
  | 'usage_scope'
  | 'price_inconsistency'
  | 'update_frequency'
  | 'field_missing'
  | 'custom';

export type IndustryRule = 'finance' | 'healthcare' | 'ecommerce' | 'general';

export type DataTypeRule = 'personal' | 'transaction' | 'behavior' | 'public';

export interface DataField {
  id: string;
  name: string;
  sampleValue: string;
  isPersonalInfo: boolean;
  personalInfoType?: string;
  description?: string;
}

export interface ComplianceIssue {
  id: string;
  severity: SeverityLevel;
  category: IssueCategory;
  title: string;
  description: string;
  location?: string;
  fieldId?: string;
  suggestion: string;
  reviewed: boolean;
  reviewResult?: 'fixed' | 'accepted' | 'rejected';
  reviewNote?: string;
  createdAt: number;
}

export interface CustomRule {
  id: string;
  name: string;
  pattern: string;
  severity: SeverityLevel;
  enabled: boolean;
}

export interface CheckTemplate {
  id: string;
  name: string;
  description: string;
  industryRules: IndustryRule[];
  dataTypeRules: DataTypeRule[];
  customRules: CustomRule[];
  createdAt: number;
  updatedAt: number;
}

export interface CheckSession {
  id: string;
  name: string;
  fileName?: string;
  fileContent?: string;
  fileType?: string;
  industryRules: IndustryRule[];
  dataTypeRules: DataTypeRule[];
  customRules: CustomRule[];
  fields: DataField[];
  issues: ComplianceIssue[];
  status: 'idle' | 'scanning' | 'completed';
  score: number;
  createdAt: number;
  completedAt?: number;
}

export interface ParsedDocument {
  rawContent: string;
  fields: DataField[];
  metadata: {
    hasAuthPeriod: boolean;
    hasUsageScope: boolean;
    hasPriceInfo: boolean;
    hasUpdateFrequency: boolean;
    prices: number[];
    updateFrequencies: string[];
  };
}

export const INDUSTRY_RULE_LABELS: Record<IndustryRule, { label: string; icon: string; desc: string }> = {
  finance: { label: '金融行业', icon: 'Landmark', desc: '银行账户、交易记录、信贷数据等敏感字段检测' },
  healthcare: { label: '医疗健康', icon: 'Heart', desc: '病历、诊疗、处方、健康指标等 HIPAA 合规检查' },
  ecommerce: { label: '电商零售', icon: 'ShoppingBag', desc: '收货地址、支付信息、订单行为等数据检测' },
  general: { label: '通用规则', icon: 'ShieldCheck', desc: '通用 PII 识别、基础合规字段完整性检查' },
};

export const DATATYPE_RULE_LABELS: Record<DataTypeRule, { label: string; icon: string; desc: string }> = {
  personal: { label: '个人信息', icon: 'User', desc: '身份证、手机号、邮箱、住址等个人敏感信息检测' },
  transaction: { label: '交易数据', icon: 'CreditCard', desc: '订单金额、支付流水、账户余额等交易字段检查' },
  behavior: { label: '行为数据', icon: 'Activity', desc: '浏览记录、点击轨迹、停留时长等行为数据合规' },
  public: { label: '公开数据', icon: 'Globe', desc: '公开可获取数据，自动降低敏感等级评估' },
};

export const CATEGORY_LABELS: Record<IssueCategory, { label: string; color: string }> = {
  personal_info: { label: '个人信息', color: 'bg-rose-500' },
  auth_period: { label: '授权期限', color: 'bg-amber-500' },
  usage_scope: { label: '用途范围', color: 'bg-blue-500' },
  price_inconsistency: { label: '价格不一致', color: 'bg-purple-500' },
  update_frequency: { label: '更新频率', color: 'bg-cyan-500' },
  field_missing: { label: '字段缺失', color: 'bg-slate-500' },
  custom: { label: '自定义规则', color: 'bg-indigo-500' },
};

export const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; weight: number; bg: string; text: string; border: string; ring: string }> = {
  critical: {
    label: '严重',
    weight: 3,
    bg: 'bg-gradient-to-r from-red-600 to-rose-500',
    text: 'text-red-700',
    border: 'border-red-300',
    ring: 'ring-red-400/30',
  },
  warning: {
    label: '警告',
    weight: 1,
    bg: 'bg-gradient-to-r from-amber-500 to-orange-400',
    text: 'text-amber-700',
    border: 'border-amber-300',
    ring: 'ring-amber-400/30',
  },
  info: {
    label: '提示',
    weight: 0.3,
    bg: 'bg-gradient-to-r from-sky-500 to-blue-400',
    text: 'text-sky-700',
    border: 'border-sky-300',
    ring: 'ring-sky-400/30',
  },
};
