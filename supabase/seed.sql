-- SatıcıPilot — Demo Seed Verisi (Genişletilmiş)
-- Supabase SQL Editor'da çalıştır

-- ── Mevcut demo verisini temizle ──────────────────────────────────────────────
delete from returns  where seller_id::text like 'a1000000%';
delete from reviews  where seller_id::text like 'a1000000%';
delete from products where seller_id::text like 'a1000000%';
delete from sellers  where id::text        like 'a1000000%';

-- ── Satıcılar ─────────────────────────────────────────────────────────────────
insert into sellers (id, email, shop_name, plan, is_active, created_at) values
  ('a1000000-0000-0000-0000-000000000001', 'demo1@saticipilot.com', 'ModaMira Butik',      'profesyonel', true,  now() - interval '45 days'),
  ('a1000000-0000-0000-0000-000000000002', 'demo2@saticipilot.com', 'Trendyol Tekstil',    'kurumsal',    true,  now() - interval '30 days'),
  ('a1000000-0000-0000-0000-000000000003', 'demo3@saticipilot.com', 'Şık Kadın Giyim',     'temel',       true,  now() - interval '20 days'),
  ('a1000000-0000-0000-0000-000000000004', 'demo4@saticipilot.com', 'Sezon Koleksiyonu',   'temel',       false, now() - interval '60 days'),
  ('a1000000-0000-0000-0000-000000000005', 'demo5@saticipilot.com', 'Premium Giyim A.Ş.', 'kurumsal',    true,  now() - interval '10 days');

-- ── Ürünler ───────────────────────────────────────────────────────────────────
insert into products (id, seller_id, marketplace, marketplace_product_id, name, category, price, stock, return_rate, description_score, seo_score, created_at) values
  -- ModaMira Butik
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',           'Bluz',    249.90,  85, 18.5, 42, 55, now() - interval '40 days'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon', 'Pantolon',349.90,  40, 12.0, 68, 72, now() - interval '38 days'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise',         'Elbise',  399.90,  20, 22.3, 35, 48, now() - interval '35 days'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1004', 'Çiçek Baskılı Midi Etek',     'Etek',    279.90,  55, 9.5,  74, 81, now() - interval '20 days'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1005', 'Oversize Keten Gömlek',       'Gömlek',  319.90,  30, 28.7, 31, 40, now() - interval '15 days'),
  -- Trendyol Tekstil
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört',          'Tişört',  129.90, 200,  8.0, 80, 85, now() - interval '28 days'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka',                 'Hırka',   459.90,  60, 14.5, 72, 78, now() - interval '25 days'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2003', 'Slim Fit Chino Pantolon',     'Pantolon',389.90,  90,  6.2, 85, 88, now() - interval '20 days'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2004', 'Denim Şort',                  'Şort',    199.90, 120, 11.0, 58, 65, now() - interval '18 days'),
  -- Şık Kadın Giyim
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3001', 'Krep Blazer Ceket',           'Ceket',   549.90,  25, 16.8, 45, 52, now() - interval '18 days'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3002', 'Saten Bluz',                  'Bluz',    229.90,  70, 20.1, 38, 44, now() - interval '15 days'),
  -- Premium Giyim
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000005', 'trendyol', 'TY-5001', 'Kaşmir Kazak',                'Kazak',   899.90,  15,  4.5, 90, 92, now() - interval '8 days'),
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000005', 'trendyol', 'TY-5002', 'Deri Görünümlü Tayt',         'Tayt',    349.90,  80, 13.2, 62, 70, now() - interval '6 days');

-- ── Yorumlar ──────────────────────────────────────────────────────────────────
insert into reviews (seller_id, marketplace, product_id, product_name, rating, comment, customer_name, sentiment, is_urgent, is_replied, reviewed_at) values

