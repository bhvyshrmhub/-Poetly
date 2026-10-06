import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

// Bounded fetch to ensure Supabase calls never hang or exceed Edge limits
const fetchWithTimeout = (url: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  if (init?.signal) {
    init.signal.addEventListener("abort", () => controller.abort());
  }

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── 1. Admin routes (pure Web Crypto HMAC, zero Supabase involvement) ──
  const isAdminLogin = pathname === "/admin/login";
  const isAdminApiAuth = pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const isAdminApiRoute = pathname.startsWith("/api/admin/") && !isAdminApiAuth;

  if (isAdminRoute || isAdminApiRoute) {
    const sessionCookie = request.cookies.get("admin-session")?.value;

    if (!sessionCookie) {
      if (isAdminRoute) {
        const url = new URL("/admin/login", request.url);
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const valid = await verifyAdminSession(sessionCookie);
    if (!valid) {
      if (isAdminRoute) {
        const url = new URL("/admin/login", request.url);
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

    return NextResponse.next({ request });
  }

  // If already authenticated as admin, visiting /admin/login redirects to /admin
  if (isAdminLogin) {
    const sessionCookie = request.cookies.get("admin-session")?.value;
    if (sessionCookie) {
      const valid = await verifyAdminSession(sessionCookie);
      if (valid) {
        const url = new URL("/admin", request.url);
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next({ request });
  }

  // ── 2. Auth callback route (must run without interference to exchange OAuth code) ──
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  // ── 3. Route classification ──
  const isProtected =
    pathname.startsWith("/write") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/saved") ||
    pathname.startsWith("/library") ||
    pathname === "/profile" ||
    pathname === "/profile/setup" ||
    (pathname.startsWith("/poem/") && (
      pathname.endsWith("/edit") ||
      pathname.endsWith("/respond") ||
      pathname.endsWith("/canvas")
    ));

  // ── 4. Supabase auth cookie check (zero-cost in-memory scan) ──
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) =>
      (c.name.startsWith("sb-") && (c.name.includes("auth-token") || c.name.includes("token"))) ||
      c.name.includes("supabase")
  );

  // ── 5. FAST PATH: No auth cookies present ──
  if (!hasAuthCookie) {
    // Unauthenticated user attempting to access protected route -> instant redirect to login
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // Public route & no session -> return immediately without any network call
    return NextResponse.next({ request });
  }

  // ── 6. SLOW PATH: Auth cookie is present ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  // Root path "/" redirects immediately to "/home" in page.tsx; avoid redundant Supabase call
  if (pathname === "/") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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
    global: {
      fetch: fetchWithTimeout,
    },
  });

  let user = null;
  try {
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase auth timeout")), 2500)
    );

    const result = await Promise.race([getUserPromise, timeoutPromise]);
    if (!result.error && result.data?.user) {
      user = result.data.user;
    }
  } catch {
    user = null;
  }

  // Helper to copy response cookies on redirect
  const createRedirectResponse = (url: URL) => {
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  };

  // Login page: redirect already-authenticated users away
  if (pathname === "/login") {
    if (user) {
      const next = request.nextUrl.searchParams.get("redirect") || "/home";
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/home";
      const targetUrl = new URL(safeNext, request.url);
      return createRedirectResponse(targetUrl);
    }
    return supabaseResponse;
  }

  // Unauthenticated users attempting to access protected routes go to login
  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return createRedirectResponse(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js|txt|xml|json)$).*)",
  ],
};
