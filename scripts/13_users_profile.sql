-- Create users profile table and RLS policies for Supabase auth integration
-- Safe to run multiple times.

begin;

create table if not exists public.users (
  id uuid primary key,                                -- must match auth.users.id
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'buyer',                 -- 'buyer' | 'seller' | 'admin'
  avatar_url text,
  bio text,
  location text,
  is_verified boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Helpful index for common lookups
create index if not exists idx_users_email on public.users (email);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Policies: users can manage their own row
create policy if not exists "Users can view themselves"
  on public.users for select
  using (auth.uid() = id);

create policy if not exists "Users can insert their own row"
  on public.users for insert
  with check (auth.uid() = id);

create policy if not exists "Users can update their own row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

commit;
