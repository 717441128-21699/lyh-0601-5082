import type { CheckTemplate, CheckSession, DataField, ComplianceIssue } from '../types';

const now = Date.now();

export const MOCK_FIELDS: DataField[] = [
  { id: 'f1', name: '用户ID', sampleValue: 'U10023847', isPersonalInfo: false, description: '用户唯一标识' },
  { id: 'f2', name: '手机号', sampleValue: '13812345678', isPersonalInfo: true, personalInfoType: '手机号', description: '用户注册手机号' },
  { id: 'f3', name: '姓名', sampleValue: '张三', isPersonalInfo: true, personalInfoType: '姓名', description: '用户真实姓名' },
  { id: 'f4', name: '身份证号', sampleValue: '110101199003071234', isPersonalInfo: true, personalInfoType: '身份证号', description: '身份证号码' },
  { id: 'f5', name: '邮箱', sampleValue: 'zhangsan@example.com', isPersonalInfo: true, personalInfoType: '邮箱', description: '用户邮箱地址' },
  { id: 'f6', name: '收货地址', sampleValue: '北京市朝阳区建国路88号', isPersonalInfo: true, personalInfoType: '住址', description: '默认收货地址' },
  { id: 'f7', name: '银行卡号', sampleValue: '6222021234567890123', isPersonalInfo: true, personalInfoType: '银行卡号', description: '绑定银行卡号' },
  { id: 'f8', name: '订单金额', sampleValue: '299.00', isPersonalInfo: false, description: '订单实付金额' },
  { id: 'f9', name: '下单时间', sampleValue: '2024-12-15 14:32:18', isPersonalInfo: false, description: '订单创建时间' },
  { id: 'f10', name: '浏览时长', sampleValue: '328', isPersonalInfo: false, description: '页面浏览时长(秒)' },
  { id: 'f11', name: '商品名称', sampleValue: '无线蓝牙耳机 Pro', isPersonalInfo: false, description: '商品标准名称' },
  { id: 'f12', name: 'IP地址', sampleValue: '192.168.1.101', isPersonalInfo: true, personalInfoType: 'IP地址', description: '用户访问IP' },
  { id: 'f13', name: '出生日期', sampleValue: '1990-03-07', isPersonalInfo: true, personalInfoType: '出生日期', description: '用户生日' },
  { id: 'f14', name: '性别', sampleValue: '男', isPersonalInfo: true, personalInfoType: '性别', description: '用户性别' },
  { id: 'f15', name: '订单状态', sampleValue: '已完成', isPersonalInfo: false, description: '' },
];

