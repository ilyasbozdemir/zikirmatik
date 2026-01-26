import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase yapılandırmasının tam olup olmadığını kontrol et
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing. auth will likely fail.')
}

// Client oluşturulurken URL yoksa bile boş string ile geçmeyelim, yoksa hata patlar.
// Ancak kullanıcı .env dosyasını doldurduğu için burası çalışacaktır.
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
