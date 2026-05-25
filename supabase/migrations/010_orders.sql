-- 010_orders.sql
-- Trendyol sipariş senkronizasyonu için orders tablosu.
-- Çalıştırma: Supabase Dashboard → SQL Editor

create table if not exists orders (
  id                    uuid primary key default gen_random_uuid(),
  seller_id             uuid not null references sellers(id) on delete cascade,
  marketplace           text not null,
  marketplace_order_id  text not null,
  status                text not null,
  total_price           numeric(12, 2),
  line_items            jsonb,
  ordered_at            timestamptz not null,
  created_at            timestamptz not null default now(),
  unique (seller_id, marketplace, marketplace_order_id)
);

-- RLS
alter table orders enable row level security;
create policy "orders_owner" on orders
  for all using (auth.uid() = seller_id);

-- Hızlı sorgular için index
create index if not exists orders_seller_ordered_idx
  on orders (seller_id, ordered_at desc);

create index if not exists orders_seller_status_idx
  on orders (seller_id, status);
