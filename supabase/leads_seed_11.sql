-- SatıcıPilot — Lead Round 11 (15 lead)
-- Yeni kategoriler: Altın Mücevher, Parfüm & Kişisel Koku, İç Giyim & Pijama,
-- Saç Bakım Teknolojisi, Vitamin & Sağlık Takviyesi, Akıllı Ev & Güvenlik,
-- Bisiklet & Mikromobilite, Zeytinyağı & Gurme Gıda,
-- Perde & Stor, El Aletleri & DIY, Erkek Bakım & Tıraş

INSERT INTO leads (shop_name, marketplace, contact_name, contact_email, contact_phone, store_url, status, source, notes) VALUES

-- ── ALTIN & KIYMETLİ MÜCEVHER ───────────────────────────────────
('Atasay Kuyumculuk', 'trendyol', NULL, 'info@atasay.com', '08508080706', 'https://www.trendyol.com/atasay-x-b5678', 'kesfedildi', 'instagram', 'Niche: 14-22 ayar altın kolye + yüzük + bileklik + nişan & söz seti · BİST halka açık (ATAS.IS), 300+ şube, Türkiye''nin en büyük kuyumcu zincirlerinden · Trendyol + HB + D2C · Sevgililer Günü / Anneler Günü / nişan sezonlarında sipariş patlaması → SatıcıPilot sezonsal kampanya & yorum yönetimi yüksek operasyonel değer · Altın fiyat dalgalanması = dinamik fiyatlama & stok yönetimi ihtiyacı sürekli'),

-- ── PARFÜM & KİŞİSEL KOKU ───────────────────────────────────────
('Nishane', 'trendyol', NULL, 'info@nishane.eu', NULL, 'https://www.trendyol.com/nishane-x-b34521', 'kesfedildi', 'instagram', 'Niche: Türk lüks nişe parfüm · 2012 İstanbul kuruluş · Hacivat & Fan Your Flames global hit ürünler · 100+ ülkede satış, Harrods & Sephora listesi · Trendyol + D2C + parfümeri butik · 600-2.500 TL/şişe premium segment · Lüks müşteri detaylı yorum yazar & hızlı yanıt bekler → SatıcıPilot yorum yönetimi brand imajı için kritik · Sınırlı seri & sezonsal koleksiyonlarda stok baskısı yüksek'),
('Eyüp Sabri Tuncer', 'trendyol', NULL, 'info@eyupsabri.com.tr', NULL, 'https://www.trendyol.com/eyup-sabri-tuncer-x-b234', 'kesfedildi', 'website', 'Niche: kolonyalar (çiçek, lavanta, limon) + vücut losyonu + el kremi + kişisel bakım · 1867 kuruluş, 155+ yıllık ikonik Türk markası · Trendyol + HB + market & eczane zinciri · Ramazan & Kurban Bayramı öncesinde kolonya siparişlerinde patlama → SatıcıPilot kampanya & stok yönetimi yüksek mevsimsellik · Sadık müşteri kitlesi, yorum kalitesi ve beklentisi yüksek'),

-- ── İÇ GİYİM & PİJAMA ───────────────────────────────────────────
('Suwen', 'trendyol', NULL, 'info@suwen.com.tr', '02124447266', 'https://www.trendyol.com/suwen-x-b233', 'kesfedildi', 'instagram', 'Niche: kadın iç giyim + sutyen + külot + bikini + set · Türkiye''nin lider iç giyim markalarından, 80+ mağaza · Trendyol + HB + D2C · Beden uyumsuzluğu ve kalite iade oranı iç giyimde yüksek → SatıcıPilot iade analizi & yorum şablon yanıtları kritik · Sezon koleksiyonlarında yüzlerce yeni SKU → ürün açıklama & tag optimizasyonu güçlü use-case'),
('Dagi', 'trendyol', NULL, 'info@dagi.com.tr', NULL, 'https://www.trendyol.com/dagi-x-b1245', 'kesfedildi', 'instagram', 'Niche: erkek-kadın pijama takımı + homewear + iç giyim + havlu · Türk tekstil markası, fabrika sahibi üretici · Trendyol + HB · Pijama segmenti kış aylarında (Kasım-Şubat) patlama yaşar · Hediye amaçlı alımlarda müşteri beklentisi & yorum hassasiyeti yüksek → SatıcıPilot sezonsal kampanya + yorum yönetimi somut ROI'),

