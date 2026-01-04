import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, Rocket, Trash2, ExternalLink, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminLogin } from './AdminLogin';
import { ProjectForm } from './ProjectForm';
import { Project, statusConfig } from '@/data/projects';
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { GalaxyBackground } from '../GalaxyBackground';
import { CursorTrail } from '../CursorTrail';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const PASSWORD_STORAGE_KEY = 'admin_password_hash';

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const { projects: projectList, addProject, deleteProject } = useProjects();

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_login_time');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  // Check session timeout
  useEffect(() => {
    const checkSession = () => {
      const auth = sessionStorage.getItem('admin_authenticated');
      const loginTime = sessionStorage.getItem('admin_login_time');
      
      if (auth === 'true' && loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed > SESSION_TIMEOUT) {
          handleLogout();
          toast.warning('Session expired. Please login again.');
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [handleLogout]);

  // Reset session timer on activity
  useEffect(() => {
    const resetTimer = () => {
      if (sessionStorage.getItem('admin_authenticated') === 'true') {
        sessionStorage.setItem('admin_login_time', Date.now().toString());
      }
    };

    window.addEventListener('click', resetTimer);
    window.addEventListener('keypress', resetTimer);
    return () => {
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, []);

  const handlePasswordChange = () => {
    const storedHash = localStorage.getItem(PASSWORD_STORAGE_KEY) || simpleHash('dks@admin2024');
    
    if (simpleHash(currentPassword) !== storedHash) {
      toast.error('Current password is incorrect');
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
    
    localStorage.setItem(PASSWORD_STORAGE_KEY, simpleHash(newPassword));
    toast.success('Password changed successfully!');
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveProject = (project: Project) => {
    addProject(project);
    setShowForm(false);
    toast.success('Project added! It will appear on the homepage instantly.');
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    toast.success('Project deleted');
  };

  if (!isAuthenticated) {
    return (
      <>
        <GalaxyBackground />
        <CursorTrail />
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <>
      <GalaxyBackground />
      <CursorTrail />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Rocket className="w-8 h-8 text-primary" />
                  Admin Panel
                </h1>
                <p className="text-muted-foreground text-sm">Manage your portfolio projects</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </Button>
              <Button variant="outline" onClick={() => setShowPasswordChange(true)} className="glass-button">
                <KeyRound className="w-4 h-4 mr-2" /> Change Password
              </Button>
              <Button variant="outline" onClick={handleLogout} className="glass-button">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </motion.div>

          {/* Password Change Form */}
          <AnimatePresence>
            {showPasswordChange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-primary" />
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div className="relative">
                      <Input
                        type={showPasswords ? 'text' : 'password'}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPasswords ? 'text' : 'password'}
                        placeholder="New Password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPasswords ? 'text' : 'password'}
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showPasswords ? 'Hide' : 'Show'} passwords
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handlePasswordChange} className="bg-primary text-primary-foreground">
                        Update Password
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowPasswordChange(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }} className="glass-button">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <ProjectForm onSave={handleSaveProject} onCancel={() => setShowForm(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Projects ({projectList.length})
            </h2>
            
            {projectList.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0)' }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="glass-card glass-shine p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-border-glow"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-20 h-20 rounded-2xl object-cover bg-muted ring-2 ring-white/10"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                      {project.title}
                      {project.featured && (
                        <span className="text-xs bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full font-medium">
                          Featured
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{project.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[project.status]?.className || ''}`}>
                        {statusConfig[project.status]?.label || project.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.tags.slice(0, 3).join(' • ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="glass-button h-10 w-10 rounded-xl">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="glass-button h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 glass-card glass-shine p-6"
          >
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">✅</span>
              Full Control Enabled
            </h3>
            <p className="text-sm text-muted-foreground">
              Projects you add/delete here will instantly update on the main website. 
              All changes are synced in real-time across the entire portfolio.
            </p>
          </motion.div>
        </div>
        
        {/* Ambient glow decorations */}
        <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-breathe pointer-events-none" />
        <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-breathe pointer-events-none" style={{ animationDelay: '2s' }} />
      </div>
    </>
  );
};
