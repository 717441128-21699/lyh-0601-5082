export interface PIIDetectionResult {
  isPII: boolean;
  type?: string;
  confidence: number;
}

const PII_KEYWORDS: Record<string, string[]> = {
  手机号: ['手机号', '电话', '手机', 'mobile', 'phone', 'tel', '联系电话', '联系方式'],
  身份证号: ['身份证', '身份证号', '证件号', 'idcard', 'id_card', '公民身份号码'],
  姓名: ['姓名', '用户名', '真实姓名', 'name', 'fullname', 'full_name', '用户名称'],
  邮箱: ['邮箱', 'email', 'e-mail', 'mail', '电子邮件'],
  银行卡号: ['银行卡', '卡号', 'bankcard', 'bank_card', 'card_no', '账号'],
  住址: ['地址', '住址', '地址', 'address', '收货地址', '居住地址', '家庭住址'],
  出生日期: ['生日', '出生日期', 'birth', 'birthday', '出生年月'],
  性别: ['性别', 'gender', 'sex'],
  IP地址: ['ip', 'ip地址', 'ip_address'],
  车牌号: ['车牌号', '车牌', 'plate', 'plate_no'],
  社保账号: ['社保', '社保号', 'social_security', 'ssn'],
  健康信息: ['病历', '诊断', '病情', '健康', '血压', '血糖', 'medical', 'health', 'diagnosis'],
  金融账户: ['账户', '余额', '交易', '支付', 'account', 'balance', 'transaction', 'payment'],
  位置信息: ['位置', '定位', '经度', '纬度', 'location', 'gps', 'lat', 'lng'],
};

const PII_SAMPLE_PATTERNS: Record<string, RegExp> = {
  手机号: /^1[3-9]\d{9}$/,
  身份证号: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
  邮箱: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  银行卡号: /^\d{16,19}$/,
  IP地址: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  车牌号: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,6}$/,
  固定电话: /^0\d{2,3}-?\d{7,8}$/,
};

export function detectPIIByFieldName(fieldName: string): PIIDetectionResult {
  const lowerName = fieldName.toLowerCase().trim();
  let bestMatch: PIIDetectionResult = { isPII: false, confidence: 0 };

  for (const [type, keywords] of Object.entries(PII_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (lowerName === lowerKeyword) {
        return { isPII: true, type, confidence: 1.0 };
      }
      if (lowerName.includes(lowerKeyword)) {
        const conf = lowerKeyword.length / lowerName.length;
        if (conf > bestMatch.confidence) {
          bestMatch = { isPII: true, type, confidence: Math.min(conf + 0.3, 0.95) };
        }
      }
    }
  }

  return bestMatch;
}

export function detectPIIBySampleValue(sampleValue: string): PIIDetectionResult {
  const trimmed = sampleValue.trim();
  if (!trimmed) return { isPII: false, confidence: 0 };

  for (const [type, pattern] of Object.entries(PII_SAMPLE_PATTERNS)) {
    if (pattern.test(trimmed)) {
      return { isPII: true, type, confidence: 0.98 };
    }
  }

  const weakPatterns: Record<string, RegExp> = {
    姓名: /^[\u4e00-\u9fa5]{2,4}$/,
    住址: /[省市区县街道镇乡村路号栋单元室]/,
    出生日期: /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/,
  };

  for (const [type, pattern] of Object.entries(weakPatterns)) {
    if (pattern.test(trimmed)) {
      return { isPII: true, type, confidence: 0.6 };
    }
  }

  return { isPII: false, confidence: 0 };
}

export function detectPII(fieldName: string, sampleValue: string): PIIDetectionResult {
  const byName = detectPIIByFieldName(fieldName);
  const byValue = detectPIIBySampleValue(sampleValue);

  if (byName.isPII && byValue.isPII) {
    return {
      isPII: true,
      type: byName.type || byValue.type,
      confidence: Math.min(byName.confidence + byValue.confidence * 0.3, 1.0),
    };
  }

  if (byName.isPII) return byName;
  if (byValue.isPII && byValue.confidence > 0.7) return byValue;

  return { isPII: false, confidence: 0 };
}