-- ModaMira Butik — acil ve bekleyen yorumlar
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz', 2,
  'Bedeni tutmuyor, S aldım ama M gibi geldi. Ürün güzel ama beden tablosu yanıltıcı.', 'Ayşe K.', 'olumsuz', true, false, now() - interval '2 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz', 1,
  'Tam bir hayal kırıklığı. Fotoğraftaki renkle hiç uyuşmuyor, çok soluk geldi.', 'Merve T.', 'acil', true, false, now() - interval '1 day'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1005', 'Oversize Keten Gömlek', 1,
  'Oversize yazıyor ama normal beden gibi. Tamamen yanıltıcı açıklama!', 'Hande Y.', 'acil', true, false, now() - interval '12 hours'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise', 2,
  'Omuz kısmındaki detay fotoğraftaki gibi değil, plastik görünüyor.', 'Fatma D.', 'olumsuz', false, false, now() - interval '4 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1005', 'Oversize Keten Gömlek', 2,
  'Keten dediğine göre kalın bekliyordum, çok ince geldi.', 'Reyhan S.', 'olumsuz', true, false, now() - interval '3 days'),

-- ModaMira Butik — olumlu ve yanıtlı yorumlar
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz', 4,
  'Kumaş kalitesi güzel, dikişler sağlam. Sadece beden biraz büyük geldi.', 'Selin A.', 'olumlu', false, true, now() - interval '5 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon', 5,
  'Harika bir ürün! Tam istediğim gibi, kalitesi çok iyi.', 'Zeynep M.', 'olumlu', false, true, now() - interval '7 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1004', 'Çiçek Baskılı Midi Etek', 5,
  'Renkleri çok canlı ve kumaş kaliteli. Kesinlikle tavsiye ederim!', 'Nur K.', 'olumlu', false, true, now() - interval '6 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1004', 'Çiçek Baskılı Midi Etek', 4,
  'Çok şık bir etek, fiyatına göre oldukça kaliteli.', 'Pınar A.', 'olumlu', false, false, now() - interval '9 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon', 3,
  'Bel kısmı biraz dar ama genel olarak iyi. Kargo hızlıydı.', 'Büşra Y.', 'notr', false, false, now() - interval '3 days'),

-- Trendyol Tekstil yorumlar
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört', 5,
  'Çok yumuşak, rengi solmadı. 3 tane daha aldım.', 'Elif S.', 'olumlu', false, true, now() - interval '10 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört', 5,
  'Basic ama kaliteli. Her sezon alıyorum bu markadan.', 'Nisan B.', 'olumlu', false, true, now() - interval '8 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka', 4,
  'Rengi çok güzel, dikişler sağlam. Biraz tüyleniyor ama memnunum.', 'Derya K.', 'olumlu', false, true, now() - interval '6 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka', 1,
  'İlk yıkamada bozuldu. Kesinlikle almayın!', 'Gülşen A.', 'acil', true, false, now() - interval '1 day'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2003', 'Slim Fit Chino Pantolon', 5,
  'Kesimi mükemmel, kumaşı kaliteli. Çok beğendim.', 'Emre T.', 'olumlu', false, true, now() - interval '5 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2004', 'Denim Şort', 2,
  'Rengi fotoğraftakinden farklı, biraz hayal kırıklığı.', 'Can B.', 'olumsuz', false, false, now() - interval '4 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2004', 'Denim Şort', 3,
  'İdare eder, fiyatına uygun ama beden büyük.', 'Arda M.', 'notr', false, false, now() - interval '3 days'),

-- Şık Kadın Giyim yorumlar
('a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3001', 'Krep Blazer Ceket', 1,
  'Astarda dikiş patladı, kalite berbat!', 'Oya S.', 'acil', true, false, now() - interval '6 hours'),
('a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3001', 'Krep Blazer Ceket', 2,
  'Omuzlar çok dar, bedenim tutmadı hiç.', 'Lale T.', 'olumsuz', true, false, now() - interval '2 days'),
('a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3002', 'Saten Bluz', 4,
  'Çok şık bir bluz, fiyatına göre kaliteli.', 'Meltem K.', 'olumlu', false, true, now() - interval '8 days'),

