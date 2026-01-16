import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BannerSettings {
  enabled: boolean;
  text: string;
  linkText: string;
  linkUrl: string;
  type: 'info' | 'success' | 'warning' | 'special';
}

const typeStyles = {
  info: 'bg-blue-600/95 text-white',
  success: 'bg-emerald-600/95 text-white',
  warning: 'bg-amber-500/95 text-white',
  special: 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white',
};

export const AnnouncementBanner = () => {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchBanner();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('banner-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: "key=eq.banner" },
        () => {
          fetchBanner();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBanner = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'banner')
      .single();

    if (data && !error) {
      const value = data.value as Record<string, any>;
      setBanner({
        enabled: value.enabled || false,
        text: value.text || '',
        linkText: value.linkText || '',
        linkUrl: value.linkUrl || '',
        type: value.type || 'info',
      });
    }
  };

  if (!banner || !banner.enabled || !banner.text || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${typeStyles[banner.type]} relative z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3 text-sm md:text-base">
          <span className="text-center">{banner.text}</span>
          {banner.linkText && banner.linkUrl && (
            <a
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              {banner.linkText}
            </a>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
