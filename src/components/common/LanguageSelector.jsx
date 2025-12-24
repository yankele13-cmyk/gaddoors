import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'he', label: 'HE', flag: '🇮🇱' }
];

export default function LanguageSelector({ variant = 'default' }) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    // RTL logic handles itself via App.jsx effect
  };

  if (variant === 'minimal') {
    return (
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`p-1 text-xs rounded font-bold transition-colors ${
              i18n.language === lang.code 
                ? 'bg-[#d4af37] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
            title={lang.label}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown-style or pill
  return (
    <div className="flex bg-zinc-900 border border-zinc-700 rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
            i18n.language === lang.code 
              ? 'bg-[#d4af37] text-black shadow-md' 
              : 'text-gray-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <span>{lang.flag}</span>
          <span className="hidden md:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
