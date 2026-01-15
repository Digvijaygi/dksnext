-- Drop the restrictive admin-only policy
DROP POLICY IF EXISTS "Admins can manage messages" ON public.contact_messages;

-- Create a policy that allows anyone to read messages (app-level password handles access control)
CREATE POLICY "Anyone can read messages" 
ON public.contact_messages 
FOR SELECT 
USING (true);

-- Create a policy that allows anyone to update messages (for marking as read)
CREATE POLICY "Anyone can update messages" 
ON public.contact_messages 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create a policy that allows anyone to delete messages
CREATE POLICY "Anyone can delete messages" 
ON public.contact_messages 
FOR DELETE 
USING (true);