-- ============================================================================
-- AVSurge — Supabase security hardening
-- Run once in: Dashboard → SQL Editor → New query → paste → Run
--
-- Resolves linter findings:
--   - function_search_path_mutable (4 functions)
--   - anon/authenticated_security_definer_function_executable (5 functions)
--   - rls_policy_always_true (10 policies)
--   - rls_enabled_no_policy (wishlist, tablet_wishlist, tablet_reviews)
--     NOTE: these tables had RLS enabled with NO policies, meaning wishlist
--     and tablet-review writes from the app were being silently denied.
--     The new policies below restore them, scoped to the owning user.
--
-- Requires companion code change: alert-subscribe API routes now use the
-- service-role client server-side, so their public INSERT policies are removed.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Functions: pin search_path + revoke EXECUTE from public API roles
--    (view counters are only called via /api/track-view using service_role;
--     handle_new_user is a trigger on auth.users and never called via RPC)
-- ----------------------------------------------------------------------------

ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.increment_phone_views(bigint) SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.increment_phone_views(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_phone_views(bigint) TO service_role;

ALTER FUNCTION public.increment_tablet_views(bigint) SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.increment_tablet_views(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tablet_views(bigint) TO service_role;

ALTER FUNCTION public.increment_laptop_views(bigint) SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.increment_laptop_views(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_laptop_views(bigint) TO service_role;

ALTER FUNCTION public.rls_auto_enable() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. news: replace always-true "Admin" policies with real admin checks
--    (admin pages write from the browser with the logged-in user's JWT,
--     so the check must live inside the policy via profiles.is_admin)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin insert news" ON public.news;
CREATE POLICY "Admin insert news" ON public.news
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "Admin update news" ON public.news;
CREATE POLICY "Admin update news" ON public.news
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "Admin delete news" ON public.news;
CREATE POLICY "Admin delete news" ON public.news
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- ----------------------------------------------------------------------------
-- 3. laptops / laptop_specs: public INSERT -> admin-only INSERT
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public insert laptops" ON public.laptops;
CREATE POLICY "Admin insert laptops" ON public.laptops
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "Public insert laptop specs" ON public.laptop_specs;
CREATE POLICY "Admin insert laptop specs" ON public.laptop_specs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- ----------------------------------------------------------------------------
-- 4. price histories
--    - phone history: inserted from admin UI (browser) -> admin-only policy
--    - tablet/laptop history: written only by the cron route with service_role,
--      which bypasses RLS -> drop the open policies entirely
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public insert price history" ON public.price_history;
CREATE POLICY "Admin insert price history" ON public.price_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

DROP POLICY IF EXISTS "Public insert tablet price history" ON public.tablet_price_history;
DROP POLICY IF EXISTS "Public insert laptop price history" ON public.laptop_price_history;

-- ----------------------------------------------------------------------------
-- 5. price alerts: subscription routes now run server-side with service_role,
--    so no public INSERT policies are needed on any alerts table
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public insert laptop alerts" ON public.laptop_price_alerts;
DROP POLICY IF EXISTS "Public insert tablet alerts" ON public.tablet_price_alerts;

-- ----------------------------------------------------------------------------
-- 6. Tables that had RLS enabled but NO policies (all access was denied).
--    Restore owner-scoped access for features the app uses from the browser.
-- ----------------------------------------------------------------------------

-- Phone wishlist
CREATE POLICY "Users select own wishlist" ON public.wishlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wishlist" ON public.wishlist
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own wishlist" ON public.wishlist
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Tablet wishlist
CREATE POLICY "Users select own tablet wishlist" ON public.tablet_wishlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tablet wishlist" ON public.tablet_wishlist
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own tablet wishlist" ON public.tablet_wishlist
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Tablet reviews: anyone can read; signed-in users manage their own reviews
CREATE POLICY "Anyone can read tablet reviews" ON public.tablet_reviews
  FOR SELECT USING (true);
CREATE POLICY "Users insert own tablet reviews" ON public.tablet_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own tablet reviews" ON public.tablet_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- device_prices: unused by the app — intentionally left deny-all.
-- Drop it if you don't plan to use it: DROP TABLE public.device_prices;
