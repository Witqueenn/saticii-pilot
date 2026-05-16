# SatıcıPilot — KOBİ E-Ticaret Satıcıları İçin AI Operasyon Asistanı

## Ürün Strateji ve İş Planı Dokümanı

**Versiyon:** 2.0  
**Tarih:** 16 Mayıs 2026  
**Gizlilik:** Dahili Kullanım

---

## 1. Yönetici Özeti

SatıcıPilot, Türkiye'deki küçük ve orta ölçekli e-ticaret satıcılarının günlük operasyonel yükünü AI ile hafifleten dar odaklı bir B2B otomasyon aracıdır. Ürün açıklaması iyileştirme, müşteri mesajı yönetimi, yorum ve şikâyet analizi, kampanya takibi, iade kalıp tespiti ve fiyat/rekabet izleme gibi tekrar eden, zaman yoğun görevleri tek bir panelde toplar.

Temel satış vaadi basittir: **"Her gün 1–2 saat operasyon yükü azaltma, daha iyi ürün sayfaları, daha az iade, daha hızlı müşteri cevapları."** SatıcıPilot, satıcılara "AI kullanın" demez; onlara daha az mesaj kuyruğu, daha yüksek dönüşüm oranı ve tekrar eden sorunların erken tespiti satar.

İlk hedef niş olarak **Trendyol'da kadın giyim satan 1–20 kişilik işletmeler** seçilmiştir. Giriş stratejisi ürün değil hizmettir: elle kurulum, yüz yüze doğrulama, ardından paketlenmiş SaaS'a geçiş.


---

## 2. Pazar Fırsatı ve Makro Veriler

### 2.1 Türkiye E-Ticaret Ekosistemi

Türkiye e-ticaret pazarı 2025 yılında güçlü bir büyüme sergilemiştir. Ticaret Bakanlığı'nın Mayıs 2026'da yayımladığı "Türkiye'de E-Ticaretin Görünümü Raporu 2025" verileri, pazarın hem hacim hem yapısal olgunluk açısından kritik bir eşiği aştığını göstermektedir.

| Gösterge | 2024 | 2025 | Değişim |
|---|---|---|---|
| Toplam e-ticaret hacmi | ~3 trilyon TL | 4,57 trilyon TL | %52,2 artış |
| Perakende e-ticaret hacmi | — | 2,46 trilyon TL | %51,8 artış |
| Toplam işlem sayısı | — | 5,94 milyar adet | — |
| E-ticaret yapan işletme | 600.800 | 634.611 | +33.811 işletme |
| E-ticaretin GSYH payı | %6,5 | %6,9 | — |
| Dolar bazında hacim | 89,58 milyar $ | 115,43 milyar $ | %28,9 artış |

**Kaynak:** T.C. Ticaret Bakanlığı, "Türkiye'de E-Ticaretin Görünümü Raporu 2025", 12 Mayıs 2026.

**Kritik yapısal veri:** E-ticaret faaliyetinde bulunan işletmelerin **%75'i şahıs işletmesi**, %21'i limited şirket, %4'ü anonim şirkettir. Bu, pazarın dörtte üçünün büyük yazılım ekipleri olmayan, pratik çözüme para verebilecek küçük satıcılardan oluştuğu anlamına gelir.

### 2.2 Hedef Sektör: Giyim, Ayakkabı ve Aksesuar

Sektör bazında en yüksek e-ticaret hacmi **428,7 milyar TL** ile giyim, ayakkabı ve aksesuar kategorisinde gerçekleşmiştir. Bu sektörü 304,3 milyar TL ile elektronik, 285,4 milyar TL ile havayolları izlemiştir. İşletme sayısı açısından yaklaşık 87.500 işletme giyim, ayakkabı ve aksesuar alanında e-ticaret yapmaktadır.

Bu niş SatıcıPilot için ideal hedef alandır çünkü hacim büyüktür, yorum ve mesaj yoğunluğu yüksektir, beden/ölçü kaynaklı iade oranları AI analizi için net veri üretir ve ürün açıklamalarının SEO kalitesi dönüşümü doğrudan etkiler.

### 2.3 Küresel AI ve Ajanlar Trendi

Küresel ölçekte AI harcamaları hızla büyümektedir ancak "genel AI" yerine iş akışına bağlanan görev odaklı ajanlar öne çıkmaktadır.

**Gartner tahminleri:**

- 2026'da küresel AI harcaması **2,52 trilyon dolara** ulaşacaktır; bu, bir önceki yıla göre %44'lük artış anlamına gelmektedir.
- 2026 sonuna kadar kurumsal uygulamaların **%40'ında** görev odaklı AI ajanları entegre edilecektir; 2025'te bu oran %5'in altındaydı.
- Ajansal AI harcaması 2026'da %141 büyüyerek yaklaşık 202 milyar dolara çıkacak, 2027'de ise chatbot/asistan harcamasını ilk kez geçecektir.

**McKinsey bulguları (Kasım 2025 anketi, 1.993 katılımcı, 105 ülke):**

