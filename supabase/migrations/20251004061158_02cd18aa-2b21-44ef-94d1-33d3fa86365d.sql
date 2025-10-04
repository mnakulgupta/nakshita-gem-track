-- Update design_details RLS policies to allow design and production_manager roles
DROP POLICY IF EXISTS "Only admins can insert design details" ON public.design_details;
DROP POLICY IF EXISTS "Only admins can update design details" ON public.design_details;
DROP POLICY IF EXISTS "Only admins can delete design details" ON public.design_details;

CREATE POLICY "Design team can insert design details"
ON public.design_details
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'production_manager'::app_role) OR 
  has_role(auth.uid(), 'design'::app_role)
);

CREATE POLICY "Design team can update design details"
ON public.design_details
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'production_manager'::app_role) OR 
  has_role(auth.uid(), 'design'::app_role)
);

CREATE POLICY "Design team can delete design details"
ON public.design_details
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'production_manager'::app_role) OR 
  has_role(auth.uid(), 'design'::app_role)
);

-- Create dye_details table for multiple dyes per jobcard
CREATE TABLE IF NOT EXISTS public.dye_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jobcard_id UUID REFERENCES public.jobcards(id) ON DELETE CASCADE,
  dye_number TEXT NOT NULL,
  dye_weight NUMERIC,
  dye_creation_date DATE,
  dye_vendor TEXT,
  part_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on dye_details
ALTER TABLE public.dye_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for dye_details
CREATE POLICY "All authenticated users can view dye details"
ON public.dye_details
FOR SELECT
USING (true);

CREATE POLICY "Design team can manage dye details"
ON public.dye_details
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'production_manager'::app_role) OR 
  has_role(auth.uid(), 'design'::app_role)
);

-- Add pushed_to_workshop field to jobcards
ALTER TABLE public.jobcards 
ADD COLUMN IF NOT EXISTS pushed_to_workshop BOOLEAN DEFAULT false;

-- Create trigger for dye_details updated_at
CREATE TRIGGER update_dye_details_updated_at
BEFORE UPDATE ON public.dye_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();