-- ── SAÇ BAKIM TEKNOLOJİSİ ───────────────────────────────────────
('Goldmaster', 'trendyol', NULL, 'info@goldmaster.com.tr', '02123547000', 'https://www.trendyol.com/goldmaster-x-b435', 'kesfedildi', 'website', 'Niche: saç düzleştirici + kurutma makinesi + bukle maşası + epilatör · Türkiye''nin önde gelen küçük ev aletleri markası, yerli üretim · 500+ SKU · Trendyol + HB + teknoloji perakendecileri · Kullanım hatası & yanma şikayetleri yorumlarda tekrar eder → SatıcıPilot yorum kategorize & şablon yanıt güvenlik iletişiminde tasarruf · Fiyat/performans segmenti = sürekli rekabetçi fiyat & kampanya güncellemesi'),

-- ── VİTAMİN & SAĞLIK TAKVİYESİ ─────────────────────────────────
('Suda Vitamin', 'trendyol', NULL, 'info@sudavitamin.com', NULL, 'https://www.trendyol.com/suda-vitamin-x-b10476', 'kesfedildi', 'instagram', 'Niche: vitamin C + D3 + omega-3 + kolajen + çoklu vitamin · Türkiye''nin en tanınan yerli vitamin markalarından · Trendyol + HB + eczane & market zinciri · Sağlık iddiası içeren yorumlar EFSA uyumluluk riski taşır → SatıcıPilot yorum izleme & uyumsuz içerik tespiti kritik · Kış sezonunda bağışıklık takviyesinde patlama → kampanya zamanlaması SatıcıPilot ile optimize'),
('Orzax', 'hepsiburada', NULL, 'info@orzax.com', NULL, 'https://www.hepsiburada.com/magaza/orzax', 'kesfedildi', 'instagram', 'Niche: omega-3 + probiyotik + magnezyum + biotin + spor takviyesi · Türk GMP sertifikalı takviye markası · Trendyol + HB + Amazon.com.tr · Influencer iş birliği sonrası yorum patlamaları → SatıcıPilot yorum dalgasını yönetmek büyük operasyonel değer · Klinik beklenti-gerçeklik farkı iade riskini artırır → iade & yorum analizi kritik use-case'),

