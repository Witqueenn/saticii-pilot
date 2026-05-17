import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/giris") || pathname.startsWith("/kayit");
  const isAdminPage = pathname.startsWith("/admin");
  const isPublic = pathname === "/" || isAuthPage || pathname.startsWith("/auth") || pathname === "/sifre-sifirla";
  const isProtected = !isPublic;

  // Giriş yapmamış → /giris
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    return NextResponse.redirect(url);
  }

  // Giriş yapmış → auth sayfalarına erişemez
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/genel";
    return NextResponse.redirect(url);
  }

  // Admin sayfası kontrolü
  if (user && isAdminPage) {
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!adminCheck) {
      const url = request.nextUrl.clone();
      url.pathname = "/genel";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
