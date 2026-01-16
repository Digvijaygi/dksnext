import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, Megaphone, Palette, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BannerSettings {
  enabled: boolean;
  text: string;
  linkText: string;
  linkUrl: string;
  type: 'info' | 'success' | 'warning' | 'special';
}

const defaultBanner: BannerSettings = {
  enabled: false,
  text: '',
  linkText: '',
  linkUrl: '',
  type: 'info',
};

const typeColors = {
  info: 'bg-blue-500/90',
  success: 'bg-green-500/90',
  warning: 'bg-amber-500/90',
  special: 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400',
};

const typeLabels = {
  info: '📢 Info',
  success: '✅ Success',
  warning: '⚠️ Warning',
  special: '🎉 Special Offer',
};

export const BannerPanel = () => {
  const [banner, setBanner] = useState<BannerSettings>(defaultBanner);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBannerSettings();
  }, []);

  const fetchBannerSettings = async () => {
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First check if banner setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'banner')
        .single();

      let error;
      if (existing) {
        // Update existing
        const result = await supabase
          .from('site_settings')
          .update({
            value: banner as unknown as Record<string, any>,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'banner');
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('site_settings')
          .insert({
            key: 'banner',
            value: banner as unknown as Record<string, any>,
            updated_at: new Date().toISOString(),
          });
        error = result.error;
      }

      if (error) throw error;
      toast.success('Banner settings saved!');
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Banner / Announcement Settings
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {banner.enabled ? 'Banner Active' : 'Banner Hidden'}
            </span>
            <Switch
              checked={banner.enabled}
              onCheckedChange={(checked) => setBanner(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
        </div>

        <div className="space-y-5">
          {/* Banner Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4" /> Banner Type
            </label>
            <Select
              value={banner.type}
              onValueChange={(value) => setBanner(prev => ({ ...prev, type: value as BannerSettings['type'] }))}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Banner Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Type className="w-4 h-4" /> Banner Message
            </label>
            <Textarea
              value={banner.text}
              onChange={(e) => setBanner(prev => ({ ...prev, text: e.target.value }))}
              placeholder="🎉 Special Offer! Get 20% off on all projects this month..."
              className="bg-background/50 min-h-[80px]"
            />
          </div>

          {/* Link Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Link Text (Optional)</label>
              <Input
                value={banner.linkText}
                onChange={(e) => setBanner(prev => ({ ...prev, linkText: e.target.value }))}
                placeholder="Learn More →"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Link URL</label>
              <Input
                value={banner.linkUrl}
                onChange={(e) => setBanner(prev => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview
            </label>
            <div className={`${typeColors[banner.type]} text-white py-3 px-4 rounded-lg text-center`}>
              <span>{banner.text || 'Your banner message will appear here...'}</span>
              {banner.linkText && (
                <span className="ml-2 underline font-medium">{banner.linkText}</span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Banner Settings'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">💡</span>
          Banner Tips
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Use <strong>Special Offer</strong> type for discounts and promotions</li>
          <li>• Keep messages short and clear for better visibility</li>
          <li>• Add a link to direct users to specific pages or contact</li>
          <li>• The banner will appear at the top of your website</li>
        </ul>
      </motion.div>
    </div>
  );
};
