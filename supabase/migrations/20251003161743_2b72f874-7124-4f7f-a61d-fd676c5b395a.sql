-- Add order type to inquiries
ALTER TABLE public.inquiries 
ADD COLUMN order_type text CHECK (order_type IN ('new_design', 'repeated_design'));

-- Create jobcards table for production tracking
CREATE TABLE public.jobcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jobcard_no text UNIQUE NOT NULL,
  inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE CASCADE,
  order_type text NOT NULL CHECK (order_type IN ('new_design', 'repeated_design')),
  product_category product_category NOT NULL,
  current_stage text,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'on_hold', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create design details table
CREATE TABLE public.design_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jobcard_id uuid REFERENCES public.jobcards(id) ON DELETE CASCADE,
  date date,
  cad_photo_url text,
  size_dimensions text,
  stone_specifications text,
  cad_by text,
  cad_completion_date date,
  cad_file_link text,
  cam_vendor text,
  cam_sent_date date,
  cam_received_date date,
  cam_weight_grams numeric(10,3),
  dye_vendor text,
  dye_weight numeric(10,3),
  final_dye_no text,
  dye_creation_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create production stages configuration table
CREATE TABLE public.production_stages_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_category product_category NOT NULL,
  stage_name text NOT NULL,
  stage_order integer NOT NULL,
  department text NOT NULL,
  track_pcs_in boolean DEFAULT false,
  track_pcs_out boolean DEFAULT false,
  track_weight_in boolean DEFAULT false,
  track_weight_out boolean DEFAULT false,
  is_design_stage boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_category, stage_name)
);

-- Create stage tracking table
CREATE TABLE public.stage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jobcard_id uuid REFERENCES public.jobcards(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  department text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold')),
  pcs_in integer,
  pcs_out integer,
  weight_in numeric(10,3),
  weight_out numeric(10,3),
  assigned_to uuid REFERENCES auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default stages for silver category (user works only in silver)
INSERT INTO public.production_stages_config (product_category, stage_name, stage_order, department, track_pcs_in, track_pcs_out, track_weight_in, track_weight_out, is_design_stage) VALUES
('silver', 'CAD Design', 1, 'Design', false, false, false, false, true),
('silver', 'CAD Approval', 2, 'Design', false, false, false, false, true),
('silver', 'CAM', 3, 'Design', false, false, false, true, true),
('silver', 'CAM Review', 4, 'Design', false, false, true, false, true),
('silver', 'DYE Creation', 5, 'Design', false, false, false, true, true),
('silver', 'Wax', 6, 'Production', true, true, false, false, false),
('silver', 'Wax Setting', 7, 'Production', true, true, false, false, false),
('silver', 'Casting', 8, 'Production', true, true, true, true, false),
('silver', 'Ghat', 9, 'Production', true, true, true, true, false),
('silver', 'Filing', 10, 'Production', true, true, true, true, false),
('silver', 'Pre-Polish', 11, 'Production', true, true, true, true, false),
('silver', 'Stone Setting', 12, 'Production', true, true, true, true, false),
('silver', 'Final Polish', 13, 'Production', true, true, true, true, false),
('silver', 'QC', 14, 'Quality', true, true, true, true, false),
('silver', 'Piroi', 15, 'Production', true, true, true, true, false),
('silver', 'Final QC', 16, 'Quality', true, true, true, true, false),
('silver', 'Tagging', 17, 'Packaging', true, true, true, true, false),
('silver', 'SKU Generation', 18, 'Inventory', true, false, true, false, false),
('silver', 'Cost Sheet', 19, 'Accounts', false, false, false, false, false),
('silver', 'Inventory', 20, 'Inventory', false, false, false, false, false),
('silver', 'Dispatch', 21, 'Logistics', true, false, true, false, false);

-- Enable RLS
ALTER TABLE public.jobcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_stages_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobcards
CREATE POLICY "All authenticated users can view jobcards"
ON public.jobcards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Production managers and admins can manage jobcards"
ON public.jobcards FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'admin'));

-- RLS Policies for design_details
CREATE POLICY "All authenticated users can view design details"
ON public.design_details FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Design team and admins can manage design details"
ON public.design_details FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for production_stages_config
CREATE POLICY "Everyone can view stages config"
ON public.production_stages_config FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage stages config"
ON public.production_stages_config FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for stage_tracking
CREATE POLICY "All authenticated users can view stage tracking"
ON public.stage_tracking FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Production team can update stage tracking"
ON public.stage_tracking FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_jobcards_updated_at
BEFORE UPDATE ON public.jobcards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_design_details_updated_at
BEFORE UPDATE ON public.design_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stage_tracking_updated_at
BEFORE UPDATE ON public.stage_tracking
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();