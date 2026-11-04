-- Upcoming launches: brand-confirmed Indian launch dates, shown on /upcoming.
-- Safe to re-run.
CREATE TABLE IF NOT EXISTS public.upcoming_launches (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                text NOT NULL,
  brand               text NOT NULL,
  category            text NOT NULL CHECK (category IN ('phone', 'tablet', 'laptop')),
  launch_date         date NOT NULL,
  source_url          text NOT NULL CHECK (source_url ~ '^https://'),
  expected_price_note text,
  image_url           text,
  highlights          text[] NOT NULL DEFAULT '{}',
  device_slug         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS upcoming_launches_date_idx ON public.upcoming_launches (launch_date);

ALTER TABLE public.upcoming_launches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read upcoming launches" ON public.upcoming_launches;
CREATE POLICY "Public read upcoming launches" ON public.upcoming_launches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert upcoming launches" ON public.upcoming_launches;
CREATE POLICY "Admin insert upcoming launches" ON public.upcoming_launches FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admin update upcoming launches" ON public.upcoming_launches;
CREATE POLICY "Admin update upcoming launches" ON public.upcoming_launches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admin delete upcoming launches" ON public.upcoming_launches;
CREATE POLICY "Admin delete upcoming launches" ON public.upcoming_launches FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP TRIGGER IF EXISTS upcoming_launches_touch_updated_at ON public.upcoming_launches;
CREATE TRIGGER upcoming_launches_touch_updated_at
  BEFORE UPDATE ON public.upcoming_launches
  FOR EACH ROW EXECUTE FUNCTION public.touch_phone_variant_updated_at();

NOTIFY pgrst, 'reload schema';

-- Nov 2026: expected (unconfirmed) dates
ALTER TABLE public.upcoming_launches
  ADD COLUMN IF NOT EXISTS date_status text NOT NULL DEFAULT 'confirmed'
  CHECK (date_status IN ('confirmed', 'expected'));
NOTIFY pgrst, 'reload schema';
