-- 013_pazarlama_tables.sql
-- Pazarlama modülü için email_sends tablosu ve eksik sütunlar.

-- 1. sellers tablosuna image_tokens sütunu ekle
alter table sellers
  add column if not exists image_tokens integer not null default 0;

-- 2. campaigns tablosuna eksik sütunları ekle
alter table campaigns
  add column if not exists title text;

alter table campaigns
  add column if not exists platform text;

alter table campaigns
  add column if not exists discount_pct integer;

alter table campaigns
  add column if not exists notes text;

-- 3. email_sends tablosunu oluştur
create table if not exists email_sends (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  resend_id text,
  recipient_email text not null,
  subject text not null,
  segment text not null default 'all',
  campaign_label text,
  opened boolean not null default false,
  clicked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table email_sends enable row level security;

create policy "email_sends_owner"
  on email_sends
  for all
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create index if not exists email_sends_seller_created_idx
  on email_sends (seller_id, created_at desc);

create index if not exists email_sends_resend_id_idx
  on email_sends (resend_id);
