import React from 'react';
import { Language } from '../types/farmwatch';
import { translations } from '../utils/i18n';
import { Sprout, Globe, Plus, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNewField: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onNewField,
}) => {
  const t = translations[language];

  const navLinks = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'fields', label: t.nav.fields },
    { id: 'satellite', label: t.nav.satellite },
    { id: 'ai', label: t.nav.aiAdvisory },
    { id: 'soilWeather', label: t.nav.soilWeather },
    { id: 'actions', label: t.nav.actionLog },
    { id: 'privacy', label: t.nav.privacy },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E1E8DF] shadow-[0_1px_2px_rgba(20,35,24,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Mark (Single clean text element) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#235835] text-white flex items-center justify-center shadow-xs">
            <Sprout className="w-5 h-5 text-[#E6F3E9]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#14261A] font-display">
            {t.brand}
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean text with hover/active underline) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#465A4C]">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`py-1.5 transition-colors relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#1D4A2B] font-semibold'
                    : 'hover:text-[#14261A]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#235835] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Language Toggle & New Field CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#384E3F] hover:text-[#14261A] hover:bg-[#F2F6F1] rounded-md transition-colors cursor-pointer border border-[#D5E0D3]"
            title="Toggle Language (English / हिन्दी)"
          >
            <Globe className="w-3.5 h-3.5 text-[#235835]" />
            <span className="tabular-nums">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* New Field Action */}
          <button
            onClick={onNewField}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#235835] hover:bg-[#1C482A] active:bg-[#163821] rounded-md shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.common.addField}</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center gap-4 px-4 py-2 border-t border-[#EEF2EC] overflow-x-auto text-xs font-medium text-[#465A4C] scrollbar-none">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`py-1 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-[#235835] font-semibold border-b-2 border-[#235835]'
                  : 'hover:text-[#14261A]'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
