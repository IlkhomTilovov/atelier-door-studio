
-- Add texture_scale and texture_orientation columns to floors table
ALTER TABLE public.floors
ADD COLUMN texture_scale text NOT NULL DEFAULT 'medium',
ADD COLUMN texture_orientation text NOT NULL DEFAULT 'horizontal';
