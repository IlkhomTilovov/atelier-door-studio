
-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  room_design_id UUID REFERENCES public.walls(id) ON DELETE SET NULL,
  door_model_id UUID REFERENCES public.doors(id) ON DELETE SET NULL,
  panel_count INTEGER NOT NULL DEFAULT 2,
  comment TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public can insert orders (no auth required for customers)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Public can read orders (for admin - no auth in this app)
CREATE POLICY "Anyone can read orders"
  ON public.orders FOR SELECT
  USING (true);

-- Public can update orders (admin status changes)
CREATE POLICY "Anyone can update orders"
  ON public.orders FOR UPDATE
  USING (true);

-- Public can delete orders (admin)
CREATE POLICY "Anyone can delete orders"
  ON public.orders FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
