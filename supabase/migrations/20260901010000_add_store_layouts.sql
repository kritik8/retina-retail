-- Create store_layouts table
CREATE TABLE IF NOT EXISTS public.store_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE UNIQUE,
  layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.store_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_layouts
CREATE POLICY "Users can view own store layout"
  ON public.store_layouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.store_layouts.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own store layout"
  ON public.store_layouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.store_layouts.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own store layout"
  ON public.store_layouts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.store_layouts.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own store layout"
  ON public.store_layouts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE public.shops.id = public.store_layouts.shop_id
      AND public.shops.owner_id = auth.uid()
    )
  );
