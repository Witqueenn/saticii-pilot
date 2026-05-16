-- SatıcıPilot — Demo Seed Verisi
-- Supabase SQL Editor'da çalıştır
-- NOT: Bu script her çalıştırıldığında mevcut demo veriyi siler ve yeniden ekler

-- ── Demo satıcıları ekle ─────────────────────────────────────────────────────
-- sellers tablosu auth.users'a bağlı değil, UUID'leri biz belirliyoruz

insert into sellers (id, email, shop_name, plan, is_active, created_at) values
  ('a1000000-0000-0000-0000-000000000001', 'demo1@saticipilot.com', 'ModaMira Butik',      'profesyonel', true,  now() - interval '45 days'),
  ('a1000000-0000-0000-0000-000000000002', 'demo2@saticipilot.com', 'Trendyol Tekstil',    'kurumsal',    true,  now() - interval '30 days'),
  ('a1000000-0000-0000-0000-000000000003', 'demo3@saticipilot.com', 'Şık Kadın Giyim',     'temel',       true,  now() - interval '20 days'),
  ('a1000000-0000-0000-0000-000000000004', 'demo4@saticipilot.com', 'Sezon Koleksiyonu',   'temel',       false, now() - interval '60 days'),
  ('a1000000-0000-0000-0000-000000000005', 'demo5@saticipilot.com', 'Premium Giyim A.Ş.', 'kurumsal',    true,  now() - interval '10 days')
on conflict (id) do nothing;

-- ── Ürünler ──────────────────────────────────────────────────────────────────

insert into products (id, seller_id, marketplace, marketplace_product_id, name, category, price, stock, return_rate, description_score, seo_score, created_at) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',          'Bluz',    249.90,  85, 18.5, 42, 55, now() - interval '40 days'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon','Pantolon', 349.90,  40, 12.0, 68, 72, now() - interval '38 days'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise',        'Elbise',  399.90,  20, 22.3, 35, 48, now() - interval '35 days'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört',         'Tişört',  129.90, 200,  8.0, 80, 85, now() - interval '28 days'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka',                'Hırka',   459.90,  60, 14.5, 72, 78, now() - interval '25 days')
on conflict (seller_id, marketplace, marketplace_product_id) do nothing;

-- ── Yorumlar ─────────────────────────────────────────────────────────────────

insert into reviews (seller_id, marketplace, product_id, product_name, rating, comment, customer_name, sentiment, is_urgent, is_replied, reviewed_at) values

-- ModaMira Butik yorumları
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz', 2,
  'Bedeni tutmuyor, S aldım ama M gibi geldi. Ürün güzel ama beden tablosu yanıltıcı.',
  'Ayşe K.', 'olumsuz', true, false, now() - interval '2 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz', 1,
  'Tam bir hayal kırıklığı. Fotoğraftaki renkle hiç uyuşmuyor, çok soluk geldi.',
  'Merve T.', 'acil', true, false, now() - interval '1 day'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz', 4,
  'Kumaş kalitesi güzel, dikişler sağlam. Sadece beden biraz büyük geldi.',
  'Selin A.', 'olumlu', false, true, now() - interval '5 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon', 5,
  'Harika bir ürün! Tam istediğim gibi, kalitesi çok iyi. Kesinlikle tavsiye ederim.',
  'Zeynep M.', 'olumlu', false, true, now() - interval '7 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon', 3,
  'Bel kısmı biraz dar, ama genel olarak iyi. Kargo hızlıydı.',
  'Büşra Y.', 'notr', false, false, now() - interval '3 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise', 2,
  'Omuz kısmındaki detay fotoğraftaki gibi değil, plastik görünüyor.',
  'Fatma D.', 'olumsuz', false, false, now() - interval '4 days'),

-- Trendyol Tekstil yorumları
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört', 5,
  'Çok yumuşak, rengi solmadı. 3 tane daha aldım.',
  'Elif S.', 'olumlu', false, true, now() - interval '10 days'),

('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört', 5,
  'Basic ama kaliteli. Her sezon alıyorum bu markadan.',
  'Nisan B.', 'olumlu', false, true, now() - interval '8 days'),

('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka', 4,
  'Rengi çok güzel, dikişler sağlam. Biraz tüyleniyor ama genel olarak memnunum.',
  'Derya K.', 'olumlu', false, false, now() - interval '6 days'),

('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka', 1,
  'İlk yıkamada bozuldu. Kesinlikle almayın, kalitesiz.',
  'Gülşen A.', 'acil', true, false, now() - interval '1 day');

-- ── İadeler ──────────────────────────────────────────────────────────────────

insert into returns (seller_id, marketplace, product_id, product_name, reason, customer_comment, returned_at) values

-- ModaMira Butik iadeleri
('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',
  'beden_uyumsuzlugu', 'S aldım ama M gibi geldi, iade ediyorum.', now() - interval '1 day'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',
  'renk_farki', 'Fotoğraftaki renk çok farklı, beklediğim gibi değil.', now() - interval '2 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',
  'beden_uyumsuzlugu', 'Beden tablosuna göre aldım ama olmadı.', now() - interval '3 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise',
  'kalite_sorunu', 'Omuz detayı fotoğraftaki gibi değil.', now() - interval '4 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1002', 'Yüksek Bel Palazzo Pantolon',
  'beden_uyumsuzlugu', null, now() - interval '5 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1001', 'Yazlık Keten Bluz',
  'beden_uyumsuzlugu', 'Yine beden sorunu yaşadım.', now() - interval '6 days'),

('a1000000-0000-0000-0000-000000000001', 'trendyol', 'TY-1003', 'Omuz Detaylı Elbise',
  'renk_farki', 'Renk farklı geldi.', now() - interval '7 days'),

-- Trendyol Tekstil iadeleri
('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka',
  'kalite_sorunu', 'İlk yıkamada bozuldu.', now() - interval '1 day'),

('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2001', 'Basic Pamuk Tişört',
  'renk_farki', null, now() - interval '5 days'),

('a1000000-0000-0000-0000-000000000002', 'trendyol', 'TY-2002', 'Triko Hırka',
  'kalite_sorunu', 'Tüyleniyor ve bozuldu.', now() - interval '3 days');
