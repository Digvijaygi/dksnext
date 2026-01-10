import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminLoginProps {
  onLogin: () => void;
}

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

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checkingPassword, setCheckingPassword] = useState(true);

  // Check if password exists in database
  useEffect(() => {
    const checkPasswordExists = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'admin_password')
          .maybeSingle();

        if (error) {
          console.error('Error checking password:', error);
          setCheckingPassword(false);
          return;
        }

        // If no password set, this is first time setup
        setIsFirstTime(!data || !data.value);
        setCheckingPassword(false);
      } catch (error) {
        console.error('Error:', error);
        setCheckingPassword(false);
      }
    };

    checkPasswordExists();
  }, []);

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please fill both password fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const passwordHash = simpleHash(password);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'admin_password',
          value: JSON.stringify(passwordHash),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) {
        console.error('Error saving password:', error);
        toast.error('Failed to set password. Please try again.');
        return;
      }

      // Store session with timestamp
      localStorage.setItem('admin_session', Date.now().toString());
      toast.success('Password set successfully! Welcome to Admin Panel.');
      onLogin();
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Please enter password');
      return;
    }

    setIsLoading(true);

    try {
      // Get password hash from database
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'admin_password')
        .maybeSingle();

      if (error) {
        console.error('Error fetching password:', error);
        toast.error('Login failed. Please try again.');
        return;
      }

      if (!data || !data.value) {
        toast.error('No password set. Please set up a password first.');
        setIsFirstTime(true);
        return;
      }

      const storedHash = JSON.parse(data.value as string);
      const inputHash = simpleHash(password);

      if (inputHash === storedHash) {
        // Store session with timestamp
        localStorage.setItem('admin_session', Date.now().toString());
        toast.success('Welcome to Admin Panel!');
        onLogin();
      } else {
        toast.error('Incorrect password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background glows */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="glass-island w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              {isFirstTime ? (
                <KeyRound className="w-10 h-10 text-primary" />
              ) : (
                <Shield className="w-10 h-10 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isFirstTime ? 'Setup Admin Password' : 'Admin Panel'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isFirstTime 
                ? 'Create a password to secure your admin panel' 
                : 'Enter password to access website management'}
            </p>
          </div>

          {isFirstTime ? (
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create new password"
                  className="pl-12 pr-12 h-14 glass-input text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="pl-12 h-14 glass-input text-base"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    Set Password & Enter
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-12 pr-12 h-14 glass-input text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Access Panel
                  </span>
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Session expires after 10 minutes of inactivity
          </p>
        </div>
      </motion.div>
    </div>
  );
};
