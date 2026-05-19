-- =============================================================
-- SatıcıPilot — 002_seed.sql
-- Demo seed data for local / staging testing
--
-- IMPORTANT: Replace 'YOUR-USER-ID' with your actual Supabase
-- auth user ID before running.
-- Find it in: Supabase Dashboard → Authentication → Users
-- =============================================================


-- ---------------------------------------------------------------
-- SELLER
-- ---------------------------------------------------------------
insert into public.sellers (id, shop_name, plan, onboarding_done)
values (
  'YOUR-USER-ID',
  'Demo Mağaza',
  'profesyonel',
  true
);


-- ---------------------------------------------------------------
-- REVIEWS (6 rows — mix of ratings, urgency, reply status)
-- ---------------------------------------------------------------
insert into public.reviews
  (seller_id, product_name, rating, comment, status, is_urgent, is_replied, reply, reviewed_at)
values
  -- 5-star, no reply needed yet
  (
    'YOUR-USER-ID',
    'Kadın Oversize Blazer Ceket - Ekru',
    5,
    'Kumaş kalitesi mükemmel, tam bedene göre geldi. Kesinlikle tavsiye ederim!',
    'cevaplanmadi',
    false,
    false,
    null,
    now() - interval '1 day'
  ),

  -- 2-star, urgent, no reply
  (
    'YOUR-USER-ID',
    'Ribana Kaşkorse Elbise - Siyah',
    2,
    'Renk fotoğraftakinden çok farklı çıktı, hayal kırıklığı yarattı.',
    'cevaplanmadi',
    true,
    false,
    null,
    now() - interval '3 hours'
  ),

  -- 4-star, replied
  (
    'YOUR-USER-ID',
    'Kadın Keten Pantolon - Bej',
    4,
    'Güzel ürün ama dikişler biraz dağınık. Genel olarak memnunum.',
    'cevaplandi',
    false,
    true,
    'Değerli görüşünüz için teşekkürler! Dikişle ilgili geri bildiriminizi kalite ekibimize ilettik.',
    now() - interval '2 days'
  ),

  -- 1-star, urgent, no reply
  (
    'YOUR-USER-ID',
    'Crop Triko Kazak - Camel',
    1,
    'Çok ince kumaş, beden tablosuna uymadı. Kesinlikle tavsiye etmiyorum.',
    'cevaplanmadi',
    true,
    false,
    null,
    now() - interval '5 hours'
  ),

  -- 5-star, replied
  (
    'YOUR-USER-ID',
    'Deri Görünümlü Tayt - Siyah',
    5,
    'Bu fiyata bu kalite gerçekten inanılmaz. İkinci siparişimi verdim bile.',
    'cevaplandi',
    false,
    true,
    'Çok teşekkür ederiz! Beğenmenize çok sevindik, iyi günler dileriz.',
    now() - interval '4 days'
  ),

  -- 3-star, not urgent, no reply
  (
    'YOUR-USER-ID',
    'Yazlık Viskon Bluz - Beyaz',
    3,
    'Ürün idare eder, ne çok iyi ne çok kötü. Kargo hızıydı en azından.',
    'cevaplanmadi',
    false,
    false,
    null,
    now() - interval '6 hours'
  );


-- ---------------------------------------------------------------
-- RETURNS (4 rows — different statuses)
-- ---------------------------------------------------------------
insert into public.returns
  (seller_id, product_name, reason, status, returned_at)
values
  (
    'YOUR-USER-ID',
    'Ribana Kaşkorse Elbise - Siyah',
    'Renk uyuşmazlığı — ürün görseldekinden farklı',
    'beklemede',
    now() - interval '2 hours'
  ),
  (
    'YOUR-USER-ID',
    'Crop Triko Kazak - Camel',
    'Beden uymadı, beden tablosu yanıltıcı',
    'onaylandi',
    now() - interval '1 day'
  ),
  (
    'YOUR-USER-ID',
    'Kadın Keten Pantolon - Bej',
    'Dikişlerde kalite hatası',
    'beklemede',
    now() - interval '4 hours'
  ),
  (
    'YOUR-USER-ID',
    'Yazlık Viskon Bluz - Beyaz',
    'Yanlış ürün gönderildi',
    'reddedildi',
    now() - interval '3 days'
  );


-- ---------------------------------------------------------------
-- PRODUCTS (5 rows — varied scores, stocks, prices)
-- ---------------------------------------------------------------
insert into public.products
  (seller_id, name, price, stock, description_score, seo_score, return_rate, marketplace)
values
  (
    'YOUR-USER-ID',
    'Kadın Oversize Blazer Ceket - Ekru',
    549.90,
    42,
    88,
    76,
    4.2,
    'trendyol'
  ),
  (
    'YOUR-USER-ID',
    'Ribana Kaşkorse Elbise - Siyah',
    299.90,
    6,      -- low stock
    62,
    58,
    18.5,   -- high return rate — needs attention
    'trendyol'
  ),
  (
    'YOUR-USER-ID',
    'Kadın Keten Pantolon - Bej',
    389.90,
    25,
    79,
    83,
    6.1,
    'trendyol'
  ),
  (
    'YOUR-USER-ID',
    'Deri Görünümlü Tayt - Siyah',
    179.90,
    134,
    91,
    94,
    2.3,
    'trendyol'
  ),
  (
    'YOUR-USER-ID',
    'Crop Triko Kazak - Camel',
    249.90,
    0,      -- out of stock
    45,
    39,
    22.7,   -- very high return rate
    'trendyol'
  );


-- ---------------------------------------------------------------
-- MESSAGES (3 rows — different statuses)
-- ---------------------------------------------------------------
insert into public.messages
  (seller_id, customer_name, subject, body, product_name, status, reply)
values
  (
    'YOUR-USER-ID',
    'Ayşe K.',
    'Kargo ne zaman gelir?',
    'Merhaba, siparişimi 3 gün önce verdim ama kargo hâlâ yola çıkmadı. Takip numarası alabilir miyim?',
    'Kadın Oversize Blazer Ceket - Ekru',
    'okunmadi',
    null
  ),
  (
    'YOUR-USER-ID',
    'Fatma D.',
    'Bedene göre öneri',
    'Selam, 38 beden giyiyorum ama biraz kiloluyum. Bu kazakta 38 mi 40 mı almalıyım?',
    'Crop Triko Kazak - Camel',
    'beklemede',
    null
  ),
  (
    'YOUR-USER-ID',
    'Merve S.',
    'Renk seçeneği var mı?',
    'Merhaba, bu pantolonun haki veya lacivert rengi de var mı? Sitede sadece bej görüyorum.',
    'Kadın Keten Pantolon - Bej',
    'cevaplandi',
    'Merhaba Merve Hanım, şu an sadece bej renk mevcut. Yakında yeni renk seçenekleri eklenecek, bildirim almak ister misiniz?'
  );
