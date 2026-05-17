-- Customer feedback forms and responses

CREATE TABLE IF NOT EXISTS customer_forms (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE UNIQUE NOT NULL,
  slug      text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_forms ENABLE ROW LEVEL SECURITY;

-- Sellers manage their own form
CREATE POLICY "Sellers manage own form" ON customer_forms
  FOR ALL USING (seller_id = auth.uid());

-- Public can read active forms (needed for the public form page)
CREATE POLICY "Public read active forms" ON customer_forms
  FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS form_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       uuid REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
  form_id         uuid REFERENCES customer_forms(id) ON DELETE CASCADE NOT NULL,
  product_ref     text,
  rating          int CHECK (rating BETWEEN 1 AND 5),
  comment         text,
  email           text,
  wants_newsletter boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Sellers view own responses
CREATE POLICY "Sellers view own responses" ON form_responses
  FOR SELECT USING (seller_id = auth.uid());

-- Service role handles inserts (public form submissions bypass RLS)
