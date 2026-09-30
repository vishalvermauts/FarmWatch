import React, { useState, useEffect } from 'react';
import { FarmField, Language, AIAdvisoryEnvelope, AgronomicReference } from '../types/farmwatch';
import { translations } from '../utils/i18n';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface CropAssessmentViewProps {
  selectedField: FarmField;
  onSaveAdvisory: (advisory: AIAdvisoryEnvelope) => void;
  language: Language;
}

// Preset field photos encoded as high-fidelity SVG/base64 representations for instant one-click testing
const PRESET_SAMPLE_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%234A5E44"/><rect y="200" width="400" height="100" fill="%235C4A38"/><path d="M 60 260 Q 120 140 180 80 Q 220 50 260 40" stroke="%23689456" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M 230 60 Q 260 40 280 35" stroke="%23D4A836" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M 120 260 Q 180 160 240 100" stroke="%2372A35E" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M 210 120 Q 240 100 260 95" stroke="%23C29330" stroke-width="10" fill="none" stroke-linecap="round"/><text x="20" y="30" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">Nashik Wheat Plot 4A: Leaf Tip Moisture Scorch</text></svg>`;

const PRESET_SAMPLE_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%233A5239"/><path d="M 200 260 L 200 130" stroke="%2356734E" stroke-width="16" stroke-linecap="round"/><path d="M 200 150 Q 120 120 90 160 Q 150 220 200 170" fill="%23678F59" stroke="%234E6B43" stroke-width="2"/><circle cx="130" cy="150" r="15" fill="%23C9B84B" opacity="0.8"/><circle cx="155" cy="140" r="10" fill="%23C9B84B" opacity="0.8"/><path d="M 200 140 Q 280 110 310 150 Q 250 210 200 160" fill="%23678F59" stroke="%234E6B43" stroke-width="2"/><text x="20" y="30" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">Cotton Foliage: Chlorotic Interveinal Yellowing</text></svg>`;

export const CropAssessmentView: React.FC<CropAssessmentViewProps> = ({
  selectedField,
  onSaveAdvisory,
  language,
}) => {
  const t = translations[language];

  const [photoPreview, setPhotoPreview] = useState<string | null>(PRESET_SAMPLE_1);
  const [farmerNotes, setFarmerNotes] = useState(
    language === 'hi' ? translations.hi.ai.defaultNotes : translations.en.ai.defaultNotes
  );
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AIAdvisoryEnvelope | null>(
    selectedField.recentAdvisory
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically update default notes when language toggles if farmer hasn't customized
  useEffect(() => {
    if (language === 'hi' && (farmerNotes === translations.en.ai.defaultNotes || farmerNotes.includes('Noticed dry leaf tips'))) {
      setFarmerNotes(translations.hi.ai.defaultNotes);
    } else if (language === 'en' && (farmerNotes === translations.hi.ai.defaultNotes || farmerNotes.includes('ऊपरी ढलान की कतार'))) {
      setFarmerNotes(translations.en.ai.defaultNotes);
    }
  }, [language]);

  // Q&A Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: language === 'hi' 
        ? 'नमस्ते! आप इस खेत के उपग्रह सूचकांक या फसल की पत्तियों के बारे में कोई भी प्रश्न पूछ सकते हैं।'
        : 'Welcome! You can ask follow-up questions about this field\'s satellite indices or leaf inspection steps.',
      time: 'Just now',
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAskingChat, setIsAskingChat] = useState(false);

  // Selected Reference Modal
  const [activeReference, setActiveReference] = useState<AgronomicReference | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image (JPEG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAssessment = async () => {
    setIsAssessing(true);
    setErrorMessage(null);

    const latestObs = selectedField.observations[selectedField.observations.length - 1];

    // Assemble rich evidence bundle
    const evidencePayload = {
      photoBase64: photoPreview,
      photoMime: 'image/jpeg',
      reportText: farmerNotes,
      locale: language,
      fieldEvidence: {
        cropType: selectedField.activeSeason.cropNameEn,
        sowingDate: selectedField.activeSeason.sowingDate,
        irrigationMethod: selectedField.activeSeason.irrigationMethod,
        soilPh: selectedField.soilReport.ph,
        soilOc: `${selectedField.soilReport.organicCarbonPercent}%`,
        latestNdvi: latestObs?.indicators.ndvi_median ?? 0.312,
        baselineNdvi: selectedField.latestAlert?.explanation.baselineNdvi ?? 0.578,
        ndviDelta: selectedField.latestAlert?.explanation.absoluteDelta ?? -0.266,
        latestNdmi: latestObs?.indicators.ndmi_median ?? 0.059,
        coreCoverage: `${((latestObs?.quality.coverage_core || 0.94) * 100).toFixed(0)}%`,
        supportState: latestObs?.quality.support_state ?? 'sufficient_evidence',
        maxTemp: '31.5°C',
        recentRainfall: '2.4mm',
        forecastRainfall: '5.3mm',
      }
    };

    try {
      const resp = await fetch('/api/ai/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidencePayload),
      });

      const contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await resp.text();
        console.warn('Non-JSON response received from /api/ai/assess:', text.slice(0, 150));
        throw new Error('AI advisory engine experienced a temporary network delay. Please retry in a few moments.');
      }

      const resData = await resp.json();

      if (!resp.ok) {
        if (resData?.fallback_guidance) {
          // Construct complete Schema v1 fallback advisory so the farmer is never left without guidance
          const fallbackEnvelope: AIAdvisoryEnvelope = {
            id: `ADV-FALLBACK-${Date.now().toString(36).toUpperCase()}`,
            generated_at: new Date().toISOString(),
            model_id: 'agronomic-rule-engine',
            prompt_version: 'advisory-v1-grounded',
            schema_version: '1',
            validation_status: 'fallback_applied',
            locale: language,
            data: {
              schema_version: '1',
              locale: language,
              photo_observations: [
                {
                  description: language === 'hi'
                    ? 'पत्तियों के सिरों पर हल्का सूखापन और किनारों पर पीलापन देखा गया, जो सूक्ष्म-सिंचाई में नमी की कमी या गर्मी के तनाव से मेल खाता है।'
                    : 'Foliage shows localized leaf tip drying and marginal chlorosis consistent with micro-irrigation deficits or heat stress.',
                  quality: 'adequate',
                }
              ],
              possible_causes: [
                {
                  explanation: language === 'hi'
                    ? 'फसल की छतरी में नमी की कमी और ड्रिप उत्सर्जक (ड्रिपर) के दबाव में स्थानीय गिरावट।'
                    : 'Canopy moisture deficit and localized micro-irrigation emitter pressure reduction.',
                  supporting_evidence: language === 'hi'
                    ? 'सेंटिनल-2 NDMI में 0.059 तक गिरावट और उच्च दैनिक तापमान।'
                    : 'Recent Sentinel-2 NDMI drop to 0.059 and high daytime temperatures.',
                  confidence: 'moderate',
                },
                {
                  explanation: language === 'hi'
                    ? 'आरंभिक द्वितीयक कवक या जड़ क्षेत्र में मिट्टी का कड़ापन जिससे पोषक तत्वों का अवशोषण धीमा हुआ।'
                    : 'Early secondary fungal or root-zone compaction preventing adequate nutrient uptake.',
                  supporting_evidence: language === 'hi'
                    ? 'ऊपरी ढलान की कतारों में निचली पत्तियों पर पीलापन दर्ज किया गया।'
                    : 'Reported yellowing on lower leaves in upper slope rows.',
                  confidence: 'low',
                }
              ],
              questions: language === 'hi' ? [
                'क्या आपने ड्रिप लेटरल लाइनों के अंतिम छोर पर पानी का दबाव जांचा है?',
                'क्या यह पीलापन पूरे खेत में एक समान है या केवल कुछ खास कतारों में केंद्रित है?'
              ] : [
                'Have you checked the line pressure at the tail end of your drip lateral lines?',
                'Is the yellowing uniform across the field or clustered near specific rows?'
              ],
              inspection_steps: resData?.fallback_guidance?.steps || (language === 'hi' ? [
                'प्रभावित क्षेत्र में 10-15 पत्तियों की निचली सतह पर रस चूसक कीटों की जांच करें।',
                'खुरपी से 15 सेमी गहराई पर मिट्टी की नमी का भौतिक परीक्षण करें।',
                'ड्रिप लेटरल लाइनों को फ्लश करें और अवरुद्ध ड्रिपर को साफ करें।'
              ] : [
                'Inspect the underside of 10-15 random crop leaves across the zone for sucking pests.',
                'Check root-zone soil moisture at 15cm depth using a clean hand trowel.',
                'Flush lateral drip lines and clean silt from clogged emitters.'
              ]),
              regenerative_guidance: [
                {
                  text: language === 'hi'
                    ? 'फसल की जड़ों के पास 5-8 सेमी जैविक अवशेष मल्च (धान का पुआल या सूखी पत्तियां) बिछाएं जिससे वाष्पीकरण रुके और मिट्टी का तापमान नियंत्रित रहे।'
                    : 'Apply a 5-8cm residue mulch layer (paddy straw or biomass) around crop root zones to reduce surface evaporation and buffer soil temperatures.',
                  reference_ids: ['REF-ICAR-REGEN-SOIL-2025']
                }
              ],
              uncertainty: language === 'hi'
                ? 'बाहरी नेटवर्क प्रतीक्षा के दौरान प्रमाणित कृषि नियमों के आधार पर मूल्यांकन तैयार किया गया। खेत में भौतिक सत्यापन आवश्यक है।'
                : 'Assessment generated from deterministic agronomic rules during external service cooldown. Physical field validation is essential.',
              escalation: 'inspect_field',
            },
            available_references: [
              resData?.fallback_guidance?.reference || {
                id: 'REF-IMD-AGROMET-2026',
                title: language === 'hi' ? 'आईएमडी जिला कृषि मौसम विज्ञान परामर्श बुलेटिन' : 'IMD District Agrometeorological Advisory Bulletin',
                publisher: language === 'hi' ? 'भारतीय मौसम विज्ञान विभाग (IMD)' : 'India Meteorological Department (IMD)',
                issueDate: '2026-09-15',
                url: 'https://mausam.imd.gov.in/',
                scope: 'Field moisture conservation',
                excerpt: language === 'hi' ? 'अनियमित मौसम के दौरान जल निकासी बनाए रखें और पत्तियों के नीचे की सतह का निरीक्षण करें।' : 'Maintain drainage and inspect leaf undersides during erratic weather.',
              }
            ]
          };
          setAssessmentResult(fallbackEnvelope);
          onSaveAdvisory(fallbackEnvelope);
          return;
        }
        throw new Error(resData?.error?.message || `Assessment engine returned HTTP ${resp.status}`);
      }

      setAssessmentResult(resData);
      onSaveAdvisory(resData);
    } catch (err: any) {
      console.error('Assessment failed:', err);
      setErrorMessage(err?.message || 'AI engine is temporarily unavailable. Local fallback advice provided below.');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAskingChat) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setIsAskingChat(true);

    try {
      const latestObs = selectedField.observations[selectedField.observations.length - 1];
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          locale: language,
          context: {
            cropType: selectedField.activeSeason.cropNameEn,
            latestNdvi: latestObs?.indicators.ndvi_median,
            weather: 'Warm, dry interval with recent 2.4mm rain',
          }
        }),
      });

      const data = await resp.json();
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: data.answer || 'Thank you. Please ensure physical inspection of leaf undersides.', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: 'Unable to reach advisory service. Please check soil moisture at 15cm depth manually.', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } finally {
      setIsAskingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
          <span>{t.ai.bannerSubtitle}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#14261A] font-display mt-0.5">
          {t.ai.title}
        </h2>
        <p className="text-xs text-[#465A4C] mt-0.5">
          {t.ai.subtitle}
        </p>
      </div>

      {/* Main Evidence Input Section: Photo + Farmer Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Photo Uploader & Sample Selection */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
              {t.ai.fieldPhotoTitle}
            </span>
            <span className="text-[11px] text-[#698572] font-mono">JPG, PNG</span>
          </div>

          {/* Photo Preview Frame */}
          <div className="relative border-2 border-dashed border-[#CCD8CB] rounded-xl overflow-hidden bg-[#F9FAF8] min-h-[220px] flex items-center justify-center">
            {photoPreview ? (
              <div className="relative w-full h-full min-h-[220px] flex items-center justify-center bg-black/5">
                <img
                  src={photoPreview}
                  alt="Inspected crop foliage sample"
                  referrerPolicy="no-referrer"
                  className="max-h-[220px] w-auto object-contain rounded-lg"
                />
                <button
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold bg-[#14261A]/80 hover:bg-[#14261A] text-white rounded-md backdrop-blur-xs cursor-pointer"
                >
                  {t.common.change}
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 text-center cursor-pointer space-y-2">
                <div className="p-3 bg-[#EAF2E9] rounded-full text-[#235835]">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-[#14261A]">
                  {t.ai.dragDrop}
                </span>
                <span className="text-[11px] text-[#688170]">
                  {t.ai.daylightTip}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Preset Sample Buttons for Instant Evaluation */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#486350] block">
              {t.ai.selectSample}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPhotoPreview(PRESET_SAMPLE_1)}
                className="p-2 text-left bg-[#F6FAF5] hover:bg-[#EBF3EA] border border-[#DEEADE] rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-semibold text-[#14261A] block">{t.ai.sample1}</span>
                <span className="text-[10px] text-[#556F5D]">{t.ai.sample1Details}</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoPreview(PRESET_SAMPLE_2)}
                className="p-2 text-left bg-[#F6FAF5] hover:bg-[#EBF3EA] border border-[#DEEADE] rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-semibold text-[#14261A] block">{t.ai.sample2}</span>
                <span className="text-[10px] text-[#556F5D]">{t.ai.sample2Details}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Farmer Scouting Notes & Synthesizer Launch */}
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#486350] tracking-wide uppercase">
                {t.ai.farmerNotesTitle}
              </span>
              <span className="text-[11px] text-[#698572] font-mono tabular-nums">
                {farmerNotes.length}/4000 {t.common.chars}
              </span>
            </div>

            <textarea
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              placeholder={t.ai.farmerNotesPlaceholder}
              rows={5}
              className="w-full p-3 text-xs border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] text-[#14261A] outline-none focus:border-[#235835] focus:ring-1 focus:ring-[#235835]"
            />

            {/* Synthesizer Invariants Summary Box */}
            <div className="p-3 bg-[#F6FAF5] border border-[#DEEADE] rounded-lg text-xs space-y-1 text-[#465A4C]">
              <span className="font-semibold text-[#14261A] block mb-1">
                {t.ai.contextBundledTitle}
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                <div>· {t.ai.cropLabel} <span className="font-semibold text-[#14261A]">{language === 'hi' ? selectedField.activeSeason.cropNameHi : selectedField.activeSeason.cropNameEn}</span></div>
                <div>· {t.ai.sowingLabel} <span className="font-semibold text-[#14261A] font-mono">{selectedField.activeSeason.sowingDate}</span></div>
                <div>· {t.ai.latestNdviLabel} <span className="font-semibold text-[#14261A] font-mono">0.312 ({t.ai.latestNdviLabel.includes('NDVI') ? '-46%' : ''})</span></div>
                <div>· {t.ai.irrigationLabel} <span className="font-semibold text-[#14261A] capitalize">{selectedField.activeSeason.irrigationMethod}</span></div>
                <div>· {t.ai.soilPhLabel} <span className="font-semibold text-[#14261A] font-mono">{selectedField.soilReport.ph}</span></div>
                <div>· {t.ai.referencesLabel} <span className="font-semibold text-[#14261A]">{t.ai.reviewedCount}</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleRunAssessment}
              disabled={isAssessing}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#235835] hover:bg-[#1C482A] active:bg-[#163821] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isAssessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.ai.running}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FDE047]" />
                  <span>{t.ai.runAssessment}</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-[#698572] text-center">
              {t.ai.owaspNotice}
            </div>
          </div>
        </div>
      </div>

      {/* Error / Fallback Banner if external API unavailable */}
      {errorMessage && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-xs text-[#991B1B] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>AI Assessment Service Notice</span>
          </div>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Structured Schema v1 Advisory Output Display */}
      {assessmentResult && (
        <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* Advisory Header & Provenance */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEF2EC] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#536A5B]">
                <ShieldCheck className="w-4 h-4 text-[#2E7D46]" />
                <span>{t.common.advisoryId}: {assessmentResult.id}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{t.common.engine}: {assessmentResult.model_id}</span>
                <span aria-hidden="true">·</span>
                <span>{t.common.status}: {assessmentResult.validation_status}</span>
              </div>
              <h3 className="text-lg font-bold text-[#14261A] font-display mt-0.5">
                {t.ai.resultsHeading}
              </h3>
            </div>

            <div className="text-xs text-[#526D5A]">
              {t.common.escalation}:{' '}
              <span className="font-bold text-[#B45309] capitalize font-mono">
                {assessmentResult.data.escalation.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Section 1: Visible Photo Observations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#486350] uppercase tracking-wide">
              {t.ai.visibleObsTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {assessmentResult.data.photo_observations.map((obs, idx) => (
                <div key={idx} className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] space-y-1">
                  <div className="flex justify-between text-[11px] text-[#657E6D]">
                    <span>{t.ai.observationNumber}{idx + 1}</span>
                    <span className="capitalize font-medium">{t.ai.qualityLabel} {obs.quality}</span>
                  </div>
                  <p className="text-[#14261A] font-medium leading-relaxed">
                    {obs.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Possible Causes (Strictly Non-Definitive) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#486350] uppercase tracking-wide">
              {t.ai.causesTitle}
            </h4>
            <div className="space-y-2 text-xs">
              {assessmentResult.data.possible_causes.map((cause, idx) => (
                <div key={idx} className="p-3 bg-[#FFFBF5] rounded-lg border border-[#F6E7D2] flex items-start gap-3">
                  <div className="p-1 rounded bg-[#FBE3C5] text-[#9A3412] shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                    H{idx + 1}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#7C2D12]">{cause.explanation}</span>
                      <span className="text-[10px] text-[#9A3412] uppercase font-mono">
                        {t.ai.confidenceLabel} {cause.confidence}
                      </span>
                    </div>
                    {cause.supporting_evidence && (
                      <p className="text-[11px] text-[#9A3412] leading-relaxed">
                        {t.ai.supportingEvidenceLabel} {cause.supporting_evidence}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Step-by-Step Physical Field Inspection Protocol */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#486350] uppercase tracking-wide">
              {t.ai.stepsTitle}
            </h4>
            <div className="space-y-2 text-xs">
              {assessmentResult.data.inspection_steps.map((step, idx) => (
                <div key={idx} className="p-2.5 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#E5EDE3] text-[#235835] font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
                    {idx + 1}
                  </span>
                  <p className="text-[#14261A] leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Grounded Regenerative Practice Guidance (With Verified Citations) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#486350] uppercase tracking-wide">
              {t.ai.regenTitle}
            </h4>
            <div className="space-y-2.5 text-xs">
              {assessmentResult.data.regenerative_guidance.map((regen, idx) => (
                <div key={idx} className="p-3 bg-[#F0F7EE] rounded-lg border border-[#D5E8D2] space-y-2">
                  <p className="text-[#163821] font-medium leading-relaxed">
                    {regen.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#D5E8D2]/60">
                    <span className="text-[11px] text-[#476751]">{t.ai.peerCitationsLabel}</span>
                    {regen.reference_ids.map((refId) => {
                      const refObj = assessmentResult.available_references?.find(r => r.id === refId);
                      return (
                        <button
                          key={refId}
                          onClick={() => refObj && setActiveReference(refObj)}
                          className="px-2 py-0.5 bg-[#FFFFFF] hover:bg-[#F9FCF8] border border-[#CADBC7] rounded text-[11px] font-mono text-[#235835] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <BookOpen className="w-3 h-3 text-[#2E7D46]" />
                          <span>{refId}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Clarifying Questions & Uncertainty Disclosure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3 bg-[#F8FAF7] rounded-lg border border-[#E3EDE1] space-y-1.5">
              <span className="font-semibold text-[#14261A] block">
                {t.ai.questionsTitle}:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#465A4C]">
                {assessmentResult.data.questions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed">{q}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-[#F8FAF7] rounded-lg border border-[#E3EDE1] space-y-1.5">
              <span className="font-semibold text-[#14261A] block">
                {t.ai.uncertaintyTitle}:
              </span>
              <p className="text-[#526D5A] leading-relaxed">
                {assessmentResult.data.uncertainty}
              </p>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="p-3 bg-[#F6FAF5] border border-[#DEEADE] rounded-lg text-[11px] text-[#556F5D] leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-[#235835]" />
            {t.ai.disclaimer}
          </div>

        </div>
      )}

      {/* Follow-up Agronomic Q&A Chat Section */}
      <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#235835]" />
            <h3 className="text-sm font-bold text-[#14261A]">
              {t.ai.chatHeading}
            </h3>
          </div>
          <span className="text-[11px] text-[#5C7564]">
            Language: <span className="font-semibold">{language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}</span>
          </span>
        </div>

        {/* Message Thread List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#235835] text-white rounded-br-xs'
                    : 'bg-[#F6FAF5] text-[#14261A] border border-[#DEEADE] rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#738B7B] mt-0.5 px-1 font-mono">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-[#EEF2EC]">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={t.ai.chatPlaceholder}
            className="flex-1 px-3 py-2 text-xs border border-[#CCD8CB] rounded-lg bg-[#F8FAF7] text-[#14261A] outline-none focus:border-[#235835] focus:ring-1 focus:ring-[#235835]"
          />
          <button
            type="submit"
            disabled={isAskingChat || !inputQuestion.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAskingChat ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{t.ai.askButton}</span>
          </button>
        </form>
      </div>

      {/* Verified Reference Detail Modal */}
      {activeReference && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DEE6DD] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2E7D46]" />
                <h3 className="text-sm font-bold text-[#14261A] font-mono">
                  {activeReference.id}
                </h3>
              </div>
              <button
                onClick={() => setActiveReference(null)}
                className="text-[#657E6D] hover:text-[#14261A] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#14261A] leading-snug">
                {activeReference.title}
              </h4>
              <p className="text-xs text-[#526D5A] mt-1">
                {t.ai.publisherLabel} {activeReference.publisher} ({t.ai.issuedLabel} {activeReference.issueDate})
              </p>
            </div>

            <div className="p-3 bg-[#F9FCF8] rounded-lg border border-[#E7EFE6] text-xs text-[#14261A] leading-relaxed">
              <span className="font-semibold block mb-1 text-[#235835]">{t.ai.reviewedExcerpt}</span>
              "{activeReference.excerpt}"
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={activeReference.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#235835] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{t.ai.viewOfficialBulletin}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setActiveReference(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] rounded-lg"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