- Kuruluşların **%62'si** AI ajanlarla en azından deneme yapmaktadır; %23'ü en az bir fonksiyonda ölçeklendirme aşamasındadır.
- Ancak kuruluşların yaklaşık üçte ikisi hâlâ pilot aşamasından çıkamamıştır.
- Yüksek performanslı şirketler (EBIT'in %5'inden fazlasını AI'dan elde edenler) toplam katılımcıların yalnızca **%5,5'idir**; bu da küçük, uygulanabilir çözümler için geniş bir alan bırakmaktadır.

**Temel çıkarım:** Büyük şirketler bile AI ajanlarını ölçeklendirmekte zorlanırken, KOBİ'lere "kurulum + eğitim + bakım" modeli ile sunulan dar kapsamlı AI otomasyonları anlamlı bir pazar boşluğu oluşturmaktadır. SatıcıPilot tam da bu boşluğa oturmaktadır.


---

## 3. Sorun Tanımı

Tipik bir Trendyol/Hepsiburada/N11 satıcısı (5–50 ürün, 1–5 çalışan) her gün şu sorunlarla karşılaşır:

**Yorum ve mesaj birikmesi:** Günlük onlarca müşteri yorumu ve mesajı gelir. Hangilerinin acil cevap gerektirdiğini, hangilerinin tekrar eden şikâyet olduğunu ayırt etmek zaman alır. Cevap gecikmesi hem müşteri kaybına hem platform puanı düşüşüne yol açar.

**Ürün açıklamalarının yetersizliği:** Açıklamalar genellikle copy-paste veya eksik yazılır. SEO uyumsuzluğu, eksik özellik bilgisi ve zayıf görseller dönüşüm oranını düşürür.

**İade kalıplarının görünmezliği:** İade sebepleri (beden uyumsuzluğu, renk farkı, kalite beklentisi vb.) dağınık verilerde gizlidir. Satıcı, aynı iade sebebinin tekrar ettiğini ancak çok geç fark eder.

**Kampanya ve fiyat yönetimi:** Platform kampanyalarına hangi ürünlerle girilmeli, rakip fiyatları ne durumda, marj korunuyor mu — bunları izlemek sürekli göz gezdirmeyi gerektirir.

**WhatsApp/Instagram mesaj kaosu:** Özellikle Instagram ve WhatsApp'tan satış yapan satıcılarda mesajlar, sipariş bilgileri ve müşteri takibi birbirine karışır.

Bu sorunların her biri ayrı ayrı "çözülebilir" görünür, ancak satıcının asıl sorunu bunların **hepsinin aynı anda** gelmesi ve bunları yönetecek sistemin olmamasıdır.


---

## 4. Müşteri Personası: "Satıcı Ayşe"

### 4.1 Profil

**Ayşe Demir, 34 yaşında.** İstanbul Bağcılar'da 3 kişilik ekiple kadın giyim satıyor. 2021'de Trendyol'da mağaza açtı, sonra Hepsiburada'ya da genişledi. Şu an 42 aktif ürünü var. Aylık ortalama 800–1.200 sipariş alıyor. Cirosu aylık 150.000–250.000 TL bandında, net kâr marjı %12–18 arasında gidip geliyor.

### 4.2 Günlük Rutini

Ayşe her sabah 08:30'da Trendyol satıcı panelini açıyor. İlk 45 dakikasını dünden kalan **32 müşteri yorumunu** okumaya ve cevaplamaya harcıyor. Yorumların çoğu "Beden küçük geldi", "Kumaş fotoğraftaki gibi değil", "Ne zaman gelir?" gibi tekrar eden sorular ama her birini tek tek okuyup cevap yazması gerekiyor. Ardından 20 dakikasını **iade taleplerini** incelemeye ayırıyor — son bir haftada 3 farklı üründe "beden uyumsuzluğu" iade sebebi tekrarladığını fark ediyor ama bunu sistematik olarak takip edecek aracı yok. Öğleden sonra **5 ürünün açıklamasını** güncellemeye çalışıyor çünkü Trendyol'dan "ürün içerik kalite puanınız düştü" uyarısı geldi. Akşam 19:00'da WhatsApp'tan gelen **15 müşteri mesajına** bakıyor, sipariş durumu soran, indirim isteyen, beden soran mesajlar karışık.

### 4.3 Acı Noktaları (Pain Points)

Ayşe en çok şu anda şunlardan şikâyetçi:

- "Yorum cevaplama beni boğuyor. Aynı soruları defalarca cevaplıyorum ama kopyala-yapıştır yaparsam puanım düşer."
- "Hangi ürünlerin neden iade edildiğini toplu göremiyorum. Ölçü tablosunu güncellesem belki iadelerin yarısı düşer ama veriye ulaşamıyorum."
- "Ürün açıklamalarını iyileştirmem gerektiğini biliyorum ama nereden başlayacağımı bilemiyorum."
- "Rakiplerim kampanyalarda fiyatı kırdığında geç fark ediyorum, satışlarım düşüyor."
- "Bir yazılıma ayda 2.000–3.000 TL verebilirim ama büyük ERP sistemleri benim için fazla; bana özel, basit bir şey lazım."

### 4.4 Karar Alma Süreci

Ayşe yeni bir araca para vermeye karar verirken şu sırayı takip ediyor: Önce tanıdığı satıcılara soruyor (WhatsApp grupları, Trendyol satıcı forumları). Sonra 10 dakikada ne yaptığını anlamadığı aracı bırakıyor. Ücretsiz deneme veya "ilk analiz bedava" teklifi onu kapıya çekiyor. İlk 48 saat içinde somut bir fayda görmezse devam etmiyor.

**Bu persona, tüm ürün kararlarının sınandığı referans noktasıdır. Her özellik öncesi soru: "Ayşe bunu kullanır mı? Ayşe buna para verir mi?"**


---

## 5. Kullanıcı Yolculuğu (User Journey)

### 5.1 Keşif → Aktivasyon → Değer → Sadakat Haritası

```
KEŞIF                DEĞERLEME             AKTİVASYON           İLK DEĞER            ALIŞKANLIK           SADAKATf
(Hafta 0)            (Hafta 0–1)           (Hafta 1)            (Hafta 1–2)          (Ay 1–2)             (Ay 3+)
│                    │                     │                    │                    │                    │
│ WhatsApp grubunda  │ "Ücretsiz analiz"   │ Trendyol hesabını  │ İlk günlük rapor:  │ Her sabah           │ 3. ayda iade oranı
│ referans duyar     │ teklifine tıklar     │ bağlar, 10 dk      │ "17 acil yorum,    │ SatıcıPilot ile     │ %15 düştü; NPS
│ veya Instagram     │ veya satıcı          │ onboarding          │ 3 zayıf açıklama,  │ güne başlıyor.      │ anketinde 9/10
│ reklamı görür      │ toplantısında demo   │ çağrısı yapılır     │ beden iadesi        │ Haftalık raporu     │ verdi; 2 satıcıya
│                    │ izler                │                    │ tekrarı var"        │ bekliyor.           │ referans oldu
│                    │                     │                    │                    │                    │
▼                    ▼                     ▼                    ▼                    ▼                    ▼
Duygu: "İlginç,      Duygu: "Benim         Duygu: "Kolay        Duygu: "Vay, bunu    Duygu: "Bu olmadan   Duygu: "Aylık
acaba işe yarar mı?" sorunumu anlıyorlar"  olmuş, bakalım"      göremiyordum!"       yapamıyorum artık"   paketi yükselteyim"
```

### 5.2 Kritik Anlar (Moments of Truth)

**İlk 10 dakika:** Onboarding akışının basitliği her şeyi belirler. Satıcı, Trendyol API bilgilerini girip 10 dakika içinde ilk veri çekmesini görmeli. Karmaşık form, uzun bekleyiş veya teknik hata = kayıp.

**İlk 48 saat:** Satıcı somut bir "bunu bilmiyordum!" anı yaşamalı. Bu genellikle tekrar eden iade sebebinin tespiti veya düşük performanslı ürün açıklamasının belirlenmesi oluyor. Bu an yaşanmazsa satıcı "bir ChatGPT'den ne farkı var?" diye düşünüp bırakıyor.

**İlk hafta raporu:** Haftalık özet e-postası, satıcının kendi verisinden çıkarılmış somut rakamlarla gelmeli: "Bu hafta 142 yorum cevapladın (ortalamadan %20 fazla), 7 iade beden uyumsuzluğu kaynaklı, 2 ürünün açıklama puanı kritik eşiğin altında." Bu rapor, satıcının SatıcıPilot'u "lazım bir araç" olarak kodlamasını sağlar.

**30. gün:** İptal/devam kararı. Satıcının bu noktada görmesi gereken: en az bir ölçülebilir iyileşme (cevap süresi, iade oranı, açıklama puanı). Bu metrik yoksa iptal riski çok yüksek.


---

## 6. Ürün Vizyonu ve Çekirdek Modüller

### 6.1 Tek Cümlelik Vizyon

> "Küçük e-ticaret satıcısının dağınık operasyonunu AI ile toparlamak — sihir değil, her gün 1–2 saat kazandıran pratik otomasyon."

### 6.2 MVP Modül Haritası (İlk 90 Gün)

**Modül 1 — Yorum ve Mesaj Komuta Merkezi**

Tüm pazaryeri yorumları ve gelen mesajlar tek panelde toplanır. AI, her mesajı aciliyet ve duygu durumuna göre sınıflandırır (olumlu, nötr, şikâyet, acil). "Bugün cevaplanması gereken 17 yorum var, 3'ü acil" gibi günlük özetler üretir. Sık sorulan sorulara otomatik cevap taslakları hazırlar; satıcı onaylar veya düzenler.

**Modül 2 — Ürün Açıklaması ve SEO Analizi**

Mevcut ürün açıklamalarını tarar. Eksik bilgileri (ölçü tablosu, kumaş, bakım önerisi), SEO zayıflıklarını ve dönüşüm potansiyelini raporlar. "Bu 3 ürünün açıklaması zayıf, dönüşüm düşürüyor olabilir" şeklinde aksiyon önerileri sunar. İsteğe bağlı olarak iyileştirilmiş açıklama taslağı üretir.

**Modül 3 — İade Kalıp Analizi**

İade verilerini toplar ve tekrar eden sebepleri (beden uyumsuzluğu, renk farkı, hasarlı ürün vb.) kümeler. "Şu üründe iade sebebi tekrar ediyor: beden uyumsuzluğu — ölçü tablosu güncellenmeli" gibi spesifik öneriler üretir. Haftalık iade raporu ile trendin yönünü gösterir.

**Modül 4 — Kampanya ve Rekabet Radarı**

Aktif ve yaklaşan platform kampanyalarını izler. Hangi ürünlerin kampanyaya uygun olduğunu marj analizi ile birlikte önerir. Seçili rakip ürünlerin fiyat hareketlerini takip eder ve değişikliklerde uyarı gönderir.

### 6.3 Gelecek Aşama Modüller (6–12 Ay)

**WhatsApp İş Asistanı:** WhatsApp Business API entegrasyonu ile gelen müşteri mesajlarına otomatik cevap taslağı, sipariş durumu bildirimi ve SSS yönetimi. Satıcı, mesajları kaçırmadan profesyonel bir müşteri deneyimi sunar.

**Stok ve Talep Sinyalleri:** Satış hızı, sezon trendi ve kampanya takvimi verilerini çaprazlayarak "Şu üründe stok 3 güne yeter" veya "Bu kategoride talep artıyor, tedarik planla" şeklinde erken uyarılar.

**Çok Kanallı Senkronizasyon:** Trendyol + Hepsiburada + N11 + Shopify/WooCommerce mağazalarını tek panelde gösterme; ürün bilgisi, fiyat ve stok tutarlılığı kontrolü.


---

## 7. Hedef Müşteri Profili

### 7.1 Birincil Hedef: Kadın Giyim Satıcıları

| Kriter | Tanım |
|---|---|
| İşletme büyüklüğü | 1–20 kişi, şahıs veya limited şirket |
| Ürün sayısı | 5–50 aktif SKU |
| Ana kanal | Trendyol (birincil), Hepsiburada/N11 (ikincil) |
| Günlük mesaj hacmi | 10–100+ yorum ve mesaj |
| Ana acı noktası | Yorum birikimi, iade oranı, ürün açıklama kalitesi |
| Dijital olgunluk | Temel seviye; Excel, WhatsApp, pazaryeri paneli kullanır |
| Bütçe hassasiyeti | Aylık 500–3.000 TL arası yazılım harcamasına açık |
| Karar verici | İşletme sahibi veya operasyon sorumlusu |

### 7.2 İkincil Hedefler

**Elektronik aksesuar satıcıları:** Ürün yorumu, teknik soru, iade ve fiyat rekabeti çok yoğundur. AI özellikle teknik soruların hızlı cevaplanması ve fiyat izleme konusunda değer yaratır.

**Ev, bahçe, mobilya ve dekorasyon satıcıları:** Ürün açıklamalarında ölçü ve malzeme bilgisi kritiktir, kargo hasarı kaynaklı iadeler sıktır, müşteri soruları detaylıdır. AI burada ciddi zaman kazandırır.

### 7.3 İlk 60 Gün Odak Kuralı

İlk 60 gün yalnızca tek nişe odaklanılır: **"Trendyol'da kadın giyim satan 1–20 kişilik işletmeler için AI yorum, açıklama ve iade analiz sistemi."** Bu dar tanım, ürün-pazar uyumunu test etmek ve referans müşteriler oluşturmak için kritiktir. Niş genişletme ancak ilk 10 ödeme yapan müşteriden sonra değerlendirilir.


---

## 8. Rekabet Analizi: İsimli Rakipler ve Boşluk Haritası

### 8.1 Doğrudan Rakipler (Türk Pazaryeri Araçları)

**Dopigo** — Türkiye'nin en bilinen pazaryeri entegrasyon platformu. 4.000'den fazla satıcıya hizmet veriyor. Trendyol, Hepsiburada, N11, Amazon dahil 45+ satış kanalıyla entegre. Güçlü yönleri: sipariş yönetimi, toplu ürün listeleme, e-fatura otomasyonu, stok senkronizasyonu, depo yönetimi (WMS). Yıllık 24.999 TL'den başlayan paketler. **Eksik olan:** AI tabanlı yorum analizi, iade kalıp tespiti, ürün açıklama optimizasyonu ve proaktif öneri motoru yok. Dopigo operasyonel altyapıyı yönetir; SatıcıPilot ise Dopigo'nun bıraktığı "zekâ katmanını" hedefler.

**İkas** — SaaS e-ticaret altyapısı. Kendi mağazanı kur ve pazaryerlerine bağla modeli. KOBİ'ler için uygun fiyatlı. Pazaryeri entegrasyonları var ama odağı mağaza yönetimi. AI içerik veya yorum analizi sunmuyor.

**Ticimax** — Yine bir e-ticaret altyapı platformu. Trendyol, Hepsiburada ile entegre. Raporlama ve kampanya araçları var ama bunlar basit analitik seviyesinde; AI tabanlı öneri veya dil işleme yok.

**IdeaSoft** — Türkiye'nin en köklü e-ticaret altyapılarından. Logo, Netsis, SAP ile ERP entegrasyonları güçlü. Ancak hedef kitlesi orta-büyük ölçek; KOBİ satıcıya göre karmaşık ve pahalı. AI katmanı yok.

### 8.2 Dolaylı Rakipler

**Genel AI araçları (ChatGPT, Claude, Gemini):** Satıcılar zaten ChatGPT'yi ürün açıklaması yazmak veya müşteri cevabı oluşturmak için kullanıyor. Ancak bunlar satıcının verisine bağlı değil — her seferinde prompt yazmak gerekiyor, otomatik izleme ve proaktif bildirim yok. SatıcıPilot'un farkı: genel AI aracını satıcının özel verisine bağlayıp, prompt yazmadan günlük değer üretmesi.

**Segmentify** — Türk menşeli, e-ticaret siteleri için AI tabanlı ürün önerisi ve kişiselleştirme platformu. Hepsiburada, N11, Boyner gibi büyük müşterileri var. Ancak hedef kitlesi son kullanıcıya (alıcıya) yönelik deneyim optimizasyonu; satıcının operasyonel yükünü hafifletme amacı yok.

**Pazaryeri yerleşik araçları:** Trendyol'un satıcı panelinde temel analitik var (satış raporu, yorum listesi, iade listesi). Ama bunlar reaktif — satıcı kendisi girip bakmalı. Çapraz platform görünüm, AI sınıflandırma ve proaktif uyarı sunmuyorlar.

### 8.3 Boşluk Haritası

| Yetenek | Dopigo | İkas | Ticimax | ChatGPT | SatıcıPilot |
|---|---|---|---|---|---|
| Çoklu pazaryeri entegrasyonu | ✅ Güçlü | ✅ Orta | ✅ Orta | ❌ | ⚠️ Başlangıçta sınırlı |
| Sipariş/stok/fatura yönetimi | ✅ Güçlü | ✅ | ✅ | ❌ | ❌ (kapsam dışı) |
| AI yorum sınıflandırma | ❌ | ❌ | ❌ | ⚠️ Manuel prompt | ✅ Otomatik |
| AI iade kalıp tespiti | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI ürün açıklama optimizasyonu | ❌ | ❌ | ❌ | ⚠️ Manuel prompt | ✅ Veri bağlantılı |
| Proaktif günlük bildirim | ❌ | ❌ | ❌ | ❌ | ✅ |
| Rekabet fiyat izleme | ❌ | ❌ | ⚠️ Basit | ❌ | ✅ |
| Türkçe dil nüansı | ✅ | ✅ | ✅ | ⚠️ Genel | ✅ Sektör özel |

**Stratejik sonuç:** Türk pazarında sipariş/stok/fatura yönetimi iyi çözülmüş (Dopigo, İkas, Ticimax). SatıcıPilot bu katmanla rekabet etmez; onların üstüne oturan **"zekâ ve içgörü katmanı"** olarak konumlanır. Hatta Dopigo ile gelecekte entegrasyon ortaklığı mümkündür.


---

## 9. Gelir Modeli ve Fiyatlama Stratejisi

### 9.1 Faz 1 — Hizmet + Kurulum (Ay 1–3)

İlk aşamada SaaS kasılmaz. Önce **hizmet + kurulum + aylık bakım** satılır. Amaç ödeme yapan müşteriyle sistemi doğrulamaktır.

**Başlangıç Paketi (Tek Seferlik):** Kurulum, veri bağlantısı, ilk AI analiz raporu, kullanıcı eğitimi. Fiyat aralığı: 3.000–8.000 TL.

**Aylık Bakım Paketi:** AI panel erişimi, haftalık rapor, küçük iyileştirmeler, destek. Fiyat aralığı: 1.500–3.500 TL/ay.

### 9.2 Faz 2 — Paketlenmiş Teklif (Ay 3–6)

Elle kurulan sistemi standartlaştırıp 10–20 müşteriye yaymak. Onboarding süresini 1 haftadan 2 güne düşürmek.

| Paket | İçerik | Aylık Fiyat (Tahmini) |
|---|---|---|
| Temel | Yorum analizi + iade raporu + aylık özet | 1.500 TL |
| Profesyonel | Temel + ürün açıklama önerileri + rekabet radarı | 2.500 TL |
| Kurumsal | Profesyonel + WhatsApp botu + haftalık büyüme raporu + özel entegrasyon | 4.500 TL |

### 9.3 Faz 3 — Mikro-SaaS (Ay 6–12)

Tekrar eden işleri self-servis SaaS'a çevirmek. Satıcı, panele giriş yapar, pazaryeri hesabını bağlar ve AI analizlere hemen erişir. Onboarding süresi dakikalarla ölçülür. Hizmet katmanı yalnızca premium müşterilere kalır.

### 9.4 Fiyatlandırma Gerekçesi: "Neden Bu Fiyat?"

Fiyatlandırma üç bacaklı bir mantığa dayanır:

**1. Fırsat maliyeti hesabı:** Satıcı Ayşe günde ortalama 1,5 saatini yorum cevaplama, iade inceleme ve açıklama düzenlemeye harcıyor. Bir asistan/stajyer çalıştırsa aylık maliyeti 15.000–20.000 TL bandında. SatıcıPilot'un Profesyonel paketi (2.500 TL/ay) bu maliyetin %12–17'si — açıkça daha ucuz ve 7/24 çalışıyor.

**2. Rakip fiyat çerçevesi:** Dopigo'nun yıllık pazaryeri paketi 24.999 TL (aylık ~2.083 TL). İkas aylık 160–650 TL bandında ama e-ticaret altyapısı, AI içgörü değil. SatıcıPilot'un 1.500–4.500 TL bandı, Dopigo'nun "üstüne eklenen katman" olarak konumlandığında kabul edilebilir.

**3. Willingness-to-pay sinyali:** Keşif görüşmelerinde doğrulanacak, ancak Türk KOBİ satıcılarının aylık 500–3.000 TL bandında yazılım harcamasına açık olduğu sektör anekdotları ve Dopigo fiyatlandırması tarafından destekleniyor. İlk 3 müşteride A/B fiyat testi yapılarak gerçek WTP ölçülecek.

**Önemli:** İlk 5 müşteriye "doğrulama fiyatı" uygulanabilir (piyasa fiyatının %50'si). Amaç gelir değil, kullanım verisi ve geri bildirim toplamaktır.


---

## 10. Birim Ekonomisi (Unit Economics)

### 10.1 Müşteri Başına Maliyet ve Gelir Tahmini

Aşağıdaki tablo, "Profesyonel Paket" (2.500 TL/ay) üzerinden tek bir müşterinin aylık birim ekonomisini gösterir:

| Kalem | Aylık Tutar | Açıklama |
|---|---|---|
| **Gelir** | 2.500 TL | Profesyonel paket aboneliği |
| **AI API maliyeti** | ~400–700 TL | Claude/GPT API çağrıları (günlük analiz, yorum sınıflandırma, açıklama üretimi). ~50 ürün × günlük batch + 30–80 yorum/gün analizi |
| **Altyapı maliyeti** | ~150–250 TL | Supabase Pro (kota payı), Vercel/Railway hosting, n8n bulut |
| **Destek maliyeti** | ~200–400 TL | Kurucu zamanının fırsat maliyeti; Faz 2'de müşteri başına düşecek |
| **Toplam değişken maliyet** | ~750–1.350 TL | — |
| **Brüt kâr** | ~1.150–1.750 TL | Brüt marj: **%46–70** |

### 10.2 Kritik Eşikler

**AI API maliyeti kontrolü:** En büyük değişken maliyet. Maliyet optimizasyonu için: batch işleme (gerçek zamanlı yerine günlük toplu analiz), prompt caching (tekrar eden sınıflandırmalarda cache), model seçimi (basit sınıflandırma için Haiku, karmaşık üretim için Sonnet), ve token limitleri. Hedef: müşteri başına AI maliyetini aylık 500 TL'nin altında tutmak.

**Başabaş noktası (break-even):** Sabit maliyetler (kurucu maaşı/yaşam gideri, araç lisansları, domain/SSL) aylık ~15.000–20.000 TL varsayılırsa, 10–12 Profesyonel müşteri ile başabaş noktasına ulaşılır.

**LTV / CAC hedefi:** Ortalama müşteri ömrü 8 ay varsayımıyla LTV = 2.500 × 8 = 20.000 TL. CAC hedefi < 2.500 TL (bir aylık abonelik). LTV:CAC oranı en az 8:1. Bu, topluluk bazlı organik büyüme ile gerçekçi; ücretli reklam ile zorlaşır.

### 10.3 Ölçekleme Etkisi

| Müşteri Sayısı | Aylık Gelir | Aylık Değişken Maliyet | Brüt Kâr | Sabit Maliyet Sonrası Net |
|---|---|---|---|---|
| 5 | 12.500 TL | 5.000 TL | 7.500 TL | -10.000 TL (yatırım aşaması) |
| 15 | 37.500 TL | 15.000 TL | 22.500 TL | ~5.000 TL (başabaş) |
| 30 | 75.000 TL | 28.000 TL | 47.000 TL | ~27.000 TL |
| 50 | 125.000 TL | 42.000 TL | 83.000 TL | ~60.000 TL |

Not: 30+ müşteride ölçek ekonomisi devreye girer — AI API batch optimization, paylaşılan altyapı maliyeti ve otomatik onboarding ile müşteri başına değişken maliyet düşer.


---

## 11. Teknik Mimari ve Araç Kiti

### 11.1 Yığın Seçimi

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Frontend | Next.js + React | Hızlı prototipleme, SSR, Vercel deploy |
| Backend API | FastAPI (Python) | AI/ML ekosistemiyle uyum, hız |
| Veritabanı | Supabase (PostgreSQL) | Auth, realtime, edge functions dahil |
| Kuyruk/İşçi | Redis + Celery | Günlük AI analiz batch işleri |
| AI/LLM | Claude API / GPT-4o | Yorum analizi, açıklama üretimi, sınıflandırma |
| Otomasyon | n8n / Make | Platform veri çekme, bildirim, webhook |
| WhatsApp | WhatsApp Business API | Müşteri mesaj otomasyonu (Faz 2) |
| Ödeme | iyzico | Türk pazarı uyumlu ödeme altyapısı |
| Hosting | Vercel (frontend) + Railway/Fly.io (backend) | Düşük maliyet, ölçeklenebilirlik |
| Monitoring | Sentry + PostHog | Hata izleme, ürün analitiği |

### 11.2 Pazaryeri API Gerçeklik Kontrolü

Bu bölüm, teknik planlamadaki en büyük belirsizlik alanını dürüstçe ele alır.

**Trendyol API (developers.trendyol.com):**

Trendyol, satıcılar ve entegratörler için kapsamlı bir API sunuyor. Ürün listeleme/güncelleme, stok ve fiyat yönetimi, sipariş işlemleri, fatura gönderimi ve müşteri soruları gibi endpoint'ler mevcut. API erişimi Trendyol Partner Programı kapsamında sağlanıyor. Stage ve production ortamları ayrı. Haziran 2026'da Product V2 API'ye geçiş tamamlanacak (V1 Ağustos 2026'da kapanıyor).

*SatıcıPilot için kritik olan:* Müşteri soruları/yorumları endpoint'i mevcut — bu, yorum çekme modülünün temelini oluşturur. Ürün bilgileri ve sipariş/iade verileri de çekilebilir. Ancak rakip fiyat bilgisi ve kampanya detayları gibi veriler doğrudan API'den gelmiyor; bu noktada scraping veya satıcının manuel veri girişi gerekebilir.

**Hepsiburada API:**

Hepsiburada da satıcı API'si sunuyor ancak Trendyol'a göre dokümantasyonu daha kapalı ve erişim süreci daha bürokratik. Entegratör onay süreci uzun sürebiliyor.

**N11 API:**

N11 satıcı API'si mevcut ve nispeten açık. Ürün, sipariş ve temel raporlama endpoint'leri var.

**Dürüst değerlendirme ve yedek planlar:**

Pazaryeri API'leri en büyük teknik risktir. API'ler değişebilir, erişim kısıtlanabilir veya rate limit'ler operasyonu yavaşlatabilir. Yedek planlar:

- *Plan A:* Resmi API entegrasyonu (ideal senaryo). Trendyol'un yeni MCP server aracı bile Claude Code entegrasyonu için yayınlanmış — ekosistem AI entegrasyonuna açılıyor.
- *Plan B:* Satıcının panel verilerini CSV/Excel olarak dışa aktarıp sisteme yüklemesi (yarı manuel). İlk 3 müşteride zaten bu yöntem kullanılabilir.
- *Plan C:* Dopigo gibi mevcut entegratörlerin API'si üzerinden veri çekme. Dopigo zaten Trendyol verisini topluyor; ortaklık yapılabilir.
- *Plan D:* Tarayıcı otomasyon (Playwright/Puppeteer) ile satıcı panelinden veri çekme. Hukuki gri alan; uzun vadeli çözüm değil ama MVP doğrulaması için kullanılabilir.

**İlk 3 müşteride strateji:** Plan B (CSV yükleme) + Plan A'yı paralel geliştirme. Müşteri ödeme yapıyor mu sorusunu API tamamlanmadan test etmek mümkün.

### 11.3 Veri Akışı (Basitleştirilmiş)

```
┌──────────────────────────────────────────────────────────────────┐
│                     SATIŞ KANALLARI                              │
│   Trendyol API  ·  Hepsiburada API  ·  N11 API  ·  WhatsApp     │
└──────────────────────┬───────────────────────────────────────────┘
                       │  n8n / Make (veri çekme, zamanlanmış)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   VERİ KATMANI (Supabase / PostgreSQL)           │
│   yorumlar · mesajlar · ürün bilgileri · iade kayıtları          │
│   kampanya verileri · rakip fiyatları · müşteri geçmişi          │
└──────────────────────┬───────────────────────────────────────────┘
                       │  Redis + Celery (batch işlemler)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      AI İŞLEME KATMANI                           │
│   Duygu analizi · Sınıflandırma · İade kalıp tespiti             │
│   Açıklama önerisi · SEO skoru · Cevap taslağı üretimi           │
│   Kampanya uygunluk analizi · Fiyat karşılaştırma                │
└──────────────────────┬───────────────────────────────────────────┘
                       │  FastAPI → Next.js
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SATICI PANELİ (Dashboard)                    │
│   Günlük görev listesi · Yorum kutusu · İade raporu              │
│   Açıklama önerileri · Kampanya radarı · WhatsApp tümleşimi      │
└──────────────────────────────────────────────────────────────────┘
```

### 11.4 Geliştirme İlkeleri

**"Yarı manuel" başla:** İlk sürümde her şeyi otomatik yapmaya çalışma. Bazı adımları (veri çekme, rapor onaylama) manuel bırak. Erken aşamada önemli olan "AI muhteşem mi?" değil, "müşteri bunun için para veriyor mu?" sorusu.

**Prompt mühendisliğini ürünleştir:** Her AI çıktısı (yorum sınıflandırma, açıklama önerisi, cevap taslağı) için versiyonlanmış prompt şablonları oluştur. Prompt performansını müşteri geri bildirimi ile ölç ve iterasyonla geliştir.

**Veri güvenliği öncelik:** Satıcı verileri hassastır (satış rakamları, müşteri bilgileri, fiyatlandırma). Supabase Row Level Security, API key yönetimi ve KVKK uyumu baştan kurulmalı.


---

## 12. Araç Dağılımı: Claude Code + ChatGPT + Antigravity

### 12.1 Roller ve Sorumluluklar

**ChatGPT kullanım alanları:** Ürün stratejisi belgeleri, müşteri görüşme soruları ve senaryoları, satış metinleri ve landing page kopyası, prompt tasarımı ve optimizasyonu, hata senaryosu ve edge case keşfi, kullanıcı dokümantasyonu ve yardım içerikleri.

**Claude Code kullanım alanları:** Backend geliştirme (FastAPI endpoint'leri), API entegrasyonları (pazaryeri, WhatsApp), veritabanı şema tasarımı ve migrasyon, Celery task'ları ve batch işleme scriptleri, test yazımı (unit, integration), veri işleme pipeline'ları.

**Antigravity kullanım alanları:** Hızlı frontend prototipleme, dashboard ve panel arayüzü akışı, tarayıcı tabanlı test ve görsel doğrulama, demo prototip (satış görüşmeleri için).

### 12.2 Ek Araçlar

- **Supabase:** Veritabanı, auth, realtime subscriptions
- **Vercel / Cloudflare:** Frontend deploy, edge computing
- **n8n / Make:** Pazaryeri API polling, webhook yönetimi, bildirim otomasyonu
- **WhatsApp Business API:** Müşteri mesajlaşma (Faz 2)
- **Google Sheets:** İlk aşamada hafif raporlama, satıcının alışık olduğu format
- **iyzico:** Abonelik ödemeleri
- **PostHog:** Ürün analitiği, feature flag yönetimi


---

## 13. Go-to-Market Stratejisi

### 13.1 Faz 1: Doğrulama (Hafta 1–8)

**Hedef:** İlk 3 ödeme yapan müşteriyi bulmak ve elle kurulum ile sistemi doğrulamak.

**Adımlar:**

1. Trendyol'da kadın giyim kategorisinde aktif, 20–200 arası yoruma sahip, iade oranı görece yüksek mağazaları listele (ETBİS ve platform verileri üzerinden).
2. 15–20 satıcıyla keşif görüşmesi yap. Sorular: "Günde kaç yorum/mesaj geliyor? En çok neye vakit harcıyorsun? İade sebebin ne? Açıklamalarını kim yazıyor?"
3. En acil sorunu olan ve ödeme kapasitesi bulunan 3–5 satıcıyı seç.
4. Elle kurulum yap: verilerini çek, AI analizini çalıştır, ilk raporu sun.
5. 2 hafta boyunca yakın destek ver, kullanım ve geri bildirimi ölç.

**Başarı kriteri:** 3 satıcının hepsinin 2. aya geçip aylık pakete devam etmesi.

### 13.2 Faz 2: Paketleme (Hafta 8–24)

**Hedef:** Aynı sistemi 10–20 müşteriye yaymak.

**Adımlar:**

1. İlk 3 müşteriden case study ve referans al.
2. Onboarding sürecini standartlaştır (checklist, video eğitim, şablon konfigürasyon).
3. Instagram ve LinkedIn'de hedef kitleye yönelik içerik üret: "Bu satıcı SatıcıPilot ile iade oranını %X düşürdü."
4. Trendyol satıcı toplulukları, WhatsApp grupları ve e-ticaret forumlarında bilinirlik oluştur.
5. İlk 10 müşteriden öğrenilen kalıpları ürüne geri besle.

### 13.3 Faz 3: Ölçekleme (Ay 6–12)

**Hedef:** Self-servis SaaS'a geçiş; 50–100 müşteri.

**Adımlar:**

1. Pazaryeri hesap bağlama akışını otomatikleştir.
2. Freemium veya deneme modeli ekle (7 günlük ücretsiz analiz).
3. İçerik pazarlama ve SEO ile organik büyüme.
4. İkincil niş kategorilere açıl (elektronik aksesuar, ev-dekorasyon).
5. Partnership: e-ticaret danışmanları, kargo şirketleri, pazaryeri eğitim platformları ile çapraz satış.


---

## 14. Riskler ve Azaltma Stratejileri

### 14.1 Pazaryeri API Erişim Riski

**Risk:** Trendyol, Hepsiburada veya N11'in API erişimini kısıtlaması veya değiştirmesi.

**Azaltma:** İlk aşamada API yerine CSV/Excel dışa aktarım desteği. n8n/Make ile esnek entegrasyon; bir kaynak koptuğunda diğerine geçiş. Dopigo gibi mevcut entegratörlerle ortaklık. Uzun vadede resmi partner/geliştirici programlarına başvuru. Trendyol'un kendi MCP developer tool'u yayınlaması ekosistem açıklığının olumlu bir sinyali.

### 14.2 Müşteri Edinme Maliyeti

**Risk:** KOBİ'lere satış yapmak pahalı olabilir; karar süreci uzun, bütçe hassasiyeti yüksek.

**Azaltma:** "Ücretsiz ilk analiz" ile kapıyı açmak. Topluluk bazlı büyüme (referans, WhatsApp grupları, satıcı forumları). İlk değeri 48 saat içinde göstermek.

### 14.3 AI Çıktı Kalitesi

**Risk:** Yanlış yorum sınıflandırma, alakasız açıklama önerisi veya hatalı iade analizi güven kaybına yol açabilir.

**Azaltma:** İlk sürümde tüm AI çıktıları "taslak" olarak sunulur; satıcı onaylar. Prompt'lar iteratif olarak geliştirilir. Geri bildirim döngüsü ile sürekli kalibrasyon. Kritik kararlar (fiyat değişikliği, toplu mesaj gönderimi) her zaman insan onayı gerektirir.

### 14.4 Tek Kişilik Ekip Riski

**Risk:** Kurucu her şeyi yapar — geliştirme, satış, destek, strateji. Tükenme ve darboğaz.

**Azaltma:** AI araçlarını (Claude Code, ChatGPT, Antigravity) çarpan olarak kullan. İlk 3 ayda sadece 3–5 müşteriye odaklan. Tekrar eden destek görevlerini erken otomasyonla azalt. Gelir başladığında freelancer desteği al (müşteri destek, içerik üretimi).

### 14.5 KVKK ve Veri Uyumu

**Risk:** Satıcı ve müşteri verilerinin işlenmesi KVKK kapsamında yükümlülükler doğurur.

**Azaltma:** Veri işleme sözleşmesi baştan hazırlanır. Kişisel veri minimizasyonu ilkesi uygulanır. Supabase Row Level Security ve şifreleme aktif tutulur. Hukuki danışmanlık alınır.

### 14.6 AI API Maliyet Patlaması

**Risk:** Müşteri sayısı arttıkça AI API maliyetleri geliri aşabilir.

**Azaltma:** Batch processing ile gerçek zamanlı yerine günlük toplu analiz. Basit görevler (duygu sınıflandırma) için daha ucuz modeller (Haiku). Tekrar eden kalıplar için rule-based fallback. Prompt caching aktif tutma. Her ay müşteri başına AI maliyetini izleme ve alarm eşiği koyma.


---

## 15. Başarı Metrikleri ve KPI'lar

### 15.1 Ürün Metrikleri

| Metrik | Hedef (Ay 6) |
|---|---|
| Günlük aktif kullanıcı oranı (DAU/MAU) | >%40 |
| AI önerisi kabul oranı | >%50 |
| Ortalama cevap süresi kısalması | >%30 |
| İade oranı düşüşü (müşteri bazlı) | >%10 |
| Onboarding tamamlanma süresi | <48 saat |

### 15.2 İş Metrikleri

| Metrik | Hedef (Ay 6) |
|---|---|
| Ödeme yapan müşteri sayısı | 15–25 |
| Aylık tekrarlayan gelir (MRR) | 37.500–62.500 TL |
| Müşteri tutma oranı (3 aylık) | >%80 |
| Net Promoter Score (NPS) | >40 |
| Müşteri edinme maliyeti (CAC) | <1 aylık abonelik tutarı |

### 15.3 Hipotez Doğrulama Kontrol Listesi

Aşağıdaki hipotezlerin her biri, 3 ay içinde ödeme yapan müşterilerden alınan veri ile doğrulanmalı veya çürütülmelidir:

- [ ] Kadın giyim satıcıları günlük yorum/mesaj yönetimine en az 1–2 saat harcıyor.
- [ ] AI yorum sınıflandırması satıcının kendi sınıflandırmasından anlamlı ölçüde daha hızlı ve doğru.
- [ ] İade kalıp raporları satıcının daha önce göremediği örüntüleri ortaya koyuyor.
- [ ] Satıcılar aylık 1.500–3.500 TL ödeme kapasitesine ve niyetine sahip.
- [ ] İlk değer algısı 48 saat içinde oluşuyor.
- [ ] Pazaryeri API'lerinden yeterli veri çekilebiliyor (veya CSV alternatifi kabul ediliyor).


---

## 16. Kill / Pivot Kriterleri ve Karar Çerçevesi

Bu bölüm, projenin devam edip etmeyeceğine dair duygusal değil, veri bazlı kararlar alınmasını sağlar. "Mükemmel ürün" peşinde koşmak yerine, belirli sinyallere göre devam etme, döndürme veya durdurma kararı verilir.

### 16.1 Ay 3 Kontrol Noktası: "Devam mı, Pivot mi?"

| Sinyal | Yeşil (Devam) | Sarı (Düzelt) | Kırmızı (Pivot/Durdur) |
|---|---|---|---|
| Ödeme yapan müşteri | ≥3 aktif | 1–2 aktif | 0 |
| Keşif görüşmesi → ödeme dönüşümü | >%15 (15 görüşmeden 3+) | %5–15 | <%5 (20+ görüşme, 0 ödeme) |
| Müşteri tutma (2. aya geçiş) | ≥%80 | %50–80 | <%50 |
| "Bunu olmadan yapamam" geri bildirimi | ≥2 müşteri bunu söyledi | 1 müşteri | 0 |
| AI çıktı kalitesi memnuniyeti | ≥%70 öneri kabul oranı | %40–70 | <%40 |

**Kırmızı senaryoda ne yapılır:**

Eğer ay 3 sonunda 20+ keşif görüşmesi yapılmış ama 0 ödeme yapan müşteri varsa, sorunun nerede olduğu sistematik olarak analiz edilir:

- **"Sorun yok ama para vermem" diyorlarsa:** Fiyat çok yüksek → ücretsiz/freemium modeli dene veya fiyatı %50 düşür. Hâlâ yok → ödeme istekliliği (WTP) bu segmentte yetersiz; alternatif kol'a (bölüm 17) dön.
- **"Sorunumu çözmüyor" diyorlarsa:** Yanlış sorunu çözüyoruz → keşif görüşmelerine geri dön, en sık tekrarlanan acı noktasını yeniden belirle ve MVP'yi pivot et.
- **"İlginç ama şimdi değil" diyorlarsa:** Zamanlama veya dağıtım kanalı sorunu → farklı bir segment veya kanal dene (örn: kadın giyim yerine elektronik aksesuar, veya direkt satış yerine e-ticaret danışmanları üzerinden dolaylı satış).
- **Hiç görüşme bile yapılamıyorsa:** Erişim sorunu → go-to-market stratejisini değiştir; WhatsApp grupları yerine Trendyol satıcı etkinliklerine katıl veya mevcut bir e-ticaret topluluğuyla ortaklık kur.

### 16.2 Ay 6 Kontrol Noktası: "Ölçeklenebilir mi?"

| Sinyal | Yeşil (Ölçekle) | Sarı (Optimize et) | Kırmızı (Model değiştir) |
|---|---|---|---|
| Aktif müşteri sayısı | ≥15 | 8–14 | <8 |
| Aylık churn (iptal oranı) | <%10 | %10–20 | >%20 |
| Organik büyüme (referans oranı) | Her 3 müşteriden 1'i referans getiriyor | Arada referans geliyor | Referans yok; tüm büyüme aktif satış |
| Müşteri başına AI maliyeti | Gelirin <%30'u | %30–50 | >%50 (kârsız) |
| Onboarding süresi | <2 gün (standart) | 2–7 gün | >1 hafta (ölçeklenemiyor) |

### 16.3 Ay 12 Kontrol Noktası: "SaaS'a Geçiş Hazır mı?"

Self-servis SaaS'a geçiş ancak şu koşullar sağlandığında yapılır: müşteri onboarding'i insan müdahalesi olmadan tamamlanabiliyor, AI çıktı kalitesi %70+ kabul oranı koruyor, churn %10'un altında stabil, ve aylık net kâr kurucu + 1 tam zamanlı çalışan maaşını karşılıyor.

Bu koşullar sağlanmıyorsa SaaS'a geçiş ertelenir ve hizmet modeli sürdürülür — hizmet modeli kârlı olduğu sürece SaaS'a geçmek zorunlu değildir.


---

## 17. Alternatif Kollar ve Pivot Karar Çerçevesi

### 17.1 Kol A: Hizmet İşletmeleri İçin Randevu ve Müşteri Takip Ajanı

Güzellik merkezleri, klinikler, kurslar, emlakçılar, diyetisyenler, spor salonları gibi hizmet işletmelerine WhatsApp ve Instagram üzerinden randevu yönetimi, SSS cevaplaması, kaçan müşteri hatırlatması sunan AI ajanı. Gartner'ın 2026 trendlerine göre müşteri hizmetleri liderlerinin %91'i AI uygulama baskısı altındadır — destek otomasyonu net talep gören bir alan.

### 17.2 Kol B: Pazarlama Otomasyon Mikro-Ajansı

Küçük işletmelere haftalık içerik planı, reklam metni, ürün görsel brief'i, kampanya takvimi ve e-posta/WhatsApp pazarlama metni üreten AI destekli servis. Alan kalabalıktır; farklılaşma yolu dikeyleşmektir ("sadece restoranlara", "sadece butiklere", "sadece diş kliniklerine" gibi).

### 17.3 Kol C: AI "Temizlik ve Düzenleme" Danışmanlığı

Birçok işletme 5 farklı AI aracı almış ama hiçbiri düzgün çalışmamaktadır. CRM, WhatsApp, e-posta, Google Sheets, fatura ve teklif akışını AI ile sadeleştiren, araçları birbirine bağlayan ve gereksiz olanları eleyen bir danışmanlık hizmeti. Yazılım ürünü olmadan hızlı gelir için güçlü bir giriş kapısıdır.

### 17.4 Pivot Karar Matrisi: "Hangi Koşulda Hangi Kola?"

| Gözlem | Ana yol (e-ticaret) devam mı? | Pivot kolu | Sinyal |
|---|---|---|---|
| Satıcılar para veriyor ama API erişimi çözülemedi | Evet, Plan B/C ile devam | — | Teknik sorun, talep var |
| Satıcılar "sorunum var" diyor ama para vermiyor | ❌ Hayır | Kol C (danışmanlık) | WTP sorunu; danışmanlık modeli daha kolay satılır |
| Satıcılara erişmekte zorlanıyorum | Evet, kanal değiştir | — | GTM sorunu; farklı topluluk/etkinlik dene |
| İlk 3 müşteri memnun ama büyüme çok yavaş | Evet, ama nişi genişlet | Kol A'yı paralel test et | Pazar küçük veya doymuş olabilir |
| Keşif görüşmelerinde hizmet işletmeleri daha heyecanlı | ❌ Pivot | Kol A (randevu ajanı) | Talep sinyali farklı segmentten geliyor |
| Hızlı nakde ihtiyaç var, ürün henüz hazır değil | Paralel yürüt | Kol C (danışmanlık) | Danışmanlık geliri ile ürün geliştirmeyi finanse et |
| Pazarlama ajanslarından teklif geliyor | Paralel yürüt | Kol B (mikro ajans) | Fırsatçı gelir; ürünleşmesi zor |

### 17.5 Önemli Kural: Aynı Anda En Fazla 2 Kol

Tek kişi (veya küçük ekip) olarak aynı anda 3+ kolu yürütmek tükenme ve odak kaybı demektir. Kurallar:

- Ana kol (e-ticaret) her zaman birincil kalır, yeterli sinyal varsa.
- Paralel kol yalnızca ana kolun gelir üretmesi 3+ ay sürecekse, kısa vadeli nakit akışı için açılır.
- Bir koldan çıkmak da bir karardır ve veri ile desteklenmelidir — "bu kol çalışmıyor" demek için en az 10 görüşme + 1 ay deney gerekir.


---

## 18. Yol Haritası Özeti

```
AY 1–2     │  Keşif görüşmeleri, MVP geliştirme, ilk 3 müşteriye elle kurulum
           │  Teknoloji: FastAPI + Supabase + n8n, temel dashboard
           │  Karar noktası: 15+ görüşme yapıldı mı? İlgi sinyali var mı?
           │
AY 3–4     │  ★ AY 3 KONTROL NOKTASI ★
           │  İlk müşteri geri bildirimiyle iterasyon
           │  Yorum sınıflandırma ve iade analiz modülleri olgunlaşır
           │  Paketlenmiş teklif hazırlanır, fiyatlandırma test edilir
           │  Kill/pivot kararı: Bölüm 16.1 kriterlerine bak
           │
AY 5–6     │  ★ AY 6 KONTROL NOKTASI ★
           │  10–20 müşteriye büyüme, onboarding otomasyonu
           │  Ürün açıklama ve kampanya radarı modülleri eklenir
           │  Case study ve referans bazlı pazarlama başlar
           │  Ölçeklenebilirlik kararı: Bölüm 16.2 kriterlerine bak
           │
AY 7–9     │  Self-servis SaaS altyapısı kurulur (eğer yeşil sinyal)
           │  WhatsApp Business entegrasyonu (beta)
           │  İkincil niş (elektronik aksesuar) test edilir
           │
AY 10–12   │  ★ AY 12 KONTROL NOKTASI ★
           │  50–100 müşteri hedefi
           │  Çok kanallı senkronizasyon (v1)
           │  Partnership kanalları aktif edilir
           │  İlk tam zamanlı işe alım değerlendirilir
           │  SaaS geçiş kararı: Bölüm 16.3 kriterlerine bak
```


---

## 19. Gelir Hedefleri (Güncellenmiş)

| Dönem | Müşteri Sayısı | Tahmini MRR | AI Maliyeti | Brüt Kâr | Kümülatif Net |
|---|---|---|---|---|---|
| Ay 3 sonu | 3–5 | 7.500–12.500 TL | ~2.500 TL | ~5.000–10.000 TL | -30.000 TL (yatırım) |
| Ay 6 sonu | 15–25 | 37.500–62.500 TL | ~10.000 TL | ~25.000–50.000 TL | +20.000 TL |
| Ay 9 sonu | 30–50 | 75.000–125.000 TL | ~18.000 TL | ~55.000–100.000 TL | +150.000 TL |
| Ay 12 sonu | 50–100 | 125.000–250.000 TL | ~30.000 TL | ~90.000–210.000 TL | +500.000 TL |

Not: Kümülatif net rakamları, aylık 15.000 TL sabit maliyet (kurucu yaşam gideri, araçlar, hosting) ve ay 9'dan itibaren 12.000 TL ek çalışan maliyeti varsayar. Bu hedefler muhafazakârdır; amacı büyük gelir değil, sürdürülebilir büyüme altyapısı kurmaktır.


---

## 20. Sonuç

SatıcıPilot'un stratejik tezi şudur: **AI uygulaması yapmak değil, küçük işletmenin dağınık operasyonunu AI ile toparlamak.** Türkiye'de 634.000'den fazla e-ticaret işletmesinin dörtte üçü şahıs işletmesi, çoğunluğu 1–5 kişilik ekiplerle çalışıyor. Bu satıcılara "AI kullanın" demek yetersizdir; onlara kurulmuş, çalışan, her gün değer üreten bir sistem sunmak gerekir.

Mevcut Türk e-ticaret araçları (Dopigo, İkas, Ticimax) operasyonel altyapıyı iyi çözmüş durumdadır. SatıcıPilot bu altyapının üstüne oturan **"zekâ katmanı"** olarak konumlanır — rekabet değil, tamamlayıcılık. Rakip boşluk analizinin gösterdiği gibi, AI tabanlı yorum sınıflandırma, iade kalıp tespiti ve proaktif öneri motoru bu ekosistemde henüz kimsenin doldurmadığı bir alandır.

Küresel trendler bu yaklaşımı desteklemektedir: Gartner'ın öngördüğü 2,52 trilyon dolarlık AI harcaması içinde en hızlı büyüyen segment görev odaklı AI ajanlarıdır. McKinsey verilerine göre kuruluşların büyük çoğunluğu pilot aşamasından çıkamamaktadır — bu da "küçük, uygulanabilir, iş akışına gömülü" çözümler için sistematik bir fırsat yaratmaktadır.

Birim ekonomisi göstermektedir ki, 15 Profesyonel paket müşterisi ile başabaş noktasına, 30 müşteri ile anlamlı kârlılığa ulaşmak mümkündür. LTV:CAC oranı topluluk bazlı büyüme ile 8:1'in üzerinde tutulabilir.

En önemlisi, bu plan "mükemmel ürün" peşinde koşmaz. Net kontrol noktaları (ay 3, 6, 12), kill/pivot kriterleri ve alternatif kol haritası ile her aşamada veri bazlı kararlar alınır. İlk amaç ödeyen müşteriyle öğrenmektir.

SatıcıPilot, hizmet + teknoloji hibrit modeli ile bu fırsatı yakalamayı hedefler: erken gelir, düşük başlangıç maliyeti, hızlı geri bildirim döngüsü ve sürdürülebilir SaaS'a geçiş yolu. Hem hızlı gelir vardır, hem ürünleşme şansı vardır, hem de tek kişi Claude Code + ChatGPT + Antigravity üçlüsüyle ciddi yol alabilir.

---

*Bu doküman yaşayan bir belgedir. Her müşteri görüşmesi, her metrik güncellemesi ve her pazar değişikliği ile revize edilmelidir. Versiyon 2.0 — tüm kontrol noktaları ve karar çerçeveleri eklenmiştir.*
