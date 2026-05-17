-- reviews tablosuna bildirim kolonu
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS notified_at timestamptz;

-- sellers tablosuna bildirim tercihleri
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS notify_urgent_reviews boolean NOT NULL DEFAULT true;