export const MOCK_ISSUES: ComplianceIssue[] = [
  {
    id: 'i1', severity: 'critical', category: 'personal_info',
    title: '检测到疑似个人信息字段：身份证号',
    description: '字段 [身份证号] 被识别为「身份证号」，样例值：110101199003071234。根据《个人信息保护法》，该字段属于敏感个人信息范畴。',
    location: '字段：身份证号', fieldId: 'f4',
    suggestion: '建议：1. 评估该字段是否为数据产品发布所必需；2. 若非必需，直接删除该字段；3. 若必需，需进行脱敏处理（如哈希、掩码）并在文档中补充脱敏方式说明；4. 确认已获得用户单独同意。',
    reviewed: false, createdAt: now - 5000,
  },
  {
    id: 'i2', severity: 'critical', category: 'personal_info',
    title: '检测到疑似个人信息字段：银行卡号',
    description: '字段 [银行卡号] 被识别为「银行卡号」，样例值：6222021234567890123。属于金融敏感数据。',
    location: '字段：银行卡号', fieldId: 'f7',
    suggestion: '建议：银行卡号原则上不应对外提供。如需用于风控建模，必须采用不可逆哈希脱敏处理，并提供 K 值供校验。',
    reviewed: false, createdAt: now - 4900,
  },
  {
    id: 'i3', severity: 'critical', category: 'personal_info',
    title: '检测到疑似个人信息字段：手机号',
    description: '字段 [手机号] 被识别为「手机号」，样例值：13812345678。',
    location: '字段：手机号', fieldId: 'f2',
    suggestion: '建议：手机号可保留前3后4位掩码展示，或使用加盐 SHA-256 哈希后对外提供。',
    reviewed: true, reviewResult: 'accepted', reviewNote: '业务场景需要手机号做匹配，使用加盐哈希处理',
    createdAt: now - 4800,
  },
  {
    id: 'i4', severity: 'warning', category: 'auth_period',
    title: '缺少授权期限描述',
    description: '文档中未发现「授权期」「有效期」「使用期限」「到期日」等授权期限相关描述。根据《数据安全法》要求，数据交易需明确约定使用期限。',
    location: '文档整体',
    suggestion: '建议：在文档中补充「授权期限」章节，明确约定数据使用的起止日期，如「自合同签订之日起12个月内有效」，并约定到期后的处理方式（删除或续签）。',
    reviewed: false, createdAt: now - 4700,
  },
  {
    id: 'i5', severity: 'warning', category: 'usage_scope',
    title: '用途范围描述缺失',
    description: '文档中未发现「用途」「使用场景」「适用范围」等用途范围相关描述。数据使用需遵循「目的限定」原则。',
    location: '文档整体',
    suggestion: '建议：补充「数据用途」章节，明确列出数据的具体使用场景，例如「用于用户画像分析」「用于风控模型训练」等，禁止使用「用于业务发展」等概括性描述。',
    reviewed: false, createdAt: now - 4600,
  },
  {
    id: 'i6', severity: 'warning', category: 'price_inconsistency',
    title: '价格信息描述不一致',
    description: '文档中发现 3 处价格提及，但存在 2 种不同的价格数值：¥299.00 / ¥399.00。价格信息不一致可能导致交易纠纷。',
    location: '价格相关章节',
    suggestion: '建议：统一文档中所有价格描述，建议使用表格形式集中呈现计费规则、单价、计价单位、总价等信息，删除冲突的价格表述。',
    reviewed: true, reviewResult: 'fixed', reviewNote: '已统一价格为 ¥299/月',
    createdAt: now - 4500,
  },
  {
    id: 'i7', severity: 'warning', category: 'update_frequency',
    title: '缺少更新频率描述',
    description: '文档中未发现「更新频率」「刷新周期」等描述，买方无法评估数据时效性。',
    location: '文档整体',
    suggestion: '建议：补充「数据更新频率」章节，明确说明更新方式（全量/增量）、更新周期（T+1/实时/每小时）、更新时间窗口。',
    reviewed: false, createdAt: now - 4400,
  },
  {
    id: 'i8', severity: 'warning', category: 'personal_info',
    title: '检测到疑似个人信息字段：收货地址',
    description: '字段 [收货地址] 被识别为「住址」，样例值：北京市朝阳区建国路88号。',
    location: '字段：收货地址', fieldId: 'f6',
    suggestion: '建议：收货地址截断至区县一级，删除详细街道门牌信息。',
    reviewed: false, createdAt: now - 4300,
  },
  {
    id: 'i9', severity: 'warning', category: 'personal_info',
    title: '检测到疑似个人信息字段：邮箱',
    description: '字段 [邮箱] 被识别为「邮箱」，样例值：zhangsan@example.com。',
    location: '字段：邮箱', fieldId: 'f5',
    suggestion: '建议：如业务允许，删除邮箱字段或使用 MD5 哈希值替代原文。',
    reviewed: false, createdAt: now - 4200,
  },
  {
    id: 'i10', severity: 'warning', category: 'personal_info',
    title: '检测到疑似个人信息字段：IP地址',
    description: '字段 [IP地址] 被识别为「IP地址」，样例值：192.168.1.101。',
    location: '字段：IP地址', fieldId: 'f12',
    suggestion: '建议：IP地址可掩码最后一段（如 192.168.1.*）后提供。',
    reviewed: false, createdAt: now - 4100,
  },
  {
    id: 'i11', severity: 'info', category: 'field_missing',
    title: '有 1 个字段缺少样例值',
    description: '字段：订单状态 未提供样例值，可能影响买方对字段含义的理解。',
    location: '字段定义表', fieldId: 'f15',
    suggestion: '建议：为每个字段补充真实的脱敏样例值，便于买方理解字段含义和数据格式。',
    reviewed: false, createdAt: now - 4000,
  },
  {
    id: 'i12', severity: 'info', category: 'personal_info',
    title: '检测到疑似个人信息字段：出生日期',
    description: '字段 [出生日期] 被识别为「出生日期」。',
    location: '字段：出生日期', fieldId: 'f13',
    suggestion: '建议：仅提供年龄段（如 25-30岁）替代具体日期。',
    reviewed: false, createdAt: now - 3900,
  },
  {
    id: 'i13', severity: 'info', category: 'personal_info',
    title: '检测到疑似个人信息字段：性别',
    description: '字段 [性别] 被识别为「性别」。',
    location: '字段：性别', fieldId: 'f14',
    suggestion: '性别字段如非业务必需可删除；如需保留需在用途说明中明确必要性。',
    reviewed: false, createdAt: now - 3800,
  },
];

