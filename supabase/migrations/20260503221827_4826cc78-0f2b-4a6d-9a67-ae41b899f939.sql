CREATE TABLE IF NOT EXISTS public.door_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  scale NUMERIC(4,2) NOT NULL DEFAULT 1.15,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.door_frames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read door_frames" ON public.door_frames;
DROP POLICY IF EXISTS "Anyone can insert door_frames" ON public.door_frames;
DROP POLICY IF EXISTS "Anyone can update door_frames" ON public.door_frames;
DROP POLICY IF EXISTS "Anyone can delete door_frames" ON public.door_frames;

CREATE POLICY "Anyone can read door_frames" ON public.door_frames FOR SELECT USING (true);
CREATE POLICY "Anyone can insert door_frames" ON public.door_frames FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update door_frames" ON public.door_frames FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete door_frames" ON public.door_frames FOR DELETE USING (true);