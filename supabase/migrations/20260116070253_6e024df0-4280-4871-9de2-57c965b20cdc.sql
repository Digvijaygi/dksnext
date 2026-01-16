-- Drop restrictive admin-only policy
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

-- Create policies that allow all operations (security is handled at app level via password)
CREATE POLICY "Anyone can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update projects" 
ON public.projects 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete projects" 
ON public.projects 
FOR DELETE 
USING (true);