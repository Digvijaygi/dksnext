import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Storage key for password
const PASSWORD_STORAGE_KEY = 'admin_password_hash';
const DEFAULT_PASSWORD = 'dks@admin2024';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Simple hash function for local storage (not for production security)
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

const getStoredPasswordHash = () => {
  return localStorage.getItem(PASSWORD_STORAGE_KEY) || simpleHash(DEFAULT_PASSWORD);
};

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const storedHash = getStoredPasswordHash();
      if (simpleHash(password) === storedHash) {
        const loginTime = Date.now();
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_login_time', loginTime.toString());
        toast.success('Admin access granted!');
        onLogin();
      } else {
        toast.error('Incorrect password!');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="glass-card glass-shine p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="glass-island w-20 h-20 mx-auto mb-6 flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-foreground mb-2"
            >
              Admin Panel
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              Enter password to access project management
            </motion.p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Access Admin Panel
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
            </motion.div>
          </form>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-breathe pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-breathe pointer-events-none" style={{ animationDelay: '2s' }} />
        </motion.div>
      </div>
    </motion.div>
  );
};
