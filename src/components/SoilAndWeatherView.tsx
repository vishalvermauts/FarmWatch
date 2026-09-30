import React, { useState } from 'react';
import { FarmField, Language, WeatherContext } from '../types/farmwatch';
import { translations, formatDate } from '../utils/i18n';
import { 
  CloudSun, 
  Droplets, 
  Thermometer, 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface SoilAndWeatherViewProps {
  selectedField: FarmField;
  weather: WeatherContext | null;
  onUpdateSoilReport: (updatedSoil: any) => void;
  language: Language;
}

export const SoilAndWeatherView: React.FC<SoilAndWeatherViewProps> = ({
  selectedField,
  weather,
  onUpdateSoilReport,
  language,
}) => {
  const t = translations[language];

  const [soilForm, setSoilForm] = useState({
    ph: selectedField.soilReport.ph,
    organicCarbonPercent: selectedField.soilReport.organicCarbonPercent,
    availableNitrogenKgHa: selectedField.soilReport.availableNitrogenKgHa,
    availablePhosphorusKgHa: selectedField.soilReport.availablePhosphorusKgHa,
    availablePotassiumKgHa: selectedField.soilReport.availablePotassiumKgHa,
    electricalConductivityDsM: selectedField.soilReport.electricalConductivityDsM,
    labName: selectedField.soilReport.labName || (language === 'hi' ? 'जिला मृदा परीक्षण केंद्र' : 'District Soil Testing Center'),
  });

  const [isEditingSoil, setIsEditingSoil] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSoil = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSoilReport({
      ...selectedField.soilReport,
      ...soilForm,
      confirmedByFarmer: true,
      confirmedAt: new Date().toISOString(),
    });
    setIsEditingSoil(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
          <span>{t.soilWeather.tags.model}</span>
          <span aria-hidden="true">·</span>
          <span>{t.soilWeather.tags.soilCard}</span>
          <span aria-hidden="true">·</span>
          <span>{t.soilWeather.tags.regional}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#14261A] font-display mt-0.5">
          {t.soilWeather.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Regional Weather Outlook */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-3">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-[#235835]" />
              <h3 className="text-base font-bold text-[#14261A]">
                {t.soilWeather.weatherCardTitle}
              </h3>
            </div>
            <span className="text-[11px] text-[#5C7564] font-mono tabular-nums">
              {t.soilWeather.coordsLabel} {weather?.coordinates?.latitude ?? 19.99}°, {weather?.coordinates?.longitude ?? 73.78}°
            </span>
          </div>

          {weather ? (
            <div className="space-y-4">
              
              {/* Current Overview Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#F6FAF5] rounded-xl border border-[#DEEADE] text-center">
                <div>
                  <span className="text-[11px] text-[#556F5D] block">{t.soilWeather.currentTemp}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {weather.summary.currentTemp}°C
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#556F5D] block">{t.soilWeather.past3DaysRain}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {weather.summary.recentPrecipitationSum.toFixed(1)} mm
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#556F5D] block">{t.soilWeather.next4DaysRain}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {weather.summary.forecastPrecipitationSum.toFixed(1)} mm
                  </span>
                </div>
              </div>

              {/* 7-Day Forecast Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#486350] tracking-wide uppercase block">
                  {t.soilWeather.precipTemp7Day}
                </span>
                <div className="space-y-1.5 text-xs font-mono tabular-nums">
                  {weather.daily?.time?.slice(0, 7).map((date, idx) => {
                    const maxT = weather.daily?.temperature_2m_max?.[idx] ?? 30;
                    const minT = weather.daily?.temperature_2m_min?.[idx] ?? 20;
                    const rain = weather.daily?.precipitation_sum?.[idx] ?? 0;
                    const isToday = idx === 3;

                    return (
                      <div
                        key={date}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          isToday ? 'bg-[#F0F7EE] border-[#CDE3CB] font-semibold' : 'bg-[#FAFCF9] border-[#E8EFE6]'
                        }`}
                      >
                        <span className="w-24 text-[#14261A]">
                          {date} {isToday ? t.soilWeather.today : ''}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#3F5B46]">
                            {minT}°C / {maxT}°C
                          </span>
                          <span className={`w-16 text-right ${rain > 0 ? 'text-[#1E658E] font-bold' : 'text-[#859B8B]'}`}>
                            {rain.toFixed(1)} mm
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Notice */}
              <div className="p-3 bg-[#F8FAF7] border border-[#DEE6DD] rounded-lg text-[11px] text-[#556F5D] leading-relaxed">
                <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-[#235835]" />
                {t.soilWeather.weatherNotice}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#526D5A]">
              {t.soilWeather.loadingWeather}
            </div>
          )}
        </div>

        {/* Right Card: Confirmed Laboratory Soil Test Report */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#235835]" />
              <h3 className="text-base font-bold text-[#14261A]">
                {t.soilWeather.soilCardTitle}
              </h3>
            </div>
            {selectedField.soilReport.confirmedByFarmer && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#2E7D46]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.soilWeather.confirmedBadge}</span>
              </span>
            )}
          </div>

          {/* Form / Display */}
          {!isEditingSoil ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F9FCF8] rounded-xl border border-[#E7EFE6] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#657E6D]">{t.soilWeather.testingLabLabel}</span>
                  <span className="font-semibold text-[#14261A]">{selectedField.soilReport.labName || (language === 'hi' ? 'प्रमाणित मृदा प्रयोगशाला' : 'Certified Soil Lab')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#657E6D]">{t.soilWeather.sampledOnLabel}</span>
                  <span className="font-mono tabular-nums text-[#14261A]">{selectedField.soilReport.sampledOn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#657E6D]">{t.soilWeather.farmerConfirmLabel}</span>
                  <span className="font-mono tabular-nums text-[#14261A]">
                    {formatDate(selectedField.soilReport.confirmedAt, language)}
                  </span>
                </div>
              </div>

              {/* Analyte Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
                  <span className="text-[#657E6D] text-[11px] block">{t.soilWeather.soilPh}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {selectedField.soilReport.ph}
                  </span>
                  <span className="text-[10px] text-[#556F5D] block mt-0.5">{t.soilWeather.optimalRangePh}</span>
                </div>

                <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
                  <span className="text-[#657E6D] text-[11px] block">{t.soilWeather.organicCarbon}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {selectedField.soilReport.organicCarbonPercent}%
                  </span>
                  <span className="text-[10px] text-[#556F5D] block mt-0.5">{t.soilWeather.adequateOc}</span>
                </div>

                <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
                  <span className="text-[#657E6D] text-[11px] block">{t.soilWeather.nitrogen}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {selectedField.soilReport.availableNitrogenKgHa} kg/ha
                  </span>
                  <span className="text-[10px] text-[#556F5D] block mt-0.5">{t.soilWeather.lowN}</span>
                </div>

                <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
                  <span className="text-[#657E6D] text-[11px] block">{t.soilWeather.phosphorus}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {selectedField.soilReport.availablePhosphorusKgHa} kg/ha
                  </span>
                  <span className="text-[10px] text-[#556F5D] block mt-0.5">{t.soilWeather.medP}</span>
                </div>

                <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
                  <span className="text-[#657E6D] text-[11px] block">{t.soilWeather.potassium}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {selectedField.soilReport.availablePotassiumKgHa} kg/ha
                  </span>
                  <span className="text-[10px] text-[#556F5D] block mt-0.5">{t.soilWeather.highK}</span>
                </div>

                <div className="p-3 bg-[#F6FAF5] rounded-lg border border-[#E3EDE1]">
                  <span className="text-[#657E6D] text-[11px] block">{t.soilWeather.ec}</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-[#14261A]">
                    {selectedField.soilReport.electricalConductivityDsM} dS/m
                  </span>
                  <span className="text-[10px] text-[#556F5D] block mt-0.5">{t.soilWeather.nonSalineEc}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsEditingSoil(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer"
                >
                  {t.soilWeather.editSoilBtn}
                </button>

                {saveSuccess && (
                  <span className="text-xs text-[#2E7D46] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.soilWeather.valuesConfirmedSuccess}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveSoil} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.soilPh}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilForm.ph}
                    onChange={(e) => setSoilForm({ ...soilForm, ph: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.organicCarbon} %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={soilForm.organicCarbonPercent}
                    onChange={(e) => setSoilForm({ ...soilForm, organicCarbonPercent: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.nitrogen} (kg/ha)</label>
                  <input
                    type="number"
                    value={soilForm.availableNitrogenKgHa}
                    onChange={(e) => setSoilForm({ ...soilForm, availableNitrogenKgHa: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.phosphorus} (kg/ha)</label>
                  <input
                    type="number"
                    value={soilForm.availablePhosphorusKgHa}
                    onChange={(e) => setSoilForm({ ...soilForm, availablePhosphorusKgHa: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.potassium} (kg/ha)</label>
                  <input
                    type="number"
                    value={soilForm.availablePotassiumKgHa}
                    onChange={(e) => setSoilForm({ ...soilForm, availablePotassiumKgHa: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.ec} (dS/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={soilForm.electricalConductivityDsM}
                    onChange={(e) => setSoilForm({ ...soilForm, electricalConductivityDsM: Number(e.target.value) })}
                    className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#556F5D] font-medium block mb-1">{t.soilWeather.formLabName}</label>
                <input
                  type="text"
                  value={soilForm.labName}
                  onChange={(e) => setSoilForm({ ...soilForm, labName: e.target.value })}
                  className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSoil(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#526D5A] hover:text-[#14261A]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg cursor-pointer"
                >
                  {t.soilWeather.confirmButton}
                </button>
              </div>
            </form>
          )}

          {/* Scientific Boundary Notice */}
          <div className="p-3 bg-[#F8FAF7] border border-[#DEE6DD] rounded-lg text-[11px] text-[#556F5D] leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-[#235835]" />
            {t.soilWeather.soilNotice}
          </div>
        </div>

      </div>

    </div>
  );
};
