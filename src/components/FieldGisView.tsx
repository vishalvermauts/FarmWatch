import React, { useState } from 'react';
import { FarmField, Language, Coordinate } from '../types/farmwatch';
import { translations } from '../utils/i18n';
import { calculateGeodesicAreaHa, toGeoJSONFeature, parseGeoJSON, getBoundingBox } from '../utils/geo';
import { 
  Layers, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  MapPin, 
  AlertCircle,
  HelpCircle,
  Eye,
  Maximize2
} from 'lucide-react';

interface FieldGisViewProps {
  selectedField: FarmField;
  onUpdateFieldGeometry: (newCoordinates: Coordinate[], areaHa: number) => void;
  language: Language;
}

export const FieldGisView: React.FC<FieldGisViewProps> = ({
  selectedField,
  onUpdateFieldGeometry,
  language,
}) => {
  const t = translations[language];

  // Visual layer: 'trueColor' | 'ndvi' | 'ndmi'
  const [activeLayer, setActiveLayer] = useState<'trueColor' | 'ndvi' | 'ndmi'>('ndvi');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCoords, setDrawnCoords] = useState<Coordinate[]>(selectedField.currentGeometry.coordinates);
  const [showCoreBuffer, setShowCoreBuffer] = useState(true);
  const [geoJsonModalOpen, setGeoJsonModalOpen] = useState(false);
  const [geoJsonInput, setGeoJsonInput] = useState('');
  const [geoJsonError, setGeoJsonError] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentArea = calculateGeodesicAreaHa(drawnCoords);
  const pixelEquivalentCount = Math.round((currentArea * 10000) / 400); // 20m grid = 400m² per pixel
  const isSmallField = pixelEquivalentCount < 9;

  // Compute SVG projection bounds
  const bbox = getBoundingBox(drawnCoords);
  const paddingLng = (bbox.maxLng - bbox.minLng) * 0.25 || 0.001;
  const paddingLat = (bbox.maxLat - bbox.minLat) * 0.25 || 0.001;

  const minLng = bbox.minLng - paddingLng;
  const maxLng = bbox.maxLng + paddingLng;
  const minLat = bbox.minLat - paddingLat;
  const maxLat = bbox.maxLat + paddingLat;

  // Project geographic coordinate to 600x400 SVG viewport
  const project = (c: Coordinate) => {
    const x = ((c.lng - minLng) / (maxLng - minLng)) * 600;
    const y = 400 - ((c.lat - minLat) / (maxLat - minLat)) * 400;
    return { x, y };
  };

  // Convert SVG click back to geographic coordinate
  const unproject = (x: number, y: number): Coordinate => {
    const lng = minLng + (x / 600) * (maxLng - minLng);
    const lat = minLat + ((400 - y) / 400) * (maxLat - minLat);
    return { lng: Number(lng.toFixed(6)), lat: Number(lat.toFixed(6)) };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    const newCoord = unproject(x, y);

    setDrawnCoords((prev) => [...prev, newCoord]);
  };

  const handleSaveDrawn = () => {
    if (drawnCoords.length < 3) {
      alert(language === 'hi' ? 'मान्य बहुभुज के लिए कम से कम 3 कोने होने चाहिए।' : 'A valid polygon must have at least 3 vertices.');
      return;
    }
    const finalArea = calculateGeodesicAreaHa(drawnCoords);
    onUpdateFieldGeometry(drawnCoords, finalArea);
    setIsDrawing(false);
  };

  const handleReset = () => {
    setDrawnCoords(selectedField.currentGeometry.coordinates);
    setIsDrawing(false);
  };

  const handleImportGeoJson = () => {
    setGeoJsonError(null);
    const parsed = parseGeoJSON(geoJsonInput);
    if (!parsed) {
      setGeoJsonError(language === 'hi' ? 'अमान्य GeoJSON प्रारूप। WGS84 बंद निर्देशांक चक्र अपेक्षित है।' : 'Invalid GeoJSON Polygon format. Expected WGS84 closed coordinate ring.');
      return;
    }
    const area = calculateGeodesicAreaHa(parsed);
    setDrawnCoords(parsed);
    onUpdateFieldGeometry(parsed, area);
    setGeoJsonModalOpen(false);
    setGeoJsonInput('');
  };

  const handleExportGeoJson = () => {
    const feat = toGeoJSONFeature(drawnCoords, {
      fieldName: selectedField.fieldName,
      crop: selectedField.activeSeason.cropNameEn,
      farm: selectedField.farmName,
    });
    const text = JSON.stringify(feat, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Generate SVG polygon points string
  const outerPointsStr = drawnCoords.map(project).map(p => `${p.x},${p.y}`).join(' ');

  // Compute 10m inward core buffer polygon (scaled approximation from centroid)
  const centroid = drawnCoords.reduce((acc, c) => ({ lng: acc.lng + c.lng / drawnCoords.length, lat: acc.lat + c.lat / drawnCoords.length }), { lng: 0, lat: 0 });
  const innerBufferCoords = drawnCoords.map(c => ({
    lng: centroid.lng + (c.lng - centroid.lng) * 0.78,
    lat: centroid.lat + (c.lat - centroid.lat) * 0.78,
  }));
  const innerPointsStr = innerBufferCoords.map(project).map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-6">
      
      {/* Top Action & Metadata Bar */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
              <span>{t.common.fieldId}: {selectedField.id}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{t.common.revision}: {selectedField.currentGeometry.version}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">WGS84 EPSG:4326</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#14261A] font-display">
              {t.fields.title}
            </h2>
            <p className="text-xs text-[#465A4C] mt-0.5">
              {t.fields.description}
            </p>
          </div>

          {/* Interactive GIS Control Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!isDrawing ? (
              <>
                <button
                  onClick={() => {
                    setIsDrawing(true);
                    setDrawnCoords([]);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.fields.drawBoundary}</span>
                </button>

                <button
                  onClick={() => setGeoJsonModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-[#14261A] bg-[#F1F6F0] hover:bg-[#E5EEE4] border border-[#D5E0D3] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#235835]" />
                  <span>{t.fields.uploadGeoJson}</span>
                </button>

                <button
                  onClick={handleExportGeoJson}
                  className="px-3 py-1.5 text-xs font-medium text-[#14261A] bg-[#F1F6F0] hover:bg-[#E5EEE4] border border-[#D5E0D3] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#235835]" />
                  <span>{copiedSuccess ? t.fields.copiedSuccess : t.fields.exportGeoJson}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveDrawn}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2E7D46] hover:bg-[#256839] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.fields.confirmBoundary}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-medium text-[#7A271A] bg-[#FEE2E2] hover:bg-[#FECACA] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.fields.cancelReset}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Invariants Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Vector Map Container (2 cols) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl overflow-hidden shadow-xs flex flex-col">
          
          {/* Map Controls Header */}
          <div className="p-3 bg-[#F8FAF7] border-b border-[#EEF2EC] flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* False Color Layer Selector */}
            <div className="flex items-center gap-1 bg-[#EEF4EC] p-1 rounded-lg">
              <button
                onClick={() => setActiveLayer('ndvi')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  activeLayer === 'ndvi'
                    ? 'bg-white text-[#163821] shadow-xs'
                    : 'text-[#486350] hover:text-[#14261A]'
                }`}
              >
                {t.fields.bands.ndvi}
              </button>
              <button
                onClick={() => setActiveLayer('ndmi')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  activeLayer === 'ndmi'
                    ? 'bg-white text-[#163821] shadow-xs'
                    : 'text-[#486350] hover:text-[#14261A]'
                }`}
              >
                {t.fields.bands.ndmi}
              </button>
              <button
                onClick={() => setActiveLayer('trueColor')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  activeLayer === 'trueColor'
                    ? 'bg-white text-[#163821] shadow-xs'
                    : 'text-[#486350] hover:text-[#14261A]'
                }`}
              >
                {t.fields.bands.trueColor}
              </button>
            </div>

            {/* Core Buffer Display Checkbox */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[#3E5544] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCoreBuffer}
                  onChange={(e) => setShowCoreBuffer(e.target.checked)}
                  className="rounded text-[#235835] focus:ring-[#235835]"
                />
                <span>{t.fields.coreBufferCheckbox}</span>
              </label>
            </div>
          </div>

          {/* Canvas Rendering Area */}
          <div className="relative flex-1 bg-[#EEF4EC] min-h-[420px] flex items-center justify-center p-4">
            
            {/* SVG GIS Layer Renderer */}
            <svg
              viewBox="0 0 600 400"
              className={`w-full h-auto max-h-[460px] select-none rounded-lg ${
                isDrawing ? 'cursor-crosshair' : 'cursor-default'
              }`}
              onClick={handleSvgClick}
            >
              <defs>
                {/* Background Satellite Orthophoto Grid Pattern */}
                <pattern id="soilGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCE8DA" strokeWidth="1" />
                </pattern>

                {/* NDVI False-Color Gradient Fill */}
                <radialGradient id="ndviGradient" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#2E7D46" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#68BB59" stopOpacity="0.8" />
                  <stop offset="85%" stopColor="#E5B942" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#D96347" stopOpacity="0.75" />
                </radialGradient>

                {/* NDMI Moisture Gradient Fill */}
                <radialGradient id="ndmiGradient" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#1E658E" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#4FA4C8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#C48E44" stopOpacity="0.75" />
                </radialGradient>

                {/* True Color Agricultural Crop Fill */}
                <linearGradient id="trueColorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A6B44" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#5B8354" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#739B6A" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Background Orthophoto Simulation Canvas */}
              <rect width="600" height="400" fill="#E6EFE4" />
              <rect width="600" height="400" fill="url(#soilGrid)" opacity="0.6" />

              {/* Surrounding field borders simulation */}
              <path d="M 0 120 Q 200 140 600 90" stroke="#CCDBC9" strokeWidth="3" fill="none" />
              <path d="M 220 0 L 250 400" stroke="#CCDBC9" strokeWidth="3" fill="none" />
              <path d="M 450 0 L 430 400" stroke="#CCDBC9" strokeWidth="2.5" fill="none" />

              {/* Render Field Polygon */}
              {drawnCoords.length >= 3 && (
                <>
                  {/* Active False-Color Spectrum Fill */}
                  <polygon
                    points={outerPointsStr}
                    fill={
                      activeLayer === 'ndvi'
                        ? 'url(#ndviGradient)'
                        : activeLayer === 'ndmi'
                        ? 'url(#ndmiGradient)'
                        : 'url(#trueColorGradient)'
                    }
                    stroke="#163821"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* 10m Inward Core Buffer Outline */}
                  {showCoreBuffer && (
                    <polygon
                      points={innerPointsStr}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      strokeOpacity="0.9"
                    />
                  )}

                  {/* Vertices Markers */}
                  {drawnCoords.map((c, i) => {
                    const pt = project(c);
                    return (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isDrawing ? 5 : 3.5}
                          fill="#FFFFFF"
                          stroke="#163821"
                          strokeWidth="2"
                        />
                        {isDrawing && (
                          <text
                            x={pt.x + 8}
                            y={pt.y - 8}
                            fontSize="10"
                            fontWeight="bold"
                            fill="#163821"
                            className="select-none font-mono"
                          >
                            P{i + 1}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Drawing mode interactive prompt */}
              {isDrawing && drawnCoords.length < 3 && (
                <text x="300" y="200" textAnchor="middle" fill="#4B6350" fontSize="13" fontWeight="500">
                  {language === 'hi' 
                    ? `खेत के कोने का बिंदु लगाने के लिए क्लिक करें (${3 - drawnCoords.length} और चाहिए)`
                    : `Click on canvas to place field corner nodes (Need ${3 - drawnCoords.length} more)`}
                </text>
              )}
            </svg>

            {/* Dynamic Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#DEE6DD] rounded-lg p-2.5 text-[11px] text-[#334638] shadow-xs">
              <span className="font-semibold block mb-1">
                {activeLayer === 'ndvi' ? t.fields.bands.ndvi : activeLayer === 'ndmi' ? t.fields.bands.ndmi : t.fields.bands.trueColor}
              </span>
              {activeLayer === 'ndvi' && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-2 rounded bg-gradient-to-r from-[#D96347] via-[#E5B942] to-[#2E7D46]" />
                  <span className="tabular-nums font-mono text-[10px]">0.2 → 0.85</span>
                </div>
              )}
              {activeLayer === 'ndmi' && (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-2 rounded bg-gradient-to-r from-[#C48E44] via-[#4FA4C8] to-[#1E658E]" />
                  <span className="tabular-nums font-mono text-[10px]">-0.1 → +0.4</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Guidance bar */}
          <div className="px-4 py-2.5 bg-[#FFFFFF] border-t border-[#EEF2EC] flex items-center justify-between text-xs text-[#526D5A]">
            <span>
              {t.fields.coreBufferNotice}
            </span>
            <span className="font-mono tabular-nums text-[#14261A]">
              {t.fields.gridAlignmentNotice}
            </span>
          </div>
        </div>

        {/* Parcel Specification Rail (1 col) */}
        <div className="space-y-4">
          
          {/* Spatial Metric Card */}
          <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
              {t.fields.invariantsTitle}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F0]">
                <span className="text-[#657E6D]">{t.fields.geodesicAreaLabel}</span>
                <span className="font-bold text-[#14261A] font-mono tabular-nums">
                  {currentArea} {t.common.hectares}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F0]">
                <span className="text-[#657E6D]">{t.fields.approxSqMeters}</span>
                <span className="font-semibold text-[#14261A] font-mono tabular-nums">
                  {(currentArea * 10000).toLocaleString()} m²
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F0]">
                <span className="text-[#657E6D]">{t.fields.pixelCountLabel}</span>
                <span className="font-semibold text-[#14261A] font-mono tabular-nums">
                  {pixelEquivalentCount} pixels
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#657E6D]">{t.fields.coreEligibilityLabel}</span>
                <span className={`font-semibold ${isSmallField ? 'text-[#B45309]' : 'text-[#2E7D46]'}`}>
                  {isSmallField ? t.fields.subpixelWarning : t.fields.corePass}
                </span>
              </div>
            </div>

            {isSmallField && (
              <div className="p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-[11px] text-[#92400E] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706] mt-0.5" />
                <span>
                  {t.fields.smallFieldNotice}
                </span>
              </div>
            )}
          </div>

          {/* Polygon Coordinates Table */}
          <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
                {t.fields.nodesTitle} ({drawnCoords.length})
              </h4>
              <span className="text-[11px] text-[#698572] font-mono">{t.fields.lonLat}</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {drawnCoords.map((c, i) => (
                <div key={i} className="flex justify-between py-1 px-2 bg-[#F7FAF6] rounded border border-[#E7EFE6]">
                  <span className="text-[#556F5D]">{t.fields.nodeLabel} {i + 1}:</span>
                  <span className="text-[#14261A] tabular-nums">
                    {c.lng.toFixed(5)}, {c.lat.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* GeoJSON Import Modal */}
      {geoJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14261A] font-display">
                {t.fields.uploadGeoJson}
              </h3>
              <button
                onClick={() => setGeoJsonModalOpen(false)}
                className="text-[#657E6D] hover:text-[#14261A] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-[#526D5A]">
              {t.fields.geoJsonPrompt}
            </p>

            <textarea
              value={geoJsonInput}
              onChange={(e) => setGeoJsonInput(e.target.value)}
              placeholder='{"type": "Polygon", "coordinates": [[[73.789, 19.997], [73.790, 19.997], [73.790, 19.998], [73.789, 19.997]]]}'
              rows={8}
              className="w-full p-3 font-mono text-xs border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] text-[#14261A] outline-none focus:border-[#235835] focus:ring-1 focus:ring-[#235835]"
            />

            {geoJsonError && (
              <div className="p-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#B91C1C]">
                {geoJsonError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setGeoJsonModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-[#465A4C] hover:text-[#14261A] cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleImportGeoJson}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer"
              >
                {t.fields.importValidate}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
