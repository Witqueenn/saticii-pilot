-- =============================================================
-- SatıcıPilot — 001_schema.sql
-- Full Supabase-compatible PostgreSQL schema migration
-- =============================================================

-- ---------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------

-- sellers (extends auth.users 1-to-1)
create table public.sellers (
  id                    uuid        primary key references auth.users(id) on delete cascade,
  shop_name             text,
  plan                  text        not null default 'temel', -- temel / profesyonel / marketing
  phone                 text,
  onboarding_done       boolean     not null default false,
  notify_urgent_reviews boolean     not null default true,
  notify_weekly_report  boolean     not null default true,
  notify_new_returns    boolean     not null default false,
  notify_low_stock      boolean     not null default false,
  referral_code         text        unique,
  referral_count        integer     not null default 0,
  referred_by           text,
  created_at            timestamptz not null default now()
);

-- reviews
create table public.reviews (
  id           uuid        primary key default gen_random_uuid(),
  seller_id    uuid        not null references public.sellers(id) on delete cascade,
  product_name text        not null,
  rating       integer     not null check (rating between 1 and 5),
  comment      text,
  status       text        not null default 'cevaplanmadi', -- cevaplanmadi / cevaplandi
  is_urgent    boolean     not null default false,
  is_replied   boolean     not null default false,
  reply        text,
  reviewed_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- returns
create table public.returns (
  id           uuid        primary key default gen_random_uuid(),
  seller_id    uuid        not null references public.sellers(id) on delete cascade,
  product_name text        not null,
  reason       text,
  status       text        not null default 'beklemede', -- beklemede / onaylandi / reddedildi
  returned_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- products
create table public.products (
  id                uuid        primary key default gen_random_uuid(),
  seller_id         uuid        not null references public.sellers(id) on delete cascade,
  name              text        not null,
  price             numeric(10,2),
  stock             integer     not null default 0,
  description_score integer     check (description_score between 0 and 100),
  seo_score         integer     check (seo_score between 0 and 100),
  return_rate       numeric(5,2),
  marketplace       text        not null default 'trendyol',
  created_at        timestamptz not null default now()
);

-- messages (müşteri mesajları)
create table public.messages (
  id            uuid        primary key default gen_random_uuid(),
  seller_id     uuid        not null references public.sellers(id) on delete cascade,
  customer_name text        not null,
  subject       text        not null,
  body          text        not null,
  product_name  text,
  status        text        not null default 'okunmadi', -- okunmadi / okundu / cevaplandi / beklemede
  reply         text,
  created_at    timestamptz not null default now()
);

-- waitlist
create table public.waitlist (
  id          uuid        primary key default gen_random_uuid(),
  email       text        unique not null,
  shop_name   text,
  referred_by text,
  created_at  timestamptz not null default now()
);

-- marketplace_credentials
create table public.marketplace_credentials (
  id          uuid        primary key default gen_random_uuid(),
  seller_id   uuid        not null references public.sellers(id) on delete cascade,
  marketplace text        not null,
  api_key     text        not null,
  api_secret  text,
  store_id    text,
  created_at  timestamptz not null default now()
);

-- admin_users
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade
);


-- ---------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------

-- seller_id indexes for all child tables
create index on public.reviews (seller_id);
create index on public.returns (seller_id);
create index on public.products (seller_id);
create index on public.messages (seller_id);
create index on public.marketplace_credentials (seller_id);

-- domain-specific indexes
create index on public.reviews (rating);
create index on public.reviews (status);
create index on public.returns (status);
create index on public.products (description_score);


-- ---------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------

alter table public.sellers             enable row level security;
alter table public.reviews             enable row level security;
alter table public.returns             enable row level security;
alter table public.products            enable row level security;
alter table public.messages            enable row level security;
alter table public.waitlist            enable row level security;
alter table public.marketplace_credentials enable row level security;
alter table public.admin_users         enable row level security;

-- sellers: each user manages their own row
create policy "sellers: select own"
  on public.sellers for select
  using (auth.uid() = id);

create policy "sellers: insert own"
  on public.sellers for insert
  with check (auth.uid() = id);

create policy "sellers: update own"
  on public.sellers for update
  using (auth.uid() = id);

create policy "sellers: delete own"
  on public.sellers for delete
  using (auth.uid() = id);

-- reviews
create policy "reviews: select own"
  on public.reviews for select
  using (auth.uid() = seller_id);

create policy "reviews: insert own"
  on public.reviews for insert
  with check (auth.uid() = seller_id);

create policy "reviews: update own"
  on public.reviews for update
  using (auth.uid() = seller_id);

create policy "reviews: delete own"
  on public.reviews for delete
  using (auth.uid() = seller_id);

-- returns
create policy "returns: select own"
  on public.returns for select
  using (auth.uid() = seller_id);

create policy "returns: insert own"
  on public.returns for insert
  with check (auth.uid() = seller_id);

create policy "returns: update own"
  on public.returns for update
  using (auth.uid() = seller_id);

create policy "returns: delete own"
  on public.returns for delete
  using (auth.uid() = seller_id);

-- products
create policy "products: select own"
  on public.products for select
  using (auth.uid() = seller_id);

create policy "products: insert own"
  on public.products for insert
  with check (auth.uid() = seller_id);

create policy "products: update own"
  on public.products for update
  using (auth.uid() = seller_id);

create policy "products: delete own"
  on public.products for delete
  using (auth.uid() = seller_id);

-- messages
create policy "messages: select own"
  on public.messages for select
  using (auth.uid() = seller_id);

create policy "messages: insert own"
  on public.messages for insert
  with check (auth.uid() = seller_id);

create policy "messages: update own"
  on public.messages for update
  using (auth.uid() = seller_id);

create policy "messages: delete own"
  on public.messages for delete
  using (auth.uid() = seller_id);

-- marketplace_credentials
create policy "credentials: select own"
  on public.marketplace_credentials for select
  using (auth.uid() = seller_id);

create policy "credentials: insert own"
  on public.marketplace_credentials for insert
  with check (auth.uid() = seller_id);

create policy "credentials: update own"
  on public.marketplace_credentials for update
  using (auth.uid() = seller_id);

create policy "credentials: delete own"
  on public.marketplace_credentials for delete
  using (auth.uid() = seller_id);

-- waitlist: anon can insert (sign-up form); no public reads
create policy "waitlist: anon insert"
  on public.waitlist for insert
  with check (true);

-- admin_users: admins can see their own record
create policy "admin_users: select own"
  on public.admin_users for select
  using (auth.uid() = id);

-- admins can see ALL sellers (additional select policy on sellers)
create policy "sellers: admin select all"
  on public.sellers for select
  using (
    exists (select 1 from public.admin_users where id = auth.uid())
  );


-- ---------------------------------------------------------------
-- TRIGGER: auto-create sellers row on new auth.users insert
-- ---------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.sellers (id, shop_name, referred_by)
  values (
    new.id,
    new.raw_user_meta_data->>'shop_name',
    new.raw_user_meta_data->>'referred_by'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------------
-- RPC: apply_referral
-- Increments referral_count for the seller who owns ref_code
-- ---------------------------------------------------------------

create or replace function public.apply_referral(ref_code text, new_user_id uuid)
returns void language sql security definer as $$
  update public.sellers
  set referral_count = referral_count + 1
  where referral_code = ref_code;
$$;
