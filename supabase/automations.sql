CREATE TABLE IF NOT EXISTS automations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     uuid REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  name          text NOT NULL,
  trigger       text NOT NULL DEFAULT 'form_submitted',
  subject       text NOT NULL,
  body          text NOT NULL,
  discount_code text,
  is_active     boolean DEFAULT true,
  sent_count    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own automations" ON automations
  FOR ALL USING (seller_id = auth.uid());
