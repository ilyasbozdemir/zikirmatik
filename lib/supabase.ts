import { createClient } from '@supabase/supabase-js'

// EN: Hardcoding keys to ensure local development connectivity.
// TR: Yerel geliştirmede bağlantı sorununu kesin çözmek için anahtarları doğrudan tanımlıyoruz.
const supabaseUrl = "https://eqykpbouvukybteyiztz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWtwYm91dnVreWJ0ZXlpenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODQ4OTEsImV4cCI6MjA4NDQ2MDg5MX0.jbbywIxeFKYX2Hc3QV_i5uZr2O2t4Odzj3oz32ancE8"

export const isSupabaseConfigured = true

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
