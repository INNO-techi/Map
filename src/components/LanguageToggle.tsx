import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../hooks/useLanguage';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="relative">
      <button
        onClick={() => onLanguageChange(currentLanguage === 'sw' ? 'en' : 'sw')}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-lg border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all duration-200 touch-manipulation"
      >
        <Globe className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-800">
          {currentLanguage === 'sw' ? 'SW' : 'EN'}
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;