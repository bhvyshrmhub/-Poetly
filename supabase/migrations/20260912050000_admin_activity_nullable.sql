-- ============================================================
-- POETLY — MAKE ADMIN ACTIVITY LOG ADMIN_ID NULLABLE
-- Allows activity logging without a Supabase auth user.
-- Non-destructive: existing rows keep their admin_id.
-- ============================================================

ALTER TABLE public.admin_activity_log
  ALTER COLUMN admin_id DROP NOT NULL;
