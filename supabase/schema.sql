-- Users table (Supabase auth.users provides identity). Local profile table for additional fields
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'buyer',
  email_verified boolean default false,
  created_at timestamp with time zone default now()
);

-- Businesses for B2B sellers
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  title text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Orders (simplified)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Messages between users
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_messages_parties on public.messages(sender_id, receiver_id);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- RLS
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.businesses enable row level security;

-- Users: user can read self, insert/update own profile
create policy users_select_self on public.users for select using (auth.uid() = id);
create policy users_insert_self on public.users for insert with check (auth.uid() = id);
create policy users_update_self on public.users for update using (auth.uid() = id);

-- Products: anyone can select
create policy products_select_all on public.products for select using (true);
-- Owner can insert
create policy products_insert_owner on public.products for insert with check (auth.uid() = user_id);
-- Owner can update/delete
create policy products_update_owner on public.products for update using (auth.uid() = user_id);
create policy products_delete_owner on public.products for delete using (auth.uid() = user_id);

-- Orders: owner can select own orders and insert
create policy orders_select_owner on public.orders for select using (auth.uid() = user_id);
create policy orders_insert_owner on public.orders for insert with check (auth.uid() = user_id);

-- Messages: participants can select/insert
create policy messages_select_participant on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy messages_insert_sender on public.messages for insert with check (auth.uid() = sender_id);

-- Businesses: owner can select/insert/update/delete
create policy businesses_select_owner on public.businesses for select using (auth.uid() = owner_id);
create policy businesses_insert_owner on public.businesses for insert with check (auth.uid() = owner_id);
create policy businesses_update_owner on public.businesses for update using (auth.uid() = owner_id);
create policy businesses_delete_owner on public.businesses for delete using (auth.uid() = owner_id);

-- Storage: bucket for product images (optional uploads)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'products') then
    insert into storage.buckets (id, name, public) values ('products', 'products', true);
  end if;
end $$;

-- Storage RLS policies
-- Anyone can read public product images
create policy if not exists "Public read product images"
  on storage.objects for select
  using (bucket_id = 'products');

-- Only authenticated users can upload to products bucket
create policy if not exists "Authenticated upload product images"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' and bucket_id = 'products'
  );

-- Only owner (by JWT subject match in object path) or admins can update/delete their own files
-- Convention: store files under folder `${auth.uid()}/...`
create policy if not exists "Owner manage own product images"
  on storage.objects for update
  using (
    bucket_id = 'products' and (auth.uid()::text = (storage.foldername(name))[1])
  );

create policy if not exists "Owner delete own product images"
  on storage.objects for delete
  using (
    bucket_id = 'products' and (auth.uid()::text = (storage.foldername(name))[1])
  );
