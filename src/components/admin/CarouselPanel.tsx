import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Plus, Trash2, Image, Link, Type, 
  GripVertical, Eye, EyeOff, Play, Pause, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
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

const defaultSettings: CarouselSettings = {
  enabled: false,
  autoPlay: true,
  interval: 4000,
  slides: [],
};

const createEmptySlide = (): BannerSlide => ({
  id: crypto.randomUUID(),
  image: '',
  title: '',
  subtitle: '',
  linkUrl: '',
  linkText: '',
});

export const CarouselPanel = () => {
  const [settings, setSettings] = useState<CarouselSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetchSettings();
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'banner_carousel')
        .single();

      let error;
      if (existing) {
        const result = await supabase
          .from('site_settings')
          .update({
            value: settings as unknown as Record<string, any>,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'banner_carousel');
        error = result.error;
      } else {
        const result = await supabase
          .from('site_settings')
          .insert({
            key: 'banner_carousel',
            value: settings as unknown as Record<string, any>,
            updated_at: new Date().toISOString(),
          });
        error = result.error;
      }

      if (error) throw error;
      toast.success('Carousel settings saved!');
    } catch (error) {
      console.error('Error saving carousel:', error);
      toast.error('Failed to save carousel settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addSlide = () => {
    if (settings.slides.length >= 10) {
      toast.error('Maximum 10 slides allowed');
      return;
    }
    setSettings(prev => ({
      ...prev,
      slides: [...prev.slides, createEmptySlide()],
    }));
  };

  const removeSlide = (id: string) => {
    setSettings(prev => ({
      ...prev,
      slides: prev.slides.filter(s => s.id !== id),
    }));
    if (previewIndex >= settings.slides.length - 1) {
      setPreviewIndex(Math.max(0, settings.slides.length - 2));
    }
  };

  const updateSlide = (id: string, field: keyof BannerSlide, value: string) => {
    setSettings(prev => ({
      ...prev,
      slides: prev.slides.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const moveSlide = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= settings.slides.length) return;
    
    const newSlides = [...settings.slides];
    [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];
    setSettings(prev => ({ ...prev, slides: newSlides }));
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Image className="w-6 h-6 text-primary" />
            Banner Carousel (Flipkart Style)
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {settings.enabled ? 'Carousel Active' : 'Carousel Hidden'}
            </span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Auto Play */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              {settings.autoPlay ? <Play className="w-5 h-5 text-green-500" /> : <Pause className="w-5 h-5 text-muted-foreground" />}
              <div>
                <p className="font-medium text-foreground">Auto Play</p>
                <p className="text-sm text-muted-foreground">Slides change automatically</p>
              </div>
            </div>
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoPlay: checked }))}
            />
          </div>

          {/* Interval */}
          <div className="p-4 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Slide Duration: {settings.interval / 1000}s</span>
            </div>
            <Slider
              value={[settings.interval]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, interval: value }))}
              min={2000}
              max={10000}
              step={500}
              className="w-full"
            />
          </div>
        </div>

        {/* Add Slide Button */}
        <Button 
          onClick={addSlide}
          variant="outline"
          className="w-full mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Slide ({settings.slides.length}/10)
        </Button>

        {/* Slides List */}
        <div className="space-y-4">
          <AnimatePresence>
            {settings.slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-border rounded-lg p-4 bg-background/30"
              >
                <div className="flex items-start gap-4">
                  {/* Drag Handle & Index */}
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === settings.slides.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>

                  {/* Slide Content */}
                  <div className="flex-1 space-y-3">
                    {/* Image URL */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Image className="w-3 h-3" /> Image URL *
                      </label>
                      <Input
                        value={slide.image}
                        onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Type className="w-3 h-3" /> Title
                        </label>
                        <Input
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                          placeholder="Special Offer!"
                          className="bg-background/50"
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
                        <Input
                          value={slide.subtitle}
                          onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                          placeholder="Get 50% off on all items"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Link Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Link className="w-3 h-3" /> Button Text
                        </label>
                        <Input
                          value={slide.linkText}
                          onChange={(e) => updateSlide(slide.id, 'linkText', e.target.value)}
                          placeholder="Shop Now"
                          className="bg-background/50"
                        />
                      </div>

                      {/* Link URL */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Button Link</label>
                        <Input
                          value={slide.linkUrl}
                          onChange={(e) => updateSlide(slide.id, 'linkUrl', e.target.value)}
                          placeholder="https://..."
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Image Preview */}
                    {slide.image && (
                      <div className="relative aspect-[3/1] bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={slide.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x300?text=Invalid+Image+URL';
                          }}
                        />
                        {slide.title && (
                          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-4">
                            <div>
                              <p className="text-white font-bold text-sm">{slide.title}</p>
                              {slide.subtitle && <p className="text-white/80 text-xs">{slide.subtitle}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlide(slide.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {settings.slides.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No slides added yet</p>
              <p className="text-sm">Click "Add New Slide" to create your first banner</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-border mt-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Carousel Settings'}
          </Button>
        </div>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">💡</span>
          Carousel Tips
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Use high-quality images with <strong>1200x400</strong> or <strong>1920x600</strong> resolution for best results</li>
          <li>• Keep text on the left side of images as overlay appears from left</li>
          <li>• Use 4-5 slides for optimal user engagement</li>
          <li>• Set auto-play duration between 3-5 seconds</li>
          <li>• Drag slides to reorder them</li>
        </ul>
      </motion.div>
    </div>
  );
};
