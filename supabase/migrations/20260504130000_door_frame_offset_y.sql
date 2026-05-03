-- Add vertical offset for fine-tuning frame position relative to door
-- Positive value shifts frame down (toward floor); negative shifts up.
-- Stored as percentage of container height; range typically -30 to 30.
ALTER TABLE public.door_frames
  ADD COLUMN IF NOT EXISTS offset_y NUMERIC(5,2) NOT NULL DEFAULT 0;
