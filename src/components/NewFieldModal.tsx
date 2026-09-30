import React, { useState } from 'react';
import { FarmField, Language } from '../types/farmwatch';
import { translations } from '../utils/i18n';

interface NewFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: FarmField) => void;
  language: Language;
}

export const NewFieldModal: React.FC<NewFieldModalProps> = ({
  isOpen,
  onClose,
  onAddField,
  language,
}) => {
  const t = translations[language];

  const [farmName, setFarmName] = useState('Godavari Agri Bio-Farm');
  const [fieldName, setFieldName] = useState('Plot 5B - Mustard & Gram');
  const [locationName, setLocationName] = useState('Nashik, Maharashtra');
  const [cropNameEn, setCropNameEn] = useState('Mustard (Pusa Bold)');
  const [cropNameHi, setCropNameHi] = useState('सरसों (पूसा बोल्ड)');
  const [sowingDate, setSowingDate] = useState('2026-09-01');
  const [irrigation, setIrrigation] = useState<'drip' | 'sprinkler' | 'flood' | 'rainfed'>('drip');
  const [areaHa, setAreaHa] = useState(1.15);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFieldId = `FIELD-${Date.now().toString(36).toUpperCase()}`;

    // Base coordinates around Nashik with offset
    const baseLng = 73.7920;
    const baseLat = 19.9985;
    const delta = Math.sqrt(areaHa) * 0.001;

    const newField: FarmField = {
      id: newFieldId,
      farmName: farmName.trim(),
      fieldName: fieldName.trim(),
      locationName: locationName.trim(),
      currentGeometry: {
        id: `GEOM-${Date.now().toString(36).toUpperCase()}`,
        version: 1,
        areaHa: Number(areaHa),
        createdAt: new Date().toISOString(),
        coordinates: [
          { lng: baseLng, lat: baseLat },
          { lng: baseLng + delta, lat: baseLat },
          { lng: baseLng + delta * 1.1, lat: baseLat + delta * 0.9 },
          { lng: baseLng + delta * 0.1, lat: baseLat + delta * 1.1 },
        ]
      },
      activeSeason: {
        id: `SEASON-${Date.now().toString(36).toUpperCase()}`,
        fieldId: newFieldId,
        cropCode: 'MUSTARD_RABI',
        cropNameEn: cropNameEn.trim(),
        cropNameHi: cropNameHi.trim(),
        sowingDate: sowingDate,
        irrigationMethod: irrigation,
        status: 'active',
      },
      soilReport: {
        id: `SOIL-${Date.now().toString(36).toUpperCase()}`,
        seasonId: `SEASON-${Date.now().toString(36).toUpperCase()}`,
        sampledOn: '2026-08-25',
        labName: 'Nashik District Soil Lab',
        ph: 7.3,
        organicCarbonPercent: 0.58,
        availableNitrogenKgHa: 225,
        availablePhosphorusKgHa: 19.0,
        availablePotassiumKgHa: 310,
        electricalConductivityDsM: 0.40,
        confirmedByFarmer: true,
        confirmedAt: new Date().toISOString(),
      },
      observations: [
        {
          id: `S2A_MSIL2A_${Date.now().toString(36).slice(0, 8)}_1`,
          provider: 'Copernicus Sentinel-2 Harmonized',
          collection: 'COPERNICUS/S2_SR_HARMONIZED',
          timestamps: {
            acquired_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            ingested_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
            last_usable_at: new Date().toISOString(),
          },
          quality: {
            scl_cloud_percentage: 2.5,
            scl_shadow_percentage: 0.4,
            coverage_full: 0.97,
            coverage_core: 0.93,
            valid_pixel_count: Math.round((areaHa * 10000) / 400 * 0.9),
            total_pixel_count: Math.round((areaHa * 10000) / 400),
            grid_resolution_meters: 20,
            support_state: 'sufficient_evidence',
            exclusion_reasons: [],
          },
          bands: { b4_red_reflectance: 0.110, b8_nir_reflectance: 0.420, b11_swir_reflectance: 0.210 },
          indicators: {
            ndvi_median: 0.585,
            ndvi_p10: 0.550,
            ndvi_p90: 0.620,
            ndmi_median: 0.333,
            ndmi_p10: 0.300,
            ndmi_p90: 0.360,
          }
        }
      ],
      latestAlert: null,
      actions: [],
      recentAdvisory: null,
    };

    onAddField(newField);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-2">
          <h3 className="text-base font-bold text-[#14261A] font-display">
            Onboard New Farm Parcel
          </h3>
          <button onClick={onClose} className="text-[#657E6D] hover:text-[#14261A] text-lg font-bold">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#486350] font-semibold block mb-1">Farm Name</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                required
              />
            </div>
            <div>
              <label className="text-[#486350] font-semibold block mb-1">Field / Plot Name</label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[#486350] font-semibold block mb-1">Location / District</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#486350] font-semibold block mb-1">Crop (English)</label>
              <input
                type="text"
                value={cropNameEn}
                onChange={(e) => setCropNameEn(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                required
              />
            </div>
            <div>
              <label className="text-[#486350] font-semibold block mb-1">Crop (हिन्दी)</label>
              <input
                type="text"
                value={cropNameHi}
                onChange={(e) => setCropNameHi(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[#486350] font-semibold block mb-1">Area (Hectares)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1">Sowing Date</label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1">Irrigation Method</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value as any)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
              >
                <option value="drip">Drip</option>
                <option value="sprinkler">Sprinkler</option>
                <option value="flood">Flood</option>
                <option value="rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF2EC]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#465A4C] hover:text-[#14261A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg cursor-pointer"
            >
              Onboard & Begin Sentinel Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
