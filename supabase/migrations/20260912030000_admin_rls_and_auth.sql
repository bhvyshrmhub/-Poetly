-- ============================================================
-- POETLY — ADMIN RLS POLICIES & AUTH FUNCTIONS
-- Adds admin-level access to all tables.
-- Adds helper functions for admin checks and activity logging.
-- Safe to run on existing database — no destructive operations.
-- ============================================================

-- ============================================================
-- 1. ADMIN HELPER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = uid
  );
$$;

-- ============================================================
-- 2. ADMIN ACTIVITY LOG FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  p_action text,
  p_target_type text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_details text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_activity_log (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
END;
$$;

-- ============================================================
-- 3. POEMS — Admin can SELECT all poems (drafts, hidden, removed)
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all poems"
  ON public.poems FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 4. REPORTS — Admin can SELECT all reports
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 5. COMMENTS — Admin can SELECT all comments
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 6. NOTIFICATIONS — Admin can SELECT all notifications
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 7. SAVES — Admin can SELECT all saves
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all saves"
  ON public.saves FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 8. FOLLOWS — Admin can SELECT all follows
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all follows"
  ON public.follows FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 9. COLLECTIONS — Admin can SELECT all collections
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can view all collections"
  ON public.collections FOR SELECT
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 10. PROFILES — Admin can update any profile (for suspend/ban)
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 11. COMMENTS — Admin can delete any comment
-- ============================================================
DO $$ BEGIN CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
