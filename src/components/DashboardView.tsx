import React from 'react';
import { FarmField, Language, WeatherContext } from '../types/farmwatch';
import { translations, formatDate } from '../utils/i18n';
import { 
  AlertTriangle, 
  CheckCircle2, 
  CloudSun, 
  MapPin, 
  Layers, 
  Camera, 
  ClipboardList, 
  ArrowRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  fields: FarmField[];
  selectedField: FarmField;
  onSelectField: (field: FarmField) => void;
  language: Language;
  weather: WeatherContext | null;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  fields,
  selectedField,
  onSelectField,
  language,
  weather,
  onNavigate,
}) => {
  const t = translations[language];

  // Latest observation on selected field
  const latestObs = selectedField.observations[selectedField.observations.length - 1];
  const hasAlert = Boolean(selectedField.latestAlert);

  const getCropName = (f: FarmField) =>
    language === 'hi' ? f.activeSeason.cropNameHi : f.activeSeason.cropNameEn;

  const getIrrigationLabel = (method: string) => {
    const key = method as keyof typeof t.common.irrigations;
    return t.common.irrigations[key] || method;
  };

  return (
    <div className="space-y-6">
      
      {/* Hero / Context Banner (Anti-Slop: single elevation, editorial typography) */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
              <span>{t.dashboard.tenantBadge}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{fields.length} {t.dashboard.monitoredParcels}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{t.dashboard.sentinelTag}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#14261A] font-display">
              {t.dashboard.title}
            </h1>
            <p className="text-sm text-[#465A4C] max-w-2xl">
              {t.dashboard.welcome}
            </p>
          </div>

          {/* Field Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="field-select" className="text-xs font-medium text-[#465A4C] shrink-0">
              {t.common.activeField}:
            </label>
            <select
              id="field-select"
              value={selectedField.id}
              onChange={(e) => {
                const found = fields.find((f) => f.id === e.target.value);
                if (found) onSelectField(found);
              }}
              className="bg-[#F6FAF5] border border-[#CAD6C8] text-[#14261A] text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-[#235835] focus:ring-1 focus:ring-[#235835] cursor-pointer"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fieldName} ({f.currentGeometry.areaHa} {t.common.hectares} - {getCropName(f)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Priority Alert Spotlight (If vegetative drop detected) */}
      {hasAlert && selectedField.latestAlert ? (
        <div className="bg-[#FFFBF5] border-l-4 border-l-[#D97706] border border-[#F3E2C9] rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-[#FDF2DF] text-[#B45309] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#B45309]">
                  <span>{t.common.inspectField}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{t.common.rule}: {selectedField.latestAlert.rule_version}</span>
                </div>
                <h3 className="text-base font-bold text-[#78350F]">
                  {language === 'hi' ? t.dashboard.alertTitle : selectedField.latestAlert.title}
                </h3>
                <p className="text-xs text-[#92400E] max-w-3xl leading-relaxed">
                  {language === 'hi' ? t.dashboard.alertExplanation : selectedField.latestAlert.explanation.qualifyingCriteriaMet}. Baseline NDVI:{' '}
                  <span className="font-mono tabular-nums font-semibold">{selectedField.latestAlert.explanation.baselineNdvi}</span>,
                  Latest NDVI:{' '}
                  <span className="font-mono tabular-nums font-semibold">{selectedField.latestAlert.explanation.latestNdvi}</span>{' '}
                  (Relative drop:{' '}
                  <span className="font-mono tabular-nums font-semibold">{selectedField.latestAlert.explanation.relativeDeltaPercent}%</span>).
                </p>
                <div className="text-[11px] text-[#A16207] italic pt-0.5">
                  {language === 'hi' ? t.dashboard.alertDisclaimer : selectedField.latestAlert.explanation.disclaimer}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => onNavigate('ai')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.dashboard.uploadLeafPhoto}</span>
              </button>
              <button
                onClick={() => onNavigate('actions')}
                className="px-3.5 py-2 text-xs font-medium text-[#78350F] bg-[#FDF2DF] hover:bg-[#FBE4BE] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{t.dashboard.logInspection}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#F9FCF8] border border-[#DEEADE] rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2E7D46] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#183820]">
                {t.dashboard.noAlertsNotice}
              </p>
              <p className="text-xs text-[#526D5A]">
                Latest median NDVI: <span className="font-mono tabular-nums font-medium">{latestObs?.indicators.ndvi_median ?? 'N/A'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('satellite')}
            className="text-xs font-semibold text-[#235835] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t.dashboard.viewTimeline}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Key Analytical Context (Single elevation, zero-pill) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Parcel Identity & Geometry Support */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
              {t.dashboard.parcelGeometry}
            </span>
            <button
              onClick={() => onNavigate('fields')}
              className="text-xs text-[#235835] font-semibold hover:underline"
            >
              {t.dashboard.openGis}
            </button>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#14261A] truncate">
              {selectedField.fieldName}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-[#526D5A] mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#235835]" />
              <span className="truncate">{selectedField.locationName}</span>
            </div>
          </div>

          <div className="border-t border-[#EEF2EC] pt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#657E6D] block">{t.dashboard.geodesicArea}</span>
              <span className="font-semibold text-[#14261A] font-mono tabular-nums">
                {selectedField.currentGeometry.areaHa} {t.common.hectares}
              </span>
            </div>
            <div>
              <span className="text-[#657E6D] block">{t.dashboard.cropVariety}</span>
              <span className="font-semibold text-[#14261A] truncate block">
                {getCropName(selectedField)}
              </span>
            </div>
            <div>
              <span className="text-[#657E6D] block">{t.dashboard.sowingLabel}</span>
              <span className="font-semibold text-[#14261A] font-mono tabular-nums">
                {selectedField.activeSeason.sowingDate}
              </span>
            </div>
            <div>
              <span className="text-[#657E6D] block">{t.dashboard.irrigationSystem}</span>
              <span className="font-semibold text-[#14261A] capitalize">
                {getIrrigationLabel(selectedField.activeSeason.irrigationMethod)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Latest Satellite Evidence & Quality */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
              {t.dashboard.sentinelIndices}
            </span>
            <button
              onClick={() => onNavigate('satellite')}
              className="text-xs text-[#235835] font-semibold hover:underline"
            >
              {t.common.history} ({selectedField.observations.length})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
              <span className="text-[11px] text-[#556F5D] block">{t.satellite.ndviLegend}</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#14261A]">
                {latestObs?.indicators.ndvi_median ?? 'N/A'}
              </span>
              <span className="text-[10px] text-[#698572] block mt-0.5">
                p10: {latestObs?.indicators.ndvi_p10 ?? '-'} · p90: {latestObs?.indicators.ndvi_p90 ?? '-'}
              </span>
            </div>

            <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
              <span className="text-[11px] text-[#556F5D] block">{t.satellite.ndmiLegend}</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#14261A]">
                {latestObs?.indicators.ndmi_median ?? 'N/A'}
              </span>
              <span className="text-[10px] text-[#698572] block mt-0.5">
                p10: {latestObs?.indicators.ndmi_p10 ?? '-'} · p90: {latestObs?.indicators.ndmi_p90 ?? '-'}
              </span>
            </div>
          </div>

          <div className="border-t border-[#EEF2EC] pt-2 text-xs text-[#4E6756] flex items-center justify-between">
            <span>{t.dashboard.corePixelsSupport}</span>
            <span className="font-mono tabular-nums font-semibold text-[#14261A]">
              {latestObs?.quality.valid_pixel_count}/{latestObs?.quality.total_pixel_count} ({((latestObs?.quality.coverage_core || 0) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Card 3: Regional Weather Outlook */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
              {t.dashboard.agroWeatherTitle}
            </span>
            <button
              onClick={() => onNavigate('soilWeather')}
              className="text-xs text-[#235835] font-semibold hover:underline"
            >
              {t.dashboard.sevenDayView}
            </button>
          </div>

          {weather ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono tabular-nums text-[#14261A]">
                    {weather.summary.currentTemp}°C
                  </span>
                  <p className="text-xs text-[#526D5A]">
                    {t.dashboard.high}: {weather.summary.maxTempUpcoming}°C · {t.dashboard.low}: {weather.summary.minTempUpcoming}°C
                  </p>
                </div>
                <div className="p-2.5 bg-[#EFF7F0] rounded-lg text-[#235835]">
                  <CloudSun className="w-6 h-6" />
                </div>
              </div>

              <div className="border-t border-[#EEF2EC] pt-2.5 text-xs text-[#526D5A] space-y-1">
                <div className="flex justify-between">
                  <span>{t.dashboard.recentRain}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#14261A]">
                    {weather.summary.recentPrecipitationSum.toFixed(1)} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.dashboard.forecastRain}</span>
                  <span className="font-mono tabular-nums font-semibold text-[#14261A]">
                    {weather.summary.forecastPrecipitationSum.toFixed(1)} mm
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#6A8171] py-4 text-center">
              {t.dashboard.fetchingWeather}
            </div>
          )}
        </div>
      </div>

      {/* 6 Timestamps Provenance Ledger (Document 07 Requirement R21) */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#235835]" />
            <h3 className="text-sm font-bold text-[#14261A]">
              {t.satellite.sixTimestampsTitle}
            </h3>
          </div>
          <span className="text-xs text-[#5C7564]">
            {t.dashboard.asset} <span className="font-mono text-[#14261A]">{latestObs?.id || 'N/A'}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E8EFE6]">
            <span className="text-[#657E6D] text-[11px] block">{t.dashboard.timestamps.t1}</span>
            <span className="font-mono font-medium text-[#14261A] tabular-nums block mt-0.5">
              {formatDate(latestObs?.timestamps.acquired_at, language)}
            </span>
          </div>

          <div className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E8EFE6]">
            <span className="text-[#657E6D] text-[11px] block">{t.dashboard.timestamps.t2}</span>
            <span className="font-mono font-medium text-[#14261A] tabular-nums block mt-0.5">
              {formatDate(latestObs?.timestamps.published_at, language)}
            </span>
          </div>

          <div className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E8EFE6]">
            <span className="text-[#657E6D] text-[11px] block">{t.dashboard.timestamps.t3}</span>
            <span className="font-mono font-medium text-[#14261A] tabular-nums block mt-0.5">
              {formatDate(latestObs?.timestamps.ingested_at, language)}
            </span>
          </div>

          <div className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E8EFE6]">
            <span className="text-[#657E6D] text-[11px] block">{t.dashboard.timestamps.t4}</span>
            <span className="font-mono font-medium text-[#14261A] tabular-nums block mt-0.5">
              {formatDate(latestObs?.timestamps.last_usable_at, language)}
            </span>
          </div>

          <div className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E8EFE6]">
            <span className="text-[#657E6D] text-[11px] block">{t.dashboard.timestamps.t5}</span>
            <span className="font-mono font-medium text-[#14261A] tabular-nums block mt-0.5">
              {formatDate(latestObs?.timestamps.processed_at, language)}
            </span>
          </div>

          <div className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E8EFE6]">
            <span className="text-[#657E6D] text-[11px] block">{t.dashboard.timestamps.t6}</span>
            <span className="font-mono font-medium text-[#14261A] tabular-nums block mt-0.5">
              {formatDate(selectedField.recentAdvisory?.generated_at, language)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#698572] mt-3">
          <Info className="w-3 h-3 inline mr-1 text-[#235835]" />
          {t.dashboard.timestamps.notice}
        </p>
      </div>

    </div>
  );
};
