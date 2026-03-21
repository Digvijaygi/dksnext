-- Drop overly permissive policies on projects
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;

-- Drop overly permissive policies on site_settings
DROP POLICY IF EXISTS "Anyone can manage site_settings" ON public.site_settings;

-- Drop overly permissive policies on contact_messages
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.contact_messages;

-- Projects: only authenticated users can write
CREATE POLICY "Authenticated users can insert projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects" ON public.projects
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects" ON public.projects
  FOR DELETE TO authenticated USING (true);

-- Site settings: only authenticated users can write
CREATE POLICY "Authenticated users can manage site_settings" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact messages: authenticated users can update/delete
CREATE POLICY "Authenticated users can update messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (true);