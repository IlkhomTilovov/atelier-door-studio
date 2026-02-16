
-- Create room_categories table
CREATE TABLE public.room_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;

-- Public access policies (matching existing pattern)
CREATE POLICY "Public read room_categories" ON public.room_categories FOR SELECT USING (true);
CREATE POLICY "Public insert room_categories" ON public.room_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update room_categories" ON public.room_categories FOR UPDATE USING (true);
CREATE POLICY "Public delete room_categories" ON public.room_categories FOR DELETE USING (true);

-- Add category_id to walls table
ALTER TABLE public.walls ADD COLUMN category_id UUID REFERENCES public.room_categories(id) ON DELETE SET NULL;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_categories;

-- Seed default categories
INSERT INTO public.room_categories (name, sort_order) VALUES
  ('Klassik', 1),
  ('Neo-Klassik', 2),
  ('Zamonaviy', 3),
  ('Lyuks', 4);
