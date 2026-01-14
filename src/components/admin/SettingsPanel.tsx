import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Mail, Phone, MapPin, User, FileText, Link, BarChart3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseSiteSettings, SiteSettings } from '@/hooks/useSupabaseSiteSettings';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Simple hash function for password
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Field component moved outside to prevent re-renders
interface FieldProps {
  label: string;
  field: keyof SiteSettings;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  value: string;
  onChange: (field: keyof SiteSettings, value: string) => void;
}

const Field = ({ label, field, type = 'text', placeholder, multiline = false, value, onChange }: FieldProps) => (
  <div className="space-y-2">
    <label className="text-sm text-muted-foreground">{label}</label>
    {multiline ? (
      <Textarea
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="glass-input min-h-[100px]"
      />
    ) : (
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="glass-input"
      />
    )}
  </div>
);

// Section component moved outside
const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="glass-card p-6 space-y-4">
    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      {title}
    </h3>
    {children}
  </div>
);

export const SettingsPanel = () => {
  const { settings, updateSettings, resetSettings, isLoading } = useSupabaseSiteSettings();
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = useCallback((field: keyof SiteSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setHasChanges(false);
      toast.success('Settings saved! All users will see updates in real-time.');
    } catch (e) {
      console.error('Settings save failed:', e);
      toast.error('Settings save failed. Please try again.');
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
      setFormData(settings);
      setHasChanges(false);
      toast.success('Settings reset to defaults');
    } catch (e) {
      console.error('Settings reset failed:', e);
      toast.error('Settings reset failed. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      toast.error('Please fill all password fields');
      return;
    }

    if (trimmedNew.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Get current password from database
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'admin_password')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching password:', fetchError);
        toast.error('Failed to verify password. Please try again.');
        return;
      }

      if (!data || !data.value) {
        toast.error('No password set in database');
        return;
      }

      // Handle JSONB values - parse if it's a JSON string, otherwise convert to string
      let storedHash: string;
      if (typeof data.value === 'string') {
        try {
          storedHash = JSON.parse(data.value);
        } catch {
          storedHash = data.value;
        }
      } else {
        storedHash = String(data.value);
      }

      const currentHash = simpleHash(trimmedCurrent);

      if (currentHash !== storedHash) {
        toast.error('Current password is incorrect');
        return;
      }

      // Save new password hash to database
      const newHash = simpleHash(trimmedNew);

      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: 'admin_password',
            value: newHash,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (updateError) {
        console.error('Error updating password:', updateError);
        toast.error('Failed to update password. Please try again.');
        return;
      }

      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success('Password changed successfully! It will sync across all devices.');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="bg-primary text-primary-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="glass-button"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Contact Information */}
      <Section title="Contact Information" icon={Mail}>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Email Address" field="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
          <Field label="Phone Number" field="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
          <Field label="Location" field="location" placeholder="City, Country" value={formData.location} onChange={handleChange} />
        </div>
      </Section>

      {/* Hero Section */}
      <Section title="Hero Section" icon={User}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Your Name" field="heroName" placeholder="Your Full Name" value={formData.heroName} onChange={handleChange} />
          <Field label="Tagline" field="heroTagline" placeholder="Your profession/tagline" value={formData.heroTagline} onChange={handleChange} />
        </div>
        <Field label="Description" field="heroDescription" multiline placeholder="Brief description about yourself..." value={formData.heroDescription} onChange={handleChange} />
        <Field label="Availability Status" field="availabilityStatus" placeholder="e.g., Available for Freelance" value={formData.availabilityStatus} onChange={handleChange} />
      </Section>

      {/* Social Links */}
      <Section title="Social Links" icon={Link}>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="GitHub URL" field="githubUrl" placeholder="https://github.com/username" value={formData.githubUrl} onChange={handleChange} />
          <Field label="LinkedIn URL" field="linkedinUrl" placeholder="https://linkedin.com/in/username" value={formData.linkedinUrl} onChange={handleChange} />
          <Field label="Twitter URL" field="twitterUrl" placeholder="https://twitter.com/username" value={formData.twitterUrl} onChange={handleChange} />
        </div>
      </Section>

      {/* About Section */}
      <Section title="About Section" icon={FileText}>
        <Field label="About Paragraph 1" field="aboutText1" multiline placeholder="First paragraph..." value={formData.aboutText1} onChange={handleChange} />
        <Field label="About Paragraph 2" field="aboutText2" multiline placeholder="Second paragraph..." value={formData.aboutText2} onChange={handleChange} />
        <Field label="About Paragraph 3" field="aboutText3" multiline placeholder="Third paragraph..." value={formData.aboutText3} onChange={handleChange} />
      </Section>

      {/* Stats */}
      <Section title="Statistics" icon={BarChart3}>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Projects Count" field="statsProjects" placeholder="50+" value={formData.statsProjects} onChange={handleChange} />
          <Field label="Clients Count" field="statsClients" placeholder="30+" value={formData.statsClients} onChange={handleChange} />
          <Field label="Years Experience" field="statsYears" placeholder="5+" value={formData.statsYears} onChange={handleChange} />
        </div>
      </Section>

      {/* Footer */}
      <Section title="Footer" icon={User}>
        <Field label="Footer Name" field="footerName" placeholder="Your name in footer" value={formData.footerName} onChange={handleChange} />
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon={Lock}>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="glass-input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="glass-input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="glass-input"
            />
          </div>
        </div>
        <Button 
          onClick={handleChangePassword} 
          disabled={isChangingPassword}
          className="mt-4 bg-primary text-primary-foreground"
        >
          {isChangingPassword ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Update Password
            </>
          )}
        </Button>
      </Section>

      {/* Save reminder */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 glass-card p-4 flex items-center gap-4 z-50"
        >
          <span className="text-sm text-muted-foreground">You have unsaved changes</span>
          <Button onClick={handleSave} size="sm" className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
