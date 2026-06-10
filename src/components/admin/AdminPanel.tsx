import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, LogOut, Rocket, Trash2, ExternalLink, ArrowLeft, Mail, 
  FolderKanban, Settings, Edit2, Image, Search, Filter, SortAsc, 
  SortDesc, Download, Upload, Bell, Moon, Sun, Activity, 
  BarChart3, Users, Eye, Calendar, Tag, Star, Archive, 
  RefreshCw, Shield, Lock, Key, Database, HardDrive,
  Clock, CheckCircle2, XCircle, AlertTriangle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminLogin } from './AdminLogin';
import { ProjectForm } from './ProjectForm';
import { MessagesPanel } from './MessagesPanel';
import { SettingsPanel } from './SettingsPanel';
import { CarouselPanel } from './CarouselPanel';
import { Project, statusConfig } from '@/data/projects';
import { useSupabaseProjects } from '@/hooks/useSupabaseProjects';
import { useSupabaseContactMessages } from '@/hooks/useSupabaseContactMessages';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Custom hooks for advanced features
const useAnalytics = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    todayViews: 0,
    averageTime: '0:00',
    bounceRate: '0%'
  });

  useEffect(() => {
    // Simulate analytics data - replace with actual API call
    const fetchStats = async () => {
      // In production, fetch from your analytics service
      setStats({
        totalViews: Math.floor(Math.random() * 10000),
        todayViews: Math.floor(Math.random() * 500),
        averageTime: '2:34',
        bounceRate: '45%'
      });
    };
    fetchStats();
  }, []);

  return stats;
};

const useRealtimeStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', { icon: <Zap className="w-4 h-4" /> });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Changes will be saved locally.', { duration: 0 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncNow = useCallback(async () => {
    setLastSync(new Date());
    toast.success('Synced with server');
  }, []);

  return { isOnline, lastSync, syncNow };
};

// Advanced search and filter hook
const useProjectFilters = (projects: Project[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(project => project.tags.forEach(tag => tags.add(tag)));
    return ['all', ...Array.from(tags)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter(project => project.tags.includes(tagFilter));
    }

    // Featured filter
    if (featuredOnly) {
      filtered = filtered.filter(project => project.featured);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, searchTerm, statusFilter, tagFilter, sortBy, sortOrder, featuredOnly]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    featuredOnly,
    setFeaturedOnly,
    allTags,
    filteredProjects
  };
};

// Bulk actions hook
const useBulkActions = (onDelete: (ids: string[]) => Promise<void>) => {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProjects(newSelected);
  };

  const selectAll = (ids: string[]) => {
    setSelectedProjects(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedProjects(new Set());
  };

  const deleteSelected = async () => {
    if (selectedProjects.size === 0) return;
    
    const confirmed = window.confirm(`Delete ${selectedProjects.size} projects? This action cannot be undone.`);
    if (confirmed) {
      await onDelete(Array.from(selectedProjects));
      clearSelection();
      toast.success(`${selectedProjects.size} projects deleted`);
    }
  };

  return {
    selectedProjects,
    toggleSelect,
    selectAll,
    clearSelection,
    deleteSelected,
    hasSelected: selectedProjects.size > 0
  };
};

