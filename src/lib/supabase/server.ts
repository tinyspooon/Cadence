import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function createUserClient(clerkUserId: string) {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  try {
    await client.rpc('set_config', {
      setting: 'app.clerk_user_id',
      value: clerkUserId,
      is_local: true,
    })
  } catch {
    // set_config may not exist — service role still handles auth
  }
  return client
}
