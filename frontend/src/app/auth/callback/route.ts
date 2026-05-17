import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    // Yedek: trigger çalışmamışsa sellers satırı oluştur
    if (user) {
      const serviceSupabase = createSupabase(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await serviceSupabase.from("sellers").upsert({
        id: user.id,
        email: user.email,
        shop_name: user.user_metadata?.shop_name ?? "Mağazam",
        plan: "temel",
        is_active: true,
        onboarding_done: false,
      }, { onConflict: "id", ignoreDuplicates: true });
    }
  }

  return NextResponse.redirect(`${origin}/genel`);
}
