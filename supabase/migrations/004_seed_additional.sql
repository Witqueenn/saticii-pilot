-- =============================================================
-- SatıcıPilot — 004_seed_additional.sql
-- Demo seed for: competitor_prices, customer_responses,
--                campaigns, automations
--
-- IMPORTANT: Replace 'YOUR-USER-ID' with your actual Supabase
-- auth user ID before running. (Same ID used in 002_seed.sql)
-- =============================================================


-- ---------------------------------------------------------------
-- COMPETITOR PRICES
-- 5 products × 2-3 competitors each
-- Shows mix of: pahalı (we're pricier), uygun (±5%), ucuz (we're cheaper)
-- ---------------------------------------------------------------
insert into public.competitor_prices
  (seller_id, our_product_id, our_product_name, our_price, competitor_name, competitor_product_name, competitor_price, category, checked_at)
values

  -- Blazer Ceket (549.90) — biz orta konumdayız
  (
    'YOUR-USER-ID', 'prod-blazer',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90, 'Mavi', 'Oversize Blazer Ceket Ekru', 529.90, 'Ceket',
    now() - interval '2 hours'
  ),
  (
    'YOUR-USER-ID', 'prod-blazer',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90, 'Zara', 'Blazer Kruvaze Ceket', 599.90, 'Ceket',
    now() - interval '2 hours'
  ),
  (
    'YOUR-USER-ID', 'prod-blazer',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90, 'H&M', 'Oversize Ceket Bej', 549.00, 'Ceket',
    now() - interval '2 hours'
  ),

  -- Kaşkorse Elbise (299.90) — rakipler daha ucuz, dikkat!
  (
    'YOUR-USER-ID', 'prod-kaskorse',
    'Ribana Kaşkorse Elbise - Siyah',
    299.90, 'LC Waikiki', 'Kaşkorse Elbise Siyah', 249.90, 'Elbise',
    now() - interval '45 minutes'
  ),
  (
    'YOUR-USER-ID', 'prod-kaskorse',
    'Ribana Kaşkorse Elbise - Siyah',
    299.90, 'DeFacto', 'Kaşkorse Mini Elbise', 279.90, 'Elbise',
    now() - interval '45 minutes'
  ),

  -- Keten Pantolon (389.90) — biz daha uygunuz, avantajlı konum
  (
    'YOUR-USER-ID', 'prod-pantolon',
    'Kadın Keten Pantolon - Bej',
    389.90, 'Koton', 'Keten Pantolon Bej', 419.90, 'Pantolon',
    now() - interval '6 hours'
  ),
  (
    'YOUR-USER-ID', 'prod-pantolon',
    'Kadın Keten Pantolon - Bej',
    389.90, 'Mavi', 'Beli Lastikli Keten Pantolon', 399.90, 'Pantolon',
    now() - interval '6 hours'
  ),

  -- Deri Tayt (179.90) — rakipler biraz daha ucuz
  (
    'YOUR-USER-ID', 'prod-tayt',
    'Deri Görünümlü Tayt - Siyah',
    179.90, 'LC Waikiki', 'Deri Görünümlü Tayt', 169.90, 'Tayt',
    now() - interval '1 day'
  ),
  (
    'YOUR-USER-ID', 'prod-tayt',
    'Deri Görünümlü Tayt - Siyah',
    179.90, 'DeFacto', 'Push-up Deri Tayt', 159.90, 'Tayt',
    now() - interval '1 day'
  ),

  -- Crop Kazak (249.90) — rekabetçi konumdayız
  (
    'YOUR-USER-ID', 'prod-kazak',
    'Crop Triko Kazak - Camel',
    249.90, 'H&M', 'Crop Triko Kazak', 259.90, 'Kazak',
    now() - interval '3 hours'
  ),
  (
    'YOUR-USER-ID', 'prod-kazak',
    'Crop Triko Kazak - Camel',
    249.90, 'Koton', 'Triko Crop Kazak Camel', 239.90, 'Kazak',
    now() - interval '3 hours'
  );


-- ---------------------------------------------------------------
-- CUSTOMER RESPONSES (QR form yanıtları)
-- 7 kayıt — 5 farklı müşteri, biri 2 kez alışveriş yapmış
-- ---------------------------------------------------------------
insert into public.customer_responses
  (seller_id, email, phone, rating, comment, product_name, is_newsletter)
