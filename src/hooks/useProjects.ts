import { useState, useEffect, useCallback } from 'react';
import { projects as initialProjects, Project, ProjectCategory, ProjectStatus } from '@/data/projects';

const STORAGE_KEY = 'portfolio_projects';

// Custom event for project updates
const PROJECTS_UPDATED_EVENT = 'projects-updated';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects from localStorage
  const loadProjects = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      setProjects(initialProjects);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProjects));
    }
    setIsLoading(false);
  }, []);

  // Listen for updates from other components
  useEffect(() => {
    loadProjects();

    const handleUpdate = () => loadProjects();
    window.addEventListener(PROJECTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PROJECTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadProjects]);

  // Save projects and notify other components
  const saveProjects = useCallback((newProjects: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    setProjects(newProjects);
    window.dispatchEvent(new CustomEvent(PROJECTS_UPDATED_EVENT));
  }, []);

  const addProject = useCallback((project: Project) => {
    saveProjects([...projects, project]);
  }, [projects, saveProjects]);

  const deleteProject = useCallback((id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  }, [projects, saveProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    saveProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [projects, saveProjects]);

  // Filter helpers
  const searchProjects = useCallback((query: string) => {
    const q = query.toLowerCase();
    return projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [projects]);

  const getProjectsByCategory = useCallback((category: ProjectCategory) => {
    return projects.filter(p => p.category === category);
  }, [projects]);

  const getProjectsByStatus = useCallback((status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  }, [projects]);

  const getFeaturedProjects = useCallback(() => {
    return projects.filter(p => p.featured);
  }, [projects]);

  return {
    projects,
    isLoading,
    addProject,
    deleteProject,
    updateProject,
    saveProjects,
    searchProjects,
    getProjectsByCategory,
    getProjectsByStatus,
    getFeaturedProjects,
  };
};
