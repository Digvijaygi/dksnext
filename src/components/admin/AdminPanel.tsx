import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, Rocket, Trash2, ExternalLink, ArrowLeft, Mail, FolderKanban, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLogin } from './AdminLogin';
import { ProjectForm } from './ProjectForm';
import { MessagesPanel } from './MessagesPanel';
import { SettingsPanel } from './SettingsPanel';
import { Project, statusConfig } from '@/data/projects';
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects';
import { useSupabaseContactMessages } from '@/hooks/useSupabaseContactMessages';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'settings'>('projects');
  const { projects: projectList, addProject, deleteProject } = useSupabaseProjects();
  const { unreadCount } = useSupabaseContactMessages();

  // Check for existing session on mount
  useEffect(() => {
    const sessionTime = localStorage.getItem('admin_session');
    if (sessionTime) {
      const elapsed = Date.now() - parseInt(sessionTime);
      if (elapsed < SESSION_TIMEOUT) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  // Update session time on activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateSession = () => {
      localStorage.setItem('admin_session', Date.now().toString());
    };

    // Update session on user activity
    window.addEventListener('click', updateSession);
    window.addEventListener('keypress', updateSession);

    return () => {
      window.removeEventListener('click', updateSession);
      window.removeEventListener('keypress', updateSession);
    };
  }, [isAuthenticated]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleSaveProject = async (project: Project) => {
    try {
      await addProject(project);
      setShowForm(false);
      toast.success('Project added! All users will see it in real-time.');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    toast.success('Project deleted from everywhere!');
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      {/* Ambient glow decorations */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
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
              <p className="text-muted-foreground text-sm">Manage your portfolio</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {activeTab === 'projects' && (
              <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="glass-button">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 flex-wrap"
        >
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'projects'
                ? 'bg-primary text-primary-foreground'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Projects
            <span className="ml-1 text-xs opacity-70">({projectList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 relative ${
              activeTab === 'messages'
                ? 'bg-primary text-primary-foreground'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-primary text-primary-foreground'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Website Settings
          </button>
        </motion.div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
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

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Projects ({projectList.length})
                </h2>
                
                {projectList.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-20 h-20 rounded-2xl object-cover bg-muted ring-2 ring-white/10"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                          {project.title}
                          {project.featured && (
                            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
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
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 glass-card p-6"
              >
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">✅</span>
                  Full Control Enabled
                </h3>
                <p className="text-sm text-muted-foreground">
                  Projects you add/delete here will instantly update on the main website.
                </p>
              </motion.div>
            </motion.div>
          ) : activeTab === 'messages' ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessagesPanel />
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
