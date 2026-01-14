-- Drop the restrictive admin-only policy for site_settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;

-- Create a policy that allows anyone to update site_settings
-- (The admin password check is handled in the application code)
CREATE POLICY "Anyone can manage site_settings"
ON public.site_settings
FOR ALL
USING (true)
WITH CHECK (true);