-- Make created_at nullable so it doesn't need to be manually entered
ALTER TABLE public.user_roles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.user_roles ALTER COLUMN created_at DROP NOT NULL;