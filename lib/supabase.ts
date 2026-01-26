import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase yapılandırmasının tam olup olmadığını kontrol et
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing. auth will likely fail.')
}

// Build sırasında hata almamak için boş olsa bile geçerli bir URL formatı veriyoruz.
// Bu sadece "supabaseUrl is required" hatasını engellemek içindir.
// isSupabaseConfigured false olduğu sürece uygulama bu client'ı kullanmaya çalışmayacaktır.
const validUrl = supabaseUrl || 'https://v0-build-placeholder.supabase.co'
const validKey = supabaseAnonKey || 'v0-build-placeholder'

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
