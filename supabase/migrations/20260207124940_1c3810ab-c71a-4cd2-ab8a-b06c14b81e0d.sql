
-- Junction table: which doors are compatible with which room style (wall)
CREATE TABLE public.room_doors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wall_id UUID NOT NULL REFERENCES public.walls(id) ON DELETE CASCADE,
  door_id UUID NOT NULL REFERENCES public.doors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wall_id, door_id)
);

-- Junction table: which floors are compatible with which room style (wall)
CREATE TABLE public.room_floors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wall_id UUID NOT NULL REFERENCES public.walls(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wall_id, floor_id)
);

-- Junction table: which colors are available for which door model
CREATE TABLE public.door_model_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  door_id UUID NOT NULL REFERENCES public.doors(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES public.door_colors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(door_id, color_id)
);

-- Enable RLS on all junction tables
ALTER TABLE public.room_doors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.door_model_colors ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for junction tables (matching existing pattern)
CREATE POLICY "Public read room_doors" ON public.room_doors FOR SELECT USING (true);
CREATE POLICY "Public insert room_doors" ON public.room_doors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete room_doors" ON public.room_doors FOR DELETE USING (true);

CREATE POLICY "Public read room_floors" ON public.room_floors FOR SELECT USING (true);
CREATE POLICY "Public insert room_floors" ON public.room_floors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete room_floors" ON public.room_floors FOR DELETE USING (true);

CREATE POLICY "Public read door_model_colors" ON public.door_model_colors FOR SELECT USING (true);
CREATE POLICY "Public insert door_model_colors" ON public.door_model_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete door_model_colors" ON public.door_model_colors FOR DELETE USING (true);

-- Enable realtime for junction tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_doors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_floors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.door_model_colors;
