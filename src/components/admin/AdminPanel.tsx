import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LogOut, Rocket, Trash2, Edit, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLogin } from './AdminLogin';
import { ProjectForm } from './ProjectForm';
import { projects as initialProjects, Project, statusConfig } from '@/data/projects';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { GalaxyBackground } from '../GalaxyBackground';
import { CursorTrail } from '../CursorTrail';

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Load projects from localStorage or use initial
    const stored = localStorage.getItem('portfolio_projects');
    if (stored) {
      setProjectList(JSON.parse(stored));
    } else {
      setProjectList(initialProjects);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const handleSaveProject = (project: Project) => {
    const updated = [...projectList, project];
    setProjectList(updated);
    localStorage.setItem('portfolio_projects', JSON.stringify(updated));
    setShowForm(false);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projectList.filter(p => p.id !== id);
    setProjectList(updated);
    localStorage.setItem('portfolio_projects', JSON.stringify(updated));
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
            <div className="flex gap-3">
              <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </motion.div>

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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card/60 backdrop-blur-lg border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-16 h-16 rounded-lg object-cover bg-muted"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      {project.title}
                      {project.featured && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[project.status]?.className || ''}`}>
                        {statusConfig[project.status]?.label || project.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.tags.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 bg-card/40 backdrop-blur border border-border rounded-xl"
          >
            <h3 className="font-semibold text-foreground mb-2">📝 Note</h3>
            <p className="text-sm text-muted-foreground">
              Projects added here are stored in browser localStorage. For permanent storage, 
              copy the project data to <code className="text-primary">src/data/projects.ts</code> file.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};
