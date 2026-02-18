import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Eğer anahtarlar boşsa bile kütüphane patlamasın diye fallback URL veriyoruz.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.includes("supabase.co"))

export const supabase = createBrowserClient(
  supabaseUrl || "https://eqykpbouvukybteyiztz.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWtwYm91dnVreWJ0ZXlpenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODQ4OTEsImV4cCI6MjA4NDQ2MDg5MX0.jbbywIxeFKYX2Hc3QV_i5uZr2O2t4Odzj3oz32ancE8"
)
