
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client or handle as null? 
    // Usually callers check isSupabaseConfigured.
    // For now, let's avoid the crash by providing empty strings if we MUST return a client, 
    // but better to return a client that won't throw on init.
    return createServerClient("https://placeholder.supabase.co", "placeholder", { cookies: { getAll() { return [] }, setAll() {} } })
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing the user session.
          }
        },
      },
    }
  )
}
