-- ============================================================
-- POETLY: ENSURE DATABASE STATE MATCHES APPLICATION CODE
-- Idempotent migration — safe to run multiple times
-- ============================================================

-- ============================================================
-- 1. ENSURE PROFILES TABLE HAS ALL EXPECTED COLUMNS
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;

-- Ensure status check constraint
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
    CHECK (status in ('active', 'suspended', 'banned'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. ENSURE POEMS TABLE HAS ALL EXPECTED COLUMNS
-- ============================================================
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS prompt_id uuid;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS image_url text;

-- Add foreign key for prompt_id if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.poems ADD CONSTRAINT poems_prompt_id_fkey
    FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure expanded status check constraint
DO $$ BEGIN
  ALTER TABLE public.poems DROP CONSTRAINT IF EXISTS poems_status_check;
  ALTER TABLE public.poems ADD CONSTRAINT poems_status_check
    CHECK (status in ('draft', 'published', 'archived', 'hidden', 'removed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ENSURE ALL RLS POLICIES EXIST (profiles)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 5. ENSURE ALL RLS POLICIES EXIST (poems)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Published poems are viewable by everyone"
    ON public.poems FOR SELECT USING (status = 'published' and visibility = 'public');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own drafts"
    ON public.poems FOR SELECT USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own poems"
    ON public.poems FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own poems"
    ON public.poems FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own poems"
    ON public.poems FOR DELETE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 6. ENSURE ALL RLS POLICIES EXIST (likes)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Likes are viewable by everyone"
    ON public.likes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can like poems"
    ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unlike poems"
    ON public.likes FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 7. ENSURE ALL RLS POLICIES EXIST (comments)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own comments"
    ON public.comments FOR UPDATE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own comments"
    ON public.comments FOR DELETE USING (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 8. ENSURE ALL RLS POLICIES EXIST (follows)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Follows are viewable by everyone"
    ON public.follows FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can follow others"
    ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unfollow others"
    ON public.follows FOR DELETE USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 9. ENSURE ALL RLS POLICIES EXIST (saves)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Users can view their own saves"
    ON public.saves FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can save poems"
    ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unsave poems"
    ON public.saves FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 10. ENSURE ALL RLS POLICIES EXIST (collections)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Public collections are viewable by everyone"
    ON public.collections FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own collections"
    ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own collections"
    ON public.collections FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own collections"
    ON public.collections FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 11. ENSURE ALL RLS POLICIES EXIST (collection_poems)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Collection poems are viewable by everyone"
    ON public.collection_poems FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own collection poems"
    ON public.collection_poems FOR ALL
    USING (
      exists (
        select 1 from public.collections
        where collections.id = collection_poems.collection_id
        and collections.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 12. ENSURE ALL RLS POLICIES EXIST (responses)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Responses are viewable by everyone"
    ON public.responses FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create responses"
    ON public.responses FOR INSERT WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 13. ENSURE ALL RLS POLICIES EXIST (prompts)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Prompts are viewable by everyone"
    ON public.prompts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 14. ENSURE ALL RLS POLICIES EXIST (notifications)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 15. ENSURE ALL RLS POLICIES EXIST (reports)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 16. ENSURE UPDATED_AT TRIGGER EXISTS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_poems_updated_at
    BEFORE UPDATE ON public.poems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 17. ENSURE HANDLE_NEW_USER TRIGGER EXISTS
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, profile_image)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', null)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 18. ENSURE INDEXES EXIST
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_poems_author_id ON public.poems(author_id);
CREATE INDEX IF NOT EXISTS idx_poems_created_at ON public.poems(created_at desc);
CREATE INDEX IF NOT EXISTS idx_poems_status ON public.poems(status);
CREATE INDEX IF NOT EXISTS idx_likes_poem_id ON public.likes(poem_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_poem_id ON public.comments(poem_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_saves_user_id ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
