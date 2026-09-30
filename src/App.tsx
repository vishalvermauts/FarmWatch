import React, { useState, useEffect } from 'react';
import { FarmField, Language, WeatherContext, Coordinate, AIAdvisoryEnvelope, FarmerAction } from './types/farmwatch';
import { INITIAL_FIELDS } from './utils/mockData';
import { translations } from './utils/i18n';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { FieldGisView } from './components/FieldGisView';
import { SatelliteTimelineView } from './components/SatelliteTimelineView';
import { CropAssessmentView } from './components/CropAssessmentView';
import { SoilAndWeatherView } from './components/SoilAndWeatherView';
import { ActionHistoryView } from './components/ActionHistoryView';
import { PrivacyCenterView } from './components/PrivacyCenterView';
import { NewFieldModal } from './components/NewFieldModal';
import { WifiOff, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'farmwatch_state_v4';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [fields, setFields] = useState<FarmField[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read cached fields:', e);
    }
    return INITIAL_FIELDS;
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || 'FIELD-NASHIK-DINDORI');
  const [weather, setWeather] = useState<WeatherContext | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [newFieldModalOpen, setNewFieldModalOpen] = useState(false);

  const t = translations[language];

  // Sync state to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
    } catch (e) {
      console.warn('Could not persist fields to localStorage:', e);
    }
  }, [fields]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  // Fetch real-time weather from backend proxy
  useEffect(() => {
    if (!selectedField) return;

    // Use centroid coordinates of selected field
    const coords = selectedField.currentGeometry.coordinates;
    const avgLng = coords.reduce((acc, c) => acc + c.lng, 0) / coords.length || 73.7898;
    const avgLat = coords.reduce((acc, c) => acc + c.lat, 0) / coords.length || 19.9975;

    fetch(`/api/weather?lat=${avgLat}&lon=${avgLng}`)
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch((err) => console.warn('Weather fetch error:', err));
  }, [selectedField?.id]);

  // Handlers
  const handleUpdateGeometry = (newCoordinates: Coordinate[], areaHa: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedField.id) return f;
        return {
          ...f,
          currentGeometry: {
            ...f.currentGeometry,
            version: f.currentGeometry.version + 1,
            coordinates: newCoordinates,
            areaHa: areaHa,
          }
        };
      })
    );
  };

  const handleRefreshObservations = async (simulateStress: boolean) => {
    try {
      const resp = await fetch('/api/satellite/simulate-observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaHa: selectedField.currentGeometry.areaHa,
          cropType: selectedField.activeSeason.cropNameEn,
          sowingDate: selectedField.activeSeason.sowingDate,
          simulateStress,
        }),
      });

      if (!resp.ok) throw new Error('Observation simulation failed');

      const data = await resp.json();
      setFields((prev) =>
        prev.map((f) => {
          if (f.id !== selectedField.id) return f;
          return {
            ...f,
            observations: data.observations,
            latestAlert: data.latestAlert,
          };
        })
      );
    } catch (err) {
      console.error(err);
      alert(language === 'hi' ? 'उपग्रह प्रेक्षण अद्यतन करने में असमर्थ।' : 'Could not update satellite observations.');
    }
  };

  const handleSaveAdvisory = (advisory: AIAdvisoryEnvelope) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedField.id) return f;
        return { ...f, recentAdvisory: advisory };
      })
    );
  };

  const handleAddAction = (action: FarmerAction) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedField.id) return f;
        return { ...f, actions: [action, ...f.actions] };
      })
    );
  };

  const handleUpdateSoilReport = (updatedSoil: any) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedField.id) return f;
        return { ...f, soilReport: updatedSoil };
      })
    );
  };

  const handleResetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFields(INITIAL_FIELDS);
    setSelectedFieldId(INITIAL_FIELDS[0].id);
  };

  const handleAddField = (newField: FarmField) => {
    setFields((prev) => [newField, ...prev]);
    setSelectedFieldId(newField.id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#142318] flex flex-col font-sans">
      
      {/* Offline Status Alert if Network is Lost */}
      {!isOnline && (
        <div className="bg-[#FFFBEB] border-b border-[#FDE68A] text-[#92400E] px-4 py-2 text-xs flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-[#D97706]" />
          <span>{t.offlineAlert}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onNewField={() => setNewFieldModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            fields={fields}
            selectedField={selectedField}
            onSelectField={(f) => setSelectedFieldId(f.id)}
            language={language}
            weather={weather}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'fields' && (
          <FieldGisView
            fields={fields}
            selectedField={selectedField}
            onSelectField={(f) => setSelectedFieldId(f.id)}
            onUpdateFieldGeometry={handleUpdateGeometry}
            language={language}
          />
        )}

        {activeTab === 'satellite' && (
          <SatelliteTimelineView
            selectedField={selectedField}
            onRefreshObservations={handleRefreshObservations}
            language={language}
          />
        )}

        {activeTab === 'ai' && (
          <CropAssessmentView
            selectedField={selectedField}
            onSaveAdvisory={handleSaveAdvisory}
            language={language}
          />
        )}

        {activeTab === 'soilWeather' && (
          <SoilAndWeatherView
            selectedField={selectedField}
            weather={weather}
            onUpdateSoilReport={handleUpdateSoilReport}
            language={language}
          />
        )}

        {activeTab === 'actions' && (
          <ActionHistoryView
            selectedField={selectedField}
            onAddAction={handleAddAction}
            language={language}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyCenterView
            fields={fields}
            onResetAllData={handleResetAllData}
            language={language}
          />
        )}
      </main>

      {/* New Parcel Onboarding Modal */}
      <NewFieldModal
        isOpen={newFieldModalOpen}
        onClose={() => setNewFieldModalOpen(false)}
        onAddField={handleAddField}
        language={language}
      />

      {/* Clean Editorial Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E1E8DF] py-6 px-4 sm:px-6 text-xs text-[#526D5A] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14261A] font-display">{t.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{t.footerSubtitle}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Sentinel-2 Harmonized (ESA/Copernicus)</span>
            <span aria-hidden="true">·</span>
            <span>Open-Meteo Regional Model</span>
            <span aria-hidden="true">·</span>
            <span>Google Vertex AI (Grounded Schema v1)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
