import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    // No code means this is not a valid OAuth / magic-link callback
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("Auth callback exchange error:", exchangeError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // getUser validates the session server-side (does not rely on cached session)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth callback user fetch error:", userError?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Check whether this user has completed onboarding.
  // maybeSingle() returns null (not an error) when no row exists, so we only
  // treat actual database errors as failures.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Auth callback profile fetch error:", profileError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // No profile row yet, or onboarding has not been completed
  if (!profile?.onboarded) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
