-- SatıcıPilot — Admin Sistemi
-- Supabase SQL Editor'da çalıştır

-- ── Admin kullanıcıları ───────────────────────────────────────────────────────
-- auth.users tablosundaki kullanıcılara admin rolü verir

create table if not exists admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- RLS: sadece admin_users tablosunu adminler okuyabilir
alter table admin_users enable row level security;

create policy "admin_users_select" on admin_users
  for select using (auth.uid() in (select id from admin_users));

-- ── Admin için sellers tablosuna erişim ──────────────────────────────────────
-- Adminler tüm satıcıları görebilir

create policy "sellers_admin_select" on sellers
  for select using (auth.uid() in (select id from admin_users));

create policy "sellers_admin_update" on sellers
  for update using (auth.uid() in (select id from admin_users));

-- ── İlk admin kullanıcısını ekle ─────────────────────────────────────────────
-- Kendi Supabase user ID'ni ve emailini buraya yaz, sonra çalıştır:
-- insert into admin_users (id, email)
-- values ('SENIN-USER-ID', 'senin@email.com');

-- ── Admin istatistik view'ı ───────────────────────────────────────────────────

create or replace view admin_seller_stats as
select
  s.id,
  s.email,
  s.shop_name,
  s.plan,
  s.is_active,
  s.created_at,
  count(distinct r.id)  as total_reviews,
  count(distinct p.id)  as total_products,
  count(distinct rt.id) as total_returns
from sellers s
left join reviews  r  on r.seller_id  = s.id
left join products p  on p.seller_id  = s.id
left join returns  rt on rt.seller_id = s.id
group by s.id;
