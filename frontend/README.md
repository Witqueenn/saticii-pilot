# SatıcıPilot — Web Dashboard

Next.js 15 tabanlı web dashboard. Türk KOBİ e-ticaret satıcıları için Trendyol, Hepsiburada ve N11 operasyonlarını tek ekrandan yönetir.

## Kurulum

```bash
cd frontend
npm install
cp .env.local.example .env.local   # değerleri doldur
npm run dev                         # http://localhost:3000
```

## Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — yalnızca API route'lar kullanır, client'a asla verilmez |
| `CREDENTIAL_ENCRYPTION_KEY` | 64 karakter hex — marketplace API kimlik bilgilerini AES-256-GCM ile şifreler |
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (varsayılan: `http://localhost:8000/api/v1`) |

Şifreleme anahtarı üretmek için: `openssl rand -hex 32`

## Klasör Yapısı

```
src/app/
├── (auth)/              # Giriş, kayıt, şifre sıfırlama
├── (dashboard)/         # Satıcı paneli (RLS korumalı)
│   ├── genel/           # Dashboard — KPI kartları, son aktivite
│   ├── yorumlar/        # Müşteri yorum yönetimi & AI yanıt taslağı
│   ├── iadeler/         # İade kalıp analizi
│   ├── urunler/         # Ürün açıklama & SEO puanlama
│   ├── musteri/         # Müşteri mesajları
│   ├── rakip/           # Rakip fiyat takibi
│   ├── pazarlama/       # Kampanya yönetimi
│   ├── baglanti/        # Marketplace API bağlantıları
│   └── ayarlar/         # Hesap ayarları
├── admin/               # İç admin paneli (ayrı auth)
│   ├── leads/           # BD / CRM kanban
│   ├── saticilar/       # Satıcı yönetimi
│   ├── gelir/           # MRR & gelir takibi
│   └── loglar/          # Sistem logları
├── api/
│   └── credentials/     # POST/DELETE — credential şifreleme proxy'si
├── blog/                # SEO blog yazıları
├── fiyatlar/            # Fiyatlandırma sayfası
└── beta/                # Beta başvuru formu
```

## Kimlik Doğrulama

- Supabase Auth (e-posta/şifre)
- Dashboard route'ları `middleware.ts` ile korunur — oturum yoksa `/auth/giris`'e yönlendirir
- Admin route'ları ayrı `ADMIN_SECRET` kontrolüyle korunur
- Marketplace API kimlik bilgileri `/api/credentials` üzerinden AES-256-GCM ile şifrelenerek saklanır; client asla doğrudan yazmaz

## Deployment

Vercel üzerinden deploy edilir. Root `vercel.json` güvenlik başlıklarını (HSTS, CSP, X-Frame-Options) otomatik ekler.

```bash
vercel --prod
```
