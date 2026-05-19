-- Drop the 3-platform constraint; replace with the full set of known platform IDs.
-- comingSoon platforms are included so credential saves never fail if we graduate them.
alter table marketplace_credentials
  drop constraint if exists marketplace_credentials_marketplace_check;

alter table marketplace_credentials
  add constraint marketplace_credentials_marketplace_check
  check (marketplace in (
    'trendyol', 'hepsiburada', 'n11',
    'amazon_tr', 'pazarama', 'etsy',
    'woocommerce', 'shopify', 'custom_website', 'instagram'
  ));

-- Track which sellers expressed interest in a coming-soon platform.
-- Used to prioritize roadmap and notify on launch.
create table if not exists platform_interests (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid references auth.users(id) on delete cascade not null,
  platform    text not null,
  created_at  timestamptz default now() not null,
  unique (seller_id, platform)
);

alter table platform_interests enable row level security;

create policy "own_interests" on platform_interests
  for all using (auth.uid() = seller_id);
