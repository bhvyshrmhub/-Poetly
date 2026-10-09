import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/home";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/home";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const errorMessage = errorDescription || error;
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", errorMessage);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
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

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data.session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, bio, website, location")
        .eq("id", data.session.user.id)
        .maybeSingle();

      // Check if user was just created within the last 2 minutes and hasn't customized profile
      const createdAt = new Date(data.session.user.created_at || "").getTime();
      const isNewUser = !isNaN(createdAt) && Date.now() - createdAt < 120000;
      const needsSetup = !profile || (isNewUser && !profile.bio && !profile.website && !profile.location);

      const redirectUrl = new URL(needsSetup ? "/profile/setup" : next, origin);

      const response = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    }

    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set("error", "Authentication failed");
    return NextResponse.redirect(errorUrl);
  }

  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "No authorization code received");
  return NextResponse.redirect(errorUrl);
}
