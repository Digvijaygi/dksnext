-- Create storage bucket for project files (images and zip files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files', 
  'project-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/zip', 'application/x-zip-compressed']
);

-- Allow anyone to view project files (public bucket)
CREATE POLICY "Anyone can view project files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Allow anyone to upload project files (admin auth is handled at app level)
CREATE POLICY "Anyone can upload project files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files');

-- Allow anyone to update project files
CREATE POLICY "Anyone can update project files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-files');

-- Allow anyone to delete project files
CREATE POLICY "Anyone can delete project files"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files');

-- Add download_url column to projects table for ZIP files
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS download_url TEXT;