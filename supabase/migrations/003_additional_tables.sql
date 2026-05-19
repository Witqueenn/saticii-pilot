-- competitor_prices: tracks competitor product prices for price comparison
-- If you already ran an earlier version of this file that had "product_name",
-- run these ALTER statements first, then skip the CREATE TABLE below:
--
--   alter table competitor_prices rename column product_name to our_product_name;
--   alter table competitor_prices add column if not exists our_product_id text not null default '';
--   alter table competitor_prices add column if not exists category text;

create table if not exists competitor_prices (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade not null,
  our_product_id text not null,
  our_product_name text not null,
  our_price numeric(10,2) not null,
  competitor_name text not null,
  competitor_product_name text,
  competitor_price numeric(10,2) not null,
  category text,
  checked_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table competitor_prices enable row level security;

create policy "Sellers can view their own competitor prices"
  on competitor_prices for select
  using (auth.uid() = seller_id);

create policy "Sellers can insert competitor prices"
  on competitor_prices for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update their own competitor prices"
  on competitor_prices for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete their own competitor prices"
  on competitor_prices for delete
  using (auth.uid() = seller_id);

-- customer_responses: responses collected from QR-based customer feedback forms
create table if not exists customer_responses (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade not null,
  email text,
  phone text,
  rating integer check (rating between 1 and 5),
  comment text,
  product_name text,
  is_newsletter boolean default false,
  created_at timestamptz default now()
);

alter table customer_responses enable row level security;

create policy "Sellers can view their own customer responses"
  on customer_responses for select
  using (auth.uid() = seller_id);

create policy "Sellers can insert customer responses"
  on customer_responses for insert
  with check (auth.uid() = seller_id);

-- campaigns: marketing campaigns (discounts, flash sales, bundles, etc.)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade not null,
  name text not null,
  type text not null default 'indirim', -- indirim | flash_sale | upsell | bundle | sezon
  status text not null default 'taslak', -- taslak | beklemede | aktif | bitti
  discount_rate numeric(5,2),
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

alter table campaigns enable row level security;

create policy "Sellers can view their own campaigns"
  on campaigns for select
  using (auth.uid() = seller_id);

create policy "Sellers can insert campaigns"
  on campaigns for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update their own campaigns"
  on campaigns for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete their own campaigns"
  on campaigns for delete
  using (auth.uid() = seller_id);

-- automations: trigger-action pairs that run automatically
create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade not null,
  trigger text not null, -- yeni_yorum | dusuk_puan | iade_talebi | siparis
  action text not null,  -- mesaj_gonder | indirim_kodu | bildirim
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table automations enable row level security;

create policy "Sellers can view their own automations"
  on automations for select
  using (auth.uid() = seller_id);

create policy "Sellers can insert automations"
  on automations for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update their own automations"
  on automations for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete their own automations"
  on automations for delete
  using (auth.uid() = seller_id);

-- demo seed for existing dev accounts (adjust seller_id as needed)
-- insert into competitor_prices (seller_id, product_name, our_price, competitor_name, competitor_price)
-- values ('<your-seller-id>', 'Kadın Triko Kazak', 299.90, 'Mavi', 279.90);
