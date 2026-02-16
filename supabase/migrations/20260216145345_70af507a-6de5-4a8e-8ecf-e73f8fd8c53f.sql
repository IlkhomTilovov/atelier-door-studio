
-- Junction table: door ↔ category (many-to-many)
CREATE TABLE public.door_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  door_id UUID NOT NULL REFERENCES public.doors(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.room_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(door_id, category_id)
);

ALTER TABLE public.door_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read door_categories" ON public.door_categories FOR SELECT USING (true);
CREATE POLICY "Public insert door_categories" ON public.door_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete door_categories" ON public.door_categories FOR DELETE USING (true);
