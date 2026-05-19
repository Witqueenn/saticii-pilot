-- SatıcıPilot — Lead Round 9 (16 lead)
-- Yeni kategoriler: Evcil Hayvan, Spor Beslenmesi, Bahçe/Kamp,
-- Erkek Giyim, Çocuk Giyim, Aydınlatma/Dekor, Halı/Kilim,
-- Kahve/Gıda, Kamp/Outdoor, Müzik Aletleri

INSERT INTO leads (shop_name, marketplace, contact_name, contact_email, contact_phone, store_url, status, source, notes) VALUES

-- ── EVCİL HAYVAN ───────────────────────────────────────────────
('Atakan Petshop', 'trendyol', NULL, 'info@atakanpetshop.com', '08504664250', 'https://www.trendyol.com/magaza/atakan-petshop-m-104873', 'kesfedildi', 'website', 'Niche: mama, aksesuar, tımar · 26K IG (@atakanpetshop) · 1994 kuruluş, köklü mağaza · Yüzlerce SKU + yüksek iade riski → yorum yönetimi & iade takibi SatıcıPilot için güçlü use-case'),
('Mixpet', 'trendyol', NULL, 'info@mixpet.com.tr', '05528781878', 'https://www.trendyol.com/mixpet-x-b146395', 'kesfedildi', 'website', 'Niche: kedi/köpek maması + aksesuar · Trendyol + N11 çift kanal · Sık sipariş ürünleri = yüksek yorum hacmi · Çok kanallı yönetim ihtiyacı SatıcıPilot tek panel ile çözülür'),

-- ── SPOR BESLENMESİ ────────────────────────────────────────────
('Proteinocean', 'trendyol', NULL, 'info@proteinocean.com', '08503032989', 'https://www.trendyol.com/proteinocean-x-b109857', 'kesfedildi', 'instagram', 'Niche: protein tozu + takviye + vitamin · 257K IG (@proteinocean) · 2016 kuruluş, Ostim OSB kendi üretimi · Tat/etki yorumları yoğun gelir → yorum yanıtlama + iade otomasyonu kritik · Büyük Trendyol hacmi'),

-- ── BAHÇE & KAMP ───────────────────────────────────────────────
('Andoutdoor', 'trendyol', NULL, 'info@andoutdoor.com', '+902125903838', 'https://www.trendyol.com/magaza/andoutdoor-m-105011', 'kesfedildi', 'website', 'Niche: bahçe ekipmanı + kamp malzemesi · 1982 kuruluş, 12.000+ SKU · Mevsimsel satış dalgaları → stok & sipariş analizi SatıcıPilot ile · Bahçe + kamp çift niş = yıl boyu hacim'),

