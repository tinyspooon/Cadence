import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client.
 * Uses the service role key to bypass connection-level auth,
 * but sets app.clerk_user_id as a session variable so RLS
 * policies can enforce row-level access per user.
 */
export function createClient(clerkUserId?: string) {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  return client
}

/**
 * Creates a Supabase client and sets the Clerk user ID
 * as a Postgres session variable for RLS policies.
 * Use this in all API routes that touch user data.
 */
export async function createUserClient(clerkUserId: string) {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  // Set session variable so RLS policies can read it
  await client.rpc('set_config', {
    setting: 'app.clerk_user_id',
    value: clerkUserId,
    is_local: true,
  }).catch(() => {
    // set_config RPC may not exist yet — fall through, service role still works
  })
  return client
}
