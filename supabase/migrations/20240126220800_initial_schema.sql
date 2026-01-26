-- 1. Profil Tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Zikir Koleksiyonu Tablosu
CREATE TABLE IF NOT EXISTS public.dhikr_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dhikrs JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bireysel Zikirler Tablosu (Bulut Senkronizasyonu için)
CREATE TABLE IF NOT EXISTS public.dhikrs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_completed TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned',
  category TEXT,
  arabic_text TEXT,
  transliteration TEXT,
  translation TEXT,
  is_part_of_series BOOLEAN DEFAULT FALSE,
  series_index INTEGER,
  series_id TEXT,
  audio TEXT,
  scheduled_days JSONB,
  scheduled_time TEXT,
  scheduled_dates JSONB,
  schedule_type TEXT,
  schedule_settings JSONB
);

-- RLS (Row Level Security) Etkinleştirme
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhikr_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhikrs ENABLE ROW LEVEL SECURITY;

-- Politikalar (Policies)
-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Dhikr Collections
CREATE POLICY "Public collections are viewable by everyone" ON public.dhikr_collections FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage their own collections" ON public.dhikr_collections FOR ALL USING (auth.uid() = user_id);

-- Dhikrs
CREATE POLICY "Users can manage their own dhikrs" ON public.dhikrs FOR ALL USING (auth.uid() = user_id);
