import { useComplianceStore } from '../store/complianceStore';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { FileImportModule } from '../components/modules/FileImport';
import { RuleSelectorModule } from '../components/modules/RuleSelector';
import { FieldScannerModule } from '../components/modules/FieldScanner';
import { IssueListModule } from '../components/modules/IssueList';
import { ReportGeneratorModule } from '../components/modules/ReportGenerator';

export default function Workbench() {
  const { currentStep } = useComplianceStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/30">
      <Header />
      <main className="mx-auto flex max-w-[1500px] gap-4 px-6 py-6">
        <Sidebar />
        <div className="flex-1 min-w-0 space-y-6">
          {currentStep >= 0 && (
            <div className="animate-[fadeIn_0.4s_ease-out]">
              <FileImportModule />
            </div>
          )}
          {currentStep >= 1 && (
            <div className="animate-[fadeIn_0.4s_ease-out_0.05s_both]">
              <RuleSelectorModule />
            </div>
          )}
          {currentStep >= 2 && (
            <div className="animate-[fadeIn_0.4s_ease-out_0.1s_both]">
              <FieldScannerModule />
            </div>
          )}
          {currentStep >= 3 && (
            <div className="animate-[fadeIn_0.4s_ease-out_0.15s_both]">
              <IssueListModule />
            </div>
          )}
          {currentStep >= 4 && (
            <div className="animate-[fadeIn_0.4s_ease-out_0.2s_both]">
              <ReportGeneratorModule />
            </div>
          )}
        </div>
      </main>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
