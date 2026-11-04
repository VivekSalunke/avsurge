-- ============================================================================
-- AVSurge schema additions, Oct–Nov 2026
-- Variants (phones + tablets), markets / regional prices, alert + counter fixes.
--
-- This records the FINAL state of what was applied by hand in the Supabase
-- SQL Editor. Every statement is safe to re-run (IF NOT EXISTS / OR REPLACE /
-- DROP ... IF EXISTS). It contains schema only, not data (variant rows,
-- China prices and launch-date fixes were entered separately).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Price alerts: cooldown column for tablets and laptops
--    (phones already had it; /api/alerts/check reads it for all three)
-- ----------------------------------------------------------------------------
ALTER TABLE public.tablet_price_alerts ADD COLUMN IF NOT EXISTS last_notified_at timestamptz;
ALTER TABLE public.laptop_price_alerts ADD COLUMN IF NOT EXISTS last_notified_at timestamptz;


-- ----------------------------------------------------------------------------
-- 2. View counters: fully qualified table names
--    security-hardening.sql set search_path = '' on these, which broke the
--    unqualified "phones"/"tablets"/"laptops" references (42P01).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_phone_views(phone_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.phones SET view_count = COALESCE(view_count, 0) + 1 WHERE id = phone_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_tablet_views(tablet_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.tablets SET view_count = COALESCE(view_count, 0) + 1 WHERE id = tablet_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_laptop_views(laptop_id bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.laptops SET view_count = COALESCE(view_count, 0) + 1 WHERE id = laptop_id;
END;
$$;


-- ----------------------------------------------------------------------------
-- 3. Shared trigger function: stamp updated_at on variant edits
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_phone_variant_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- ----------------------------------------------------------------------------
-- 4. Phone variants
--    One row per RAM + storage combination. The trigger keeps
--    phones.price_inr = cheapest variant and phones.released_at = earliest
--    variant launch date (devices without variants are untouched).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phone_variants (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phone_id    bigint  NOT NULL REFERENCES public.phones(id) ON DELETE CASCADE,
  ram_gb      integer NOT NULL CHECK (ram_gb > 0),
  storage_gb  integer NOT NULL CHECK (storage_gb > 0),
  price_inr   integer NOT NULL CHECK (price_inr > 0),
  store       text    NOT NULL DEFAULT 'amazon' CHECK (store IN ('amazon', 'flipkart')),
  store_url   text,
  released_at date,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (phone_id, ram_gb, storage_gb)
);
CREATE INDEX IF NOT EXISTS phone_variants_phone_id_idx ON public.phone_variants (phone_id);

ALTER TABLE public.phone_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read phone variants" ON public.phone_variants;
CREATE POLICY "Public read phone variants" ON public.phone_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert phone variants" ON public.phone_variants;
CREATE POLICY "Admin insert phone variants" ON public.phone_variants FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admin update phone variants" ON public.phone_variants;
CREATE POLICY "Admin update phone variants" ON public.phone_variants FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admin delete phone variants" ON public.phone_variants;
CREATE POLICY "Admin delete phone variants" ON public.phone_variants FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE OR REPLACE FUNCTION public.sync_phone_starting_price()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  affected bigint[];
  pid bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected := ARRAY[OLD.phone_id];
  ELSIF TG_OP = 'UPDATE' AND NEW.phone_id IS DISTINCT FROM OLD.phone_id THEN
    affected := ARRAY[OLD.phone_id, NEW.phone_id];
  ELSE
    affected := ARRAY[NEW.phone_id];
  END IF;

  FOREACH pid IN ARRAY affected LOOP
    UPDATE public.phones ph
    SET price_inr   = COALESCE(v.min_price, ph.price_inr),
        released_at = COALESCE(v.min_date, ph.released_at::date)
    FROM (
      SELECT min(price_inr) AS min_price, min(released_at) AS min_date
      FROM public.phone_variants WHERE phone_id = pid
    ) v
    WHERE ph.id = pid
      AND (ph.price_inr IS DISTINCT FROM COALESCE(v.min_price, ph.price_inr)
        OR ph.released_at::date IS DISTINCT FROM COALESCE(v.min_date, ph.released_at::date));
  END LOOP;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS phone_variants_sync_price ON public.phone_variants;
CREATE TRIGGER phone_variants_sync_price
  AFTER INSERT OR UPDATE OR DELETE ON public.phone_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_phone_starting_price();

DROP TRIGGER IF EXISTS phone_variants_touch_updated_at ON public.phone_variants;
CREATE TRIGGER phone_variants_touch_updated_at
  BEFORE UPDATE ON public.phone_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_phone_variant_updated_at();


-- ----------------------------------------------------------------------------
-- 5. Tablet variants (same as phones, plus Wi-Fi / Cellular connectivity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tablet_variants (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tablet_id    bigint  NOT NULL REFERENCES public.tablets(id) ON DELETE CASCADE,
  ram_gb       integer NOT NULL CHECK (ram_gb > 0),
  storage_gb   integer NOT NULL CHECK (storage_gb > 0),
  price_inr    integer NOT NULL CHECK (price_inr > 0),
  connectivity text    NOT NULL DEFAULT 'wifi' CHECK (connectivity IN ('wifi', 'cellular')),
  store        text    NOT NULL DEFAULT 'amazon' CHECK (store IN ('amazon', 'flipkart')),
  store_url    text,
  released_at  date,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tablet_variants_unique_config UNIQUE (tablet_id, ram_gb, storage_gb, connectivity)
);
CREATE INDEX IF NOT EXISTS tablet_variants_tablet_id_idx ON public.tablet_variants (tablet_id);

ALTER TABLE public.tablet_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tablet variants" ON public.tablet_variants;
CREATE POLICY "Public read tablet variants" ON public.tablet_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert tablet variants" ON public.tablet_variants;
CREATE POLICY "Admin insert tablet variants" ON public.tablet_variants FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admin update tablet variants" ON public.tablet_variants;
CREATE POLICY "Admin update tablet variants" ON public.tablet_variants FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admin delete tablet variants" ON public.tablet_variants;
CREATE POLICY "Admin delete tablet variants" ON public.tablet_variants FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

CREATE OR REPLACE FUNCTION public.sync_tablet_starting_price()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  affected bigint[];
  tid bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected := ARRAY[OLD.tablet_id];
  ELSIF TG_OP = 'UPDATE' AND NEW.tablet_id IS DISTINCT FROM OLD.tablet_id THEN
    affected := ARRAY[OLD.tablet_id, NEW.tablet_id];
  ELSE
    affected := ARRAY[NEW.tablet_id];
  END IF;

  FOREACH tid IN ARRAY affected LOOP
    UPDATE public.tablets t
    SET price_inr   = COALESCE(v.min_price, t.price_inr),
        released_at = COALESCE(v.min_date, t.released_at::date)
    FROM (
      SELECT min(price_inr) AS min_price, min(released_at) AS min_date
      FROM public.tablet_variants WHERE tablet_id = tid
    ) v
    WHERE t.id = tid
      AND (t.price_inr IS DISTINCT FROM COALESCE(v.min_price, t.price_inr)
        OR t.released_at::date IS DISTINCT FROM COALESCE(v.min_date, t.released_at::date));
  END LOOP;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tablet_variants_sync_price ON public.tablet_variants;
CREATE TRIGGER tablet_variants_sync_price
  AFTER INSERT OR UPDATE OR DELETE ON public.tablet_variants
  FOR EACH ROW EXECUTE FUNCTION public.sync_tablet_starting_price();

DROP TRIGGER IF EXISTS tablet_variants_touch_updated_at ON public.tablet_variants;
CREATE TRIGGER tablet_variants_touch_updated_at
  BEFORE UPDATE ON public.tablet_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_phone_variant_updated_at();


-- ----------------------------------------------------------------------------
-- 6. Markets: where each device is officially sold ('IN', 'CN', 'GLOBAL').
--    Devices not sold in India keep price_inr NULL and store their real local
--    launch prices in device_prices.
-- ----------------------------------------------------------------------------
ALTER TABLE public.phones  ADD COLUMN IF NOT EXISTS markets text[] NOT NULL DEFAULT '{IN}';
ALTER TABLE public.tablets ADD COLUMN IF NOT EXISTS markets text[] NOT NULL DEFAULT '{IN}';
ALTER TABLE public.laptops ADD COLUMN IF NOT EXISTS markets text[] NOT NULL DEFAULT '{IN}';

-- device_prices: public read only (writes via SQL Editor / service role)
ALTER TABLE public.device_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read device prices" ON public.device_prices;
CREATE POLICY "Public read device prices" ON public.device_prices FOR SELECT USING (true);


NOTIFY pgrst, 'reload schema';
