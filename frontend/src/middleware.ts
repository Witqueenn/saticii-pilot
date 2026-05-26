import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function buildCsp(_nonce: string): string {
  return [
    "default-src 'self'",
    // 'unsafe-inline' required for Next.js inline bootstrap scripts
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  // x-nonce is read by Next.js to nonce its own bootstrap scripts,
  // and by our server components for any inline <script> tags.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
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
  const isPublic =
    pathname === "/" ||
    isAuthPage ||
    pathname.startsWith("/auth") ||
    pathname === "/sifre-sifirla" ||
    pathname === "/sifremi-unuttum" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/blog");
  const isProtected = !isPublic;

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("Content-Security-Policy", csp);
    return redirect;
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/genel";
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("Content-Security-Policy", csp);
    return redirect;
  }

  if (user && isAdminPage) {
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!adminCheck) {
      const url = request.nextUrl.clone();
      url.pathname = "/genel";
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("Content-Security-Policy", csp);
      return redirect;
    }
  }

  supabaseResponse.headers.set("Content-Security-Policy", csp);
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
