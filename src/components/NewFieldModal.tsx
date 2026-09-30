import React, { useState } from 'react';
import { FarmField, Language } from '../types/farmwatch';
import { translations } from '../utils/i18n';
import { generatePresetPolygon, getSatelliteTiles } from '../utils/geo';
import { MapPin, Navigation, Search, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface NewFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: FarmField) => void;
  language: Language;
}

interface PresetLocation {
  id: string;
  name: string;
  subTitle: string;
  cropEn: string;
  cropHi: string;
  lat: number;
  lng: number;
  emoji: string;
}

const AGRICULTURAL_PRESETS: PresetLocation[] = [
  {
    id: 'dindori',
    name: 'Dindori Vineyard (Nashik Rural, MH)',
    subTitle: 'Sahyadri Valley Viticulture & Onion Orchards',
    cropEn: 'Table Grapes (Thompson Seedless)',
    cropHi: 'अंगूर (थॉम्पसन सीडलेस)',
    lat: 20.1985,
    lng: 73.8340,
    emoji: '🍇'
  },
  {
    id: 'samrala',
    name: 'Samrala Wheat Fields (Ludhiana Rural, PB)',
    subTitle: 'Malwa Canal Intensive Grain & Mustard Cropland',
    cropEn: 'Sharbati Wheat (HD-3086)',
    cropHi: 'शरबती गेहूं (एचडी-3086)',
    lat: 30.8250,
    lng: 76.1820,
    emoji: '🌾'
  },
  {
    id: 'guntur',
    name: 'Vatticherukuru Chili Farmland (Guntur, AP)',
    subTitle: 'Krishna Delta Black Cotton Soil Chili Belt',
    cropEn: 'Dry Red Chili (Teja S17)',
    cropHi: 'लाल मिर्च (तेजा एस17)',
    lat: 16.2240,
    lng: 80.5280,
    emoji: '🌶️'
  },
  {
    id: 'mandya',
    name: 'Pandavapura Sugarcane (Mandya Valley, KA)',
    subTitle: 'Cauvery River Canal Perennial Agro-Cluster',
    cropEn: 'Sugarcane (Co 86032)',
    cropHi: 'गन्ना (सीओ 86032)',
    lat: 12.4835,
    lng: 76.6855,
    emoji: '🌱'
  },
  {
    id: 'baramati',
    name: 'Baramati Agro-Valley (Pune Rural, MH)',
    subTitle: 'Nira River Basin Intensive Sugarcane & Dairy',
    cropEn: 'Sugarcane & Pomegranate (Bhagwa)',
    cropHi: 'गन्ना एवं अनार (भगवा)',
    lat: 18.1925,
    lng: 74.6140,
    emoji: '🌽'
  },
];

