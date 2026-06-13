import { create } from 'zustand';
import type { CheckSession, ComplianceIssue, CheckTemplate, IndustryRule, DataTypeRule, CustomRule, DataField } from '../types';
import { DEFAULT_TEMPLATES, MOCK_SESSION, MOCK_HISTORY, SAMPLE_DOCUMENT } from '../data/mockData';
import { parseDocument } from '../utils/parser';
import { runComplianceScan, calculateScore, sortIssuesBySeverity } from '../utils/scanner';
import { detectPII } from '../utils/piiDetector';

function uuid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface ComplianceState {
  currentSession: CheckSession;
  sessions: CheckSession[];
  templates: CheckTemplate[];
  scanProgress: number;
  currentStep: number;
  activeFilterSeverity: string;
  activeFilterCategory: string;
  expandedIssueId: string | null;

  createNewSession: () => void;
  setSessionName: (name: string) => void;
  uploadFile: (fileName: string, fileType: string, content: string) => void;
  setIndustryRules: (rules: IndustryRule[]) => void;
  setDataTypeRules: (rules: DataTypeRule[]) => void;
  setCustomRules: (rules: CustomRule[]) => void;
  runScan: () => Promise<void>;
  updateIssue: (id: string, patch: Partial<ComplianceIssue>) => void;
  setStep: (step: number) => void;
  setFilterSeverity: (s: string) => void;
  setFilterCategory: (c: string) => void;
  setExpandedIssue: (id: string | null) => void;
  loadTemplate: (templateId: string) => void;
  saveCurrentAsTemplate: (name: string, desc: string) => void;
  deleteTemplate: (id: string) => void;
  deleteSession: (id: string) => void;
  loadSession: (id: string) => void;
  loadDemo: () => void;
  loadSampleFile: () => void;
  manualAddField: (name: string, sampleValue: string) => void;
  removeField: (id: string) => void;
}

const emptySession = (): CheckSession => ({
  id: uuid(),
  name: `合规检查_${new Date().toLocaleDateString('zh-CN')}`,
  industryRules: ['general'],
  dataTypeRules: [],
  customRules: [],
  fields: [],
  issues: [],
  status: 'idle',
  score: 0,
  createdAt: Date.now(),
});

const LS_TEMPLATES_KEY = 'compliance_templates_v1';
const LS_SESSIONS_KEY = 'compliance_sessions_v1';

