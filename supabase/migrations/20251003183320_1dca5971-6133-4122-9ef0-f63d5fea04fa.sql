-- Add handover signature tracking to stage_tracking
ALTER TABLE stage_tracking 
ADD COLUMN IF NOT EXISTS handover_person_name text,
ADD COLUMN IF NOT EXISTS handover_person_signature text,
ADD COLUMN IF NOT EXISTS handover_timestamp timestamp with time zone;

-- Update RLS policies for jobcards to allow all authenticated users to view
DROP POLICY IF EXISTS "All authenticated users can view jobcards" ON jobcards;
CREATE POLICY "All authenticated users can view jobcards"
ON jobcards
FOR SELECT
TO authenticated
USING (true);

-- Allow production managers and admins to manage jobcards
DROP POLICY IF EXISTS "Production managers and admins can manage jobcards" ON jobcards;
CREATE POLICY "Production managers and admins can manage jobcards"
ON jobcards
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'production_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'production_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));