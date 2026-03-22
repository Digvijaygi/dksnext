
-- 1. Tighten projects RLS: only admins can write
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Tighten site_settings RLS: only admins can write
DROP POLICY IF EXISTS "Authenticated users can manage site_settings" ON public.site_settings;

CREATE POLICY "Admins can manage site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Restrict contact_messages reads to admins only
DROP POLICY IF EXISTS "Anyone can read messages" ON public.contact_messages;

CREATE POLICY "Admins can read messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Tighten contact_messages update/delete to admins
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON public.contact_messages;

CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Delete plaintext admin password from site_settings
DELETE FROM public.site_settings WHERE key = 'admin_password';
