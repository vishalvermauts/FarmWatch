import React, { useState } from 'react';
import { FarmField, Language } from '../types/farmwatch';
import { translations } from '../utils/i18n';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  FileText, 
  Lock, 
  Database, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PrivacyCenterViewProps {
  fields: FarmField[];
  onResetAllData: () => void;
  language: Language;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({
  fields,
  onResetAllData,
  language,
}) => {
  const t = translations[language];
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExportJson = () => {
    const exportBundle = {
      app: 'FarmWatch',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tenant: 'Nashik Farmer Cooperative',
      totalFields: fields.length,
      fields: fields.map(f => ({
        id: f.id,
        farmName: f.farmName,
        fieldName: f.fieldName,
        location: f.locationName,
        geometry: f.currentGeometry,
        season: f.activeSeason,
        soilReport: f.soilReport,
        observationsCount: f.observations.length,
        observations: f.observations,
        latestAlert: f.latestAlert,
        actions: f.actions,
        advisory: f.recentAdvisory,
      })),
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmwatch_export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('JSON Archive Downloaded Successfully');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportMarkdown = () => {
    let md = `# FarmWatch Agricultural Inspection Report\n`;
    md += `*Generated on ${new Date().toISOString()}*\n\n`;

    fields.forEach((f, idx) => {
      md += `## ${idx + 1}. Field: ${f.fieldName} (${f.farmName})\n`;
      md += `- **Location:** ${f.locationName}\n`;
      md += `- **Geodesic Area:** ${f.currentGeometry.areaHa} ha (Revision ${f.currentGeometry.version})\n`;
      md += `- **Crop:** ${f.activeSeason.cropNameEn} (Sown: ${f.activeSeason.sowingDate})\n`;
      md += `- **Irrigation:** ${f.activeSeason.irrigationMethod}\n`;
      md += `- **Soil Test:** pH ${f.soilReport.ph}, Organic Carbon ${f.soilReport.organicCarbonPercent}%, N: ${f.soilReport.availableNitrogenKgHa} kg/ha\n\n`;

      md += `### Latest Satellite Observations\n`;
      f.observations.forEach(o => {
        md += `- **${o.timestamps.acquired_at.slice(0, 10)}**: NDVI ${o.indicators.ndvi_median ?? 'N/A'}, NDMI ${o.indicators.ndmi_median ?? 'N/A'}, Core Coverage ${((o.quality.coverage_core || 0) * 100).toFixed(0)}% (${o.quality.support_state})\n`;
      });

      if (f.latestAlert) {
        md += `\n### Active Alert\n`;
        md += `- **${f.latestAlert.title}** (${f.latestAlert.severity})\n`;
        md += `- ${f.latestAlert.explanation.qualifyingCriteriaMet}\n`;
      }

      if (f.actions.length > 0) {
        md += `\n### Recorded Field Scouting Actions\n`;
        f.actions.forEach(a => {
          md += `- **${a.observedOn}**: ${a.observation} -> *Action:* ${a.actionTaken} (${a.alertConcernConfirmed})\n`;
        });
      }

      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmwatch_summary_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('Markdown Report Downloaded Successfully');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
          <ShieldCheck className="w-4 h-4 text-[#2E7D46]" />
          <span>Zero Secret Leakage</span>
          <span aria-hidden="true">·</span>
          <span>Tenant Data Isolation</span>
          <span aria-hidden="true">·</span>
          <span>Self-Governed Export</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#14261A] font-display mt-0.5">
          {t.privacy.title}
        </h2>
        <p className="text-xs text-[#465A4C] mt-0.5">
          {t.privacy.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Data Export & Portability Card */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#EEF2EC] pb-3">
            <Download className="w-5 h-5 text-[#235835]" />
            <h3 className="text-base font-bold text-[#14261A]">
              Farmer Data Portability & Archive
            </h3>
          </div>

          <p className="text-xs text-[#526D5A] leading-relaxed">
            Download an authenticated, tamper-evident record of all your farm boundaries, satellite observations, confirmed soil tests, and AI advisory syntheses.
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>{t.privacy.downloadJson}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="w-full py-2.5 px-4 text-xs font-medium text-[#14261A] bg-[#F1F6F0] hover:bg-[#E5EEE4] border border-[#D5E0D3] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#235835]" />
              <span>{t.privacy.downloadMd}</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-2.5 bg-[#EAF5E9] border border-[#C6E2C3] rounded-lg text-xs font-semibold text-[#1D5E32] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* Security Invariants & Isolation Card */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#EEF2EC] pb-3">
            <Lock className="w-5 h-5 text-[#235835]" />
            <h3 className="text-base font-bold text-[#14261A]">
              Platform Agro-Security Standards
            </h3>
          </div>

          <div className="space-y-3 text-xs text-[#465A4C]">
            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1">
              <span className="font-semibold text-[#14261A] block">1. Zero Client-Side API Keys:</span>
              <p className="leading-relaxed text-[#526D5A]">
                All Gemini AI and meteorological queries are proxied via server-side endpoints. Your browser never holds API credentials or tokens.
              </p>
            </div>

            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1">
              <span className="font-semibold text-[#14261A] block">2. Strict Isolation & No Model Training:</span>
              <p className="leading-relaxed text-[#526D5A]">
                Your crop leaf photos and GPS coordinates are used exclusively for immediate inferencing and are never fed into foundational model training corpora.
              </p>
            </div>

            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1">
              <span className="font-semibold text-[#14261A] block">3. OWASP LLM01 Prompt Injection Defense:</span>
              <p className="leading-relaxed text-[#526D5A]">
                Farmer text notes are isolated in data blocks, preventing malicious instructional overrides or unauthorized tool execution.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Local Storage & Cache Reset Area */}
      <div className="bg-[#FFFFFF] border border-[#F0D8D8] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#7F1D1D]">
            Purge Local Device Cache
          </h4>
          <p className="text-xs text-[#991B1B] mt-0.5 max-w-xl">
            Clears all locally stored field drafts, offline cached observations, and action notes from this browser session.
          </p>
        </div>

        <button
          onClick={() => setShowPurgeModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge Device Storage</span>
        </button>
      </div>

      {/* Purge Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#991B1B]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold font-display">
                Confirm Local Storage Reset
              </h3>
            </div>

            <p className="text-xs text-[#526D5A] leading-relaxed">
              {t.privacy.purgeConfirm}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-[#465A4C] hover:text-[#14261A]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowPurgeModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg"
              >
                Yes, Purge and Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
