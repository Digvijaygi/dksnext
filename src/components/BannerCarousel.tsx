import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BannerSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  linkText: string;
}

interface CarouselSettings {
  enabled: boolean;
  autoPlay: boolean;
  interval: number;
  slides: BannerSlide[];
}

export const BannerCarousel = () => {
  const [settings, setSettings] = useState<CarouselSettings | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('carousel-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: "key=eq.banner_carousel" },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'banner_carousel')
      .single();

    if (data && !error) {
      const value = data.value as Record<string, any>;
      setSettings({
        enabled: value.enabled || false,
        autoPlay: value.autoPlay !== false,
        interval: value.interval || 4000,
        slides: value.slides || [],
      });
    }
  };

  const nextSlide = useCallback(() => {
    if (!settings?.slides.length) return;
    setCurrentIndex((prev) => (prev + 1) % settings.slides.length);
  }, [settings?.slides.length]);

  const prevSlide = useCallback(() => {
    if (!settings?.slides.length) return;
    setCurrentIndex((prev) => (prev - 1 + settings.slides.length) % settings.slides.length);
  }, [settings?.slides.length]);

  useEffect(() => {
    if (!settings?.autoPlay || isPaused || !settings?.slides.length) return;

    const timer = setInterval(nextSlide, settings.interval);
    return () => clearInterval(timer);
  }, [settings?.autoPlay, settings?.interval, settings?.slides.length, isPaused, nextSlide]);

  if (!settings?.enabled || !settings?.slides?.length) {
    return null;
  }

  const currentSlide = settings.slides[currentIndex];

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-xl my-4 px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[21/9] md:aspect-[3/1] bg-black/20 rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 max-w-md"
              >
                {currentSlide.title}
              </motion.h2>
              {currentSlide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm md:text-lg text-white/80 mb-4 max-w-sm"
                >
                  {currentSlide.subtitle}
                </motion.p>
              )}
              {currentSlide.linkUrl && currentSlide.linkText && (
                <motion.a
                  href={currentSlide.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors w-fit text-sm md:text-base"
                >
                  {currentSlide.linkText}
                </motion.a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {settings.slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {settings.slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {settings.slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
