-- Rakip fiyat takibi tablosu
CREATE TABLE IF NOT EXISTS competitor_prices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid REFERENCES sellers(id) ON DELETE CASCADE,
  our_product_id   text NOT NULL,
  our_product_name text NOT NULL,
  our_price        numeric(10,2) NOT NULL,
  competitor_name  text NOT NULL,
  competitor_product_name text,
  competitor_price numeric(10,2) NOT NULL,
  category    text,
  checked_at  timestamptz DEFAULT now()
);

ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seller sees own competitor prices"
  ON competitor_prices FOR SELECT
  USING (seller_id = auth.uid());

-- ── Demo seed verisi ──────────────────────────────────────────────────────────
-- Önce temizle
DELETE FROM competitor_prices WHERE seller_id::text LIKE 'a1000000%';

INSERT INTO competitor_prices
  (seller_id, our_product_id, our_product_name, our_price,
   competitor_name, competitor_product_name, competitor_price, category, checked_at)
VALUES

-- ── ModaMira Butik ─────────────────────────────────────────────────────────
-- Yazlık Keten Bluz ₺249.90 → en ucuz rakip ₺219.90 → PAHALI (%13.6)
('a1000000-0000-0000-0000-000000000001','TY-1001','Yazlık Keten Bluz',249.90,
 'FashionTR','Keten Bluz Yazlık',219.90,'Bluz', now() - interval '2 hours'),
('a1000000-0000-0000-0000-000000000001','TY-1001','Yazlık Keten Bluz',249.90,
 'ModaHouse','Kadın Keten Bluz',269.90,'Bluz', now() - interval '2 hours'),
('a1000000-0000-0000-0000-000000000001','TY-1001','Yazlık Keten Bluz',249.90,
 'TekstilCity','Sezon Keten Bluz',234.90,'Bluz', now() - interval '2 hours'),

-- Yüksek Bel Palazzo Pantolon ₺349.90 → en ucuz rakip ₺327.90 → PAHALI (%6.7)
('a1000000-0000-0000-0000-000000000001','TY-1002','Yüksek Bel Palazzo Pantolon',349.90,
 'FashionTR','Palazzo Pantolon',327.90,'Pantolon', now() - interval '2 hours'),
('a1000000-0000-0000-0000-000000000001','TY-1002','Yüksek Bel Palazzo Pantolon',349.90,
 'StyleShop','Yüksek Bel Palazzo',379.90,'Pantolon', now() - interval '2 hours'),

-- Omuz Detaylı Elbise ₺399.90 → en ucuz rakip ₺385.90 → UYGUN (%3.6)
('a1000000-0000-0000-0000-000000000001','TY-1003','Omuz Detaylı Elbise',399.90,
 'TrendGiyim','Detaylı Elbise',385.90,'Elbise', now() - interval '2 hours'),
('a1000000-0000-0000-0000-000000000001','TY-1003','Omuz Detaylı Elbise',399.90,
 'ModaHouse','Omuz Detaylı Midi Elbise',419.90,'Elbise', now() - interval '2 hours'),

-- Çiçek Baskılı Midi Etek ₺279.90 → en ucuz rakip ₺269.90 → UYGUN (%3.7)
('a1000000-0000-0000-0000-000000000001','TY-1004','Çiçek Baskılı Midi Etek',279.90,
 'FashionTR','Çiçek Baskı Midi Etek',299.90,'Etek', now() - interval '2 hours'),
('a1000000-0000-0000-0000-000000000001','TY-1004','Çiçek Baskılı Midi Etek',279.90,
 'StyleShop','Midi Çiçek Etek',269.90,'Etek', now() - interval '2 hours'),

-- Oversize Keten Gömlek ₺319.90 → en ucuz rakip ₺349.90 → UCUZ (%−8.6)
('a1000000-0000-0000-0000-000000000001','TY-1005','Oversize Keten Gömlek',319.90,
 'ModaHouse','Oversize Keten Gömlek',349.90,'Gömlek', now() - interval '2 hours'),
('a1000000-0000-0000-0000-000000000001','TY-1005','Oversize Keten Gömlek',319.90,
 'TrendGiyim','Keten Oversize',369.90,'Gömlek', now() - interval '2 hours'),

-- ── Trendyol Tekstil ───────────────────────────────────────────────────────
-- Basic Pamuk Tişört ₺129.90 → en ucuz ₺119.90 → PAHALI (%8.3)
('a1000000-0000-0000-0000-000000000002','TY-2001','Basic Pamuk Tişört',129.90,
 'BasicWear','Pamuk Basic Tişört',119.90,'Tişört', now() - interval '3 hours'),
