import React, { useState } from 'react';
import { FarmField, Language, SatelliteObservation } from '../types/farmwatch';
import { translations, formatDate } from '../utils/i18n';
import { 
  TrendingDown, 
  CloudOff, 
  CheckCircle2, 
  Clock, 
  Layers, 
  RefreshCw, 
  Table as TableIcon, 
  BarChart3,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface SatelliteTimelineViewProps {
  selectedField: FarmField;
  onRefreshObservations: (simulateStress: boolean) => Promise<void>;
  language: Language;
}

export const SatelliteTimelineView: React.FC<SatelliteTimelineViewProps> = ({
  selectedField,
  onRefreshObservations,
  language,
}) => {
  const t = translations[language];
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedObs, setSelectedObs] = useState<SatelliteObservation | null>(
    selectedField.observations[selectedField.observations.length - 1] || null
  );

  const observations = selectedField.observations;

  const handleTriggerBackfill = async (simulateStress: boolean) => {
    setIsRefreshing(true);
    try {
      await onRefreshObservations(simulateStress);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter observations that have valid NDVI
  const validObservations = observations.filter(o => o.indicators.ndvi_median !== null);

  // SVG Chart Dimensions
  const chartWidth = 680;
  const chartHeight = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  // Scale: NDVI runs from 0.0 to 1.0
  const getY = (val: number) => padTop + (1.0 - val) * plotHeight;
  const getX = (index: number) => padLeft + (index / Math.max(1, observations.length - 1)) * plotWidth;

  // Build SVG polyline points for NDVI and NDMI
  const ndviPoints = observations
    .map((o, idx) => (o.indicators.ndvi_median !== null ? `${getX(idx)},${getY(o.indicators.ndvi_median)}` : null))
    .filter(Boolean)
    .join(' ');

  const ndmiPoints = observations
    .map((o, idx) => (o.indicators.ndmi_median !== null ? `${getX(idx)},${getY(o.indicators.ndmi_median)}` : null))
    .filter(Boolean)
    .join(' ');

  // Compute 3-observation baseline line for NDVI if enough points
  const baselineNdvi = selectedField.latestAlert?.explanation.baselineNdvi ?? 0.58;

  const getSupportStateLabel = (state: string) => {
    const key = state as keyof typeof t.common.supportStates;
    return t.common.supportStates[key] || state;
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Ingestion Simulation Controls */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
              <span>Sentinel-2 Harmonized (S2_SR_HARMONIZED)</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{t.common.gridRes}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{observations.length} {t.satellite.passesCataloged}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#14261A] font-display">
              {t.satellite.title}
            </h2>
            <p className="text-xs text-[#465A4C] mt-0.5">
              {t.satellite.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerBackfill(false)}
              disabled={isRefreshing}
              className="px-3 py-1.5 text-xs font-medium text-[#14261A] bg-[#F1F6F0] hover:bg-[#E5EEE4] rounded-lg transition-colors cursor-pointer border border-[#D5E0D3] flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.satellite.normalIngestion}</span>
            </button>
            <button
              onClick={() => handleTriggerBackfill(true)}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="Simulates rapid vegetative moisture decline on last 2 passes to test candidate alert generation"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t.satellite.simulateDecline}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Time-Series Visualization Card */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs space-y-4">
        
        {/* Toggle between Graph and Accessible Table */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-[#14261A]">{t.satellite.spectralIndicators}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#2E7D46] inline-block" />
              <span className="text-[#364D3E]">{t.satellite.ndviLegend}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#247BA0] inline-block" />
              <span className="text-[#364D3E]">{t.satellite.ndmiLegend}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#D97706] inline-block" />
              <span className="text-[#364D3E]">{t.satellite.baselineLegend} ({baselineNdvi})</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F1F5F0] rounded-lg text-xs">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                viewMode === 'chart' ? 'bg-white text-[#14261A] shadow-xs' : 'text-[#486350]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
              {t.satellite.graphBtn}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#14261A] shadow-xs' : 'text-[#486350]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 inline mr-1" />
              {t.satellite.tableBtn}
            </button>
          </div>
        </div>

        {viewMode === 'chart' ? (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[580px] max-h-[300px] select-none"
            >
              {/* Grid Lines and Y-Axis Ticks */}
              {[0.0, 0.25, 0.5, 0.75, 1.0].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="#E5EDE3"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      fontSize="10"
                      fill="#738B7B"
                      textAnchor="end"
                      className="font-mono tabular-nums"
                    >
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Baseline Reference Line */}
              <line
                x1={padLeft}
                y1={getY(baselineNdvi)}
                x2={chartWidth - padRight}
                y2={getY(baselineNdvi)}
                stroke="#D97706"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.8"
              />

              {/* NDMI Moisture Curve */}
              {ndmiPoints && (
                <polyline
                  points={ndmiPoints}
                  fill="none"
                  stroke="#247BA0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* NDVI Greenness Curve */}
              {ndviPoints && (
                <polyline
                  points={ndviPoints}
                  fill="none"
                  stroke="#2E7D46"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Observation Nodes */}
              {observations.map((obs, idx) => {
                const x = getX(idx);
                const hasValidNdvi = obs.indicators.ndvi_median !== null;
                const yNdvi = hasValidNdvi ? getY(obs.indicators.ndvi_median!) : null;
                const isSelected = selectedObs?.id === obs.id;

                const dateStr = obs.timestamps.acquired_at.slice(5, 10);

                return (
                  <g key={obs.id} className="cursor-pointer" onClick={() => setSelectedObs(obs)}>
                    {/* X-axis date tick */}
                    <text
                      x={x}
                      y={chartHeight - 10}
                      fontSize="10"
                      fill={isSelected ? '#14261A' : '#738B7B'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="font-mono tabular-nums"
                    >
                      {dateStr}
                    </text>

                    {/* Vertical guideline on hover/selection */}
                    {isSelected && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={chartHeight - padBottom}
                        stroke="#235835"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Node Circle */}
                    {hasValidNdvi ? (
                      <circle
                        cx={x}
                        cy={yNdvi!}
                        r={isSelected ? 6 : 4}
                        fill="#FFFFFF"
                        stroke="#2E7D46"
                        strokeWidth={isSelected ? 3 : 2}
                      />
                    ) : (
                      /* Cloud Exclusion Marker */
                      <g>
                        <circle
                          cx={x}
                          cy={getY(0.3)}
                          r="5"
                          fill="#FEE2E2"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={getY(0.3) + 3}
                          fontSize="8"
                          fill="#B91C1C"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          ✕
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          /* Accessible HTML Table Alternative for Screen Readers & Tabular Auditing */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E1E8DF] bg-[#F7FAF6] text-[#4A6452]">
                  <th className="p-2.5">{t.satellite.table.passDate}</th>
                  <th className="p-2.5">{t.satellite.table.ndviMedian}</th>
                  <th className="p-2.5">{t.satellite.table.ndmiMedian}</th>
                  <th className="p-2.5">{t.satellite.table.coreCoverage}</th>
                  <th className="p-2.5">{t.satellite.table.sclCloud}</th>
                  <th className="p-2.5">{t.satellite.table.supportState}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2EC] font-mono tabular-nums">
                {observations.map((obs) => (
                  <tr
                    key={obs.id}
                    onClick={() => setSelectedObs(obs)}
                    className={`cursor-pointer transition-colors ${
                      selectedObs?.id === obs.id ? 'bg-[#F0F7EE] font-semibold' : 'hover:bg-[#F9FCF8]'
                    }`}
                  >
                    <td className="p-2.5">{obs.timestamps.acquired_at.slice(0, 10)}</td>
                    <td className="p-2.5 text-[#2E7D46]">
                      {obs.indicators.ndvi_median ?? t.satellite.table.suppressed}
                    </td>
                    <td className="p-2.5 text-[#247BA0]">
                      {obs.indicators.ndmi_median ?? t.satellite.table.suppressed}
                    </td>
                    <td className="p-2.5">
                      {((obs.quality.coverage_core || 0) * 100).toFixed(0)}%
                    </td>
                    <td className="p-2.5">{obs.quality.scl_cloud_percentage}%</td>
                    <td className="p-2.5 font-sans">
                      <span className={`text-[11px] ${
                        obs.quality.support_state === 'sufficient_evidence'
                          ? 'text-[#2E7D46]'
                          : 'text-[#B45309]'
                      }`}>
                        {getSupportStateLabel(obs.quality.support_state)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 bg-[#F8FAF7] rounded-lg border border-[#E3EDE1] text-xs text-[#526D5A] flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-[#235835] shrink-0 mt-0.5" />
          <span>
            {t.satellite.baselineExplanation} {t.satellite.noticeCloud}
          </span>
        </div>
      </div>

      {/* Observation Deep Inspector Rail */}
      {selectedObs && (
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEF2EC] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#486350] uppercase tracking-wide">
                {t.satellite.inspector.title}
              </div>
              <h3 className="text-base font-bold text-[#14261A] font-mono">
                {selectedObs.id}
              </h3>
            </div>
            <div className="text-xs text-[#526D5A] font-mono tabular-nums">
              {t.satellite.inspector.acquired} {formatDate(selectedObs.timestamps.acquired_at, language)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Spectral Reflectance Values */}
            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1.5">
              <span className="font-semibold text-[#14261A] block">{t.satellite.inspector.bandReflectances}</span>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.b4Label}</span>
                <span className="font-mono tabular-nums text-[#14261A]">{selectedObs.bands.b4_red_reflectance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.b8Label}</span>
                <span className="font-mono tabular-nums text-[#14261A]">{selectedObs.bands.b8_nir_reflectance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.b11Label}</span>
                <span className="font-mono tabular-nums text-[#14261A]">{selectedObs.bands.b11_swir_reflectance}</span>
              </div>
            </div>

            {/* Quality & Cloud Metrics */}
            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1.5">
              <span className="font-semibold text-[#14261A] block">{t.satellite.inspector.sceneQuality}</span>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.cloudPct}</span>
                <span className="font-mono tabular-nums text-[#14261A]">{selectedObs.quality.scl_cloud_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.shadowPct}</span>
                <span className="font-mono tabular-nums text-[#14261A]">{selectedObs.quality.scl_shadow_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.coreSupport}</span>
                <span className="font-mono tabular-nums text-[#14261A]">{((selectedObs.quality.coverage_core || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Pixel Support Verification */}
            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1.5">
              <span className="font-semibold text-[#14261A] block">{t.satellite.inspector.supportInvariants}</span>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.validPixels}</span>
                <span className="font-mono tabular-nums text-[#14261A]">
                  {selectedObs.quality.valid_pixel_count} / {selectedObs.quality.total_pixel_count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.supportState}</span>
                <span className={`font-semibold ${selectedObs.quality.support_state === 'sufficient_evidence' ? 'text-[#2E7D46]' : 'text-[#B45309]'}`}>
                  {getSupportStateLabel(selectedObs.quality.support_state)}
                </span>
              </div>
            </div>

            {/* Computed Indices */}
            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1.5">
              <span className="font-semibold text-[#14261A] block">{t.satellite.inspector.derivedIndices}</span>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.ndviMedian}</span>
                <span className="font-mono tabular-nums font-bold text-[#2E7D46]">
                  {selectedObs.indicators.ndvi_median ?? 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657E6D]">{t.satellite.inspector.ndmiMedian}</span>
                <span className="font-mono tabular-nums font-bold text-[#247BA0]">
                  {selectedObs.indicators.ndmi_median ?? 'N/A'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