-- ── ERKEK GİYİM ────────────────────────────────────────────────
('Kiğılı', 'trendyol', NULL, 'info@kigili.com.tr', '08502501938', 'https://www.trendyol.com/kigili-erkek-giyim-x-b234-g2-c82', 'kesfedildi', 'instagram', 'Niche: erkek takım elbise + gömlek + pantolon · 194K IG (@kigiligiyim) · Türkiye''nin en büyük erkek giyim markalarından · Beden uyumsuzluğu iade oranı yüksek → yorum yönetimi + iade analizi SatıcıPilot''ta kritik'),
('Sarar', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/sarar-x-b436', 'kesfedildi', 'instagram', 'Niche: premium erkek giyim + CCS alt markası · 141K IG (@sarargroup) · Uluslararası varlık · Çoklu marka yönetim ihtiyacı · Premium segment = müşteri beklentisi yüksek, yorum kalitesi iş kararlarını etkiler'),
('Lufian', 'trendyol', NULL, 'onlinedestek@lufian.com.tr', '08508118536', 'https://www.trendyol.com/lufian-erkek-giyim-x-b364-g2-c82', 'kesfedildi', 'instagram', 'Niche: premium erkek + kadın giyim · 178K IG (@lufianturkiye) · Avrupa mağazası da var · Sezon geçişlerinde stok & indirim yönetimi yoğun → SatıcıPilot fiyat optimizasyon + yorum takibi değerli'),

-- ── ÇOCUK GİYİM ────────────────────────────────────────────────
('Riccotarz', 'trendyol', NULL, 'bilgi@riccotarz.com', '05558826402', 'https://www.trendyol.com/riccotarz-cocuk-giyim-x-b109023-g3-c82', 'kesfedildi', 'instagram', 'Niche: 0-14 yaş çocuk giyim · IG (@riccotarz) · Hatay/Antakya merkezli · Çocuk giyimde beden uyumsuzluğu + kalite beklentisi yüksek = yoğun yorum + iade · KOBİ için SatıcıPilot otomasyonu büyük verimlilik kazanımı'),

-- ── AYDINLATMA & DEKOR ─────────────────────────────────────────
('ByLamp', 'trendyol', NULL, 'info@bylamp.com', '+902165043591', 'https://www.trendyol.com/magaza/bylamp-m-107120', 'kesfedildi', 'instagram', 'Niche: kişiselleştirilmiş lamba + LED dekor · IG (@by.lamp) · Trendyol + N11 + PttAVM + Etsy çok platform · Kişisel tasarım ürünler = yüksek müşteri beklentisi · SatıcıPilot çok platform yorum aggregation güçlü fit'),

-- ── HALI & KİLİM ───────────────────────────────────────────────
('Karmen Halı', 'trendyol', NULL, 'karmen@karmencarpet.com', '03423374466', 'https://www.trendyol.com/magaza/karmen-hali-m-646432', 'kesfedildi', 'instagram', 'Niche: halı + kilim + çalışma halısı · 17K IG (@karmenhali) · Gaziantep OSB fabrika satış, 50+ ülke ihracat · Yüksek bilet ürün, iade maliyetli → yorum izleme + iade süreç takibi gelir koruması sağlar'),

-- ── KAHVE & GIDA ───────────────────────────────────────────────
('Kahve Dünyası', 'trendyol', NULL, 'sanalmagaza@kahvedunyasi.com', '02123580808', 'https://www.trendyol.com/kahve-dunyasi-x-b108219', 'kesfedildi', 'instagram', 'Niche: kahve + çikolata + hediye seti · 327K IG (@kahvedunyasi) · 2004 kuruluş, Türkiye''nin en büyük kahve zinciri · Gıdada son kullanma tarihi + aroma yorumları çok gelir → yorum kategorize etme + yanıt şablonları büyük verimlilik'),
('Kurukahveci Nuri Toplar', 'trendyol', NULL, 'info@kurukahvecinuritoplar.com', '+902125220728', 'https://www.trendyol.com/nuri-toplar-x-b150727', 'kesfedildi', 'website', 'Niche: Türk kahvesi + filtre kahve + kahve aksesuar · 28K IG (@kurukahvecinuritoplar) · 1890 kuruluş · Amazon US''te de satış yapıyor · Köklü marka dijitalleşiyor → SatıcıPilot Türkçe destek + kolay kurulum ile iyi fit'),
('Bağdat Baharat', 'trendyol', NULL, 'bagdat@bagdatpazarlama.com.tr', '03123971839', 'https://www.trendyol.com/bagdat-x-b110062', 'kesfedildi', 'instagram', 'Niche: baharat + kuru gıda + kuruyemiş · 38K IG (@bagdatbaharat) · Trendyol + N11 çift kanal · Çok SKU = fiyat güncelleme & stok takibi yoğun → SatıcıPilot sipariş & kampanya yönetimi ile verimlileşme somut'),

-- ── KAMP & OUTDOOR ─────────────────────────────────────────────
('Nurgaz', 'trendyol', NULL, 'pazarlama@nurgaz.com', '+902126842246', 'https://www.trendyol.com/nurgaz-x-b108802', 'kesfedildi', 'instagram', 'Niche: kamp ocağı + tüp + outdoor ekipman · 209K IG (@nurgazshop.com.tr) · Türkiye''nin lider kamp ocağı markası · Kamp sezonunda sipariş patlaması → yorum & iade yönetimi kritik · SatıcıPilot sezonsal otomasyon özelliği yüksek değer'),

-- ── MÜZİK ALETLERİ ─────────────────────────────────────────────
('Dore Music', 'trendyol', NULL, 'xpress@doremuzik.com.tr', '08509557777', 'https://www.trendyol.com/magaza/dore-music-m-1504', 'kesfedildi', 'instagram', 'Niche: enstrüman + ses sistemi + stüdyo ekipmanı · 123K IG (@doremusic) · 30+ fiziksel mağaza + Trendyol · 125+ marka distribütörlüğü → geniş katalog yorum hacmi yüksek · Kırılgan kargo = iade riski · SatıcıPilot iade takip büyük değer'),
('PanMusic', 'trendyol', NULL, 'panmusic@panmusic.com.tr', NULL, 'https://www.trendyol.com/magaza/panmusic', 'kesfedildi', 'website', 'Niche: DJ ekipmanı + stüdyo ekipmanı + enstrüman · 8.9K IG (@panmusic.com.tr) · 1995 kuruluş, Ankara · Profesyonel segment müşteriler detaylı yorum bırakır, yanıt beklentisi yüksek → SatıcıPilot yorum yanıt şablonları + müşteri iletişim değerli')

;
