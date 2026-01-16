import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Save, Image, Link, Github, Upload, FileArchive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Project, ProjectCategory, ProjectStatus, categoryLabels, statusConfig } from '@/data/projects';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFormProps {
  onSave: (project: any) => void;
  onCancel: () => void;
  editProject?: Project | null;
}

export const ProjectForm = ({ onSave, onCancel, editProject }: ProjectFormProps) => {
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
    downloadUrl: '',
    featured: false,
    client: '',
  });
  const [newTag, setNewTag] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (editProject) {
      setFormData({
        title: editProject.title || '',
        description: editProject.description || '',
        longDescription: editProject.longDescription || '',
        image: editProject.image || '/placeholder.svg',
        tags: editProject.tags || [],
        category: editProject.category || 'web-app',
        status: editProject.status || 'completed',
        liveUrl: editProject.liveUrl || '',
        githubUrl: editProject.githubUrl || '',
        downloadUrl: editProject.downloadUrl || '',
        featured: editProject.featured || false,
        client: editProject.client || '',
      });
    }
  }, [editProject]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileName = `images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, image: urlData.publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/zip', 'application/x-zip-compressed'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid ZIP file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('ZIP file size must be less than 50MB');
      return;
    }

    setIsUploadingZip(true);
    try {
      const fileName = `zips/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, downloadUrl: urlData.publicUrl }));
      toast.success('ZIP file uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload ZIP file');
    } finally {
      setIsUploadingZip(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required!');
      return;
    }

    const project = {
      id: editProject?.id || `project-${Date.now()}`,
      ...formData,
      completedDate: new Date().toISOString().split('T')[0],
    };

    onSave(project);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {editProject ? 'Edit Project' : 'Add New Project'}
        </h2>
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

      {/* Image Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Image className="w-4 h-4" /> Project Image
        </label>
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <Input
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="Image URL or upload below"
              className="bg-background/50"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImage}
              className="w-full"
            >
              {isUploadingImage ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Upload Image</>
              )}
            </Button>
          </div>
          {formData.image && formData.image !== '/placeholder.svg' && (
            <img
              src={formData.image}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover border border-border"
            />
          )}
        </div>
      </div>

      {/* ZIP File Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileArchive className="w-4 h-4" /> Project Files (ZIP)
        </label>
        <div className="space-y-2">
          <Input
            value={formData.downloadUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
            placeholder="Download URL or upload ZIP file"
            className="bg-background/50"
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={handleZipUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => zipInputRef.current?.click()}
            disabled={isUploadingZip}
            className="w-full"
          >
            {isUploadingZip ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading ZIP...</>
            ) : (
              <><FileArchive className="w-4 h-4 mr-2" /> Upload ZIP File (Max 50MB)</>
            )}
          </Button>
          {formData.downloadUrl && (
            <p className="text-xs text-muted-foreground truncate">
              ✓ ZIP file ready: {formData.downloadUrl.split('/').pop()}
            </p>
          )}
        </div>
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
          <Save className="w-4 h-4 mr-2" /> {editProject ? 'Update Project' : 'Save Project'}
        </Button>
      </div>
    </motion.form>
  );
};