function loadStoredTemplates(): CheckTemplate[] {
  try {
    const raw = localStorage.getItem(LS_TEMPLATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_TEMPLATES;
}

function loadStoredSessions(): CheckSession[] {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_HISTORY;
}

function persistTemplates(templates: CheckTemplate[]) {
  try { localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(templates)); } catch {}
}

function persistSessions(sessions: CheckSession[]) {
  try { localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20))); } catch {}
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
  currentSession: MOCK_SESSION,
  sessions: loadStoredSessions(),
  templates: loadStoredTemplates(),
  scanProgress: 0,
  currentStep: 4,
  activeFilterSeverity: 'all',
  activeFilterCategory: 'all',
  expandedIssueId: null,

  createNewSession: () => {
    const s = emptySession();
    set({ currentSession: s, currentStep: 0, scanProgress: 0, expandedIssueId: null });
  },

  setSessionName: (name) => set((st) => ({ currentSession: { ...st.currentSession, name } })),

  uploadFile: (fileName, fileType, content) => {
    if (!fileName || !content) {
      set((st) => ({
        currentSession: {
          ...st.currentSession,
          fileName: undefined,
          fileType: undefined,
          fileContent: undefined,
          fields: [],
          issues: [],
          score: 0,
          status: 'idle',
          completedAt: undefined,
        },
        currentStep: 0,
        scanProgress: 0,
        expandedIssueId: null,
      }));
      return;
    }
    const parsed = parseDocument(content, fileType);
    set((st) => ({
      currentSession: {
        ...st.currentSession,
        fileName,
        fileType,
        fileContent: content,
        fields: parsed.fields,
        issues: [],
        score: 0,
        status: 'idle',
        completedAt: undefined,
      },
      currentStep: 1,
      scanProgress: 0,
      expandedIssueId: null,
    }));
  },

  setIndustryRules: (rules) => set((st) => ({
    currentSession: { ...st.currentSession, industryRules: rules },
  })),

  setDataTypeRules: (rules) => set((st) => ({
    currentSession: { ...st.currentSession, dataTypeRules: rules },
  })),

  setCustomRules: (rules) => set((st) => ({
    currentSession: { ...st.currentSession, customRules: rules },
  })),

  runScan: async () => {
    const st = get();
    set({ currentSession: { ...st.currentSession, status: 'scanning', issues: [], fields: [], score: 0 }, scanProgress: 5 });
    await new Promise((r) => setTimeout(r, 400));
    set({ scanProgress: 20 });
    await new Promise((r) => setTimeout(r, 400));

    const content = st.currentSession.fileContent || '';
    const fileType = st.currentSession.fileType || 'md';
    const parsed = parseDocument(content, fileType);

    set({ scanProgress: 50 });
    await new Promise((r) => setTimeout(r, 500));

    const result = runComplianceScan(parsed, st.currentSession.industryRules, st.currentSession.dataTypeRules);
    set({ scanProgress: 80 });
    await new Promise((r) => setTimeout(r, 300));

    const completedAt = Date.now();
    const newSession: CheckSession = {
      ...st.currentSession,
      fields: result.fields,
      issues: result.issues,
      score: result.score,
      status: 'completed',
      completedAt,
    };
    const sessions = [newSession, ...st.sessions.filter((s) => s.id !== newSession.id)];
    persistSessions(sessions);

    set({
      currentSession: newSession,
      sessions,
      scanProgress: 100,
      currentStep: 3,
    });
    setTimeout(() => set({ scanProgress: 0 }), 800);
  },

  updateIssue: (id, patch) => set((st) => {
    const issues = st.currentSession.issues.map((i) => (i.id === id ? { ...i, ...patch } : i));
    const sorted = sortIssuesBySeverity(issues);
    const score = calculateScore(sorted);
    const updatedSession = { ...st.currentSession, issues: sorted, score };
    const sessions = st.sessions.map((s) =>
      s.id === updatedSession.id ? updatedSession : s
    );
    persistSessions(sessions);
    return { currentSession: updatedSession, sessions };
  }),

  setStep: (step) => set({ currentStep: step }),
  setFilterSeverity: (s) => set({ activeFilterSeverity: s }),
  setFilterCategory: (c) => set({ activeFilterCategory: c }),
  setExpandedIssue: (id) => set({ expandedIssueId: id }),

  loadTemplate: (templateId) => {
    const tpl = get().templates.find((t) => t.id === templateId);
    if (!tpl) return;
    set((st) => ({
      currentSession: {
        ...st.currentSession,
        industryRules: tpl.industryRules,
        dataTypeRules: tpl.dataTypeRules,
        customRules: tpl.customRules,
      },
      currentStep: Math.max(st.currentStep, 2),
    }));
  },

  saveCurrentAsTemplate: (name, desc) => set((st) => {
    const tpl: CheckTemplate = {
      id: uuid(),
      name,
      description: desc,
      industryRules: st.currentSession.industryRules,
      dataTypeRules: st.currentSession.dataTypeRules,
      customRules: st.currentSession.customRules,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const templates = [tpl, ...st.templates];
    persistTemplates(templates);
    return { templates };
  }),

  deleteTemplate: (id) => set((st) => {
    const templates = st.templates.filter((t) => t.id !== id);
    persistTemplates(templates);
    return { templates };
  }),

  deleteSession: (id) => set((st) => {
    const sessions = st.sessions.filter((s) => s.id !== id);
    persistSessions(sessions);
    return { sessions };
  }),

  loadSession: (id) => {
    const s = get().sessions.find((x) => x.id === id);
    if (s) set({ currentSession: s, currentStep: 3 });
  },

  loadDemo: () => set({ currentSession: MOCK_SESSION, currentStep: 4 }),

  loadSampleFile: () => {
    const st = get();
    const content = SAMPLE_DOCUMENT;
    const parsed = parseDocument(content, 'md');
    set({
      currentSession: {
        ...st.currentSession,
        fileName: '示例文档-电商数据集说明.md',
        fileType: 'md',
        fileContent: content,
        fields: parsed.fields,
      },
      currentStep: Math.max(st.currentStep, 1),
    });
  },

  manualAddField: (name, sampleValue) => {
    const res = detectPII(name, sampleValue);
    const f: DataField = {
      id: uuid(), name, sampleValue,
      isPersonalInfo: res.isPII, personalInfoType: res.type,
    };
    set((st) => ({ currentSession: { ...st.currentSession, fields: [...st.currentSession.fields, f] } }));
  },

  removeField: (id) => set((st) => ({
    currentSession: { ...st.currentSession, fields: st.currentSession.fields.filter((f) => f.id !== id) },
  })),
}));