('a1000000-0000-0000-0000-000000000002','TY-2001','Basic Pamuk Tişört',129.90,
 'TshirtTR','Pamuklu Basic',139.90,'Tişört', now() - interval '3 hours'),
('a1000000-0000-0000-0000-000000000002','TY-2001','Basic Pamuk Tişört',129.90,
 'FashionTR','Unisex Basic',124.90,'Tişört', now() - interval '3 hours'),

-- Triko Hırka ₺459.90 → en ucuz ₺441.90 → UYGUN (%4.1)
('a1000000-0000-0000-0000-000000000002','TY-2002','Triko Hırka',459.90,
 'KnitwearTR','Triko Hırka Kadın',441.90,'Hırka', now() - interval '3 hours'),
('a1000000-0000-0000-0000-000000000002','TY-2002','Triko Hırka',459.90,
 'ModaHouse','Kadın Hırka Triko',489.90,'Hırka', now() - interval '3 hours'),

-- Slim Fit Chino ₺389.90 → en ucuz ₺359.90 → PAHALI (%8.3)
('a1000000-0000-0000-0000-000000000002','TY-2003','Slim Fit Chino Pantolon',389.90,
 'ChicPants','Chino Slim Pantolon',359.90,'Pantolon', now() - interval '3 hours'),
('a1000000-0000-0000-0000-000000000002','TY-2003','Slim Fit Chino Pantolon',389.90,
 'TrendGiyim','Slim Chino',399.90,'Pantolon', now() - interval '3 hours'),

-- Denim Şort ₺199.90 → en ucuz ₺209.90 → UCUZ (%−4.8)
('a1000000-0000-0000-0000-000000000002','TY-2004','Denim Şort',199.90,
 'JeansWorld','Denim Şort Kadın',209.90,'Şort', now() - interval '3 hours'),
('a1000000-0000-0000-0000-000000000002','TY-2004','Denim Şort',199.90,
 'BasicWear','Şort Denim',219.90,'Şort', now() - interval '3 hours'),

-- ── Şık Kadın Giyim ───────────────────────────────────────────────────────
-- Krep Blazer Ceket ₺549.90 → en ucuz ₺499.90 → PAHALI (%10)
('a1000000-0000-0000-0000-000000000003','TY-3001','Krep Blazer Ceket',549.90,
 'BlazerStore','Blazer Krep Ceket',499.90,'Ceket', now() - interval '4 hours'),
('a1000000-0000-0000-0000-000000000003','TY-3001','Krep Blazer Ceket',549.90,
 'StyleShop','Kadın Blazer',579.90,'Ceket', now() - interval '4 hours'),

-- Saten Bluz ₺229.90 → en ucuz ₺219.90 → UYGUN (%4.6)
('a1000000-0000-0000-0000-000000000003','TY-3002','Saten Bluz',229.90,
 'FashionTR','Saten Kadın Bluz',219.90,'Bluz', now() - interval '4 hours'),
('a1000000-0000-0000-0000-000000000003','TY-3002','Saten Bluz',229.90,
 'ModaHouse','Saten Bluz Kadın',249.90,'Bluz', now() - interval '4 hours'),

-- ── Premium Giyim ─────────────────────────────────────────────────────────
-- Kaşmir Kazak ₺899.90 → en ucuz ₺849.90 → UYGUN (%5.9) borderline
('a1000000-0000-0000-0000-000000000005','TY-5001','Kaşmir Kazak',899.90,
 'LuxuryWear','Kaşmir Kadın Kazak',849.90,'Kazak', now() - interval '1 hour'),
('a1000000-0000-0000-0000-000000000005','TY-5001','Kaşmir Kazak',899.90,
 'PremiumTR','Kaşmir Kazak Premium',949.90,'Kazak', now() - interval '1 hour'),

-- Deri Görünümlü Tayt ₺349.90 → en ucuz ₺379.90 → UCUZ (%−7.9)
('a1000000-0000-0000-0000-000000000005','TY-5002','Deri Görünümlü Tayt',349.90,
 'SportStyle','Deri Tayt Kadın',379.90,'Tayt', now() - interval '1 hour'),
('a1000000-0000-0000-0000-000000000005','TY-5002','Deri Görünümlü Tayt',349.90,
 'FashionTR','Deri Görünüm Tayt',399.90,'Tayt', now() - interval '1 hour');
