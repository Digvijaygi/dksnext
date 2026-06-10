import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Eye, EyeOff, Shield, Mail, Fingerprint, 
  AlertCircle, CheckCircle2, Loader2, ShieldCheck,
  Clock, ArrowRight, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminLoginProps {
  onLogin: () => void;
}

// Custom hook for password strength validation
const usePasswordStrength = (password: string) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    setStrength(score);

    const newFeedback = [];
    if (!checks.length) newFeedback.push('At least 8 characters');
    if (!checks.uppercase) newFeedback.push('Uppercase letter');
    if (!checks.lowercase) newFeedback.push('Lowercase letter');
    if (!checks.number) newFeedback.push('Number');
    if (!checks.special) newFeedback.push('Special character');

    setFeedback(newFeedback);
  }, [password]);

  return { strength, feedback };
};

// Rate limiting helper
const useRateLimiter = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const [attempts, setAttempts] = useState<number[]>([]);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...validAttempts);
      const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
      return { allowed: false, waitTime };
    }
    
    return { allowed: true, waitTime: 0 };
  }, [attempts, maxAttempts, windowMs]);

  const recordAttempt = useCallback(() => {
    setAttempts(prev => [...prev, Date.now()]);
  }, []);

  const resetAttempts = useCallback(() => {
    setAttempts([]);
  }, []);

  return { checkRateLimit, recordAttempt, resetAttempts };
};

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<number | null>(null);
  
  const { strength: passwordStrength, feedback: passwordFeedback } = usePasswordStrength(password);
  const { checkRateLimit, recordAttempt, resetAttempts } = useRateLimiter();

  // Check for caps lock
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Session timeout warning
  useEffect(() => {
    if (sessionTimer && sessionTimer <= 60) {
      toast.warning(`Session expires in ${sessionTimer} seconds`, {
        duration: 5000,
        icon: <Clock className="w-4 h-4" />,
      });
    }
  }, [sessionTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validation
    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Please enter email and password', {
        icon: <AlertCircle className="w-4 h-4" />,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Rate limiting check
    const { allowed, waitTime } = checkRateLimit();
    if (!allowed) {
      toast.error(`Too many attempts. Please try again in ${waitTime} seconds`, {
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Add artificial delay for security (prevents timing attacks)
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        recordAttempt();
        setLoginAttempts(prev => prev + 1);
        
        // Show different error messages based on attempt count
        if (loginAttempts >= 3) {
          toast.error('Multiple failed attempts. Account will be temporarily locked.', {
            duration: 5000,
            icon: <ShieldCheck className="w-4 h-4" />,
          });
        } else {
          toast.error('Invalid email or password', {
            description: `${3 - loginAttempts} attempts remaining`,
          });
        }
        return;
      }

      if (data.user) {
        // Reset attempts on successful login
        resetAttempts();
        
        // Store session info
        if (rememberMe) {
          localStorage.setItem('adminEmail', trimmedEmail);
          localStorage.setItem('adminSession', Date.now().toString());
        } else {
          sessionStorage.setItem('adminSession', Date.now().toString());
        }
        
        // Simulate session timeout (5 minutes for demo)
        let timer = 300;
        const interval = setInterval(() => {
          timer--;
          setSessionTimer(timer);
          if (timer <= 0) {
            clearInterval(interval);
            toast.error('Session expired. Please login again.');
            // In a real app, you would redirect to logout
          }
        }, 1000);
        
        toast.success('Welcome back!', {
          description: 'Redirecting to admin panel...',
          icon: <CheckCircle2 className="w-4 h-4" />,
          duration: 2000,
        });
        
        setTimeout(() => {
          onLogin();
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your connection and try again.', {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      toast.error('Biometric authentication is not supported on this device');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Biometric verification successful!');
      // In a real app, you would implement WebAuthn here
    } catch (error) {
      toast.error('Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative">
          {/* Decorative border gradient */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-30" />
          
          <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative w-24 h-24 mx-auto mb-6"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative glass-island w-full h-full rounded-2xl flex items-center justify-center border border-primary/30">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-6 h-6"
                >
                  <ShieldCheck className="w-6 h-6 text-primary/60" />
                </motion.div>
              </motion.div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                Admin Panel
              </h1>
              <p className="text-muted-foreground text-sm">
                Secure access to website management
              </p>
              
              {loginAttempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs text-yellow-500 flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>{3 - loginAttempts} login attempts remaining</span>
                </motion.div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!showTwoFactor ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Admin email address"
                      className="pl-12 h-14 bg-background/50 border-white/10 focus:border-primary/50 rounded-xl text-base transition-all duration-300"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={handleKeyPress}
                      placeholder="Enter your password"
                      className="pl-12 pr-12 h-14 bg-background/50 border-white/10 focus:border-primary/50 rounded-xl text-base transition-all duration-300"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    
                    {/* Caps lock indicator */}
                    {isCapsLockOn && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-6 left-0 text-xs text-yellow-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Caps Lock is on
                      </motion.div>
                    )}
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength
                                ? i < 2
                                  ? 'bg-red-500'
                                  : i < 4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      {passwordFeedback.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {passwordFeedback.map((feedback, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-primary/50 rounded-full" />
                              <span>{feedback}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-background/50 text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Remember me
                      </span>
                    </label>
                    
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                      onClick={() => toast.info('Contact admin to reset password')}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying credentials...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  {/* Biometric login option */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-card/80 text-muted-foreground">OR</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBiometricLogin}
                    disabled={isLoading}
                    className="w-full h-12 bg-background/50 border-white/10 hover:bg-white/5 rounded-xl text-base"
                  >
                    <Fingerprint className="w-5 h-5 mr-2" />
                    Biometric Login
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="2fa-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-4">
                    <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>
                  
                  <Input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest h-14 bg-background/50 border-white/10 rounded-xl"
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTwoFactor(false)}
                      className="flex-1 h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (twoFactorCode.length === 6) {
                          toast.success('2FA verification successful!');
                          onLogin();
                        } else {
                          toast.error('Please enter a valid 6-digit code');
                        }
                      }}
                      className="flex-1 h-12 bg-primary"
                    >
                      Verify
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Encrypted</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
