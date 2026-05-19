-- =============================================================
-- SatıcıPilot — 003b_fix_competitor_prices.sql
-- Fixes competitor_prices table to match rakip.tsx schema.
--
-- Run this if you already applied 003_additional_tables.sql
-- and got "column product_name does not exist" from the seed.
-- =============================================================

-- Rename product_name → our_product_name
alter table public.competitor_prices
  rename column product_name to our_product_name;

-- Add our_product_id (used to group rows by product in rakip.tsx)
alter table public.competitor_prices
  add column if not exists our_product_id text not null default '';

-- Add category (optional label shown in detail modal)
alter table public.competitor_prices
  add column if not exists category text;

-- Remove the empty-string default we just used for NOT NULL
alter table public.competitor_prices
  alter column our_product_id drop default;
