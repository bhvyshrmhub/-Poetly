import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    const errorMessage = errorDescription || error;
    const errorUrl = origin + `/login?error=${encodeURIComponent(errorMessage)}`;
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
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
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data.session) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.session.user.id)
        .single();

      const response = NextResponse.redirect(origin + (profile ? next : "/profile/setup"));

      // Set auth cookies
      response.cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: true,
      });
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: true,
      });

      return response;
    }
  }

  // Return to login with error if something went wrong
  return NextResponse.redirect(origin + "/login?error=Authentication+failed");
}
