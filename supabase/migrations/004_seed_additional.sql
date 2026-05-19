-- =============================================================
-- SatıcıPilot — 004_seed_additional.sql
-- Demo seed for: competitor_prices, customer_responses,
--                campaigns, automations
--
-- Seller ID: 479df85d-680e-41ef-ae3b-219a70ff4476
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
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-blazer',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90, 'Mavi', 'Oversize Blazer Ceket Ekru', 529.90, 'Ceket',
    now() - interval '2 hours'
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-blazer',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90, 'Zara', 'Blazer Kruvaze Ceket', 599.90, 'Ceket',
    now() - interval '2 hours'
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-blazer',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90, 'H&M', 'Oversize Ceket Bej', 549.00, 'Ceket',
    now() - interval '2 hours'
  ),

  -- Kaşkorse Elbise (299.90) — rakipler daha ucuz, dikkat!
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-kaskorse',
    'Ribana Kaşkorse Elbise - Siyah',
    299.90, 'LC Waikiki', 'Kaşkorse Elbise Siyah', 249.90, 'Elbise',
    now() - interval '45 minutes'
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-kaskorse',
    'Ribana Kaşkorse Elbise - Siyah',
    299.90, 'DeFacto', 'Kaşkorse Mini Elbise', 279.90, 'Elbise',
    now() - interval '45 minutes'
  ),

  -- Keten Pantolon (389.90) — biz daha uygunuz, avantajlı konum
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-pantolon',
    'Kadın Keten Pantolon - Bej',
    389.90, 'Koton', 'Keten Pantolon Bej', 419.90, 'Pantolon',
    now() - interval '6 hours'
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-pantolon',
    'Kadın Keten Pantolon - Bej',
    389.90, 'Mavi', 'Beli Lastikli Keten Pantolon', 399.90, 'Pantolon',
    now() - interval '6 hours'
  ),

  -- Deri Tayt (179.90) — rakipler biraz daha ucuz
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-tayt',
    'Deri Görünümlü Tayt - Siyah',
    179.90, 'LC Waikiki', 'Deri Görünümlü Tayt', 169.90, 'Tayt',
    now() - interval '1 day'
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-tayt',
    'Deri Görünümlü Tayt - Siyah',
    179.90, 'DeFacto', 'Push-up Deri Tayt', 159.90, 'Tayt',
    now() - interval '1 day'
  ),

  -- Crop Kazak (249.90) — rekabetçi konumdayız
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-kazak',
    'Crop Triko Kazak - Camel',
    249.90, 'H&M', 'Crop Triko Kazak', 259.90, 'Kazak',
    now() - interval '3 hours'
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476', 'prod-kazak',
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
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'ayse.kalin@gmail.com',
    '+90 532 111 22 33',
    5,
    'Ürün çok güzeldi, tam bedenime geldi. Kesinlikle tekrar alacağım!',
    'Kadın Oversize Blazer Ceket - Ekru',
    true
  ),
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'ayse.kalin@gmail.com',
    '+90 532 111 22 33',
    4,
    'Pantolon kaliteli ama bel kısmı biraz dar. Genel olarak memnunum.',
    'Kadın Keten Pantolon - Bej',
    true
  ),

  -- Fatma — düşük puan, memnun değil
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'fatma.demir@hotmail.com',
    null,
    2,
    'Renk görseldekinden çok farklı çıktı. Oldukça hayal kırıklığı yaşadım.',
    'Ribana Kaşkorse Elbise - Siyah',
    false
  ),

  -- Zeynep — ortalama üstü
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'zeynep.arslan@gmail.com',
    '+90 555 987 65 43',
    4,
    'Güzel kumaş, iyi dikiş. Bir sonraki siparişimde aynı markayı tercih ederim.',
    'Kadın Keten Pantolon - Bej',
    true
  ),

  -- Selin — çok memnun, bülten abonesi
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'selin.yilmaz@icloud.com',
    '+90 544 333 21 10',
    5,
    'Bu fiyata bu kalite inanılmaz! Herkese tavsiye ediyorum 🙏',
    'Deri Görünümlü Tayt - Siyah',
    true
  ),

  -- Merve — nötr
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
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
  (seller_id, title, platform, discount_pct, start_date, end_date, status, notes)
values

  -- Aktif yazlık kampanya
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'Yaz Sezonu Kampanyası', 'trendyol', 20,
    '2026-06-01', '2026-08-31', 'aktif',
    'Sezon indirimi — tüm yazlık ürünler'
  ),

  -- Geçmiş flash indirim
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'Flash İndirim — Kaşkorse Elbise', 'trendyol', 30,
    '2026-05-10', '2026-05-12', 'bitti',
    '48 saatlik flash indirim'
  ),

  -- Gelecek bundle teklifi, beklemede
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'Triko + Tayt Bundle', 'trendyol', 15,
    '2026-06-15', '2026-07-15', 'beklemede',
    'Kazak + tayt birlikte alana indirim'
  ),

  -- Taslak — henüz planlanmadı
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'Yeni Sezon Blazer Tanıtımı', 'trendyol', null,
    null, null, 'taslak',
    'Sonbahar koleksiyonu lansmanı'
  );


-- ---------------------------------------------------------------
-- AUTOMATIONS (4 kayıt — farklı tetikleyici + aksiyonlar)
-- ---------------------------------------------------------------
insert into public.automations
  (seller_id, trigger, action, is_active)
values

  -- Düşük puan gelince otomatik mesaj
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'dusuk_puan',
    'mesaj_gonder',
    true
  ),

  -- İade talebi açılınca müşteriye indirim kodu
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'iade_talebi',
    'indirim_kodu',
    true
  ),

  -- Yeni yorum gelince bildirim (pasif)
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'yeni_yorum',
    'bildirim',
    false
  ),

  -- Yeni sipariş gelince teşekkür mesajı
  (
    '479df85d-680e-41ef-ae3b-219a70ff4476',
    'siparis',
    'mesaj_gonder',
    true
  );
