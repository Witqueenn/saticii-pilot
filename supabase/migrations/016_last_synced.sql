ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