values

  -- Ayşe — sadık müşteri (2 farklı ürün)
  (
    'YOUR-USER-ID',
    'ayse.kalin@gmail.com',
    '+90 532 111 22 33',
    5,
    'Ürün çok güzeldi, tam bedenime geldi. Kesinlikle tekrar alacağım!',
    'Kadın Oversize Blazer Ceket - Ekru',
    true
  ),
  (
    'YOUR-USER-ID',
    'ayse.kalin@gmail.com',
    '+90 532 111 22 33',
    4,
    'Pantolon kaliteli ama bel kısmı biraz dar. Genel olarak memnunum.',
    'Kadın Keten Pantolon - Bej',
    true
  ),

  -- Fatma — düşük puan, memnun değil
  (
    'YOUR-USER-ID',
    'fatma.demir@hotmail.com',
    null,
    2,
    'Renk görseldekinden çok farklı çıktı. Oldukça hayal kırıklığı yaşadım.',
    'Ribana Kaşkorse Elbise - Siyah',
    false
  ),

  -- Zeynep — ortalama üstü
  (
    'YOUR-USER-ID',
    'zeynep.arslan@gmail.com',
    '+90 555 987 65 43',
    4,
    'Güzel kumaş, iyi dikiş. Bir sonraki siparişimde aynı markayı tercih ederim.',
    'Kadın Keten Pantolon - Bej',
    true
  ),

  -- Selin — çok memnun, bülten abonesi
  (
    'YOUR-USER-ID',
    'selin.yilmaz@icloud.com',
    '+90 544 333 21 10',
    5,
    'Bu fiyata bu kalite inanılmaz! Herkese tavsiye ediyorum 🙏',
    'Deri Görünümlü Tayt - Siyah',
    true
  ),

  -- Merve — nötr
  (
    'YOUR-USER-ID',
    'merve.sahin@gmail.com',
    null,
    3,
    'Ürün fena değil ama beden tablosu yanıltıcı, dikkatli alın.',
    'Crop Triko Kazak - Camel',
    false
  );


-- ---------------------------------------------------------------
-- CAMPAIGNS (4 kayıt — farklı tip ve durumlarda)
-- ---------------------------------------------------------------
insert into public.campaigns
  (seller_id, name, type, status, discount_rate, start_date, end_date)
values

  -- Aktif yazlık kampanya
  (
    'YOUR-USER-ID',
    'Yaz Sezonu Kampanyası',
    'sezon',
    'aktif',
    20.00,
    '2026-06-01',
    '2026-08-31'
  ),

  -- Geçmiş flash indirim
  (
    'YOUR-USER-ID',
    'Flash İndirim — Kaşkorse Elbise',
    'flash_sale',
    'bitti',
    30.00,
    '2026-05-10',
    '2026-05-12'
  ),

  -- Gelecek bundle teklifi, beklemede
  (
    'YOUR-USER-ID',
    'Triko + Tayt Bundle',
    'bundle',
    'beklemede',
    15.00,
    '2026-06-15',
    '2026-07-15'
  ),

  -- Taslak — henüz planlanmadı
  (
    'YOUR-USER-ID',
    'Yeni Sezon Blazer Tanıtımı',
    'upsell',
    'taslak',
    null,
    null,
    null
  );


-- ---------------------------------------------------------------
-- AUTOMATIONS (4 kayıt — farklı tetikleyici + aksiyonlar)
-- ---------------------------------------------------------------
insert into public.automations
  (seller_id, trigger, action, is_active)
values

  -- Düşük puan gelince otomatik mesaj
  (
    'YOUR-USER-ID',
    'dusuk_puan',
    'mesaj_gonder',
    true
  ),

  -- İade talebi açılınca müşteriye indirim kodu
  (
    'YOUR-USER-ID',
    'iade_talebi',
    'indirim_kodu',
    true
  ),

  -- Yeni yorum gelince bildirim (pasif)
  (
    'YOUR-USER-ID',
    'yeni_yorum',
    'bildirim',
    false
  ),

  -- Yeni sipariş gelince teşekkür mesajı
  (
    'YOUR-USER-ID',
    'siparis',
    'mesaj_gonder',
    true
  );
