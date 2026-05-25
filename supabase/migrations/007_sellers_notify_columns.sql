-- =============================================================================
-- 007_sellers_notify_columns.sql
-- Root schema.sql'de eksik olan sellers sütunlarını ekler.
-- Bildirim tercihleri, telefon ve profil tamamlama için gerekli.
-- =============================================================================

-- Bildirim tercihleri
alter table sellers add column if not exists notify_urgent_reviews boolean not null default true;
alter table sellers add column if not exists notify_weekly_report  boolean not null default true;
alter table sellers add column if not exists notify_new_returns    boolean not null default false;
alter table sellers add column if not exists notify_low_stock      boolean not null default false;

-- Profil
alter table sellers add column if not exists phone       text;
alter table sellers add column if not exists referred_by text;

-- Eğer sellers tablosunda email kolonu yoksa (migration-001 şeması kullanılıyorsa) ekle
-- (root schema.sql'de zaten var, ON CONFLICT)
alter table sellers add column if not exists email    text;
alter table sellers add column if not exists is_active boolean not null default true;
