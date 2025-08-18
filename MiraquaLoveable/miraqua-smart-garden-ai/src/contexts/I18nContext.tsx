
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'hi' | 'fr';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    'nav.home': 'Home',
    'nav.analytics': 'Analytics',
    'nav.map': 'Map',
    'nav.chat': 'AI Chat',
    'nav.community': 'Community',
    'nav.marketplace': 'Marketplace',
    'nav.account': 'Account',
    'welcome.title': 'Welcome to Miraqua',
    'welcome.subtitle': 'Smart irrigation made simple',
    'welcome.getStarted': 'Get Started - It\'s Free',
    'welcome.signIn': 'I Already Have an Account',
    'home.waterSaved': 'Water Saved',
    'home.automation': 'Automation',
    'home.priorityTasks': 'Priority Tasks',
    'home.myPlots': 'My Plots',
    'plot.healthy': 'Healthy',
    'plot.warning': 'Attention',
    'plot.critical': 'Critical',
    'sensor.online': 'Online',
    'sensor.offline': 'Offline',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.analytics': 'Análisis',
    'nav.map': 'Mapa',
    'nav.chat': 'Chat IA',
    'nav.community': 'Comunidad',
    'nav.marketplace': 'Mercado',
    'nav.account': 'Cuenta',
    'welcome.title': 'Bienvenido a Miraqua',
    'welcome.subtitle': 'Riego inteligente simplificado',
    'welcome.getStarted': 'Comenzar - Es Gratis',
    'welcome.signIn': 'Ya Tengo Una Cuenta',
    'home.waterSaved': 'Agua Ahorrada',
    'home.automation': 'Automatización',
    'home.priorityTasks': 'Tareas Prioritarias',
    'home.myPlots': 'Mis Parcelas',
    'plot.healthy': 'Saludable',
    'plot.warning': 'Atención',
    'plot.critical': 'Crítico',
    'sensor.online': 'En línea',
    'sensor.offline': 'Desconectado',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar'
  },
  hi: {
    'nav.home': 'होम',
    'nav.analytics': 'विश्लेषण',
    'nav.map': 'मानचित्र',
    'nav.chat': 'AI चैट',
    'nav.community': 'समुदाय',
    'nav.marketplace': 'बाज़ार',
    'nav.account': 'खाता',
    'welcome.title': 'मिराक्वा में आपका स्वागत है',
    'welcome.subtitle': 'स्मार्ट सिंचाई सरल बनाई गई',
    'welcome.getStarted': 'शुरू करें - यह मुफ़्त है',
    'welcome.signIn': 'मेरे पास पहले से खाता है',
    'home.waterSaved': 'पानी बचाया गया',
    'home.automation': 'स्वचालन',
    'home.priorityTasks': 'प्राथमिकता कार्य',
    'home.myPlots': 'मेरे भूखंड',
    'plot.healthy': 'स्वस्थ',
    'plot.warning': 'ध्यान',
    'plot.critical': 'गंभीर',
    'sensor.online': 'ऑनलाइन',
    'sensor.offline': 'ऑफलाइन',
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.analytics': 'Analyses',
    'nav.map': 'Carte',
    'nav.chat': 'Chat IA',
    'nav.community': 'Communauté',
    'nav.marketplace': 'Marché',
    'nav.account': 'Compte',
    'welcome.title': 'Bienvenue sur Miraqua',
    'welcome.subtitle': 'Irrigation intelligente simplifiée',
    'welcome.getStarted': 'Commencer - C\'est Gratuit',
    'welcome.signIn': 'J\'ai Déjà Un Compte',
    'home.waterSaved': 'Eau Économisée',
    'home.automation': 'Automatisation',
    'home.priorityTasks': 'Tâches Prioritaires',
    'home.myPlots': 'Mes Parcelles',
    'plot.healthy': 'Sain',
    'plot.warning': 'Attention',
    'plot.critical': 'Critique',
    'sensor.online': 'En ligne',
    'sensor.offline': 'Hors ligne',
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler'
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('miraqua-language') as Language) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('miraqua-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
