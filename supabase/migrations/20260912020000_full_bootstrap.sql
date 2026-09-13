-- ============================================================
-- POETLY — FULL DATABASE BOOTSTRAP
-- Run this ONE file in Supabase SQL Editor.
-- It is 100% idempotent: safe to run on an empty database
-- OR on a database that already has some tables.
-- ============================================================

-- 0. Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio        text,
  profile_image text,
  website    text,
  location   text,
  status     text DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
    CHECK (status in ('active','suspended','banned'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. PROMPTS  (no FK dependencies — create early)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prompts (
  id          uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title       text NOT NULL,
  description text,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- 3. POEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.poems (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  author_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        text NOT NULL,
  content      text NOT NULL,
  mood         text,
  tags         text[],
  image_url    text,
  visibility   text DEFAULT 'public',
  status       text DEFAULT 'published',
  response_to  uuid,
  prompt_id    uuid,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL,
  published_at timestamptz
);

ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS prompt_id uuid;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS response_to uuid;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public';
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';

DO $$ BEGIN
  ALTER TABLE public.poems ADD CONSTRAINT poems_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.poems ADD CONSTRAINT poems_prompt_id_fkey
    FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.poems DROP CONSTRAINT IF EXISTS poems_status_check;
  ALTER TABLE public.poems ADD CONSTRAINT poems_status_check
    CHECK (status in ('draft','published','archived','hidden','removed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.poems DROP CONSTRAINT IF EXISTS poems_visibility_check;
  ALTER TABLE public.poems ADD CONSTRAINT poems_visibility_check
    CHECK (visibility in ('public','private','unlisted'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 4. LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id         uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  poem_id    uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, poem_id)
);

-- ============================================================
-- 5. COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id         uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  poem_id    uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- 6. FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  follower_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

DO $$ BEGIN
  ALTER TABLE public.follows ADD CONSTRAINT follows_no_self_follow
    CHECK (follower_id != following_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 7. SAVES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saves (
  id         uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  poem_id    uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, poem_id)
);

-- ============================================================
-- 8. COLLECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id          uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- 9. COLLECTION_POEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collection_poems (
  id            uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  poem_id       uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(collection_id, poem_id)
);

-- ============================================================
-- 10. RESPONSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.responses (
  id                uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  original_poem_id  uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  response_poem_id  uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  author_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at        timestamptz DEFAULT now() NOT NULL,
  UNIQUE(original_poem_id, response_poem_id)
);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type         text NOT NULL,
  reference_id uuid,
  read         boolean DEFAULT false,
  created_at   timestamptz DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
    CHECK (type in ('like','comment','follow','response','mention'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 12. REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reporter_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type     text NOT NULL,
  target_id       uuid NOT NULL,
  reason          text NOT NULL,
  report_category text,
  status          text DEFAULT 'pending',
  admin_note      text,
  resolved_by     uuid,
  resolved_at     timestamptz,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_category text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS admin_note text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by uuid;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_check
    CHECK (target_type in ('poem','comment','user'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
  ALTER TABLE public.reports ADD CONSTRAINT reports_status_check
    CHECK (status in ('pending','reviewed','resolved','rejected','dismissed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.reports ADD CONSTRAINT reports_resolved_by_fkey
    FOREIGN KEY (resolved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 13. ADMIN_USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

DO $$ BEGIN
  ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check
    CHECK (role in ('admin','moderator'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 14. FEATURED_CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.featured_content (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  content_type text NOT NULL,
  content_id   uuid NOT NULL,
  position     integer DEFAULT 0 NOT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE public.featured_content ADD CONSTRAINT featured_content_type_check
    CHECK (content_type in ('poem','prompt','collection'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 15. ADMIN_ACTIVITY_LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id          uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  admin_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      text NOT NULL,
  target_type text,
  target_id   uuid,
  details     text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- 16. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_poems_author_id       ON public.poems(author_id);
CREATE INDEX IF NOT EXISTS idx_poems_created_at      ON public.poems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poems_status          ON public.poems(status);
CREATE INDEX IF NOT EXISTS idx_likes_poem_id         ON public.likes(poem_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id         ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_poem_id      ON public.comments(poem_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id   ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id  ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_saves_user_id         ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read    ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_featured_content_type ON public.featured_content(content_type);
CREATE INDEX IF NOT EXISTS idx_featured_content_pos  ON public.featured_content(position);
CREATE INDEX IF NOT EXISTS idx_admin_log_admin_id    ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_created_at  ON public.admin_activity_log(created_at DESC);

-- ============================================================
-- 17. FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, profile_image)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(new.raw_user_meta_data->>'avatar_url', null)
  );
  RETURN new;
END;
$$;

-- ============================================================
-- 18. TRIGGERS
-- ============================================================
DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_poems_updated_at
    BEFORE UPDATE ON public.poems
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 19. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_poems   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. RLS POLICIES
-- ============================================================

-- profiles
DO $$ BEGIN CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- poems
DO $$ BEGIN CREATE POLICY "Published poems are viewable by everyone"
  ON public.poems FOR SELECT USING (status = 'published' AND visibility = 'public');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can view their own drafts"
  ON public.poems FOR SELECT USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can insert their own poems"
  ON public.poems FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can update their own poems"
  ON public.poems FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can delete their own poems"
  ON public.poems FOR DELETE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- likes
DO $$ BEGIN CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can like poems"
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can unlike poems"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- comments
DO $$ BEGIN CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- follows
DO $$ BEGIN CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can unfollow others"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- saves
DO $$ BEGIN CREATE POLICY "Users can view their own saves"
  ON public.saves FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can save poems"
  ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can unsave poems"
  ON public.saves FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- collections
DO $$ BEGIN CREATE POLICY "Public collections are viewable by everyone"
  ON public.collections FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can create their own collections"
  ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- collection_poems
DO $$ BEGIN CREATE POLICY "Collection poems are viewable by everyone"
  ON public.collection_poems FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can manage their own collection poems"
  ON public.collection_poems FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_poems.collection_id
      AND collections.user_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- responses
DO $$ BEGIN CREATE POLICY "Responses are viewable by everyone"
  ON public.responses FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can create responses"
  ON public.responses FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- prompts
DO $$ BEGIN CREATE POLICY "Prompts are viewable by everyone"
  ON public.prompts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notifications
DO $$ BEGIN CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- reports
DO $$ BEGIN CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- admin_users
DO $$ BEGIN CREATE POLICY "Admin users are viewable by authenticated users"
  ON public.admin_users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Admins can manage admin users"
  ON public.admin_users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- featured_content
DO $$ BEGIN CREATE POLICY "Featured content is viewable by everyone"
  ON public.featured_content FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Admins can manage featured content"
  ON public.featured_content FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- admin_activity_log
DO $$ BEGIN CREATE POLICY "Admin activity log is viewable by admins"
  ON public.admin_activity_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Admins can insert activity log entries"
  ON public.admin_activity_log FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
