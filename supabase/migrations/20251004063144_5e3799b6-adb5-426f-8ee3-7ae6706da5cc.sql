-- Add SKU number tracking to jobcards and dye_details
ALTER TABLE public.jobcards ADD COLUMN sku_number text;

-- Add SKU number and wax pieces per dye to dye_details
ALTER TABLE public.dye_details ADD COLUMN sku_number text;
ALTER TABLE public.dye_details ADD COLUMN wax_pcs_per_dye integer;

-- Create index for faster SKU lookups
CREATE INDEX idx_dye_details_sku_number ON public.dye_details(sku_number) WHERE sku_number IS NOT NULL;