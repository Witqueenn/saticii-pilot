-- SatıcıPilot — Supabase Şema
-- Supabase SQL Editor'da çalıştır

-- ── Satıcılar ────────────────────────────────────────────────────────────────

create table if not exists sellers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  shop_name   text not null,
  plan        text not null default 'temel' check (plan in ('temel', 'profesyonel', 'kurumsal')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Pazaryeri Kimlik Bilgileri ────────────────────────────────────────────────

create table if not exists marketplace_credentials (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references sellers(id) on delete cascade,
  marketplace   text not null check (marketplace in ('trendyol', 'hepsiburada', 'n11')),
  api_key       text not null,
  api_secret    text not null,
  supplier_id   text,
  created_at    timestamptz not null default now(),
  unique (seller_id, marketplace)
);

-- ── Ürünler ─────────────────────────────────────────────────────────────────

create table if not exists products (
  id                      uuid primary key default gen_random_uuid(),
  seller_id               uuid not null references sellers(id) on delete cascade,
  marketplace             text not null,
  marketplace_product_id  text not null,
  name                    text not null,
  category                text not null,
  description             text,
  price                   numeric(12, 2),
  stock                   integer default 0,
  return_rate             numeric(5, 2),
  description_score       integer check (description_score between 0 and 100),
  seo_score               integer check (seo_score between 0 and 100),
  ai_suggestions          jsonb,
  improved_description    text,
  updated_at              timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  unique (seller_id, marketplace, marketplace_product_id)
);

-- ── Yorumlar ─────────────────────────────────────────────────────────────────

create table if not exists reviews (
  id                      uuid primary key default gen_random_uuid(),
  seller_id               uuid not null references sellers(id) on delete cascade,
  marketplace             text not null,
  product_id              text not null,
  product_name            text not null,
  rating                  integer not null check (rating between 1 and 5),
  comment                 text not null,
  customer_name           text,
  sentiment               text check (sentiment in ('olumlu', 'notr', 'olumsuz', 'acil')),
  ai_summary              text,
  suggested_reply         text,
  is_replied              boolean not null default false,
  is_urgent               boolean not null default false,
  reviewed_at             timestamptz not null,
  created_at              timestamptz not null default now()
);

create index if not exists reviews_seller_id_idx on reviews(seller_id);
create index if not exists reviews_is_urgent_idx on reviews(is_urgent) where is_urgent = true;
create index if not exists reviews_sentiment_idx on reviews(sentiment);

-- ── İadeler ──────────────────────────────────────────────────────────────────

create table if not exists returns (
  id                uuid primary key default gen_random_uuid(),
  seller_id         uuid not null references sellers(id) on delete cascade,
  marketplace       text not null,
  product_id        text not null,
  product_name      text not null,
  reason            text not null check (reason in (
    'beden_uyumsuzlugu', 'renk_farki', 'kalite_sorunu',
    'yanlis_urun', 'hasarli', 'diger'
  )),
  customer_comment  text,
  returned_at       timestamptz not null,
  created_at        timestamptz not null default now()
);

create index if not exists returns_seller_id_idx on returns(seller_id);
create index if not exists returns_product_id_idx on returns(product_id);

-- ── İade Raporları ───────────────────────────────────────────────────────────

create table if not exists return_reports (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references sellers(id) on delete cascade,
  total_returns   integer not null default 0,
  patterns        jsonb not null default '[]',
  created_at      timestamptz not null default now(),
  unique (seller_id)  -- Her satıcı için en güncel rapor
);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table sellers                  enable row level security;
alter table marketplace_credentials  enable row level security;
alter table products                 enable row level security;
alter table reviews                  enable row level security;
alter table returns                  enable row level security;
alter table return_reports           enable row level security;

-- Satıcı yalnızca kendi verisini görür (Supabase Auth user id = seller id)
create policy "sellers_own" on sellers
  for all using (auth.uid() = id);

create policy "credentials_own" on marketplace_credentials
  for all using (auth.uid() = seller_id);

create policy "products_own" on products
  for all using (auth.uid() = seller_id);

create policy "reviews_own" on reviews
  for all using (auth.uid() = seller_id);

create policy "returns_own" on returns
  for all using (auth.uid() = seller_id);

create policy "return_reports_own" on return_reports
  for all using (auth.uid() = seller_id);
