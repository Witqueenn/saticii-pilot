CREATE TABLE IF NOT EXISTS campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  platform    text,
  product_names text[],
  discount_pct  int,
  start_date  date,
  end_date    date,
  notes       text,
  status      text DEFAULT 'planned',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own campaigns" ON campaigns
  FOR ALL USING (seller_id = auth.uid());
