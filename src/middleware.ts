import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function base64urlDecode(data: string): string {
  let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString();
}

async function verifyAdminSession(cookieValue: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [dataB64, sigHex] = parts;
  const data = base64urlDecode(dataB64);

  // Check expiration
  const colonIdx = data.lastIndexOf(":");
  if (colonIdx === -1) return false;
  const expires = parseInt(data.substring(colonIdx + 1), 10);
  if (isNaN(expires) || Math.floor(Date.now() / 1000) > expires) return false;

  // Verify HMAC signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = new Uint8Array(
    sigHex.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );

  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;

  // ── Admin routes (excluding /admin/login and /api/admin/*) ──
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApiRoute = pathname.startsWith("/api/admin/");

  if (isAdminRoute || isAdminApiRoute) {
    const sessionCookie = request.cookies.get("admin-session")?.value;

    if (!sessionCookie) {
      if (isAdminRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const valid = await verifyAdminSession(sessionCookie);
    if (!valid) {
      if (isAdminRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        // Clear invalid cookie
        supabaseResponse.cookies.set("admin-session", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Valid admin session — continue
    return supabaseResponse;
  }

  // ── Non-admin routes: Supabase auth (for normal Poetly users) ──
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicRoutes = ["/", "/home", "/trending", "/search", "/explore", "/writers", "/prompts"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/login";

  if (!user && !isPublicRoute && !isAuthRoute && !pathname.startsWith("/poem/") && !pathname.startsWith("/profile/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
