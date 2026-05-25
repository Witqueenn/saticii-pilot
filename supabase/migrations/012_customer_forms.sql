-- 012_customer_forms.sql
-- Müşteri geri bildirim formu tabloları ve otomasyon sütunları.
-- Çalıştırma: Supabase Dashboard → SQL Editor

-- customer_forms: her satıcıya ait benzersiz form (slug = public URL parçası)
create table if not exists customer_forms (
  id         uuid primary key default gen_random_uuid(),
  seller_id  uuid not null references sellers(id) on delete cascade,
  slug       text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table customer_forms enable row level security;

create policy "customer_forms_owner"
  on customer_forms for all
  using (auth.uid() = seller_id);

-- Public read: /f/[slug] sayfası için anonim okuma (sadece is_active olanlar)
create policy "customer_forms_public_read"
  on customer_forms for select
  using (is_active = true);

create index if not exists customer_forms_seller_idx on customer_forms (seller_id);
create index if not exists customer_forms_slug_idx   on customer_forms (slug);

-- form_responses: müşterilerden gelen yanıtlar
create table if not exists form_responses (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references sellers(id) on delete cascade,
  form_id          uuid not null references customer_forms(id) on delete cascade,
  product_ref      text,
  order_ref        text,
  rating           integer not null check (rating between 1 and 5),
  comment          text,
  email            text,
  phone            text,
  wants_newsletter boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table form_responses enable row level security;

-- Satıcı kendi yanıtlarını görebilir
create policy "form_responses_owner"
  on form_responses for select
  using (auth.uid() = seller_id);

-- Anonim müşteriler yanıt gönderebilir (API service role ile yapılır, ama güvenli olsun)
create policy "form_responses_insert_anon"
  on form_responses for insert
  with check (true);

create index if not exists form_responses_seller_idx  on form_responses (seller_id, created_at desc);
create index if not exists form_responses_form_idx    on form_responses (form_id);

-- automations tablosuna eksik sütunları ekle (migration 003'te oluşturulmuştu, sütunlar eksik)
alter table automations
  add column if not exists name          text not null default '',
  add column if not exists subject       text not null default '',
  add column if not exists body          text not null default '',
  add column if not exists discount_code text,
  add column if not exists sent_count    integer not null default 0;
