-- Fix critical security issues in RLS policies

-- 1. Fix inquiries table: Sales people should only see their own inquiries
DROP POLICY IF EXISTS "Sales can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Sales can view their own inquiries" ON public.inquiries;

CREATE POLICY "Sales can view their own inquiries"
ON public.inquiries
FOR SELECT
TO authenticated
USING (
  sales_person_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'production_manager'::app_role)
);

-- 2. Fix design_details table: Restrict write access to admins only
DROP POLICY IF EXISTS "All authenticated users can view design details" ON public.design_details;
DROP POLICY IF EXISTS "Design team and admins can manage design details" ON public.design_details;
DROP POLICY IF EXISTS "Only admins can manage design details" ON public.design_details;
DROP POLICY IF EXISTS "Production team can update stage tracking" ON public.design_details;

CREATE POLICY "All authenticated users can view design details"
ON public.design_details
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert design details"
ON public.design_details
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update design details"
ON public.design_details
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete design details"
ON public.design_details
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));