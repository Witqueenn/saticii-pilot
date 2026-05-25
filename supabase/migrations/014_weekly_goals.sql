-- Haftalık gelir hedefi ve aylık sipariş hedefi
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS weekly_revenue_goal numeric,
  ADD COLUMN IF NOT EXISTS monthly_order_goal  integer;
