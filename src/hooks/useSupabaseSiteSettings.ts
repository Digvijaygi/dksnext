import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  email: string;
  phone: string;
  location: string;
  heroName: string;
  heroTagline: string;
  heroDescription: string;
  availabilityStatus: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  aboutText1: string;
  aboutText2: string;
  aboutText3: string;
  statsProjects: string;
  statsClients: string;
  statsYears: string;
  footerName: string;
}

const defaultSettings: SiteSettings = {
  email: 'dksahni8@gmail.com',
  phone: '+91 9876543210',
  location: 'India',
  heroName: 'Digvijay Sahni',
  heroTagline: 'Full Stack Developer & UI/UX Designer',
  heroDescription: 'Building digital experiences that matter. I create beautiful, functional, and user-centered digital products.',
  availabilityStatus: 'Available for Freelance',
  githubUrl: 'https://github.com/digvijay',
  linkedinUrl: 'https://linkedin.com/in/digvijay',
  twitterUrl: 'https://twitter.com/digvijay',
  aboutText1: 'I am a passionate full-stack developer with over 5 years of experience in creating digital solutions that make a difference.',
  aboutText2: 'My expertise spans across modern web technologies, mobile development, and cloud architecture. I believe in writing clean, maintainable code.',
  aboutText3: 'When I\'m not coding, you\'ll find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.',
  statsProjects: '50+',
  statsClients: '30+',
  statsYears: '5+',
  footerName: 'Digvijay Sahni',
};

export const useSupabaseSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }

    if (data && data.length > 0) {
      const newSettings = { ...defaultSettings };
      data.forEach(row => {
        const value = row.value as Record<string, string>;
        switch (row.key) {
          case 'contact':
            if (value.email) newSettings.email = value.email;
            if (value.phone) newSettings.phone = value.phone;
            if (value.location) newSettings.location = value.location;
            break;
          case 'hero':
            if (value.title) newSettings.heroName = value.title;
            if (value.subtitle) newSettings.heroTagline = value.subtitle;
            if (value.description) newSettings.heroDescription = value.description;
            if (value.availability) newSettings.availabilityStatus = value.availability;
            break;
          case 'social':
            if (value.github) newSettings.githubUrl = value.github;
            if (value.linkedin) newSettings.linkedinUrl = value.linkedin;
            if (value.twitter) newSettings.twitterUrl = value.twitter;
            break;
          case 'about':
            if (value.text1) newSettings.aboutText1 = value.text1;
            if (value.text2) newSettings.aboutText2 = value.text2;
            if (value.text3) newSettings.aboutText3 = value.text3;
            if (value.statsProjects) newSettings.statsProjects = value.statsProjects;
            if (value.statsClients) newSettings.statsClients = value.statsClients;
            if (value.statsYears) newSettings.statsYears = value.statsYears;
            break;
          case 'footer':
            if (value.name) newSettings.footerName = value.name;
            break;
        }
      });
      setSettings(newSettings);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings: SiteSettings) => {
    setSettings(newSettings);

    // Update contact
    await supabase.from('site_settings').upsert({
      key: 'contact',
      value: {
        email: newSettings.email,
        phone: newSettings.phone,
        location: newSettings.location,
      }
    }, { onConflict: 'key' });

    // Update hero
    await supabase.from('site_settings').upsert({
      key: 'hero',
      value: {
        title: newSettings.heroName,
        subtitle: newSettings.heroTagline,
        description: newSettings.heroDescription,
        availability: newSettings.availabilityStatus,
      }
    }, { onConflict: 'key' });

    // Update social
    await supabase.from('site_settings').upsert({
      key: 'social',
      value: {
        github: newSettings.githubUrl,
        linkedin: newSettings.linkedinUrl,
        twitter: newSettings.twitterUrl,
      }
    }, { onConflict: 'key' });

    // Update about
    await supabase.from('site_settings').upsert({
      key: 'about',
      value: {
        text1: newSettings.aboutText1,
        text2: newSettings.aboutText2,
        text3: newSettings.aboutText3,
        statsProjects: newSettings.statsProjects,
        statsClients: newSettings.statsClients,
        statsYears: newSettings.statsYears,
      }
    }, { onConflict: 'key' });

    // Update footer
    await supabase.from('site_settings').upsert({
      key: 'footer',
      value: {
        name: newSettings.footerName,
      }
    }, { onConflict: 'key' });
  }, []);

  const resetSettings = useCallback(async () => {
    setSettings(defaultSettings);
    await updateSettings(defaultSettings);
  }, [updateSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
};
