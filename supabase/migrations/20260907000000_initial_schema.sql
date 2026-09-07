-- ============================================================
-- POETLY DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  profile_image text,
  website text,
  location text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- POEMS
-- ============================================================
create table public.poems (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  mood text,
  tags text[],
  image_url text,
  visibility text default 'public' check (visibility in ('public', 'private', 'unlisted')),
  status text default 'published' check (status in ('draft', 'published', 'archived')),
  response_to uuid references public.poems(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  published_at timestamptz
);

alter table public.poems enable row level security;

create policy "Published poems are viewable by everyone"
  on public.poems for select
  using (status = 'published' and visibility = 'public');

create policy "Users can view their own drafts"
  on public.poems for select
  using (auth.uid() = author_id);

create policy "Users can insert their own poems"
  on public.poems for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own poems"
  on public.poems for update
  using (auth.uid() = author_id);

create policy "Users can delete their own poems"
  on public.poems for delete
  using (auth.uid() = author_id);

-- ============================================================
-- LIKES
-- ============================================================
create table public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  poem_id uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, poem_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users can like poems"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike poems"
  on public.likes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ============================================================
-- FOLLOWS
-- ============================================================
create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================
-- SAVES
-- ============================================================
create table public.saves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  poem_id uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, poem_id)
);

alter table public.saves enable row level security;

create policy "Users can view their own saves"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "Users can save poems"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave poems"
  on public.saves for delete
  using (auth.uid() = user_id);

-- ============================================================
-- COLLECTIONS
-- ============================================================
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.collections enable row level security;

create policy "Public collections are viewable by everyone"
  on public.collections for select
  using (true);

create policy "Users can create their own collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on public.collections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

-- ============================================================
-- COLLECTION POEMS
-- ============================================================
create table public.collection_poems (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  poem_id uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(collection_id, poem_id)
);

alter table public.collection_poems enable row level security;

create policy "Collection poems are viewable by everyone"
  on public.collection_poems for select
  using (true);

create policy "Users can manage their own collection poems"
  on public.collection_poems for all
  using (
    exists (
      select 1 from public.collections
      where collections.id = collection_poems.collection_id
      and collections.user_id = auth.uid()
    )
  );

-- ============================================================
-- RESPONSES
-- ============================================================
create table public.responses (
  id uuid primary key default uuid_generate_v4(),
  original_poem_id uuid not null references public.poems(id) on delete cascade,
  response_poem_id uuid not null references public.poems(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(original_poem_id, response_poem_id)
);

alter table public.responses enable row level security;

create policy "Responses are viewable by everyone"
  on public.responses for select
  using (true);

create policy "Users can create responses"
  on public.responses for insert
  with check (auth.uid() = author_id);

-- ============================================================
-- PROMPTS
-- ============================================================
create table public.prompts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

alter table public.prompts enable row level security;

create policy "Prompts are viewable by everyone"
  on public.prompts for select
  using (true);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like', 'comment', 'follow', 'response', 'mention')),
  reference_id uuid,
  read boolean default false,
  created_at timestamptz default now() not null
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = recipient_id);

-- ============================================================
-- REPORTS
-- ============================================================
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('poem', 'comment', 'user')),
  target_id uuid not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'rejected')),
  created_at timestamptz default now() not null
);

alter table public.reports enable row level security;

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_poems_author_id on public.poems(author_id);
create index idx_poems_created_at on public.poems(created_at desc);
create index idx_poems_status on public.poems(status);
create index idx_likes_poem_id on public.likes(poem_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_comments_poem_id on public.comments(poem_id);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_saves_user_id on public.saves(user_id);
create index idx_notifications_recipient_id on public.notifications(recipient_id);
create index idx_notifications_read on public.notifications(read);

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

create trigger update_poems_updated_at
  before update on public.poems
  for each row execute function update_updated_at();

create trigger update_comments_updated_at
  before update on public.comments
  for each row execute function update_updated_at();

create trigger update_collections_updated_at
  before update on public.collections
  for each row execute function update_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, profile_image)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
