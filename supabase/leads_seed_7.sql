-- SatıcıPilot — Lead Round 7 (25 lead)
-- Yeni kategoriler: Züccaciye/Sofra, Saat & Gözlük, Organik Gıda,
-- Doğal Kozmetik, Ev Dekorasyon, Spor Beslenmesi, Fitness Ekipman,
-- Telefon Aksesuar, Sırt/Bel Çantası, Bebek Giyim, Ayakkabı

INSERT INTO leads (shop_name, marketplace, contact_name, contact_email, contact_phone, store_url, status, source, notes) VALUES

-- ── ZÜCCACİYE / SOFRA ─────────────────────────────────────────
('Karaca', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/karaca-x-b325', 'kesfedildi', 'instagram', 'Niche: Mutfak & ev sofra ürünleri · 3M IG (@karaca) · 1973 kuruluş · Trendyol''da çok kategorili · Geniş SKU = karmaşık sipariş/stok yönetimi → SatıcıPilot güçlü use-case'),
('Kütahya Porselen', 'trendyol', NULL, 'kvk@kutahyaporselen.com', '+90 274 225 01 50', 'https://www.trendyol.com/kutahya-porselen-x-b433', 'kesfedildi', 'instagram', 'Niche: Porselen yemek & sofra takımı · 788K IG (@kutahyaporselen) · Dünyaca tanınan Türk porselen üreticisi · Trendyol''da yüzlerce SKU → sipariş yönetimi ağır'),
('Galeri Kristal', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/magaza/gallery-crystal-m-107244', 'kesfedildi', 'trendyol_arama', 'Niche: Züccaciye, çay/kahve seti · Trendyol mağaza aktif · Çok kategorili · Orta ölçek → sipariş & müşteri mesaj yönetimi için AI çözümü ideal'),
('Emsan', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/emsan-x-b651', 'kesfedildi', 'trendyol_arama', 'Niche: Mutfak gereçleri, tencere, granit kaplamalar · 1971 kuruluş · Trendyol aktif · Ürün gamı geniş → stok/listeleme yönetimi ağır · Ürün açıklama optimizasyonu değer katar'),

-- ── SAAT & GÜNEŞ GÖZLÜĞÜ ──────────────────────────────────────
('Wesse Watches', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/wesse-saat-x-b108095-c34', 'kesfedildi', 'instagram', 'Niche: Kadın & erkek saat · 10K IG (@wesse.watches) · Yerli Türk saat markası · Trendyol''da onlarca model · Sezonsal koleksiyonlar → kampanya & listeleme yönetimi için AI değer yaratır'),
('Osse Eyewear', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/osse-gunes-gozlugu-x-b398-c105', 'kesfedildi', 'instagram', 'Niche: Güneş & optik gözlük · 21K IG (@osseeyewear) · Merve Optik bünyesi · Trendyol + optisyen zincirleri · Çok SKU = stok & sipariş yönetimi karmaşık → SatıcıPilot kullanışlı'),

-- ── ORGANİK GIDA & SAĞLIKLI ATIŞTIRNMALIK ─────────────────────
('Sade Organik', 'trendyol', NULL, NULL, NULL, 'https://sadeorganik.com.tr/', 'kesfedildi', 'instagram', 'Niche: Organik & katkısız gıda (tahıl, bakliyat, karabuğday) · 23K IG (@sadeorganikofficial) · Trendyol + Carrefour + Getir · Küçük/orta ölçek → çok kanal yönetimi zorlu → SatıcıPilot ile verimlilik'),
('Uniq2go', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/uniq2go-x-b144853', 'kesfedildi', 'instagram', 'Niche: Protein bar & sağlıklı atıştırmalık · 19K IG (@uniq2go) · Türkiye''nin ilk sağlıklı atıştırmalık markası (est. 2012) · Trendyol + Hepsiburada + Getir · ISO 22001 sertifikalı'),
('Rawsome', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/rawsome-protein-bar-x-b153693-c110468', 'kesfedildi', 'instagram', 'Niche: Raw-vegan & protein bar · 16K IG (@rawsomebar) · 9 yıllık marka · Trendyol + kendi sitesi · Büyüme sürecinde müşteri mesaj & iade yönetimi yükü artar → SatıcıPilot değer katar'),
('Organik Ali', 'trendyol', NULL, NULL, NULL, 'https://organikali.com/', 'kesfedildi', 'instagram', 'Niche: Organik & yöresel gıda marketplace (50+ üretici) · 5K IG (@organikali_) · 2018 kuruluş · Çok satıcılı yapı → sipariş koordinasyonu karmaşık · Büyüme aşamasında SaaS benimseme eğilimi yüksek'),

-- ── DOĞAL & ORGANİK KOZMETİK ──────────────────────────────────
('Rosece', 'trendyol', NULL, 'info@rosece.com', '+90 312 431 10 02', 'https://www.trendyol.com/rosece-x-b108125', 'kesfedildi', 'instagram', 'Niche: Organik & botanik cilt bakım · 56K IG (@rosecenatural) · Parabensiz · Trendyol + eczane kanalı · Ankara merkezli · Büyüyen marka → sipariş & müşteri mesajları için SatıcıPilot ideal'),
('The Purest Solutions', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/en/the-purest-solutions-x-b132527', 'kesfedildi', 'instagram', 'Niche: Doğal cilt bakım (serum, güneş kremi, bariyer) · 150K IG (@thepurestsolutions) · 2018 kuruluş · Türkiye no.1 skincare iddiası · Trendyol''da yüksek satış hacmi → değerlendirme & stok yönetimi yoğun'),
('Naturalive Beauty', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/naturalive-x-b110926', 'kesfedildi', 'instagram', 'Niche: Helal, doğal & yerli kişisel bakım · Kimya müh. kurucusu · Trendyol aktif · Büyüme sürecinde SatıcıPilot ile sipariş & ürün yönetimi değer katar'),

-- ── EV DEKORASYON ──────────────────────────────────────────────
('Dekorish', 'trendyol', NULL, NULL, NULL, 'https://dekorish.com/', 'kesfedildi', 'instagram', 'Niche: Modern & vintage mobilya/ev dekorasyon · 77K IG (@dekorishcom) · Günlük 300 paket sevkiyat · Trendyol + Hepsiburada · Yüksek hacim → müşteri soruları & iade yönetimi ağır → SatıcıPilot ile otomasyon'),
('Chakra', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/chakra-x-b953', 'kesfedildi', 'instagram', 'Niche: Ev tekstili + dekorasyon (mum, vazo, tablo, abajur) · 2006 kuruluş · Kocaer Tekstil bünyesi · Trendyol''da çok kategorili → stok & kampanya yönetimi için SatıcıPilot uygun'),

-- ── SPOR BESLENMESİ / SUPPLEMENT ──────────────────────────────
('Bigjoy Sports', 'trendyol', NULL, NULL, '+90 216 345 08 28', 'https://www.trendyol.com/bigjoy-sports-x-b144853', 'kesfedildi', 'instagram', 'Niche: Whey protein, mass, pre-workout · 104K IG (@bigjoysports) · Fenerbahçe & Galatasaray resmi spor beslenmesi sponsoru · 1996 kuruluş · 189+ Trendyol ürünü · Büyük SKU & yoğun promosyon → SatıcıPilot değer katar'),
('Hardline Nutrition', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/hardline-x-b136', 'kesfedildi', 'instagram', 'Niche: Protein tozu, amino asit, vitamin takviyesi · 68K IG (@hardline.nutrition) · 2003 kuruluş, 3M+ ürün satışı · Helal sertifikalı · Yüksek sipariş hacmi → müşteri soruları & değerlendirme yönetimi ağır → SatıcıPilot ROI yüksek'),

-- ── FİTNESS EKİPMAN ────────────────────────────────────────────
('Gymholix', 'trendyol', NULL, 'info@gymholix.com', NULL, 'https://www.gymholix.com/', 'kesfedildi', 'instagram', 'Niche: Profesyonel fitness & güç spor ekipmanları (CrossFit, Powerlifting) · 19K IG (@gymholix) · 2014 kuruluş · Avrupa/ABD/Körfez ihracatı · Niche B2B+B2C = sipariş/lojistik karmaşık → SatıcıPilot iş akışı değer yaratır'),

-- ── TELEFON AKSESUARI / KILIFLAR ───────────────────────────────
('Deercase', 'trendyol', NULL, 'mh@deercase.com', '+90 543 547 77 34', 'https://www.trendyol.com/deercase-x-b103940', 'kesfedildi', 'instagram', 'Niche: Kişiye özel & standart telefon kılıfı · 172K IG (@deercase_official) · Türkiye''nin lider kılıf markası · Apple/Samsung/Huawei geniş SKU gamı · Yüksek sipariş hacmi & müşteri mesajı → SatıcıPilot ile otomasyon şart'),
('Konsept Kılıf', 'trendyol', NULL, NULL, NULL, 'https://www.instagram.com/konseptkilif/', 'kesfedildi', 'instagram', 'Niche: iPhone kılıf & aksesuar · 46K IG (@konseptkilif) · Ücretsiz kargo 200 TL üzeri · Instagram-first satıcı → Trendyol entegrasyonu gelişiyor · Sipariş yönetimi manuel → SatıcıPilot verimlilik artışı yüksek · Karar verici doğrudan ulaşılabilir'),
('TTEC', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/ttec-x-b103', 'kesfedildi', 'instagram', 'Niche: Türk teknoloji aksesuarı (şarj, kablo, powerbank, kulaklık) · 44K IG (@ttec) · 1995 kuruluş · Türkiye''nin en çok tercih edilen mobil aksesuar markası · Geniş dağıtım = yönetim yükü yüksek → SatıcıPilot değer katar'),

-- ── SIRT & BEL ÇANTASI ─────────────────────────────────────────
('Smart Bags', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/smart-bags-x-b104595', 'kesfedildi', 'trendyol_arama', 'Niche: Sırt çantası, postacı çantası, okul çantası, bel çantası · FLO mağazalarında da mevcut · Çok kategorili ürün = listeleme & stok yönetimi yoğun → SatıcıPilot ile otomasyon değer katar'),

-- ── BEBEK GİYİM ────────────────────────────────────────────────
('Soobe', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/soobe-x-b544', 'kesfedildi', 'instagram', 'Niche: Bebek & çocuk giyim (0-12 yaş) · Anneler arası güçlü marka · Trendyol + soobe.com.tr aktif · Sezonsal koleksiyonlar = yoğun listeleme → SatıcıPilot ile katalog & sipariş yönetimi ideal'),
('Bebeqon', 'trendyol', NULL, NULL, NULL, 'https://www.instagram.com/bebeqon/', 'kesfedildi', 'instagram', 'Niche: İsme özel bebek ürünleri & kişiselleştirilmiş bebek giyim · 66K IG (@bebeqon) · Doğum hediyesi segmenti → yoğun sipariş dönemleri · Instagram-first satıcı · Kişiselleştirme = yüksek müşteri soru hacmi → SatıcıPilot mesaj yönetimi verimlilik sağlar'),

-- ── AYAKKABI ───────────────────────────────────────────────────
('Bambi Ayakkabı', 'trendyol', NULL, NULL, '+90 850 200 35 00', 'https://www.trendyol.com/bambi-ayakkabi-x-b371-c114', 'kesfedildi', 'instagram', 'Niche: Kadın ayakkabı (klasik, spor, topuklu, abiye) · 779K IG (@bambiayakkabi) · Köklü Türk markası · Trendyol''da yüzlerce model · Çok SKU + sezonsal → sipariş, stok, değerlendirme yönetimi büyük verimlilik'),
('Pembe Potin', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/pembe-potin-x-b370', 'kesfedildi', 'instagram', 'Niche: Kadın ayakkabı (balerinden spor ayakkabıya) · İstanbul merkezli · Trendyol aktif + kendi sitesi · Sosyal medya aktif → Instagram''dan gelen sipariş soruları yoğun → SatıcıPilot mesaj otomasyonu değer katar')

;
