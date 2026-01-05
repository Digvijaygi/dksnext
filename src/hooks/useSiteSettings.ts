import { useState, useEffect, useCallback } from 'react';

export interface SiteSettings {
  // Contact Info
  email: string;
  phone: string;
  location: string;
  
  // Hero Section
  heroName: string;
  heroTagline: string;
  heroDescription: string;
  availabilityStatus: string;
  
  // Social Links
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  
  // About Section
  aboutText1: string;
  aboutText2: string;
  aboutText3: string;
  statsProjects: string;
  statsClients: string;
  statsYears: string;
  
  // Footer
  footerName: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  // Contact Info
  email: 'contact@dks.dev',
  phone: '+91 98765 43210',
  location: 'India',
  
  // Hero Section
  heroName: 'Digvijay Sahni',
  heroTagline: 'Full Stack Developer & Web Designer',
  heroDescription: "I craft beautiful, responsive websites and web applications that bring ideas to life. Passionate about creating seamless user experiences with modern technologies.",
  availabilityStatus: 'Available for Freelance',
  
  // Social Links
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  twitterUrl: 'https://twitter.com',
  
  // About Section
  aboutText1: "नमस्ते! I'm Digvijay Sahni, a passionate Full Stack Developer based in India. With years of experience in web development, I specialize in creating modern, responsive, and user-friendly websites.",
  aboutText2: "I love turning complex problems into simple, beautiful solutions. Whether it's a dynamic web application, an e-commerce platform, or a stunning portfolio site – I bring creativity and technical expertise to every project.",
  aboutText3: "When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.",
  statsProjects: '50+',
  statsClients: '30+',
  statsYears: '5+',
  
  // Footer
  footerName: 'Digvijay Sahni',
};

const STORAGE_KEY = 'site_settings';
const SETTINGS_CHANGE_EVENT = 'site-settings-change';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  });

  // Listen for changes from other components
  useEffect(() => {
    const handleChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleChange);
    window.addEventListener('storage', handleChange);
    
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SiteSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
  }, []);

  return { settings, updateSettings, resetSettings, DEFAULT_SETTINGS };
};
