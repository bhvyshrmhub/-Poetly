-- ============================================================
-- POETLY: SUPABASE STORAGE BUCKETS & POLICIES
-- Creates public buckets for avatars and poem images.
-- ============================================================

-- 1. Create storage buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('poem-images', 'poem-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS policies for avatars
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

-- 3. Storage RLS policies for poem-images
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
