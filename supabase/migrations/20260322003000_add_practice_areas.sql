-- Add practice areas as text array
ALTER TABLE public.offices ADD COLUMN practice_areas text[] NOT NULL DEFAULT '{}';