export const DEFAULT_TEMPLATES: CheckTemplate[] = [
  {
    id: 't1', name: '电商用户行为数据标准检查',
    description: '适用于电商平台用户浏览、购买行为类数据产品的合规审查',
    industryRules: ['ecommerce', 'general'],
    dataTypeRules: ['personal', 'behavior', 'transaction'],
    customRules: [],
    createdAt: now - 86400000 * 7,
    updatedAt: now - 86400000 * 2,
  },
  {
    id: 't2', name: '金融风控数据严格检查',
    description: '适用于信贷、风控场景下的数据交易，金融行业专项合规要求',
    industryRules: ['finance', 'general'],
    dataTypeRules: ['personal', 'transaction'],
    customRules: [],
    createdAt: now - 86400000 * 14,
    updatedAt: now - 86400000 * 5,
  },
  {
    id: 't3', name: '医疗研究数据审查',
    description: '适用于医学研究、健康数据分析类数据产品',
    industryRules: ['healthcare', 'general'],
    dataTypeRules: ['personal'],
    customRules: [],
    createdAt: now - 86400000 * 21,
    updatedAt: now - 86400000 * 10,
  },
];

export const MOCK_SESSION: CheckSession = {
  id: 's-demo',
  name: '电商用户购买行为数据集 v2.3 发布检查',
  fileName: '电商用户购买数据集说明文档.md',
  fileType: 'md',
  fileContent: `# 电商用户购买行为数据集 v2.3

## 数据集概述
本数据集包含 2024 年 Q4 平台活跃用户的购买行为数据，总计约 50 万条记录。

## 字段列表
| 字段名 | 类型 | 示例值 | 说明 |
|--------|------|--------|------|
| 用户ID | string | U10023847 | 用户唯一标识 |
| 手机号 | string | 13812345678 | 用户注册手机号 |
| 姓名 | string | 张三 | 用户真实姓名 |
| 身份证号 | string | 110101199003071234 | 身份证号码 |
| 邮箱 | string | zhangsan@example.com | 用户邮箱地址 |
| 收货地址 | string | 北京市朝阳区建国路88号 | 默认收货地址 |
| 银行卡号 | string | 6222021234567890123 | 绑定银行卡号 |
| 订单金额 | decimal | 299.00 | 订单实付金额 |
| 下单时间 | datetime | 2024-12-15 14:32:18 | 订单创建时间 |
| 浏览时长 | int | 328 | 页面浏览时长(秒) |
| 商品名称 | string | 无线蓝牙耳机 Pro | 商品标准名称 |
| IP地址 | string | 192.168.1.101 | 用户访问IP |
| 出生日期 | date | 1990-03-07 | 用户生日 |
| 性别 | string | 男 | 用户性别 |
| 订单状态 | string |  |  |

## 价格信息
该数据集月度订阅价格为 **¥299.00**。
企业版年度套餐价格为 ¥399.00（待确认）。

## 使用方式
- API 接口实时调用
- 批量数据文件下载

## 业务价值
助力企业业务发展，提升数据驱动决策能力。
`,
  industryRules: ['ecommerce', 'general'],
  dataTypeRules: ['personal', 'transaction', 'behavior'],
  customRules: [],
  fields: MOCK_FIELDS,
  issues: MOCK_ISSUES,
  status: 'completed',
  score: 32,
  createdAt: now - 3600000,
  completedAt: now - 60000,
};

export const MOCK_HISTORY: CheckSession[] = [
  MOCK_SESSION,
  {
    id: 's-h1', name: '用户画像标签集合规检查',
    fileName: '用户画像标签说明.xlsx',
    industryRules: ['general'],
    dataTypeRules: ['personal', 'behavior'],
    customRules: [],
    fields: MOCK_FIELDS.slice(0, 8),
    issues: MOCK_ISSUES.slice(0, 5),
    status: 'completed',
    score: 68,
    createdAt: now - 86400000 * 2,
    completedAt: now - 86400000 * 2 + 1800000,
  },
  {
    id: 's-h2', name: '门店客流分析数据检查',
    fileName: '客流数据字段说明.csv',
    industryRules: ['general'],
    dataTypeRules: ['behavior', 'public'],
    customRules: [],
    fields: MOCK_FIELDS.slice(0, 5),
    issues: MOCK_ISSUES.slice(0, 3),
    status: 'completed',
    score: 85,
    createdAt: now - 86400000 * 5,
    completedAt: now - 86400000 * 5 + 900000,
  },
];

export const SAMPLE_DOCUMENT = MOCK_SESSION.fileContent as string;