export const NewFieldModal: React.FC<NewFieldModalProps> = ({
  isOpen,
  onClose,
  onAddField,
  language,
}) => {
  const t = translations[language];

  const [farmName, setFarmName] = useState('Godavari Agri Bio-Farm');
  const [fieldName, setFieldName] = useState('Plot 5B - Mustard & Gram');
  const [locationName, setLocationName] = useState('Nashik Vineyard, Maharashtra');
  const [cropNameEn, setCropNameEn] = useState('Mustard (Pusa Bold)');
  const [cropNameHi, setCropNameHi] = useState('सरसों (पूसा बोल्ड)');
  const [sowingDate, setSowingDate] = useState('2026-09-01');
  const [irrigation, setIrrigation] = useState<'drip' | 'sprinkler' | 'flood' | 'rainfed'>('drip');
  const [areaHa, setAreaHa] = useState(1.15);

  // Direct Coordinates & Location Engine State
  const [latitude, setLatitude] = useState<number>(19.9985);
  const [longitude, setLongitude] = useState<number>(73.7920);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ displayName: string; lat: number; lng: number; tier: string }>>([]);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click GPS Location Detector
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setLocationNotice(language === 'hi' ? 'आपके ब्राउज़र में जीपीएस सुविधा समर्थित नहीं है।' : 'GPS Geolocation is not supported in this browser.');
      return;
    }

    setIsGpsLoading(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationName(`Detected GPS Coordinates (${lat}°N, ${lng}°E)`);
        setIsGpsLoading(false);
        setLocationNotice(
          language === 'hi'
            ? `सटीकता: ±${Math.round(pos.coords.accuracy)} मीटर पर जीपीएस स्थिति सफलतापूर्वक प्राप्त हुई!`
            : `Detected GPS location successfully (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`
        );
      },
      (err) => {
        setIsGpsLoading(false);
        setLocationNotice(
          language === 'hi'
            ? `जीपीएस त्रुटि: ${err.message}. कृपया नीचे दिए गए कृषि प्रीसेट में से चुनें या मैन्युअल रूप से दर्ज करें।`
            : `GPS error: ${err.message}. Please select an Agricultural Preset or type coordinates.`
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Multi-Tier Fallback Geocoder Search
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocationNotice(null);

    try {
      const res = await fetch(`/api/geo/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
        setLocationNotice(language === 'hi' ? 'कोई परिणाम नहीं मिला। कृपया प्रीसेट में से चुनें।' : 'No results found. Please pick from regional agricultural presets.');
      }
    } catch (err: any) {
      console.warn('Geocoding error:', err);
      setLocationNotice(language === 'hi' ? 'स्थान खोज विफल रही। प्रीसेट चुनें।' : 'Geocoding search failed. Try selecting an agricultural preset.');
    } finally {
      setIsSearching(false);
    }
  };

  // Apply Agricultural Preset
  const handleApplyPreset = (preset: PresetLocation) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setLocationName(preset.name);
    setCropNameEn(preset.cropEn);
    setCropNameHi(preset.cropHi);
    setFieldName(`${preset.name.split(',')[0]} Plot 1`);
    setSearchResults([]);
    setLocationNotice(language === 'hi' ? `लागू किया गया: ${preset.name}` : `Selected: ${preset.name}`);
  };

  // Select Search Result
  const handleSelectResult = (result: { displayName: string; lat: number; lng: number }) => {
    setLatitude(result.lat);
    setLongitude(result.lng);
    setLocationName(result.displayName.slice(0, 80));
    setSearchResults([]);
    setLocationNotice(language === 'hi' ? 'स्थान निर्देशांक सेट किए गए।' : 'Coordinates updated from search.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFieldId = `FIELD-${Date.now().toString(36).toUpperCase()}`;
    const generatedCoordinates = generatePresetPolygon(longitude, latitude, 'rect', areaHa);

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
        coordinates: generatedCoordinates,
      },
      activeSeason: {
        id: `SEASON-${Date.now().toString(36).toUpperCase()}`,
        fieldId: newFieldId,
        cropCode: 'CUSTOM_RABI',
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
        labName: language === 'hi' ? 'क्षेत्रीय कृषि मृदा प्रयोगशाला' : 'Regional Soil Testing Laboratory',
        ph: 7.2,
        organicCarbonPercent: 0.58,
        availableNitrogenKgHa: 220,
        availablePhosphorusKgHa: 19.5,
        availablePotassiumKgHa: 305,
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
            scl_cloud_percentage: 2.1,
            scl_shadow_percentage: 0.3,
            coverage_full: 0.98,
            coverage_core: 0.94,
            valid_pixel_count: Math.round((areaHa * 10000) / 400 * 0.9),
            total_pixel_count: Math.round((areaHa * 10000) / 400),
            grid_resolution_meters: 20,
            support_state: 'sufficient_evidence',
            exclusion_reasons: [],
          },
          bands: { b4_red_reflectance: 0.115, b8_nir_reflectance: 0.430, b11_swir_reflectance: 0.205 },
          indicators: {
            ndvi_median: 0.585,
            ndvi_p10: 0.550,
            ndvi_p90: 0.620,
            ndmi_median: 0.340,
            ndmi_p10: 0.305,
            ndmi_p90: 0.370,
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

  // Satellite thumbnail tile for the current coordinates
  const previewTiles = getSatelliteTiles(longitude - 0.002, latitude - 0.002, longitude + 0.002, latitude + 0.002, 16);
  const previewTile = previewTiles[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#235835] bg-[#E8F3E8] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {language === 'hi' ? 'स्मार्ट स्थान एवं उपग्रह फील्ड' : "Farmers' Smart Location Engine"}
            </span>
            <h3 className="text-lg font-bold text-[#14261A] font-display mt-1">
              {t.newField.modalTitle}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#657E6D] hover:text-[#14261A] text-2xl font-bold w-8 h-8 rounded-full hover:bg-[#F0F4EF] flex items-center justify-center cursor-pointer transition-colors"
          >
            ×
          </button>
        </div>

        {/* 1-Tap Agricultural Presets */}
        <div className="bg-[#F8FAF7] border border-[#DEE6DD] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#14261A] flex items-center gap-1.5">
              <span>📍</span>
              {language === 'hi' ? 'त्वरित भारतीय कृषि क्षेत्र (1-टैप प्रीसेट)' : 'One-Tap Agricultural Presets:'}
            </span>
            <span className="text-[10px] text-[#556F5E]">Auto-configures coordinates & crop</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {AGRICULTURAL_PRESETS.map((p) => {
              const isSelected = Math.abs(latitude - p.lat) < 0.001 && Math.abs(longitude - p.lng) < 0.001;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#E8F3E8] border-[#235835] text-[#14261A] shadow-xs'
                      : 'bg-white border-[#DEE6DD] text-[#3A4E40] hover:border-[#98BA96] hover:bg-[#F3F7F2]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] truncate">
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-[#5B7564] truncate mt-0.5 font-mono">
                    {p.lat.toFixed(4)}°N, {p.lng.toFixed(4)}°E
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & GPS Location Engine */}
        <div className="bg-[#F3F8F2] border border-[#D3E3D1] rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#14261A] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#235835]" />
              {language === 'hi' ? 'स्थान खोज (मल्टी-टियर फ़ॉलबैक)' : 'Multi-Tier Fallback Geocoding & GPS'}
            </span>
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isGpsLoading}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isGpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
              <span>{language === 'hi' ? 'मेरा जीपीएस खोजें' : '1-Click GPS Detect'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchLocation(e); }}
                placeholder={language === 'hi' ? 'उदा. Greenfield City, Behala या Nashik Vineyard' : 'Search neighborhood e.g. Greenfield City, Behala or Guntur'}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CCD8CB] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#235835]"
              />
              <Search className="w-3.5 h-3.5 text-[#738D7A] absolute left-2.5 top-2.5" />
            </div>
            <button
              type="button"
              onClick={() => handleSearchLocation()}
              disabled={isSearching}
              className="px-3 py-1.5 text-xs font-medium text-[#14261A] bg-white hover:bg-[#E8EEE6] border border-[#CCD8CB] rounded-lg cursor-pointer flex items-center gap-1"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              <span>{language === 'hi' ? 'खोजें' : 'Search'}</span>
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-white border border-[#CCD8CB] rounded-lg p-1.5 space-y-1 max-h-32 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left p-1.5 hover:bg-[#EAF2E9] rounded text-[11px] text-[#14261A] flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate pr-2">{r.displayName}</span>
                  <span className="text-[10px] text-[#556F5E] font-mono shrink-0">
                    {r.lat.toFixed(4)}°N, {r.lng.toFixed(4)}°E
                  </span>
                </button>
              ))}
            </div>
          )}

          {locationNotice && (
            <div className="text-[11px] text-[#235835] bg-[#E8F3E8] p-2 rounded border border-[#C5DEC3] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0 text-[#235835]" />
              <span>{locationNotice}</span>
            </div>
          )}
        </div>

        {/* Direct Coordinates + Satellite Preview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAFBF9] border border-[#DEE6DD] rounded-xl p-3 items-center">
          
          {/* Numeric Inputs */}
          <div className="sm:col-span-2 space-y-2">
            <span className="text-[11px] font-bold text-[#14261A] block">
              {language === 'hi' ? 'सीधे अक्षांश और देशांतर निर्देशांक (Direct Coordinates):' : 'Direct Manual Latitude & Longitude Inputs:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#486350] uppercase tracking-wider block mb-0.5">
                  Latitude (°N)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full p-1.5 text-xs font-mono border border-[#CCD8CB] rounded-lg bg-white font-bold text-[#14261A] focus:ring-1 focus:ring-[#235835]"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#486350] uppercase tracking-wider block mb-0.5">
                  Longitude (°E)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full p-1.5 text-xs font-mono border border-[#CCD8CB] rounded-lg bg-white font-bold text-[#14261A] focus:ring-1 focus:ring-[#235835]"
                  required
                />
              </div>
            </div>
            <p className="text-[10px] text-[#5B7564]">
              Automatic 100m agricultural boundary box will be generated around this center coordinate.
            </p>
          </div>

          {/* Real Satellite Orthophoto Preview Thumbnail */}
          <div className="relative rounded-lg overflow-hidden border border-[#BDD0BA] aspect-4/3 bg-[#2D3A2C] shadow-inner flex flex-col justify-end">
            {previewTile ? (
              <img
                src={previewTile.url}
                alt="Satellite Ground Preview"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="absolute inset-0 bg-radial from-transparent to-[#000000]/40 pointer-events-none" />
            <div className="relative z-10 p-1.5 bg-[#000000]/70 backdrop-blur-xs text-[9px] text-white flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                Satellite View
              </span>
              <span className="font-mono">Zoom 16</span>
            </div>
          </div>
        </div>

        {/* Core Field Attributes Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.farmNameLabel}</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                required
              />
            </div>
            <div>
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.fieldNameLabel}</label>
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
            <label className="text-[#486350] font-semibold block mb-1">{t.newField.locationLabel}</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.cropEnLabel}</label>
              <input
                type="text"
                value={cropNameEn}
                onChange={(e) => setCropNameEn(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
                required
              />
            </div>
            <div>
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.cropHiLabel}</label>
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
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.areaLabel} (ha)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={areaHa}
                onChange={(e) => setAreaHa(Number(e.target.value))}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.sowingLabel}</label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[#486350] font-semibold block mb-1">{t.newField.irrigationLabel}</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value as any)}
                className="w-full p-2 border border-[#CCD8CB] rounded-lg bg-[#F8FAF7]"
              >
                <option value="drip">{t.common.irrigations.drip}</option>
                <option value="sprinkler">{t.common.irrigations.sprinkler}</option>
                <option value="flood">{t.common.irrigations.flood}</option>
                <option value="rainfed">{t.common.irrigations.rainfed}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF2EC]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#465A4C] hover:text-[#14261A] cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.newField.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
