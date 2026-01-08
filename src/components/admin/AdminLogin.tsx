import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const PASSWORD_STORAGE_KEY = 'admin_password_hash';
export const DEFAULT_PASSWORD = 'dks@admin2024';

export const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

const getStoredPasswordHash = async (): Promise<string> => {
  // First try to get from Supabase
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_password')
      .maybeSingle();
    
    if (!error && data?.value) {
      const passwordData = data.value as { hash: string };
      if (passwordData.hash) {
        return passwordData.hash;
      }
    }
  } catch (e) {
    console.log('Supabase not available, using localStorage');
  }
  
  // Fallback to localStorage
  return localStorage.getItem(PASSWORD_STORAGE_KEY) || simpleHash(DEFAULT_PASSWORD);
};

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedHash = await getStoredPasswordHash();
      if (simpleHash(password) === storedHash) {
        const loginTime = Date.now();
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_login_time', loginTime.toString());
        toast.success('Admin access granted!');
        onLogin();
      } else {
        toast.error('Incorrect password!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter password to access website management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Access Admin Panel
                </span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
