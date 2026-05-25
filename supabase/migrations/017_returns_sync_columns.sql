ALTER TABLE returns
  ADD COLUMN IF NOT EXISTS marketplace       text NOT NULL DEFAULT 'trendyol',
  ADD COLUMN IF NOT EXISTS product_id        text,
  ADD COLUMN IF NOT EXISTS customer_comment  text;
