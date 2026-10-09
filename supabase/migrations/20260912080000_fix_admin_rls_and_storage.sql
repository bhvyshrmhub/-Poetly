-- ============================================================
-- POETLY MIGRATION 20260912080000
-- FIX ADMIN RLS INFINITE RECURSION, MISSING STORAGE BUCKETS,
-- RPC FUNCTIONS, AND NOTIFICATION SECURITY HARDENING
-- ============================================================

-- ------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER: public.is_admin
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 2. FIX RECURSIVE RLS POLICIES ON admin_users (ERROR 42P17)
-- ------------------------------------------------------------
-- Drop the recursive FOR ALL policy that triggered self-referential subqueries
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users are viewable by authenticated users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users are viewable by everyone" ON public.admin_users;

-- Safe SELECT policy without self-referential subquery:
DO $$ BEGIN
  CREATE POLICY "Admin users are viewable by everyone"
    ON public.admin_users FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Mutations restricted to existing admins via the SECURITY DEFINER function:
DO $$ BEGIN
  CREATE POLICY "Admins can insert admin users"
    ON public.admin_users FOR INSERT
    WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update admin users"
    ON public.admin_users FOR UPDATE
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete admin users"
    ON public.admin_users FOR DELETE
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 3. FIX DEPENDENT POLICIES: featured_content & admin_activity_log
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage featured content" ON public.featured_content;
DO $$ BEGIN
  CREATE POLICY "Admins can manage featured content"
    ON public.featured_content FOR ALL
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "Admin activity log is viewable by admins" ON public.admin_activity_log;
DO $$ BEGIN
  CREATE POLICY "Admin activity log is viewable by admins"
    ON public.admin_activity_log FOR SELECT
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP POLICY IF EXISTS "Admins can insert activity log entries" ON public.admin_activity_log;
DO $$ BEGIN
  CREATE POLICY "Admins can insert activity log entries"
    ON public.admin_activity_log FOR INSERT
    WITH CHECK (public.is_admin() OR auth.uid() IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure admin_id is nullable on admin_activity_log for server operations
ALTER TABLE public.admin_activity_log ALTER COLUMN admin_id DROP NOT NULL;

-- ------------------------------------------------------------
-- 4. MISSING ADMIN MUTATION POLICIES (POEMS, REPORTS, COMMENTS)
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE POLICY "Admins can update poems"
    ON public.poems FOR UPDATE
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete poems"
    ON public.poems FOR DELETE
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow poem authors to moderate/delete comments left on their own poems
DO $$ BEGIN
  CREATE POLICY "Poem authors can delete comments on their poems"
    ON public.comments FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.poems
        WHERE poems.id = comments.poem_id
          AND poems.author_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 5. NOTIFICATION SECURITY & FOREIGN KEY HARDENING
-- ------------------------------------------------------------
-- Drop wide-open check:
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Enforce that actor_id matches the authenticated user to prevent spoofing:
DO $$ BEGIN
  CREATE POLICY "Authenticated users can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = actor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure explicit foreign key constraint names for PostgREST relation joining
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_actor_id_fkey'
      AND table_name = 'notifications'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_actor_id_fkey
      FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ------------------------------------------------------------
-- 6. ADMIN RPC FUNCTIONS (SECURITY DEFINER)
-- ------------------------------------------------------------
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
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
END;
$$;

-- ------------------------------------------------------------
-- 7. COLLISION-RESILIENT NEW USER REGISTRATION TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  candidate_username text;
  counter integer := 0;
BEGIN
  base_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'writer'
  );
  -- Sanitize: lowercase alphanumeric and underscores only
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  IF length(base_username) < 3 THEN
    base_username := 'writer_' || substr(replace(new.id::text, '-', ''), 1, 6);
  END IF;

  candidate_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate_username) LOOP
    counter := counter + 1;
    candidate_username := substr(base_username, 1, 14) || '_' || counter::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, profile_image)
  VALUES (
    new.id,
    candidate_username,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1),
      'Writer'
    ),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Fallback with unique suffix to guarantee OAuth registration never fails
  INSERT INTO public.profiles (id, username, display_name, profile_image)
  VALUES (
    new.id,
    'writer_' || substr(replace(new.id::text, '-', ''), 1, 8),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Writer'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', null)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Ensure trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 8. STORAGE BUCKETS & STORAGE RLS POLICIES
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('poem-images', 'poem-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$ BEGIN
  CREATE POLICY "Public avatars are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid() = owner);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid() = owner);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public poem images are viewable by everyone"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'poem-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upload poem images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'poem-images' AND auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their poem images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'poem-images' AND auth.uid() = owner);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their poem images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'poem-images' AND auth.uid() = owner);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