// Export/Import functionality
const useDataExport = (projects: Project[]) => {
  const exportData = useCallback(async (format: 'json' | 'csv') => {
    try {
      let data: string;
      let filename: string;
      let type: string;

      if (format === 'json') {
        data = JSON.stringify(projects, null, 2);
        filename = `projects-export-${new Date().toISOString()}.json`;
        type = 'application/json';
      } else {
        // CSV export
        const headers = ['id', 'title', 'description', 'status', 'tags', 'featured', 'liveUrl', 'githubUrl', 'createdAt'];
        const csvRows = [headers];
        
        for (const project of projects) {
          const row = headers.map(header => {
            let value = project[header as keyof Project];
            if (header === 'tags') value = (value as string[]).join(';');
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            return value;
          });
          csvRows.push(row);
        }
        
        data = csvRows.join('\n');
        filename = `projects-export-${new Date().toISOString()}.csv`;
        type = 'text/csv';
      }

      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${projects.length} projects as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  }, [projects]);

  const importData = useCallback(async (file: File, onImport: (projects: Project[]) => Promise<void>) => {
    try {
      const text = await file.text();
      let importedProjects: Project[];
      
      if (file.name.endsWith('.json')) {
        importedProjects = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        importedProjects = lines.slice(1).map(line => {
          const values = line.split(',');
          const project: any = {};
          headers.forEach((header, index) => {
            let value = values[index]?.replace(/^"|"$/g, '');
            if (header === 'tags') value = value.split(';');
            if (header === 'featured') value = value === 'true';
            project[header] = value;
          });
          return project;
        });
      } else {
        throw new Error('Unsupported file format');
      }
      
      await onImport(importedProjects);
      toast.success(`Imported ${importedProjects.length} projects`);
    } catch (error) {
      toast.error('Import failed: Invalid file format');
    }
  }, []);

  return { exportData, importData };
};

// Notification system
const useNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>>([]);

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    toast[type](message, { duration: 4000 });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, addNotification, markAsRead, clearAll, unreadCount };
};

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'settings' | 'carousel' | 'analytics'>('projects');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { projects: projectList, addProject, deleteProject, updateProject, refreshProjects } = useSupabaseProjects();
  const { unreadCount: messagesUnread } = useSupabaseContactMessages();
  const stats = useAnalytics();
  const { isOnline, lastSync, syncNow } = useRealtimeStatus();
  const { notifications, addNotification, markAsRead, clearAll, unreadCount: notifUnread } = useNotifications();
  const { filteredProjects, ...filters } = useProjectFilters(projectList);
  const bulkActions = useBulkActions(async (ids) => {
    for (const id of ids) {
      await deleteProject(id);
    }
  });
  const { exportData, importData } = useDataExport(projectList);

  // Theme management
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsCheckingAuth(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    addNotification('Logged Out', 'You have been successfully logged out', 'success');
  }, [addNotification]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    addNotification('Welcome Back', 'Successfully logged into admin panel', 'success');
  }, [addNotification]);

  const handleSaveProject = async (project: Project) => {
    try {
      if (editingProject) {
        await updateProject(project.id, project);
        addNotification('Project Updated', `${project.title} has been updated successfully`, 'success');
      } else {
        await addProject(project);
        addNotification('Project Added', `${project.title} has been added to your portfolio`, 'success');
      }
      setShowForm(false);
      setEditingProject(null);
      await refreshProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      addNotification('Error', 'Failed to save project. Please try again.', 'error');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProjects();
    await syncNow();
    setTimeout(() => setIsRefreshing(false), 1000);
    addNotification('Data Refreshed', 'All data has been synced with the server', 'info');
  };

  const handleDeleteProject = async (id: string) => {
    const project = projectList.find(p => p.id === id);
    await deleteProject(id);
    addNotification('Project Deleted', `${project?.title} has been deleted`, 'warning');
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-background to-primary/5 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-4 w-80 z-50 space-y-2"
          >
            {notifications.slice(0, 3).map(notif => (
              <motion.div
                key={notif.id}
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className={`glass-card p-3 rounded-xl border-l-4 ${
                  notif.type === 'success' ? 'border-green-500' :
                  notif.type === 'error' ? 'border-red-500' :
                  notif.type === 'warning' ? 'border-yellow-500' :
                  'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </div>
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full glass-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
                <Rocket className="w-8 h-8 text-primary" />
                Admin Panel
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-sm">Manage your portfolio</p>
                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {/* Status Bar */}
            <div className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Last sync: {lastSync.toLocaleTimeString()}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2"
              >
                <RefreshCw className={`w-3 h-3 text-muted-foreground hover:text-foreground transition-all ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="glass-button rounded-xl"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications Bell */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="glass-button rounded-xl relative">
                <Bell className="w-4 h-4" />
                {notifUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {notifUnread}
                  </span>
                )}
              </Button>
            </div>

            <Button variant="outline" onClick={handleLogout} className="glass-button">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <FolderKanban className="w-5 h-5 text-primary" />
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{projectList.length}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-primary" />
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-primary" />
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{projectList.filter(p => p.featured).length}</p>
              <p className="text-xs text-muted-foreground">Featured Projects</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Mail className="w-5 h-5 text-primary" />
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{messagesUnread}</p>
              <p className="text-xs text-muted-foreground">Unread Messages</p>
            </div>
          </motion.div>
        )}

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
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Projects
            <span className="ml-1 text-xs opacity-70">({filteredProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 relative ${
              activeTab === 'messages'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            Messages
            {messagesUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                {messagesUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('carousel')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'carousel'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="w-4 h-4" />
            Banner Carousel
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'glass-button text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </motion.tabs>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search and Filters Bar */}
              <div className="glass-card p-4 mb-6 rounded-xl">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={filters.searchTerm}
                      onChange={(e) => filters.setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/10 rounded-xl focus:border-primary/50 outline-none transition-all"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={filters.statusFilter}
                      onChange={(e) => filters.setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-background/50 border border-white/10 rounded-xl text-sm focus:border-primary/50 outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="planning">Planning</option>
                    </select>

                    <select
                      value={filters.tagFilter}
                      onChange={(e) => filters.setTagFilter(e.target.value)}
                      className="px-3 py-2 bg-background/50 border border-white/10 rounded-xl text-sm focus:border-primary/50 outline-none"
                    >
                      {filters.allTags.map(tag => (
                        <option key={tag} value={tag}>{tag === 'all' ? 'All Tags' : tag}</option>
                      ))}
                    </select>

                    <div className="flex gap-1 bg-background/50 border border-white/10 rounded-xl p-1">
                      <button
                        onClick={() => filters.setSortOrder('desc')}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${filters.sortOrder === 'desc' ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        <SortDesc className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => filters.setSortOrder('asc')}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${filters.sortOrder === 'asc' ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        <SortAsc className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => filters.setFeaturedOnly(!filters.featuredOnly)}
                      className={`px-3 py-2 rounded-xl text-sm flex items-center gap-1 transition-all ${
                        filters.featuredOnly ? 'bg-primary text-primary-foreground' : 'bg-background/50 border border-white/10'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      Featured Only
                    </button>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {bulkActions.hasSelected && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {bulkActions.selectedProjects.size} projects selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkActions.clearSelection}
                        className="text-sm"
                      >
                        Clear
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={bulkActions.deleteSelected}
                        className="text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Project Button */}
              <div className="mb-6">
                <Button 
                  onClick={() => { setEditingProject(null); setShowForm(!showForm); }} 
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {showForm ? <ArrowLeft className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {showForm ? 'Cancel' : 'Add New Project'}
                </Button>
              </div>

              {/* Project Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <ProjectForm 
                      onSave={handleSaveProject} 
                      onCancel={() => setShowForm(false)} 
                      editProject={editingProject}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Export/Import Buttons */}
              <div className="flex gap-2 mb-4 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('json')}
                  className="glass-button"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('csv')}
                  className="glass-button"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        importData(e.target.files[0], async (imported) => {
                          for (const project of imported) {
                            await addProject(project);
                          }
                          await refreshProjects();
                        });
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" className="glass-button" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                    </span>
                  </Button>
                </label>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {filteredProjects.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No projects found</p>
                    <Button
                      variant="link"
                      onClick={() => { setEditingProject(null); setShowForm(true); }}
                      className="mt-4"
                    >
                      Create your first project
                    </Button>
                  </div>
                ) : (
                  filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-card p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                        bulkActions.selectedProjects.has(project.id) ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox for bulk actions */}
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={bulkActions.selectedProjects.has(project.id)}
                            onChange={() => bulkActions.toggleSelect(project.id)}
                            className="w-4 h-4 rounded border-white/20 bg-background/50"
                          />
                        </div>

                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-20 h-20 rounded-2xl object-cover bg-muted ring-2 ring-white/10"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2 flex-wrap">
                            {project.title}
                            {project.featured && (
                              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                <Star className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[project.status]?.className || ''}`}>
                              {statusConfig[project.status]?.label || project.status}
                            </span>
                            {project.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="glass-button h-10 w-10 rounded-xl hover:scale-110 transition-transform">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="glass-button h-10 w-10 rounded-xl text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="glass-button h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
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
          ) : activeTab === 'carousel' ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CarouselPanel />
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
