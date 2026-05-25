-- =============================================================================
-- 006_review_sync.sql
-- Adds columns required for Trendyol review sync and AI analysis.
-- All statements use IF NOT EXISTS / DO NOTHING so they are safe to re-run.
-- =============================================================================

-- ── reviews: AI analysis + marketplace sync columns ─────────────────────────

alter table reviews add column if not exists marketplace            text;
alter table reviews add column if not exists product_id             text;
alter table reviews add column if not exists customer_name          text;
alter table reviews add column if not exists sentiment              text
  check (sentiment in ('olumlu', 'notr', 'olumsuz', 'acil'));
alter table reviews add column if not exists ai_summary             text;
alter table reviews add column if not exists suggested_reply        text;
alter table reviews add column if not exists marketplace_review_id  text;

-- Backfill marketplace = 'trendyol' for existing rows that have no value
update reviews set marketplace = 'trendyol' where marketplace is null;

-- Unique index for upsert deduplication during sync
create unique index if not exists reviews_sync_dedup_idx
  on reviews (seller_id, marketplace, marketplace_review_id)
  where marketplace_review_id is not null;

-- ── marketplace_credentials: normalise column name ──────────────────────────
-- Some schema versions use store_id, others supplier_id.
-- Add supplier_id if missing so the frontend credential route always works.

alter table marketplace_credentials add column if not exists supplier_id text;

-- Copy existing store_id values into supplier_id where supplier_id is still NULL
update marketplace_credentials
   set supplier_id = store_id
 where store_id is not null and supplier_id is null;

-- ── sellers: ensure referral columns exist ───────────────────────────────────

alter table sellers add column if not exists referral_code   text unique;
alter table sellers add column if not exists referral_count  integer not null default 0;
alter table sellers add column if not exists onboarding_done boolean not null default false;
