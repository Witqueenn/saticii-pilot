import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { slug, rating, comment, email, wants_newsletter, product_ref } = await req.json();

  if (!slug || !rating) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const { data: form } = await supabase
    .from("customer_forms")
    .select("id, seller_id, is_active")
    .eq("slug", slug)
    .single();

  if (!form || !form.is_active) {
    return NextResponse.json({ error: "Form bulunamadı" }, { status: 404 });
  }

  const { error } = await supabase.from("form_responses").insert({
    seller_id: form.seller_id,
    form_id: form.id,
    product_ref: product_ref ?? null,
    rating,
    comment: comment ?? null,
    email: email ?? null,
    wants_newsletter: !!wants_newsletter,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
