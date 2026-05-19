# SatıcıPilot

Türk KOBİ e-ticaret satıcıları için AI destekli operasyon asistanı. Trendyol, Hepsiburada ve N11'deki yorum yönetimi, iade takibi, sipariş analizi ve kampanya otomasyonunu tek panelden sunar.

---

## Mimari

```
saticipilot/
├── frontend/        Next.js 15 — web dashboard + admin panel + landing
├── backend/         FastAPI — Trendyol entegrasyon API'si, AI iş mantığı, Celery görevleri
└── mobile/          Expo (React Native) — satıcı mobil uygulaması (iOS + Android)
```

Ortak veritabanı: **Supabase** (PostgreSQL + Auth + RLS)

---

## Ön Koşullar

| Araç | Versiyon |
|------|---------|
| Node.js | ≥ 20 |
| Python | ≥ 3.11 |
| pnpm / npm | herhangi |
| Expo CLI | `npx expo` |
| Supabase CLI (opsiyonel) | `brew install supabase/tap/supabase` |

---

## Hızlı Başlangıç

### 1. Supabase Kurulumu

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluştur
2. `supabase/` klasöründeki `.sql` dosyalarını sırayla çalıştır:
   ```
   schema.sql → leads_seed.sql → leads_seed_2.sql → ... → leads_seed_10.sql
   ```
3. Authentication → Settings → "Enable Email Signups" aktif olsun
4. Settings → API → **JWT Secret**'ı kopyala (backend için gerekli)

### 2. Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
# .env.local dosyasını düzenle (Supabase URL + keys)
npm install
npm run dev
# http://localhost:3000
```

### 3. Backend (FastAPI)

```bash
cd backend
cp ../.env.example .env
# .env dosyasını düzenle
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# http://localhost:8000/docs — Swagger UI
```

### 4. Mobile (Expo)

```bash
cd mobile
cp .env.example .env
# .env dosyasını düzenle
npm install
npx expo start
# iOS Simulator veya Android Emulator için a/i tuşu
```

---

## Ortam Değişkenleri

### Frontend (`frontend/.env.local`)

| Değişken | Açıklama |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **asla client'a açma** |
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL'i (ör. `http://localhost:8000/api/v1`) |
| `OPENAI_API_KEY` | GPT-4o-mini — yorum analizi ve AI yanıt üretimi |
| `ANTHROPIC_API_KEY` | Claude — alternatif AI modeli |
| `CREDENTIAL_ENCRYPTION_KEY` | 32-byte hex key — platform credential şifreleme (ör. `openssl rand -hex 32`) |
| `RESEND_API_KEY` | E-posta gönderimi |
| `ADMIN_SECRET` | Admin panel erişim şifresi |

### Backend (`backend/.env`)

| Değişken | Açıklama |
|----------|---------|
| `SUPABASE_URL` | Supabase proje URL'i |
| `SUPABASE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret (Settings → API) — token doğrulama |
| `DATABASE_URL` | PostgreSQL bağlantı string'i (Supabase Connection Pooling) |
| `REDIS_URL` | Celery görev kuyruğu (ör. `redis://localhost:6379/0`) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `SECRET_KEY` | FastAPI session imzalama anahtarı |
| `TRENDYOL_API_URL` | `https://api.trendyol.com/sapigw` |

### Mobile (`mobile/.env`)

| Değişken | Açıklama |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_API_URL` | Frontend Next.js URL'i — şifreli credential yazma için (ör. `http://localhost:3000`) |

---

## API Referansı

### FastAPI Backend (`/api/v1/`)

Tüm endpoint'ler `Authorization: Bearer <supabase_access_token>` header'ı gerektirir.

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| GET | `/reviews/` | Satıcıya ait yorumları listele |
| POST | `/reviews/{id}/analyze` | Tek yorumu AI ile analiz et |
| PATCH | `/reviews/{id}/reply` | Yorumu yanıtlandı işaretle |
| GET | `/reviews/daily-summary` | Günlük yorum özeti |
| GET | `/returns/` | İadeleri listele |
| GET | `/returns/report` | İade raporu |
| GET | `/products/` | Ürünleri listele |
| POST | `/products/{id}/analyze` | Ürün açıklamasını AI ile analiz et |

### Next.js API Routes (`/api/`)

| Method | Endpoint | Açıklama |
|--------|----------|---------|
| POST | `/api/reviews/import` | CSV'den yorum toplu yükle (AI sınıflandırma) |
| POST | `/api/returns/import` | CSV'den iade toplu yükle (AI sınıflandırma) |
| POST | `/api/ai/draft-reply` | AI yorum yanıtı üret |
| POST | `/api/credentials` | Platform credential'ı şifreli kaydet |
| DELETE | `/api/credentials` | Platform credential'ı sil |
| POST | `/api/forms/submit` | Müşteri formu gönder |
| POST | `/api/notify` | Push notification gönder |

---

## Güvenlik

- **RLS**: Tüm Supabase tablolarında `auth.uid() = seller_id` politikası aktif
- **Auth**: FastAPI endpoint'leri Supabase JWT token doğrular (query param değil, Bearer header)
- **Credential Encryption**: Trendyol/HB API key ve secret'ları AES-256-GCM ile sunucu tarafında şifrelenir
- **Service Role**: Sadece Next.js API route'larında ve backend'de kullanılır, hiçbir zaman client'a gönderilmez

---

## Veritabanı Şeması (özet)

```
sellers          — kullanıcı profili, plan, referral
reviews          — yorumlar (sentiment, is_urgent, is_replied, suggested_reply)
returns          — iadeler (reason enum, customer_comment)
products         — ürünler (description_score, seo_score)
campaigns        — kampanyalar
messages         — müşteri mesajları
marketplace_credentials — platform bağlantıları (şifreli api_key/secret)
leads            — BD pipeline
form_responses   — müşteri geri bildirim formları
```

---

## Deployment

| Servis | Platform |
|--------|---------|
| Frontend | Vercel (otomatik, `frontend/` root) |
| Backend | Railway / Render / Docker |
| Mobile | Expo EAS Build → App Store / Play Store |
| Database | Supabase (managed) |

```bash
# Frontend deploy
cd frontend && vercel --prod

# Backend Docker
cd backend && docker build -t saticipilot-api . && docker run -p 8000:8000 saticipilot-api
```

---

## Geliştirme Notları

- Mobile `.env` değişkenleri `EXPO_PUBLIC_` prefix'i gerektiriyor
- Supabase anon key client'a açılabilir (RLS korur), service role key asla
- AI özellikler (yorum analizi, yanıt önerisi) OpenAI API olmadan çalışmaz; key yoksa graceful fallback yok
- `leads_seed_all.sql` tüm lead seed'lerini birleştirir, development'ta kullanabilirsin
