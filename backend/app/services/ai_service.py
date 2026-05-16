import anthropic
from app.core.config import settings
from app.models.review import ReviewAnalysis, Sentiment
from app.models.product import ProductDescriptionAnalysis


client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

REVIEW_SYSTEM_PROMPT = """Sen Türk e-ticaret satıcılarına yardım eden bir AI asistanısın.
Müşteri yorumlarını analiz ederek satıcıya pratik, kısa ve nazik öneriler sunarsın.
Yanıtların her zaman Türkçe olmalıdır."""

DESCRIPTION_SYSTEM_PROMPT = """Sen Türk e-ticaret ürün açıklamalarını optimize eden bir uzman AI asistanısın.
Trendyol/Hepsiburada/N11 platformları için SEO uyumlu, dönüşüm odaklı açıklamalar yazarsın.
Yanıtların her zaman Türkçe olmalıdır."""


def analyze_review(comment: str, rating: int, product_name: str) -> ReviewAnalysis:
    prompt = f"""Aşağıdaki müşteri yorumunu analiz et:

Ürün: {product_name}
Puan: {rating}/5
Yorum: {comment}

Şu bilgileri JSON formatında döndür:
- sentiment: "olumlu", "notr", "olumsuz" veya "acil" (acil: hemen müdahale gerektirir)
- is_urgent: true/false
- summary: 1 cümle özet
- suggested_reply: satıcı adına nazik, kısa Türkçe cevap taslağı
- keywords: önemli anahtar kelimeler listesi"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=REVIEW_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    raw = message.content[0].text
    # JSON bloğunu çıkar
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    data = json.loads(raw)
    return ReviewAnalysis(
        sentiment=Sentiment(data["sentiment"]),
        is_urgent=data["is_urgent"],
        summary=data["summary"],
        suggested_reply=data["suggested_reply"],
        keywords=data.get("keywords", []),
    )


def analyze_product_description(
    product_name: str,
    category: str,
    current_description: str,
) -> ProductDescriptionAnalysis:
    prompt = f"""Aşağıdaki ürün açıklamasını analiz et ve iyileştir:

Ürün Adı: {product_name}
Kategori: {category}
Mevcut Açıklama: {current_description or "(boş)"}

Şu bilgileri JSON formatında döndür:
- description_score: 0-100 arası puan (mevcut açıklamanın kalitesi)
- seo_score: 0-100 arası SEO puanı
- missing_fields: eksik bilgiler listesi (örn: ["ölçü tablosu", "kumaş içeriği"])
- suggestions: iyileştirme önerileri listesi (max 3)
- improved_description: iyileştirilmiş açıklama taslağı"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=DESCRIPTION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    raw = message.content[0].text
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    data = json.loads(raw)
    return ProductDescriptionAnalysis(**data)
