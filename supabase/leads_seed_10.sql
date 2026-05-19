-- SatıcıPilot — Lead Round 10 (16 lead)
-- Yeni kategoriler: Kadın Çanta, Spor Giyim/Activewear, Oyuncak,
-- Oto Aksesuar, Gaming & PC Aksesuar, Çay/İçecek,
-- Valiz & Seyahat, Gümüş Takı, Kozmetik Cihazı, Kışlık Mont

INSERT INTO leads (shop_name, marketplace, contact_name, contact_email, contact_phone, store_url, status, source, notes) VALUES

-- ── KADIN ÇANTA ─────────────────────────────────────────────────
('Shule Bags', 'trendyol', NULL, 'info@shulebags.com', NULL, 'https://www.shulebags.com', 'kesfedildi', 'instagram', 'Niche: el çantası + omuz çantası + tote + baguette · 2M IG (@shulebags) · 2016 İstanbul kuruluş · Trendyol + D2C çift kanal · Viral ürün droplarda stok tükenmesi çok yaşıyor → stok & kampanya yönetimi SatıcıPilot için güçlü use-case · Sezon koleksiyonlarında renk/model yorum patlaması'),
('Desa', 'trendyol', NULL, 'info@desa.com.tr', '02124663300', 'https://www.trendyol.com/desa-x-b177', 'kesfedildi', 'instagram', 'Niche: kadın çanta + ayakkabı + giyim aksesuar · 365K IG (@desafashion) · 1972 kuruluş, Türkiye''nin köklü deri-moda markası · Trendyol + HB + 100 fiziksel mağaza · Çok kanal = yorum & sipariş karmaşıklığı yüksek → SatıcıPilot merkezi yönetim büyük değer'),

-- ── SPOR GİYİM / ACTİVEWEAR ─────────────────────────────────────
('Kinetix', 'trendyol', NULL, 'info@kinetix.com.tr', '08503001989', 'https://www.trendyol.com/kinetix-x-b454', 'kesfedildi', 'instagram', 'Niche: spor ayakkabı + activewear + tracksuit · 403K IG (@kinetixtr) · Ziylan Group markası, 1.500+ satış noktası, Avrupa ihracatı · Trendyol + HB + FLO mağazaları → çok kanal stok senkronizasyonu kritik · Efsane Günü''nde sipariş patlaması → SatıcıPilot sezonsal otomasyon yüksek değer'),
('Lescon', 'trendyol', NULL, 'info@lescon.com.tr', NULL, 'https://www.lescon.com.tr', 'kesfedildi', 'instagram', 'Niche: spor ayakkabı + activewear (erkek/kadın/çocuk) · 159K IG (@lescon) · 1980 kuruluş, Türk spor marka · Comfort-Flex & Hyper-Flex teknoloji serileri · Beden uyumsuzluğu iade oranı spor kategorisinde yüksek → yorum & iade yönetimi SatıcıPilot''ta kritik · Çok boyut kombinasyonu = geniş katalog'),

-- ── OYUNCAK ─────────────────────────────────────────────────────
('Dolu Toy Factory', 'trendyol', NULL, 'support@dolu.com.tr', '03122950100', 'https://www.dolu.com.tr', 'kesfedildi', 'website', 'Niche: plastik & ride-on oyuncak + çocuk mobilyası + bahçe oyuncak · 13K IG (@dolu_toyfactory) · 1975 kuruluş, Türkiye''nin en büyük oyuncak üreticilerinden · 500+ SKU, 70+ ülke ihracat · Sezonsal satış (yaz=bahçe oyuncak, kış=içmekan) → stok & kampanya analizi SatıcıPilot için net value-add'),
('Fen Toys', 'trendyol', NULL, 'info@fentoys.com', '02128560050', 'https://www.trendyol.com/fen-toys-x-b105876', 'kesfedildi', 'website', 'Niche: lisanslı oyuncak + eğitici oyuncak + kız oyun seti + plaj oyuncağı · 1962 kuruluş, Çorlu + Hadımköy fabrikaları · Trendyol + toptan distribütörler · Bayram & tatil öncesi sipariş patlaması → sezonsal yorum & stok yönetimi SatıcıPilot ile efektif'),

-- ── OTO AKSESUAR ─────────────────────────────────────────────────
('Carub', 'trendyol', NULL, NULL, NULL, 'https://www.trendyol.com/carub-x-b102662', 'kesfedildi', 'website', 'Niche: araç kilitleme + park sensörü + geri görüş kamerası + oto alarm · Trendyol aktif mağaza · Araç model uyumluluğu bazlı geniş SKU matrisi → yüzlerce varyant yönetimi · Yanlış araç modeli iadesi sık görülür → SatıcıPilot iade analizi & yorum kategorize özelliği yüksek değer'),
('Otoaksesuar.com', 'trendyol', NULL, 'info@otoaksesuar.com', NULL, 'https://www.otoaksesuar.com', 'kesfedildi', 'website', 'Niche: koltuk kılıfı + paspas + direksiyon kılıfı + güneşlik + iç aksesuar · 1995 kuruluş, kendi üretim · Trendyol + D2C çift kanal · Commodity kategoride hacim çok, yorumlarda kalite/uyum şikayeti sık gelir → SatıcıPilot yorum yanıt şablonları + kampanya yönetimi somut ROI'),

