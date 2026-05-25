-- =============================================================================
-- 008_returns_sync.sql
-- returns tablosuna Trendyol sync için dedup kolonu ekle.
-- =============================================================================

alter table returns add column if not exists marketplace_return_id text;

-- Aynı iadeyi iki kez kaydetmemek için unique index
create unique index if not exists returns_sync_dedup_idx
  on returns (seller_id, marketplace, marketplace_return_id)
  where marketplace_return_id is not null;
