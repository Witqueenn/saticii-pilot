-- Ayarlar: telefon + haftalık rapor bildirimi
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS notify_weekly_report boolean DEFAULT true;

-- E-posta takibi (her gönderilen mailin resend ID'si)
CREATE TABLE IF NOT EXISTS email_sends (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       uuid REFERENCES sellers(id) ON DELETE CASCADE,
  resend_id       text UNIQUE,
  recipient_email text,
  subject         text,
  segment         text,
  campaign_label  text,
  opened          boolean DEFAULT false,
  clicked         boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers view own sends" ON email_sends
  FOR SELECT USING (seller_id = auth.uid());

-- SMS için formdan telefon toplama
ALTER TABLE form_responses ADD COLUMN IF NOT EXISTS phone text;
