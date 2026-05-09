-- ═══════════════════════════════════════════════════
-- CADENCE DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────
-- One row per user, created on first sign-in
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  name text,
  role text,
  company text,
  industry text,
  goal text,
  audience text,
  tone text,
  topics text[] default '{}',
  frequency text,
  posting_streak int default 0,
  posts_this_month int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── VOICE SETTINGS ──────────────────────────────────
create table voice_settings (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  -- DNA sliders (0-100)
  tone_slider int default 25,
  length_slider int default 60,
  story_slider int default 40,
  provocative_slider int default 65,
  -- Signature moves
  bold_hook bool default true,
  short_paragraphs bool default true,
  rhetorical_questions bool default false,
  end_with_cta bool default true,
  personal_stories bool default true,
  -- Formatting
  use_hashtags bool default false,
  max_hashtags int default 3,
  use_emojis bool default false,
  post_length text default 'medium', -- short | medium | long
  -- Voice samples (up to 3 real posts pasted by user)
  voice_samples text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── POSTS ────────────────────────────────────────────
create table posts (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text not null,
  content text not null,
  platform text not null default 'linkedin', -- linkedin | x
  style text, -- Story | Insight | Observation
  topic text,
  status text not null default 'draft', -- draft | scheduled | approved | posted
  scheduled_for date,
  posted_at timestamptz,
  rating int, -- 1-3 user self-rating after posting
  -- AI generation metadata
  prompt_used text,
  model_used text default 'llama-3.3-70b-versatile',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── PLATFORM CONNECTIONS ─────────────────────────────
create table platform_connections (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text not null,
  platform text not null, -- linkedin | x
  profile_url text,
  handle text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(clerk_user_id, platform)
);

-- ── TEAM MEMBERS ─────────────────────────────────────
-- Simple team structure: one manager, multiple reps
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  manager_clerk_id text not null,
  created_at timestamptz default now()
);

create table team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  clerk_user_id text not null,
  role text default 'member', -- manager | member
  created_at timestamptz default now(),
  unique(team_id, clerk_user_id)
);

-- ── ROW LEVEL SECURITY ───────────────────────────────
alter table profiles enable row level security;
alter table voice_settings enable row level security;
alter table posts enable row level security;
alter table platform_connections enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;

-- Users can only access their own data
create policy "Users own their profile"
  on profiles for all using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "Users own their voice settings"
  on voice_settings for all using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "Users own their posts"
  on posts for all using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "Users own their connections"
  on platform_connections for all using (clerk_user_id = current_setting('app.clerk_user_id', true));

-- ── UPDATED_AT TRIGGER ───────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger voice_settings_updated_at before update on voice_settings
  for each row execute function update_updated_at();

create trigger posts_updated_at before update on posts
  for each row execute function update_updated_at();
