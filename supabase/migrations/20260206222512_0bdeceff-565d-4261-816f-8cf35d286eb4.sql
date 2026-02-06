
-- Storage bucket for showroom assets
INSERT INTO storage.buckets (id, name, public) VALUES ('showroom-assets', 'showroom-assets', true);

-- Allow public read access
CREATE POLICY "Public read showroom assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'showroom-assets');

-- Allow anyone to upload (admin auth will be added later)
CREATE POLICY "Allow upload showroom assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'showroom-assets');

CREATE POLICY "Allow update showroom assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'showroom-assets');

CREATE POLICY "Allow delete showroom assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'showroom-assets');

-- Walls table
CREATE TABLE public.walls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#A8A09A',
  molding_type TEXT NOT NULL DEFAULT 'classic',
  enabled BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.walls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read walls" ON public.walls FOR SELECT USING (true);
CREATE POLICY "Public insert walls" ON public.walls FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update walls" ON public.walls FOR UPDATE USING (true);
CREATE POLICY "Public delete walls" ON public.walls FOR DELETE USING (true);

-- Floors table
CREATE TABLE public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2A2A2E',
  pattern TEXT NOT NULL DEFAULT 'marble',
  enabled BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read floors" ON public.floors FOR SELECT USING (true);
CREATE POLICY "Public insert floors" ON public.floors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update floors" ON public.floors FOR UPDATE USING (true);
CREATE POLICY "Public delete floors" ON public.floors FOR DELETE USING (true);

-- Doors table
CREATE TABLE public.doors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  collection TEXT NOT NULL DEFAULT 'classic',
  molding_style TEXT NOT NULL DEFAULT 'simple',
  panel_count INT NOT NULL DEFAULT 2,
  enabled BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read doors" ON public.doors FOR SELECT USING (true);
CREATE POLICY "Public insert doors" ON public.doors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update doors" ON public.doors FOR UPDATE USING (true);
CREATE POLICY "Public delete doors" ON public.doors FOR DELETE USING (true);

-- Door colors table
CREATE TABLE public.door_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hex TEXT NOT NULL DEFAULT '#E8E4DE',
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.door_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read door_colors" ON public.door_colors FOR SELECT USING (true);
CREATE POLICY "Public insert door_colors" ON public.door_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update door_colors" ON public.door_colors FOR UPDATE USING (true);
CREATE POLICY "Public delete door_colors" ON public.door_colors FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.walls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.floors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.door_colors;
