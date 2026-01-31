
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    "https://eqykpbouvukybteyiztz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWtwYm91dnVreWJ0ZXlpenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODQ4OTEsImV4cCI6MjA4NDQ2MDg5MX0.jbbywIxeFKYX2Hc3QV_i5uZr2O2t4Odzj3oz32ancE8",
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
