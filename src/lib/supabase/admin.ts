import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for administrative operations.
 * Uses SUPABASE_SERVICE_ROLE_KEY if available in environment,
 * falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * NEVER import this file in client-side ("use client") components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or key configuration.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
