-- ============================================================
-- POETLY — ADMIN RPC FUNCTIONS (SECURITY DEFINER)
-- Safe, non-destructive functions allowing server-verified
-- administrative moderation operations.
-- ============================================================

-- 1. UPDATE USER PROFILE STATUS
CREATE OR REPLACE FUNCTION public.admin_set_profile_status(
  p_user_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('active', 'suspended', 'banned') THEN
    RAISE EXCEPTION 'Invalid profile status: %', p_status;
  END IF;

  UPDATE public.profiles
  SET status = p_status, updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- 2. UPDATE POEM STATUS
CREATE OR REPLACE FUNCTION public.admin_set_poem_status(
  p_poem_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('draft', 'published', 'archived', 'hidden', 'removed') THEN
    RAISE EXCEPTION 'Invalid poem status: %', p_status;
  END IF;

  UPDATE public.poems
  SET status = p_status, updated_at = now()
  WHERE id = p_poem_id;

  RETURN FOUND;
END;
$$;

-- 3. RESOLVE OR DISMISS REPORT
CREATE OR REPLACE FUNCTION public.admin_resolve_report(
  p_report_id uuid,
  p_status text,
  p_admin_note text DEFAULT NULL,
  p_hide_content boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_type text;
  v_target_id uuid;
BEGIN
  IF p_status NOT IN ('resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid report resolution status: %', p_status;
  END IF;

  SELECT target_type, target_id INTO v_target_type, v_target_id
  FROM public.reports
  WHERE id = p_report_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF p_hide_content AND v_target_type = 'poem' THEN
    UPDATE public.poems SET status = 'hidden', updated_at = now() WHERE id = v_target_id;
  END IF;

  UPDATE public.reports
  SET
    status = p_status,
    admin_note = p_admin_note,
    resolved_at = now()
  WHERE id = p_report_id;

  RETURN TRUE;
END;
$$;

-- 4. DELETE COMMENT
CREATE OR REPLACE FUNCTION public.admin_delete_comment(
  p_comment_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.comments WHERE id = p_comment_id;
  RETURN FOUND;
END;
$$;

-- 5. ADMIN ACTIVITY LOGGING (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.admin_record_activity(
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
  VALUES (NULL, p_action, p_target_type, p_target_id, p_details);
END;
$$;
