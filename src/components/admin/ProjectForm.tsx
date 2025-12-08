import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Save, Image, Link, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ProjectCategory, ProjectStatus, categoryLabels, statusConfig } from '@/data/projects';

interface ProjectFormProps {
  onSave: (project: any) => void;
  onCancel: () => void;
}

export const ProjectForm = ({ onSave, onCancel }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    image: '/placeholder.svg',
    tags: [] as string[],
    category: 'web-app' as ProjectCategory,
    status: 'completed' as ProjectStatus,
    liveUrl: '',
    githubUrl: '',
    featured: false,
    client: '',
  });
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required!');
      return;
    }

    const project = {
      id: `project-${Date.now()}`,
      ...formData,
      completedDate: new Date().toISOString().split('T')[0],
    };

    onSave(project);
    toast.success('Project added successfully!');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Add New Project</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Project Title"
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Client</label>
          <Input
            value={formData.client}
            onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
            placeholder="Client Name"
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Short Description *</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Long Description</label>
        <Textarea
          value={formData.longDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
          placeholder="Detailed project description..."
          className="bg-background/50 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ProjectCategory }))}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectStatus }))}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Link className="w-4 h-4" /> Live URL
          </label>
          <Input
            value={formData.liveUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
            placeholder="https://example.com"
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Github className="w-4 h-4" /> GitHub URL
          </label>
          <Input
            value={formData.githubUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
            placeholder="https://github.com/..."
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Image className="w-4 h-4" /> Image URL
        </label>
        <Input
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="https://... or /placeholder.svg"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tags / Technologies</label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag..."
            className="bg-background/50"
          />
          <Button type="button" onClick={handleAddTag} size="icon" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
            >
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="featured" className="text-sm text-foreground">Featured Project</label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" /> Save Project
        </Button>
      </div>
    </motion.form>
  );
};
