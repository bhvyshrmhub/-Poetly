import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/", "/home", "/trending", "/search", "/explore", "/writers", "/prompts"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = pathname.startsWith("/auth") || pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin");

  // Diagnostic logging (safe — no tokens or secrets logged)
  if (isAdminRoute) {
    const cookieNames = request.cookies.getAll().map((c) => c.name);
    const supabaseCookieNames = cookieNames.filter((n) => n.startsWith("sb-") || n.startsWith("supabase"));
    console.log(`[MIDDLEWARE] ${pathname}`);
    console.log(`[MIDDLEWARE] totalCookies=${cookieNames.length}, supabaseCookies=${supabaseCookieNames.length} names=[${supabaseCookieNames.join(",")}]`);
    console.log(`[MIDDLEWARE] getUser error=${getUserError ? getUserError.message : "none"}`);
    console.log(`[MIDDLEWARE] user=${user ? user.id : "null"}`);
  }

  // Block unauthenticated access to protected routes (including /admin)
  if (!user && !isPublicRoute && !isAuthRoute && !pathname.startsWith("/poem/") && !pathname.startsWith("/profile/")) {
    if (isAdminRoute) {
      console.log(`[MIDDLEWARE] REDIRECT → /login (no session)`);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users on auth routes → home
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Admin route authorization check
  if (isAdminRoute && user) {
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError) {
      console.log(`[MIDDLEWARE] admin_users error: ${adminError.message} code=${adminError.code}`);
    }

    if (!adminRecord) {
      console.log(`[MIDDLEWARE] REDIRECT → /home (not admin)`);
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    console.log(`[MIDDLEWARE] ADMIN OK user=${user.id}`);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