-- ── AKILLI EV & GÜVENLİK ────────────────────────────────────────
('Ezviz Türkiye', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/ezviz-x-b22654', 'kesfedildi', 'website', 'Niche: kablosuz IP güvenlik kamerası + akıllı kapı zili + hareket dedektörü + NVR · Hikvision iştiraki, 150+ ülkede aktif · Trendyol + HB + IT distribütörleri · Kurulum güçlüğü yorumları teknik destek talebini artırır → SatıcıPilot teknik şablon yanıt & yorum kategorize büyük operasyonel tasarruf · Türkiye akıllı ev pazarı yıllık %30+ büyüyor, müşteri tabanı genişliyor'),

-- ── BİSİKLET & MİKROMOBİLİTE ────────────────────────────────────
('Bisan', 'trendyol', NULL, 'info@bisan.com.tr', '02324410666', 'https://www.trendyol.com/bisan-x-b456', 'kesfedildi', 'website', 'Niche: şehir & MTB bisiklet + çocuk bisikleti + e-bisiklet · 1960 İzmir kuruluş, Türkiye''nin en köklü bisiklet markası · 2.000+ yetkili bayi ağı + Trendyol + HB · Montaj eksikliği & kargo hasarı iadesi bisiklet kategorisinde sık → SatıcıPilot iade takip & yorum yönetimi kargo iletişiminde kritik · Bahar/yaz sezonunda (Mart-Temmuz) satış patlaması'),
('Salcano', 'trendyol', NULL, 'info@salcano.com.tr', '08502425000', 'https://www.trendyol.com/salcano-x-b567', 'kesfedildi', 'website', 'Niche: yarış bisikleti + dağ bisikleti + elektrikli bisiklet + BMX · Ankara merkezli Türk bisiklet üreticisi, 1981 kuruluş · Profesyonel segmentte güçlü konumlama · Trendyol + bayii ağı · Yüksek bilet ürün (3.000-30.000 TL) → yorum kalitesi satın alma kararını doğrudan etkiler · Teknik parça uyumluluk soruları destek yükünü artırır → SatıcıPilot şablon yanıt değerli'),

-- ── ZEYTİNYAĞI & GURME GIDA ────────────────────────────────────
('Tariş Zeytin', 'hepsiburada', NULL, 'iletisim@taris.com.tr', '02323443600', 'https://www.hepsiburada.com/magaza/taris-zeytin', 'kesfedildi', 'website', 'Niche: naturel sızma zeytinyağı + salamura zeytin + zeytin ezmesi + zeytinyağlı sabun · 1915 kuruluş, Ege Bölgesi zeytin kooperatifi, 40.000+ çiftçi üye · HB + Trendyol + 50+ ülke ihracat · Hasat sezonu (Kasım-Ocak) yoğun sipariş dalgası → SatıcıPilot stok & kampanya yönetimi sezonsal gereklilik · Sahte/seyrelmiş zeytinyağı şüphesi yorumları marka itibarını etkiler → hızlı yorum yanıt marka koruması için kritik'),

-- ── PERDE & STOR ────────────────────────────────────────────────
('Madeco', 'trendyol', NULL, 'info@madeco.com.tr', NULL, 'https://www.trendyol.com/madeco-x-b8763', 'kesfedildi', 'website', 'Niche: hazır perde + tül + blackout stor + dekoratif kuşgözü perde + korniş aksesuarı · Türk perde üreticisi, geniş renk & desen SKU kataloğu · Trendyol + HB + Çiçeksepeti · Pencere ölçü hatası kaynaklı iade oranı perde kategorisinde yüksek → SatıcıPilot iade analizi & şablon yanıt müşteri sorununu önceden yönetir · Nisan-Haziran taşınma sezonunda satış patlaması'),

-- ── EL ALETLERİ & DIY ───────────────────────────────────────────
('Ingco Türkiye', 'trendyol', NULL, 'info@ingcoturkey.com', NULL, 'https://www.trendyol.com/ingco-x-b23412', 'kesfedildi', 'website', 'Niche: matkap + taşlama makinesi + şerit testere + el aletleri seti + kompresör · Küresel DIY power tool markası, Türkiye yetkili distribütörü · Trendyol + HB + yapı market · Yüzlerce model/voltaj/boy kombinasyonu → ürün açıklama optimizasyonu SatıcıPilot ile ölçeklenebilir · Yanlış güç/uyumluluk seçimi kaynaklı iade sık → iade analiz modülü net ROI sağlar'),

-- ── ERKEK BAKIM & TIRAŞ ─────────────────────────────────────────
('Arko', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/arko-x-b1234', 'kesfedildi', 'website', 'Niche: tıraş kremi + tıraş köpüğü + aftershave losyon + erkek kolonyası · 1945 kuruluş, Evyap bünyesi · Türkiye''nin ikonik erkek bakım markası · Trendyol + HB + market & eczane zinciri · Yüksek hacimli düşük bilet ürün → yorum miktarı fazla, şablon yanıt verimliliği kritik · Babalar Günü & Yılbaşı kampanyalarında sipariş patlaması → SatıcıPilot sezonsal kampanya otomasyon değeri net')

;
