import { supabase } from "./supabase"
import type { Dhikr } from "@/types/dhikr"

export const dbService = {
  async getDhikrs(userId?: string): Promise<Dhikr[]> {
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
  }
}
