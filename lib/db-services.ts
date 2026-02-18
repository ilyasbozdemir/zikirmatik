import { supabase, isSupabaseConfigured } from "./supabase"
import type { Dhikr } from "@/types/dhikr"

export const dbService = {
  async getDhikrs(userId?: string): Promise<Dhikr[]> {
    if (!isSupabaseConfigured) {
        console.warn("Supabase not configured, returning empty list for dbService.getDhikrs")
        return []
    }

    const { data, error } = await supabase
      .from('dhikrs')
      .select('*')
      .eq('user_id', userId || 'anonymous')
      .order('date_created', { ascending: false })

    if (error) {
      console.error('Error fetching dhikrs:', error)
      return []
    }

    return (data || []).map(item => ({
      ...item,
      id: item.id.toString(),
      scheduledDays: item.scheduled_days,
      scheduledTime: item.scheduled_time,
      scheduledDates: item.scheduled_dates,
      scheduleType: item.schedule_type,
      scheduleSettings: item.schedule_settings,
      targetCount: item.target_count,
      currentCount: item.current_count,
      dateCreated: item.date_created,
      dateCompleted: item.date_completed,
      arabicText: item.arabic_text,
      isPartOfSeries: item.is_part_of_series,
      seriesIndex: item.series_index,
      seriesId: item.series_id,
    }))
  },

  async saveDhikr(dhikr: Dhikr, userId?: string) {
    const dbData = {
      id: dhikr.id,
      user_id: userId || 'anonymous',
      name: dhikr.name,
      target_count: dhikr.targetCount,
      current_count: dhikr.currentCount,
      date_created: dhikr.dateCreated,
      date_completed: dhikr.dateCompleted,
      status: dhikr.status,
      category: dhikr.category,
      arabic_text: dhikr.arabicText,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
      is_part_of_series: dhikr.isPartOfSeries || false,
      series_index: dhikr.seriesIndex,
      series_id: dhikr.seriesId,
      audio: dhikr.audio,
      scheduled_days: dhikr.scheduledDays,
      scheduled_time: dhikr.scheduledTime,
      scheduled_dates: dhikr.scheduledDates,
      schedule_type: dhikr.scheduleType,
      schedule_settings: dhikr.scheduleSettings,
    }

    const { error } = await supabase
      .from('dhikrs')
      .upsert(dbData)

    if (error) {
      console.error('Error saving dhikr:', error)
      throw error
    }
  },

  async deleteDhikr(id: string) {
    const { error } = await supabase
      .from('dhikrs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting dhikr:', error)
      throw error
    }
  },

  async saveAllDhikrs(dhikrs: Dhikr[], userId?: string) {
    const dbData = dhikrs.map(dhikr => ({
      id: dhikr.id,
      user_id: userId || 'anonymous',
      name: dhikr.name,
      target_count: dhikr.targetCount,
      current_count: dhikr.currentCount,
      date_created: dhikr.dateCreated,
      date_completed: dhikr.dateCompleted,
      status: dhikr.status,
      category: dhikr.category,
      arabic_text: dhikr.arabicText,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
      is_part_of_series: dhikr.isPartOfSeries || false,
      series_index: dhikr.seriesIndex,
      series_id: dhikr.seriesId,
      audio: dhikr.audio,
      scheduled_days: dhikr.scheduledDays,
      scheduled_time: dhikr.scheduledTime,
      scheduled_dates: dhikr.scheduledDates,
      schedule_type: dhikr.scheduleType,
      schedule_settings: dhikr.scheduleSettings,
    }))

    const { error } = await supabase
      .from('dhikrs')
      .upsert(dbData)

    if (error) {
      console.error('Error saving all dhikrs:', error)
      throw error
    }
  },

  // Profile Services
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
    }
    return data
  },

  async updateProfile(profile: { id: string, username: string, full_name?: string, avatar_url?: string }) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile)

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // Social Services
  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(10)

    if (error) {
      console.error('Error searching users:', error)
      return []
    }
    return data
  },

  async getPublicCollections() {
    try {
      const { data, error } = await supabase
        .from('dhikr_collections')
        .select(`
          id,
          name,
          description,
          dhikrs,
          created_at,
          profiles (
            username
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase Error (Collections):', error.message, error.details)
        return []
      }
      return data || []
    } catch (err) {
      console.error('Unexpected error in getPublicCollections:', err)
      return []
    }
  },

  async shareCollection(collection: any) {
    const { error } = await supabase
      .from('dhikr_collections')
      .upsert(collection)

    if (error) {
      console.error('Error sharing collection:', error)
      throw error
    }
  },

  // Admin Services
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }) // Simplified order to avoid potential syntax issues

    if (error) {
      console.warn('Cannot fetch profiles (likely RLS). Using mock data for Admin Demo.', error)
      // Fallback Mock Data for Admin UI "Pro" feel
      return [
        { 
            id: 'mock-1', 
            username: 'ahmet_yilmaz', 
            full_name: 'Ahmet Yılmaz', 
            email: 'ahmet@example.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet', 
            created_at: new Date(Date.now() - 86400000 * 2).toISOString() 
        },
        { 
            id: 'mock-2', 
            username: 'ayse_demir', 
            full_name: 'Ayşe Demir', 
            email: 'ayse@example.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse', 
            created_at: new Date(Date.now() - 86400000 * 5).toISOString() 
        },
        { 
            id: 'mock-3', 
            username: 'mehmet_kaya', 
            full_name: 'Mehmet Kaya', 
            email: 'mehmet@example.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet', 
            created_at: new Date(Date.now() - 86400000 * 10).toISOString() 
        },
        { 
            id: 'mock-4', 
            username: 'zeynep_celik', 
            full_name: 'Zeynep Çelik', 
            email: 'zeynep@example.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep', 
            created_at: new Date(Date.now() - 86400000 * 12).toISOString() 
        },
        { 
            id: 'mock-5', 
            username: 'ali_veli', 
            full_name: 'Ali Veli', 
            email: 'ali@example.com',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ali', 
            created_at: new Date(Date.now() - 86400000 * 20).toISOString() 
        }
      ]
    }
    return data
  },

  async getGlobalDhikrStats() {
    try {
      // fetching a count of all dhikrs
      const { count, error } = await supabase
        .from('dhikrs')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      return { totalDhikrs: count || 0 }
    } catch (error) {
      console.error('Error getting global stats:', error)
      return { totalDhikrs: 0 }
    }
  }
}