-- Premium Giyim yorumlar
('a1000000-0000-0000-0000-000000000005', 'trendyol', 'TY-5001', 'Kaşmir Kazak', 5,
  'Gerçekten kaşmir hissettiriyor, çok yumuşak ve sıcak.', 'Aylin B.', 'olumlu', false, true, now() - interval '4 days'),
('a1000000-0000-0000-0000-000000000005', 'trendyol', 'TY-5001', 'Kaşmir Kazak', 5,
  'Fiyatı yüksek ama kalitesi buna değiyor.', 'Sevgi T.', 'olumlu', false, true, now() - interval '3 days'),
('a1000000-0000-0000-0000-000000000005', 'trendyol', 'TY-5002', 'Deri Görünümlü Tayt', 3,
  'Görünümü güzel ama nefes almıyor, uzun süre giyince rahatsız ediyor.', 'Ceren A.', 'notr', false, false, now() - interval '2 days');

-- ── İadeler ───────────────────────────────────────────────────────────────────
insert into returns (seller_id, marketplace, product_id, product_name, reason, customer_comment, returned_at) values

-- ModaMira Butik iadeleri (bu hafta + geçen hafta)
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',           'beden_uyumsuzlugu', 'S aldım M gibi geldi.',              now() - interval '1 day'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',           'renk_farki',        'Renk çok farklı geldi.',             now() - interval '2 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',           'beden_uyumsuzlugu', 'Beden tablosuna göre aldım olmadı.',  now() - interval '3 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1005', 'Oversize Keten Gömlek',       'beden_uyumsuzlugu', 'Oversize yazıyor ama normal beden.', now() - interval '1 day'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1005', 'Oversize Keten Gömlek',       'beden_uyumsuzlugu', 'Beklediğimden küçük geldi.',          now() - interval '2 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1005', 'Oversize Keten Gömlek',       'kalite_sorunu',     'Kumaş çok ince.',                    now() - interval '4 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise',         'kalite_sorunu',     'Omuz detayı fotoğraf gibi değil.',   now() - interval '4 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon', 'beden_uyumsuzlugu', null,                                  now() - interval '5 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',           'beden_uyumsuzlugu', 'Yine beden sorunu.',                  now() - interval '8 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise',         'renk_farki',        'Renk farklı geldi.',                  now() - interval '9 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',           'beden_uyumsuzlugu', 'Her seferinde beden sorunu!',         now() - interval '10 days'),
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1004', 'Çiçek Baskılı Midi Etek',     'renk_farki',        'Renkler ekranda daha canlı görünüyor.', now() - interval '12 days'),

-- Trendyol Tekstil iadeleri
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka',      'kalite_sorunu', 'İlk yıkamada bozuldu.',    now() - interval '1 day'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka',      'kalite_sorunu', 'Tüyleniyor ve bozuldu.',   now() - interval '3 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2004', 'Denim Şort',       'renk_farki',    'Renk farklı.',             now() - interval '2 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2004', 'Denim Şort',       'beden_uyumsuzlugu', 'Beden büyük geldi.',   now() - interval '5 days'),
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört','renk_farki',   null,                       now() - interval '6 days'),

-- Şık Kadın Giyim iadeleri
('a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3001', 'Krep Blazer Ceket', 'kalite_sorunu',     'Astarda dikiş patladı.',    now() - interval '1 day'),
('a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3001', 'Krep Blazer Ceket', 'beden_uyumsuzlugu', 'Omuzlar çok dar.',           now() - interval '3 days'),
('a1000000-0000-0000-0000-000000000003', 'trendyol', 'TY-3002', 'Saten Bluz',        'renk_farki',        'Renk beklediğim gibi değil.', now() - interval '6 days'),

-- Premium Giyim iadeleri
('a1000000-0000-0000-0000-000000000005', 'trendyol', 'TY-5002', 'Deri Görünümlü Tayt', 'kalite_sorunu', 'Nefes almıyor.', now() - interval '2 days');
