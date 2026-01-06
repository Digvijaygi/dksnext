-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  category TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'completed',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for projects (everyone can view)
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);

-- Public read access for site_settings (everyone can view)
CREATE POLICY "Anyone can view site_settings" ON public.site_settings FOR SELECT USING (true);

-- Allow anyone to submit contact messages
CREATE POLICY "Anyone can submit messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Admin policies (for now, allow all operations - will secure with auth later)
CREATE POLICY "Allow all project operations" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all settings operations" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all message operations" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('contact', '{"email": "dksahni8@gmail.com", "phone": "+91 9876543210", "location": "India"}'),
  ('hero', '{"title": "Digvijay Sahni", "subtitle": "Full Stack Developer & UI/UX Designer", "description": "Building digital experiences that matter"}'),
  ('social', '{"github": "https://github.com/digvijay", "linkedin": "https://linkedin.com/in/digvijay", "twitter": "https://twitter.com/digvijay"}'),
  ('about', '{"title": "About Me", "description": "I am a passionate developer with expertise in modern web technologies.", "experience": "5+ Years Experience", "projectsCount": "50+ Projects"}'),
  ('footer', '{"name": "Digvijay Sahni", "tagline": "Building the future, one line of code at a time."}')