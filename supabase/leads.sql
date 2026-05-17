create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  shop_name     text not null,
  marketplace   text not null default 'trendyol',
  contact_name  text,
  contact_email text,
  contact_phone text,
  store_url     text,
  status        text not null default 'kesfedildi'
                check (status in ('kesfedildi','ulasildi','demo','deneme','musteri','kayip')),
  source        text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists leads_status_idx on leads(status);
