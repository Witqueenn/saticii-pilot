-- Add store_url column to marketplace_credentials for WooCommerce / Shopify
ALTER TABLE marketplace_credentials
  ADD COLUMN IF NOT EXISTS store_url text;
