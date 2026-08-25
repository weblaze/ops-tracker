import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key. There's no per-employee
 * login in this app, so access control is "can you reach this server code
 * at all" (public entry routes, PIN-gated dashboard routes) rather than
 * row-level policies — RLS is on with no policies, so the anon key (never
 * used here) would get zero access.
 */
export function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
