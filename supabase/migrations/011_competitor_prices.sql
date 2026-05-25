-- 011_competitor_prices.sql
-- Rakip fiyat takibi tablosu (manuel giriş).
-- Çalıştırma: Supabase Dashboard → SQL Editor

create table if not exists competitor_prices (
  id                      uuid primary key default gen_random_uuid(),
  seller_id               uuid not null references sellers(id) on delete cascade,
  our_product_id          text not null,
  our_product_name        text not null,
  our_price               numeric(12, 2) not null,
  competitor_name         text not null,
  competitor_product_name text,
  competitor_price        numeric(12, 2) not null,
  category                text,
  checked_at              timestamptz not null default now(),
  created_at              timestamptz not null default now()
);

alter table competitor_prices enable row level security;
create policy "competitor_prices_owner" on competitor_prices
  for all using (auth.uid() = seller_id);

create index if not exists competitor_prices_seller_idx
  on competitor_prices (seller_id, our_product_id, checked_at desc);
