import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // ── Admin routes ──
  const isAdminLogin = pathname === "/admin/login";
  const isAdminApiAuth = pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const isAdminApiRoute = pathname.startsWith("/api/admin/") && !isAdminApiAuth;

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
        const redirectRes = NextResponse.redirect(url);
        redirectRes.cookies.set("admin-session", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
        return redirectRes;
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return supabaseResponse;
  }

  // If already authenticated as admin, visiting /admin/login redirects to /admin
  if (isAdminLogin) {
    const sessionCookie = request.cookies.get("admin-session")?.value;
    if (sessionCookie) {
      const valid = await verifyAdminSession(sessionCookie);
      if (valid) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }
    return supabaseResponse;
  }

  // ── Non-admin routes: Supabase auth ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
  });

  let user = null;
  try {
    const { data: authData, error } = await supabase.auth.getUser();
    if (!error && authData?.user) {
      user = authData.user;
    }
  } catch {
    user = null;
  }

  // Helper to copy cookies on redirect
  const createRedirectResponse = (url: URL) => {
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  };

  // Auth callback route must run without interference
  if (pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  // Login page: redirect logged-in users away
  if (pathname === "/login") {
    if (user) {
      const next = request.nextUrl.searchParams.get("redirect") || "/home";
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/home";
      const url = request.nextUrl.clone();
      url.pathname = safeNext;
      url.search = "";
      return createRedirectResponse(url);
    }
    return supabaseResponse;
  }

  // Check public routes
  const isExplicitPublic = [
    "/",
    "/home",
    "/explore",
    "/trending",
    "/search",
    "/writers",
    "/prompts",
    "/robots.txt",
    "/sitemap.xml",
  ].some((r) => pathname === r);

  const isPublicPrefix =
    pathname.startsWith("/prompts/") ||
    (pathname.startsWith("/poem/") &&
      !pathname.endsWith("/edit") &&
      !pathname.endsWith("/respond") &&
      !pathname.endsWith("/canvas")) ||
    (pathname.startsWith("/profile/") &&
      pathname !== "/profile/setup" &&
      pathname !== "/profile");

  const isPublic = isExplicitPublic || isPublicPrefix;

  // Unauthenticated users attempting to access protected routes go to login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return createRedirectResponse(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js|txt|xml|json)$).*)",
  ],
};