-- ── GAMİNG & PC AKSESUAR ─────────────────────────────────────────
('Rampage', 'trendyol', NULL, 'info@rampage.com.tr', '02166600000', 'https://www.trendyol.com/rampage-x-b110185', 'kesfedildi', 'instagram', 'Niche: gaming klavye + mouse + headset + mousepad + combo set · Türkiye''nin lider yerli gaming ekipman markası · 22 ülkeye ihracat · Trendyol + Amazon.com.tr + Teknosa · Oyuncu kitlesinin beklentisi yüksek & detaylı yorum bırakır → SatıcıPilot yorum yanıt şablonları + DOA iade takibi kritik use-case'),

-- ── ÇAY & İÇECEK ─────────────────────────────────────────────────
('Doğadan', 'trendyol', NULL, 'info@dogadan.com.tr', '08503344858', 'https://www.dogadan.com.tr', 'kesfedildi', 'instagram', 'Niche: bitki çayı + siyah çay + limon&zencefil + fonksiyonel karışım · 35K IG (@dogadan_cay) · 1975 kuruluş, Coca-Cola Company bünyesi · 260+ SKU, HB + Trendyol çift platform, Amazon.de''de Avrupa satışı · Sağlık iddiası yorumları (zayıflama, sindirim) yoğun → SatıcıPilot yorum kategorize + şablon yanıt büyük verimlilik'),

-- ── VALİZ & SEYAHAT ──────────────────────────────────────────────
('IVS Valiz', 'trendyol', NULL, 'info@ivsvaliz.com.tr', NULL, 'https://www.trendyol.com/ivs-valiz-x-b111204', 'kesfedildi', 'instagram', 'Niche: ultra-hafif PLA + polipropilen hardshell valiz + seyahat aksesuar · Türkiye''nin popüler yerli valiz markası · Trendyol + HB + Amazon.com.tr · Tatil sezonu satış patlaması + yüksek hasar/teker iade riski → SatıcıPilot iade süreç takibi & yorum yönetimi kargo hasarında kritik'),

-- ── GÜMÜŞ TAKÜ ───────────────────────────────────────────────────
('Söğütlü Silver', 'trendyol', NULL, 'info@sogutlusilver.com', NULL, 'https://www.trendyol.com/sogutlu-silver-x-b1340', 'kesfedildi', 'instagram', 'Niche: 925 ayar gümüş kolye + yüzük + bileklik + Midyat işi filigran · 30K IG (@sogutlusilver) · Mardin/Midyat geleneksel gümüş işlemeciliği · Trendyol aktif, yüzlerce benzersiz SKU · Kırılgan kargo + hediye segmenti = yüksek müşteri beklentisi → SatıcıPilot sipariş & yorum yönetimi somut değer'),
('Atolye925', 'trendyol', NULL, 'info@atolye925.com', '05325000925', 'https://www.trendyol.com/atolye925-x-b108', 'kesfedildi', 'instagram', 'Niche: 925 ayar el yapımı gümüş yüzük + bileklik + kolye + künye · 119K IG (@atolye925) · Kişiselleştirme & isim yazma seçeneği · Yıldönümü/doğum günü hediye segmenti → özel gün sipariş patlamaları · Kişiselleştirilmiş ürünlerde iade karmaşıklığı yüksek → SatıcıPilot sipariş takip & yorum yönetimi değerli'),

-- ── KOZMETİK CİHAZI ─────────────────────────────────────────────
('Ozmetic', 'trendyol', NULL, 'info@ozmetic.com', NULL, 'https://www.ozmetic.com', 'kesfedildi', 'instagram', 'Niche: IPL epilasyon cihazı + ozon yüz bakım + anti-aging cilt teknolojisi · 6.8K IG (@ozmetic.official) · Türk güzellik teknoloji markası, Trendyol + D2C · Yüksek bilet ürün (500-2500 TL) · Kullanım sonrası sonuç yorumları conversion''ı doğrudan etkiler → SatıcıPilot yorum izleme & hızlı yanıt özelliği growth-stage marka için öncelikli'),

-- ── KIŞLIK GİYİM / MONT ──────────────────────────────────────────
('Mavi', 'trendyol', NULL, 'musteri.hizmetleri@mavi.com', '08503040096', 'https://www.trendyol.com/mavi-x-b43', 'kesfedildi', 'instagram', 'Niche: denim + kışlık mont + puffer ceket + yün karışım palto · 958K IG (@mavi) · 1991 kuruluş, BİST halka açık (MAVI.IS) · 7.000+ satış noktası, ABD/Almanya retail · Trendyol + HB + 400 fiziksel mağaza → sezon lansmanında binlerce SKU yorumu eş zamanlı yönetimi SatıcıPilot''a güçlü iş case''i'),
('Lumberjack', 'trendyol', NULL, 'info@lumberjack.com.tr', '02126757700', 'https://www.trendyol.com/lumberjack-x-b318', 'kesfedildi', 'instagram', 'Niche: outdoor parka + su geçirmez mont + spor giyim + bot · 160K IG (@lumberjacktr) · İtalyan kökenli, Türkiye''de aktif yönetim · FLO retail ağı (600+ mağaza) + Trendyol + HB · Efsane Günü''nde kışlık kategoride yüksek hacim → sipariş & stok yönetimi SatıcıPilot ile otomasyon güçlü fit')

;
