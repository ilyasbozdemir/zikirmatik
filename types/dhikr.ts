export type Dhikr = {
  id: string
  name: string
  targetCount: number
  currentCount: number
  dateCreated: string
  dateCompleted?: string
  status: "completed" | "in-progress" | "planned"
  category?: string
  scheduledDays?: string[] // days of week: "monday", "tuesday", etc.
  scheduledTime?: string // HH:MM format
  scheduledDates?: string[] // specific dates for custom scheduling
  scheduleType?: "daily" | "weekly" | "monthly" | "custom" | "one-time"
  scheduleSettings?: {
    repeatEvery: number
    repeatInterval: "day" | "week" | "month" | "year"
    startDate: string
    endDate?: string
  }
  arabicText?: string
  transliteration?: string
  translation?: string
  isPartOfSeries?: boolean
  seriesIndex?: number
  seriesId?: string
  audio?: string
}
