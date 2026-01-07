import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Mail, Phone, MapPin, User, FileText, Link, BarChart3, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSupabaseSiteSettings } from '@/hooks/useSupabaseSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SettingsPanel = () => {
  const { settings, updateSettings, resetSettings, isLoading } = useSupabaseSiteSettings();
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateSettings(formData);
    setHasChanges(false);
    toast.success('Settings saved! All users will see updates in real-time.');
  };

  const handleReset = async () => {
    await resetSettings();
    setFormData(settings);
    setHasChanges(false);
    toast.success('Settings reset to defaults');
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      // Check if user is authenticated with Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        // Verify current password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (signInError) {
          toast.error('Current password is incorrect');
          setChangingPassword(false);
          return;
        }

        // Update password in Supabase
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          toast.error(`Failed to change password: ${updateError.message}`);
        } else {
          toast.success('Password changed successfully!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      } else {
        // Local admin password (stored in localStorage)
        const storedHash = localStorage.getItem('adminPasswordHash');
        const defaultHash = btoa('dks@admin2024');
        const currentHash = btoa(currentPassword);
        
        if ((storedHash || defaultHash) !== currentHash) {
          toast.error('Current password is incorrect');
          setChangingPassword(false);
          return;
        }
        
        // Update local admin password
        const newHash = btoa(newPassword);
        localStorage.setItem('adminPasswordHash', newHash);
        
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('An error occurred while changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, field, type = 'text', placeholder, multiline = false }: { 
    label: string; 
    field: keyof typeof formData; 
    type?: string;
    placeholder?: string;
    multiline?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      {multiline ? (
        <Textarea
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          className="glass-input min-h-[100px]"
        />
      ) : (
        <Input
          type={type}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          className="glass-input"
        />
      )}
    </div>
  );

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
          <Field label="Email Address" field="email" type="email" placeholder="your@email.com" />
          <Field label="Phone Number" field="phone" placeholder="+91 XXXXX XXXXX" />
          <Field label="Location" field="location" placeholder="City, Country" />
        </div>
      </Section>

      {/* Hero Section */}
      <Section title="Hero Section" icon={User}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Your Name" field="heroName" placeholder="Your Full Name" />
          <Field label="Tagline" field="heroTagline" placeholder="Your profession/tagline" />
        </div>
        <Field label="Description" field="heroDescription" multiline placeholder="Brief description about yourself..." />
        <Field label="Availability Status" field="availabilityStatus" placeholder="e.g., Available for Freelance" />
      </Section>

      {/* Social Links */}
      <Section title="Social Links" icon={Link}>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="GitHub URL" field="githubUrl" placeholder="https://github.com/username" />
          <Field label="LinkedIn URL" field="linkedinUrl" placeholder="https://linkedin.com/in/username" />
          <Field label="Twitter URL" field="twitterUrl" placeholder="https://twitter.com/username" />
        </div>
      </Section>

      {/* About Section */}
      <Section title="About Section" icon={FileText}>
        <Field label="About Paragraph 1" field="aboutText1" multiline placeholder="First paragraph..." />
        <Field label="About Paragraph 2" field="aboutText2" multiline placeholder="Second paragraph..." />
        <Field label="About Paragraph 3" field="aboutText3" multiline placeholder="Third paragraph..." />
      </Section>

      {/* Stats */}
      <Section title="Statistics" icon={BarChart3}>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Projects Count" field="statsProjects" placeholder="50+" />
          <Field label="Clients Count" field="statsClients" placeholder="30+" />
          <Field label="Years Experience" field="statsYears" placeholder="5+" />
        </div>
      </Section>

      {/* Footer */}
      <Section title="Footer" icon={User}>
        <Field label="Footer Name" field="footerName" placeholder="Your name in footer" />
      </Section>

      {/* Security - Change Password */}
      <Section title="Security" icon={Lock}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="glass-input pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="glass-input pr-10"
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            variant="outline"
            className="w-full glass-button"
          >
            {changingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
        </div>
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
