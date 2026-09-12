-- ============================================================
-- POETLY ADMIN & MODERATION MIGRATION
-- Run this in Supabase SQL Editor after the initial schema
-- ============================================================

-- ============================================================
-- ADMIN USERS
-- Stores admin/moderator role assignments
-- ============================================================
create table public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'moderator')),
  created_at timestamptz default now() not null,
  unique(user_id)
);

alter table public.admin_users enable row level security;

create policy "Admin users are viewable by authenticated users"
  on public.admin_users for select
  using (true);

create policy "Admins can manage admin users"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- ============================================================
-- FEATURED CONTENT
-- Manages featured poems, prompts, collections
-- ============================================================
create table public.featured_content (
  id uuid primary key default uuid_generate_v4(),
  content_type text not null check (content_type in ('poem', 'prompt', 'collection')),
  content_id uuid not null,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.featured_content enable row level security;

create policy "Featured content is viewable by everyone"
  on public.featured_content for select
  using (true);

create policy "Admins can manage featured content"
  on public.featured_content for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

create index idx_featured_content_type on public.featured_content(content_type);
create index idx_featured_content_position on public.featured_content(position);

-- ============================================================
-- ADMIN ACTIVITY LOG
-- Auditable log of admin actions
-- ============================================================
create table public.admin_activity_log (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_type text,
  target_id uuid,
  details text,
  created_at timestamptz default now() not null
);

alter table public.admin_activity_log enable row level security;

create policy "Admin activity log is viewable by admins"
  on public.admin_activity_log for select
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

create policy "Admins can insert activity log entries"
  on public.admin_activity_log for insert
  with check (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

create index idx_admin_activity_log_admin_id on public.admin_activity_log(admin_id);
create index idx_admin_activity_log_created_at on public.admin_activity_log(created_at desc);

-- ============================================================
-- ENHANCE REPORTS TABLE
-- Add admin_note, report_category, resolved_by, resolved_at
-- ============================================================
alter table public.reports add column if not exists report_category text;
alter table public.reports add column if not exists admin_note text;
alter table public.reports add column if not exists resolved_by uuid references public.profiles(id) on delete set null;
alter table public.reports add column if not exists resolved_at timestamptz;

-- ============================================================
-- ADD HIDDEN/REMOVED STATUSES TO POEMS
-- ============================================================
alter table public.poems drop constraint if exists poems_status_check;
alter table public.poems add constraint poems_status_check check (status in ('draft', 'published', 'archived', 'hidden', 'removed'));

-- ============================================================
-- ADD USER STATUS TO PROFILES
-- ============================================================
alter table public.profiles add column if not exists status text default 'active' check (status in ('active', 'suspended', 'banned'));
