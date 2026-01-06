import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectCategory, ProjectStatus } from '@/data/projects';

export const useSupabaseProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from Supabase
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      const formattedProjects: Project[] = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        tags: p.tags || [],
        githubUrl: p.github_url || undefined,
        liveUrl: p.live_url || undefined,
        category: p.category as ProjectCategory,
        status: p.status as ProjectStatus,
        featured: p.featured,
      }));
      setProjects(formattedProjects);
    }
    setIsLoading(false);
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  const addProject = useCallback(async (project: Project) => {
    const { error } = await supabase.from('projects').insert({
      id: project.id,
      title: project.title,
      description: project.description,
      image: project.image,
      tags: project.tags,
      github_url: project.githubUrl,
      live_url: project.liveUrl,
      category: project.category,
      status: project.status,
      featured: project.featured,
    });

    if (error) {
      console.error('Error adding project:', error);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting project:', error);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase.from('projects').update({
      title: updates.title,
      description: updates.description,
      image: updates.image,
      tags: updates.tags,
      github_url: updates.githubUrl,
      live_url: updates.liveUrl,
      category: updates.category,
      status: updates.status,
      featured: updates.featured,
    }).eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
    }
  }, []);

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
    searchProjects,
    getProjectsByCategory,
    getProjectsByStatus,
    getFeaturedProjects,
  };
};
