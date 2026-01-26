"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Plus,
  Play,
  Trash2,
  RotateCcw,
  Calendar,
  X,
  BarChart3,
  Info,
  Clock,
  BookOpen,
  List,
  Folder,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns"
import { tr } from "date-fns/locale"
import { DhikrCounter } from "@/components/dhikr-counter"
import { AddDhikrForm } from "@/components/add-dhikr-form"
import { SuccessScreen } from "@/components/success-screen"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { StatsView } from "@/components/stats-view"
import { HelpView } from "@/components/help-view"
import { SettingsView } from "@/components/settings-view"
import { ScheduleView } from "@/components/schedule-view"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { ShareView } from "@/components/share-view"
import { ArabicDhikrView } from "@/components/arabic-dhikr-view"
import { AdvancedScheduleView } from "@/components/advanced-schedule-view"
import { DhikrLibrary } from "@/components/dhikr-library"
import { arabicDhikrs } from "@/lib/arabic-dhikrs"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { InstallPWAButton, UpdatePWAButton, usePWA } from "@/components/pwa-manager"
import { RepeatDhikrModal } from "@/components/repeat-dhikr-modal"
import { DhikrSeriesManager } from "@/components/dhikr-series-manager"
import { DataMigrationManager } from "@/components/data-migration-manager"
import { supabase } from "@/lib/supabase"
import { dbService } from "@/lib/db-services"

// Define the Dhikr type
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

// Common Islamic dhikrs in Turkish
export const commonDhikrs = [
  { name: "Sübhanallah", count: 33, category: "Tesbih" },
  { name: "Elhamdülillah", count: 33, category: "Tesbih" },
  { name: "Allah'ü Ekber", count: 33, category: "Tesbih" },
  { name: "La ilahe illallah", count: 100, category: "Tevhid" },
  { name: "Estağfirullah", count: 100, category: "İstiğfar" },
  { name: "Hasbünallahü ve ni'mel vekil", count: 33, category: "Dua" },
  { name: "La havle vela kuvvete illa billah", count: 33, category: "Dua" },
  { name: "Sübhanallahi ve bihamdihi", count: 100, category: "Tesbih" },
  { name: "Sübhanallahi'l-azim", count: 33, category: "Tesbih" },
]

export default function Home() {
  const [dhikrs, setDhikrs] = useState<Dhikr[]>([])
  const [activeDhikr, setActiveDhikr] = useState<Dhikr | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [streak, setStreak] = useState(0)
  const [activeView, setActiveView] = useState("home")
  const { toast } = useToast()
  const { setTheme } = useTheme()
  const isMobile = useMobile()
  const [showShare, setShowShare] = useState(false)
  const [showArabicDhikr, setShowArabicDhikr] = useState(false)
  const [showAdvancedSchedule, setShowAdvancedSchedule] = useState(false)
  const [showDhikrLibrary, setShowDhikrLibrary] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [repeatDhikrModalOpen, setRepeatDhikrModalOpen] = useState(false)
  const [dhikrToRepeat, setDhikrToRepeat] = useState<Dhikr | null>(null)
  const [showDhikrSeries, setShowDhikrSeries] = useState(false)
  const [showDataMigration, setShowDataMigration] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const { updateAvailable } = usePWA()

  // URL parametrelerini kontrol et
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)

      // Görünüm parametresi
      const viewParam = params.get("view")
      if (viewParam) {
        switch (viewParam) {
          case "stats":
            setShowStats(true)
            break
          case "help":
            setShowHelp(true)
            break
          case "settings":
            setShowSettings(true)
            break
          case "schedule":
            setShowSchedule(true)
            break
        }
      }

      // Eylem parametresi
      const actionParam = params.get("action")
      if (actionParam) {
        switch (actionParam) {
          case "add":
            setShowAddForm(true)
            break
        }
      }

      // Paylaşım parametresi
      if (params.has("share")) {
        setShowShare(true)
      }

      // URL'yi temizle
      if (viewParam || actionParam || params.has("share")) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load dhikrs from localStorage or Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        let savedDhikrs = []

        if (user) {
          // Logged in: Try fetching from Supabase
          savedDhikrs = await dbService.getDhikrs(user.id)

          // If Supabase is empty, fallback to local and sync
          if (savedDhikrs.length === 0) {
            const localDhikrs = getStorageItem("dhikrs", [])
            if (localDhikrs.length > 0) {
              savedDhikrs = localDhikrs
              await dbService.saveAllDhikrs(localDhikrs, user.id)
            }
          }
        } else {
          // Not logged in: Use localStorage
          savedDhikrs = getStorageItem("dhikrs", [])
        }

        // Migrate old format to new format if needed
        const migratedDhikrs = savedDhikrs.map((dhikr: any) => {
          if (dhikr.scheduledDays && typeof dhikr.scheduledDays === "string") {
            try {
              dhikr.scheduledDays = JSON.parse(dhikr.scheduledDays)
            } catch (e) {
              dhikr.scheduledDays = [dhikr.scheduledDays]
            }
          }
          if (dhikr.scheduledDays) {
            dhikr.scheduledDays = dhikr.scheduledDays.map((day: string) => day.toLowerCase())
          }
          return dhikr
        })

        setDhikrs(migratedDhikrs)

        const hasSeenIntro = getStorageItem("hasSeenIntro", false)
        if (!hasSeenIntro) {
          setShowHelp(true)
          setStorageItem("hasSeenIntro", true)
        }

        checkScheduledDhikrs(migratedDhikrs)
      } catch (error) {
        console.error("Error loading dhikrs:", error)
        setDhikrs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  // Save dhikrs to localStorage and Supabase whenever they change
  useEffect(() => {
    if (!isLoading) {
      setStorageItem("dhikrs", dhikrs)

      // If user is logged in, sync to cloud
      if (user) {
        const syncToCloud = async () => {
          setIsSyncing(true)
          try {
            await dbService.saveAllDhikrs(dhikrs, user.id)
          } catch (err) {
            console.error("Cloud sync failed:", err)
          } finally {
            setIsSyncing(false)
          }
        }
        syncToCloud()
      }

      // Calculate streak
      calculateStreak()
    }
  }, [dhikrs, isLoading, user])

  // Check for scheduled dhikrs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkScheduledDhikrs(dhikrs)
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [dhikrs])

  const checkScheduledDhikrs = (dhikrsToCheck: Dhikr[]) => {
    const now = new Date()
    // 'long' kullanıp sonra küçük harfe çevirelim
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const currentTime = format(now, "HH:mm")

    dhikrsToCheck.forEach((dhikr) => {
      if (
        dhikr.status === "planned" &&
        dhikr.scheduledDays &&
        dhikr.scheduledTime &&
        dhikr.scheduledDays.includes(currentDay) &&
        dhikr.scheduledTime === currentTime
      ) {
        toast({
          title: "Planlı Zikir Hatırlatması",
          description: `"${dhikr.name}" zikri için hatırlatma zamanı geldi.`,
        })
      }
    })
  }

  const calculateStreak = () => {
    const completedDates = dhikrs
      .filter((d) => d.status === "completed" && d.dateCompleted)
      .map((d) => new Date(d.dateCompleted!).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a) // Sort descending

    if (completedDates.length === 0) {
      setStreak(0)
      return
    }

    // Check if there's a completion today
    const today = new Date().setHours(0, 0, 0, 0)
    const hasCompletionToday = completedDates.includes(today)

    if (!hasCompletionToday) {
      // Check if there was a completion yesterday
      const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0)
      if (!completedDates.includes(yesterday)) {
        setStreak(0)
        return
      }
    }

    // Count consecutive days
    let currentStreak = hasCompletionToday ? 1 : 0
    let currentDate = hasCompletionToday ? today : new Date(today - 86400000).setHours(0, 0, 0, 0)

    // Remove duplicates and sort
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => b - a)

    for (let i = uniqueDates.indexOf(currentDate) + 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDate - 86400000).setHours(0, 0, 0, 0)
      if (uniqueDates[i] === prevDate) {
        currentStreak++
        currentDate = prevDate
      } else {
        break
      }
    }

    setStreak(currentStreak)
  }

  const completedDhikrs = dhikrs.filter((dhikr) => dhikr.status === "completed")
  const plannedDhikrs = dhikrs.filter((dhikr) => dhikr.status === "planned" || dhikr.status === "in-progress")

  const startDhikr = (dhikr: Dhikr) => {
    const updatedDhikr = { ...dhikr, status: "in-progress" as const }
    setActiveDhikr(updatedDhikr)

    // Update the dhikr status in the list
    setDhikrs((prev) => prev.map((d) => (d.id === dhikr.id ? updatedDhikr : d)))
  }

  const updateDhikrCount = (id: string, count: number) => {
    setDhikrs((prev) => {
      const updatedDhikrs = prev.map((dhikr) => {
        if (dhikr.id === id) {
          const isCompleted = count >= dhikr.targetCount
          return {
            ...dhikr,
            currentCount: count,
            status: isCompleted ? ("completed" as const) : ("in-progress" as const),
            dateCompleted: isCompleted ? new Date().toISOString() : undefined,
          }
        }
        return dhikr
      })

      // Eğer tamamlanan zikir bir serinin parçasıysa, bir sonraki zikiri başlatalım
      const completedDhikr = updatedDhikrs.find((d) => d.id === id)
      if (completedDhikr && completedDhikr.isPartOfSeries && count >= completedDhikr.targetCount) {
        // Aynı serideki bir sonraki zikiri bulalım
        const nextInSeries = updatedDhikrs.find(
          (d) =>
            d.seriesId === completedDhikr.seriesId &&
            d.seriesIndex === completedDhikr.seriesIndex + 1 &&
            d.status === "planned",
        )

        if (nextInSeries) {
          // Kullanıcıya bildirim gösterelim
          setTimeout(() => {
            toast({
              title: "Seri Devam Ediyor",
              description: `"${nextInSeries.name}" zikrine geçiliyor...`,
            })

            // Kısa bir gecikme sonrası bir sonraki zikiri başlatalım
            setTimeout(() => {
              setActiveDhikr({
                ...nextInSeries,
                status: "in-progress" as const,
              })
            }, 1500)
          }, 1000)
        } else {
          // Seri tamamlandı
          toast({
            title: "Zikir Serisi Tamamlandı",
            description: "Tüm seri başarıyla tamamlandı.",
          })
        }
      }

      return updatedDhikrs
    })

    if (activeDhikr && activeDhikr.id === id) {
      if (count >= activeDhikr.targetCount) {
        // Eğer zikir bir serinin parçası değilse normal başarı ekranını göster
        if (!activeDhikr.isPartOfSeries) {
          setShowSuccess(true)
          setActiveDhikr(null)
        } else {
          // Seri devam ediyorsa başarı ekranını gösterme, sadece aktif zikiri temizle
          setActiveDhikr(null)
        }
      } else {
        setActiveDhikr((prev) => (prev ? { ...prev, currentCount: count } : null))
      }
    }
  }

  const addNewDhikr = (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => {
    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      dateCreated: new Date().toISOString(),
      status: "planned",
      currentCount: 0,
      ...dhikr,
    }

    setDhikrs((prev) => [...prev, newDhikr])
    setShowAddForm(false)

    toast({
      title: "Zikir eklendi",
      description: `"${dhikr.name}" zikri başarıyla eklendi.`,
    })
  }

  // addDhikrSeries fonksiyonunu güncelleyelim
  const addDhikrSeries = (dhikrs: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[]) => {
    if (dhikrs.length === 0) return

    const seriesId = Date.now().toString()
    const newDhikrs = dhikrs.map((dhikr, index) => ({
      id: seriesId + index,
      dateCreated: new Date().toISOString(),
      status: "planned" as const,
      currentCount: 0,
      ...dhikr,
      // Seri olarak çekilecek zikirleri işaretleyelim
      isPartOfSeries: true,
      seriesIndex: index,
      seriesId: seriesId, // Aynı seriye ait zikirleri gruplamak için
    }))

    setDhikrs((prev) => [...prev, ...newDhikrs])

    toast({
      title: "Zikir serisi eklendi",
      description: `${dhikrs.length} zikir başarıyla çekilecekler listesine eklendi.`,
    })
  }

  // handleAddDhikrSeriesFromCollection fonksiyonunu ekleyelim
  const handleAddDhikrSeriesFromCollection = (
    dhikrs: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[],
  ) => {
    addDhikrSeries(dhikrs)

    toast({
      title: "Koleksiyon Eklendi",
      description: `${dhikrs.length} zikir çekilecekler listesine eklendi.`,
    })
  }

  const deleteDhikr = async (id: string) => {
    const dhikrToDelete = dhikrs.find((d) => d.id === id)
    setDhikrs((prev) => prev.filter((dhikr) => dhikr.id !== id))

    if (user) {
      try {
        await dbService.deleteDhikr(id)
      } catch (err) {
        console.error("Cloud delete failed:", err)
      }
    }

    if (dhikrToDelete) {
      toast({
        title: "Zikir silindi",
        description: `"${dhikrToDelete.name}" zikri silindi.`,
      })
    }
  }

  const handleRepeatDhikr = (dhikr: Dhikr, count: number, addToSeries: boolean, scheduleNow: boolean) => {
    // Son 5 saniye içinde aynı zikir için tekrar butonuna basılıp basılmadığını kontrol et
    const lastRepeatTime = getStorageItem(`lastRepeat_${dhikr.id}`, 0)
    const now = Date.now()

    if (lastRepeatTime && now - lastRepeatTime < 5000) {
      toast({
        title: "Yavaş ol!",
        description: "Bu zikir zaten çekilecekler listesine eklendi.",
        variant: "destructive",
      })
      return
    }

    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      name: dhikr.name,
      targetCount: count,
      currentCount: 0,
      dateCreated: new Date().toISOString(),
      status: "planned",
      category: dhikr.category,
      scheduledDays: dhikr.scheduledDays,
      scheduledTime: dhikr.scheduledTime,
      arabicText: dhikr.arabicText,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
      audio: dhikr.audio,
    }

    if (scheduleNow) {
      setDhikrs((prev) => [...prev, newDhikr])
    }

    // Son tekrar zamanını kaydet
    setStorageItem(`lastRepeat_${dhikr.id}`, now)

    toast({
      title: "Zikir tekrarlanıyor",
      description: `"${dhikr.name}" zikri ${scheduleNow ? '"Çekilecekler" listesine eklendi.' : "tekrarlanıyor."}`,
    })

    // Eğer scheduleNow false ise ve addToSeries true ise, seri oluştur
    if (!scheduleNow && addToSeries) {
      // Seri oluşturma işlemleri
      // ...
    }

    // Eğer scheduleNow false ise, hemen başlat
    if (!scheduleNow) {
      startDhikr(newDhikr)
    }
  }

  const repeatDhikr = (dhikr: Dhikr) => {
    setDhikrToRepeat(dhikr)
    setRepeatDhikrModalOpen(true)
  }

  const groupDhikrsByDate = (dhikrs: Dhikr[]) => {
    const groups: Record<string, Dhikr[]> = {}

    dhikrs.forEach((dhikr) => {
      if (!dhikr.dateCompleted) return

      // Filter by selected date if any
      if (selectedDate) {
        const completedDate = new Date(dhikr.dateCompleted)
        const selected = new Date(selectedDate)

        if (
          completedDate.getDate() !== selected.getDate() ||
          completedDate.getMonth() !== selected.getMonth() ||
          completedDate.getFullYear() !== selected.getFullYear()
        ) {
          return
        }
      }

      // Filter by search term if any
      if (searchTerm && !dhikr.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return
      }

      // Filter by category if any
      if (selectedCategory && dhikr.category !== selectedCategory) {
        return
      }

      const date = new Date(dhikr.dateCompleted)
      let dateKey: string

      if (isToday(date)) {
        dateKey = "Bugün"
      } else if (isYesterday(date)) {
        dateKey = "Dün"
      } else {
        dateKey = format(date, "d MMMM yyyy", { locale: tr })
      }

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(dhikr)
    })

    return groups
  }

  const filteredPlannedDhikrs = plannedDhikrs.filter(
    (dhikr) =>
      (!searchTerm || dhikr.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || dhikr.category === selectedCategory),
  )

  const groupedCompletedDhikrs = groupDhikrsByDate(completedDhikrs)

  // Get dates with completed dhikrs for calendar highlighting
  const datesWithCompletedDhikrs = completedDhikrs
    .filter((dhikr) => dhikr.dateCompleted)
    .map((dhikr) => new Date(dhikr.dateCompleted!))

  // Get unique categories
  const categories = [...new Set(dhikrs.map((d) => d.category).filter(Boolean))]

  const clearFilters = () => {
    setSelectedDate(undefined)
    setSearchTerm("")
    setSelectedCategory(null)
  }

  const quickAddDhikr = (preset: (typeof commonDhikrs)[0]) => {
    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      name: preset.name,
      targetCount: preset.count,
      currentCount: 0,
      dateCreated: new Date().toISOString(),
      status: "planned",
      category: preset.category,
    }

    setDhikrs((prev) => [...prev, newDhikr])

    toast({
      title: "Hızlı zikir eklendi",
      description: `"${preset.name}" zikri eklendi.`,
    })
  }

  const handleNavigation = (view: string) => {
    setActiveView(view)

    switch (view) {
      case "home":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(false)
        setShowDhikrSeries(false)
        setShowDataMigration(false)
        break
      case "stats":
        setShowStats(true)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(false)
        setShowDhikrSeries(false)
        setShowDataMigration(false)
        break
      case "schedule":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(true)
        setShowDhikrSeries(false)
        setShowDataMigration(false)
        break
      case "help":
        setShowStats(false)
        setShowHelp(true)
        setShowSettings(false)
        setShowSchedule(false)
        setShowDhikrSeries(false)
        setShowDataMigration(false)
        break
      case "settings":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(true)
        setShowSchedule(false)
        setShowDhikrSeries(false)
        setShowDataMigration(false)
        break
      case "series":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(false)
        setShowDhikrSeries(true)
        setShowDataMigration(false)
        break
      case "data":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(false)
        setShowDhikrSeries(false)
        setShowDataMigration(true)
        break
    }
  }

  const handleAddSharedDhikrs = (sharedDhikrs: Dhikr[]) => {
    // Paylaşılan zikirleri çekilecekler listesine ekle
    const newDhikrs = sharedDhikrs.map((dhikr) => ({
      ...dhikr,
      id: Date.now() + Math.random().toString(36).substring(2, 9), // Yeni ID oluştur
      dateCreated: new Date().toISOString(),
      status: "planned" as const,
      currentCount: 0,
    }))

    setDhikrs((prev) => [...prev, ...newDhikrs])

    toast({
      title: "Zikirler Eklendi",
      description: `${newDhikrs.length} zikir başarıyla çekilecekler listesine eklendi.`,
    })
  }

  const reloadApp = () => {
    window.location.reload()
  }

  const handleAddDhikrSeries = (sharedDhikrs: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[]) => {
    const newDhikrs = sharedDhikrs.map((dhikr) => ({
      ...dhikr,
      id: Date.now() + Math.random().toString(36).substring(2, 9), // Yeni ID oluştur
      dateCreated: new Date().toISOString(),
      status: "planned" as const,
      currentCount: 0,
    }))

    setDhikrs((prev) => [...prev, ...newDhikrs])

    toast({
      title: "Zikirler Eklendi",
      description: `${newDhikrs.length} zikir başarıyla çekilecekler listesine eklendi.`,
    })
  }

  // handleStartSeries fonksiyonunda hala bir sorun var. Fonksiyonu tamamen değiştiriyorum:

  const handleStartSeries = (seriesId: string) => {
    // Seriyi localStorage'dan al
    const savedSeries = getStorageItem("dhikrSeries", []) as any[]
    const series = savedSeries.find((s) => s.id === seriesId)

    if (!series || series.dhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Seri bulunamadı veya boş.",
        variant: "destructive",
      })
      return
    }

    // Serideki zikirleri al
    const seriesDhikrs: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[] = []

    series.dhikrs.forEach((dhikrId: string) => {
      // Önce mevcut zikirlerden bul
      const existingDhikr = dhikrs.find((d) => d.id === dhikrId)
      if (existingDhikr) {
        seriesDhikrs.push({
          name: existingDhikr.name,
          targetCount: existingDhikr.targetCount,
          category: existingDhikr.category,
          arabicText: existingDhikr.arabicText,
          transliteration: existingDhikr.transliteration,
          translation: existingDhikr.translation,
          audio: existingDhikr.audio,
        })
      }
    })

    if (seriesDhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Seride geçerli zikir bulunamadı.",
        variant: "destructive",
      })
      return
    }

    // Seriyi başlat
    addDhikrSeries(seriesDhikrs)

    // İlk zikiri hemen başlat
    setTimeout(() => {
      const newSeriesId = Date.now().toString()
      const firstDhikr: Dhikr = {
        id: newSeriesId + "0",
        name: seriesDhikrs[0].name,
        targetCount: seriesDhikrs[0].targetCount,
        currentCount: 0,
        dateCreated: new Date().toISOString(),
        status: "in-progress",
        category: seriesDhikrs[0].category,
        arabicText: seriesDhikrs[0].arabicText,
        transliteration: seriesDhikrs[0].transliteration,
        translation: seriesDhikrs[0].translation,
        isPartOfSeries: true,
        seriesIndex: 0,
        seriesId: newSeriesId,
        audio: seriesDhikrs[0].audio,
      }

      setActiveDhikr(firstDhikr)
      setShowDhikrSeries(false)

      // Son kullanım zamanını güncelle
      const updatedSeries = savedSeries.map((s) =>
        s.id === seriesId ? { ...s, lastUsed: new Date().toISOString() } : s,
      )
      setStorageItem("dhikrSeries", updatedSeries)
    }, 500)
  }

  const handleAddSeriesList = (seriesId: string) => {
    // Seriyi localStorage'dan al\
    const savedSeries = getStorageItem("dhikrSeries", []) as any[]
    const series = savedSeries.find((s) => s.id === seriesId)

    if (!series || series.dhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Seri bulunamadı veya boş.",
        variant: "destructive",
      })
      return
    }

    // Serideki zikirleri al
    const seriesDhikrs: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[] = []

    series.dhikrs.forEach((dhikrId: string) => {
      // Önce mevcut zikirlerden bul
      const existingDhikr = dhikrs.find((d) => d.id === dhikrId)
      if (existingDhikr) {
        seriesDhikrs.push({
          name: existingDhikr.name,
          targetCount: existingDhikr.targetCount,
          category: existingDhikr.category,
          arabicText: existingDhikr.arabicText,
          transliteration: existingDhikr.transliteration,
          translation: existingDhikr.translation,
          audio: existingDhikr.audio,
        })
      }
    })

    if (seriesDhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Seride geçerli zikir bulunamadı.",
        variant: "destructive",
      })
      return
    }

    // Seriyi listeye ekle
    addDhikrSeries(seriesDhikrs)

    // Son kullanım zamanını güncelle
    const updatedSeries = savedSeries.map((s) => (s.id === seriesId ? { ...s, lastUsed: new Date().toISOString() } : s))
    setStorageItem("dhikrSeries", updatedSeries)

    toast({
      title: "Seri Eklendi",
      description: `"${series.name}" serisi çekilecekler listesine eklendi.`,
    })

    setShowDhikrSeries(false)
  }

  // Yükleme durumunda gösterilecek bileşen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-pulse mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Zikirmatik</h1>
        <p className="text-muted-foreground text-center">Zikirleriniz yükleniyor...</p>
      </div>
    )
  }

  if (showSuccess) {
    return <SuccessScreen onClose={() => setShowSuccess(false)} />
  }

  if (activeDhikr) {
    return <DhikrCounter dhikr={activeDhikr} onUpdate={updateDhikrCount} onClose={() => setActiveDhikr(null)} />
  }

  if (showAddForm) {
    return <AddDhikrForm onAdd={addNewDhikr} onCancel={() => setShowAddForm(false)} />
  }

  if (showStats) {
    return <StatsView dhikrs={dhikrs} onClose={() => handleNavigation("home")} />
  }

  if (showHelp) {
    return <HelpView onClose={() => handleNavigation("home")} />
  }

  if (showSettings) {
    return <SettingsView onClose={() => handleNavigation("home")} onShare={() => setShowShare(true)} />
  }

  if (showSchedule) {
    return (
      <ScheduleView
        dhikrs={dhikrs}
        setDhikrs={setDhikrs}
        onClose={() => handleNavigation("home")}
        onAdvancedSchedule={() => setShowAdvancedSchedule(true)}
      />
    )
  }

  if (showShare) {
    return (
      <ShareView
        dhikrs={dhikrs}
        onAddDhikrs={handleAddSharedDhikrs}
        onClose={() => setShowShare(false)}
        onReload={reloadApp}
      />
    )
  }

  if (showArabicDhikr) {
    return <ArabicDhikrView onClose={() => setShowArabicDhikr(false)} onAddDhikr={addNewDhikr} />
  }

  if (showAdvancedSchedule) {
    return <AdvancedScheduleView dhikrs={dhikrs} setDhikrs={setDhikrs} onClose={() => setShowAdvancedSchedule(false)} />
  }

  if (showDhikrLibrary) {
    return (
      <DhikrLibrary
        onClose={() => setShowDhikrLibrary(false)}
        onAddDhikr={addNewDhikr}
        onAddDhikrSeries={addDhikrSeries}
      />
    )
  }

  if (showDhikrSeries) {
    return (
      <DhikrSeriesManager
        dhikrs={dhikrs}
        onClose={() => setShowDhikrSeries(false)}
        onStartSeries={handleStartSeries}
        onAddToList={handleAddSeriesList}
      />
    )
  }

  if (showDataMigration) {
    return <DataMigrationManager onClose={() => setShowDataMigration(false)} onReload={reloadApp} />
  }

  return (
    <div className={`flex ${!isMobile ? "flex-row" : "flex-col"} min-h-screen`}>
      {!isMobile && (
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigation}
          onAddDhikr={() => setShowAddForm(true)}
          onShare={() => setShowShare(true)}
          onArabicDhikr={() => setShowArabicDhikr(true)}
          onDhikrLibrary={() => setShowDhikrLibrary(true)}
          onDhikrSeries={() => setShowDhikrSeries(true)}
          onDataMigration={() => setShowDataMigration(true)}
        />
      )}

      <div className={`${!isMobile ? "flex-1 ml-64" : "w-full"} pb-20`}>
        <div className="container max-w-md mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Zikirmatik</h1>
            <div className="flex items-center space-x-2">
              {isMobile ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleNavigation("help")}
                    className="text-muted-foreground"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleNavigation("stats")}
                    className="text-muted-foreground"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                  <ModeToggle />
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDhikrLibrary(true)}
                    className="text-muted-foreground"
                  >
                    <BookOpen className="h-5 w-5 mr-2" /> Zikir Kütüphanesi
                  </Button>
                  <ModeToggle />
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Ömür boyu ücretsiz</p>
          </div>

          {streak > 0 && (
            <div className="mb-4 bg-primary/10 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Günlük Seri</p>
                <p className="text-2xl font-bold">{streak} gün</p>
              </div>
              <div className="flex">
                {[...Array(Math.min(streak, 5))].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-8 bg-primary mx-0.5 rounded-sm"
                    style={{
                      height: `${Math.min(8 + i * 4, 24)}px`,
                      opacity: 0.6 + i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* PWA Kurulum Butonu - Mobil cihazlarda göster */}
          {isMobile && (
            <div className="mb-4">
              <InstallPWAButton />
            </div>
          )}

          {/* Güncelleme Butonu */}
          {updateAvailable && (
            <div className="mb-4">
              <UpdatePWAButton />
            </div>
          )}

          <div className="mb-4 relative">
            <Input
              placeholder="Zikir ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih Seç"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    booked: datesWithCompletedDhikrs,
                  }}
                  modifiersStyles={{
                    booked: {
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                      fontWeight: "bold",
                      borderRadius: "0",
                    },
                  }}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                  {selectedCategory || "Kategori Seç"}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[40vh]">
                <SheetHeader className="mb-4">
                  <SheetTitle>Kategori Seçin</SheetTitle>
                  <SheetDescription>Zikirleri kategoriye göre filtrelemek için bir kategori seçin</SheetDescription>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className="justify-start"
                  >
                    Tümü
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className="justify-start"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {(selectedDate || searchTerm || selectedCategory) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-4">
                <Plus className="mr-2 h-4 w-4" /> Hızlı Zikir Ekle
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader className="mb-4">
                <SheetTitle>Hızlı Zikir Ekle</SheetTitle>
                <SheetDescription>
                  Sık kullanılan zikirlerden birini seçin veya koleksiyonlardan ekleyin
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="quick">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="quick">Hızlı Zikirler</TabsTrigger>
                  <TabsTrigger value="collections">Koleksiyonlar</TabsTrigger>
                </TabsList>

                <TabsContent value="quick">
                  <div className="grid grid-cols-1 gap-2">
                    {commonDhikrs.map((dhikr) => (
                      <Button
                        key={dhikr.name}
                        variant="outline"
                        onClick={() => {
                          quickAddDhikr(dhikr)
                        }}
                        className="justify-between"
                      >
                        <span>{dhikr.name}</span>
                        <Badge variant="secondary">{dhikr.count}</Badge>
                      </Button>
                    ))}
                    <Button onClick={() => setShowAddForm(true)} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" /> Özel Zikir Ekle
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="collections">
                  {(() => {
                    // localStorage'dan koleksiyonları al
                    const savedCollections = getStorageItem("dhikrCollections", [])

                    if (savedCollections.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-1">Henüz koleksiyon oluşturulmamış</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Zikir kütüphanesinden koleksiyon oluşturabilirsiniz.
                          </p>
                          <Button onClick={() => setShowDhikrLibrary(true)}>
                            <BookOpen className="mr-2 h-4 w-4" /> Zikir Kütüphanesine Git
                          </Button>
                        </div>
                      )
                    }

                    return (
                      <div className="grid grid-cols-1 gap-2">
                        {savedCollections.map((collection) => (
                          <Card key={collection.id} className="overflow-hidden">
                            <CardHeader className="p-3 pb-1">
                              <CardTitle className="text-base">{collection.name}</CardTitle>
                              {collection.category && (
                                <Badge variant="outline" className="mt-1 w-fit">
                                  {collection.category}
                                </Badge>
                              )}
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <p className="text-xs text-muted-foreground">{collection.dhikrs.length} zikir</p>
                              <div className="flex justify-between mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Koleksiyondaki zikirleri çekilecekler listesine ekle
                                    const customDhikrs = getStorageItem("customDhikrs", [])
                                    const arabicDhikrsFromLib = arabicDhikrs

                                    const dhikrsToAdd = collection.dhikrs
                                      .map((id) => {
                                        // Özel zikirlerden ara
                                        const customDhikr = customDhikrs.find((d) => d.id === id)
                                        if (customDhikr) {
                                          return {
                                            name: customDhikr.transliteration || customDhikr.name,
                                            targetCount: customDhikr.count,
                                            category: customDhikr.category,
                                            arabicText: customDhikr.arabicText,
                                            transliteration: customDhikr.transliteration,
                                            translation: customDhikr.translation,
                                            audio: customDhikr.audio,
                                          }
                                        }

                                        // Arapça zikirlerden ara
                                        const arabicIndex = Number.parseInt(id)
                                        if (
                                          !isNaN(arabicIndex) &&
                                          arabicIndex >= 0 &&
                                          arabicIndex < arabicDhikrsFromLib.length
                                        ) {
                                          const arabicDhikr = arabicDhikrsFromLib[arabicIndex]
                                          return {
                                            name: arabicDhikr.transliteration,
                                            targetCount: arabicDhikr.count,
                                            category: arabicDhikr.category,
                                            arabicText: arabicDhikr.name,
                                            transliteration: arabicDhikr.transliteration,
                                            translation: arabicDhikr.translation,
                                            audio: arabicDhikr.audio,
                                          }
                                        }

                                        return null
                                      })
                                      .filter(Boolean)

                                    if (dhikrsToAdd.length > 0) {
                                      handleAddDhikrSeriesFromCollection(dhikrsToAdd)
                                    }
                                  }}
                                >
                                  <List className="mr-2 h-4 w-4" /> Listeye Ekle
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    // Koleksiyondaki zikirleri seri olarak başlat
                                    const customDhikrs = getStorageItem("customDhikrs", [])
                                    const arabicDhikrsFromLib = arabicDhikrs

                                    const dhikrsToAdd = collection.dhikrs
                                      .map((id) => {
                                        // Özel zikirlerden ara
                                        const customDhikr = customDhikrs.find((d) => d.id === id)
                                        if (customDhikr) {
                                          return {
                                            name: customDhikr.transliteration || customDhikr.name,
                                            targetCount: customDhikr.count,
                                            category: customDhikr.category,
                                            arabicText: customDhikr.arabicText,
                                            transliteration: customDhikr.transliteration,
                                            translation: customDhikr.translation,
                                            audio: customDhikr.audio,
                                          }
                                        }

                                        // Arapça zikirlerden ara
                                        const arabicIndex = Number.parseInt(id)
                                        if (
                                          !isNaN(arabicIndex) &&
                                          arabicIndex >= 0 &&
                                          arabicIndex < arabicDhikrsFromLib.length
                                        ) {
                                          const arabicDhikr = arabicDhikrsFromLib[arabicIndex]
                                          return {
                                            name: arabicDhikr.transliteration,
                                            targetCount: arabicDhikr.count,
                                            category: arabicDhikr.category,
                                            arabicText: arabicDhikr.name,
                                            transliteration: arabicDhikr.transliteration,
                                            translation: arabicDhikr.translation,
                                            audio: arabicDhikr.audio,
                                          }
                                        }

                                        return null
                                      })
                                      .filter(Boolean)

                                    if (dhikrsToAdd.length > 0) {
                                      addDhikrSeries(dhikrsToAdd)

                                      // İlk zikiri hemen başlat
                                      setTimeout(() => {
                                        const seriesId = Date.now().toString()
                                        const firstDhikr = {
                                          id: seriesId + "0",
                                          name: dhikrsToAdd[0].name,
                                          targetCount: dhikrsToAdd[0].targetCount,
                                          currentCount: 0,
                                          dateCreated: new Date().toISOString(),
                                          status: "in-progress" as const,
                                          category: dhikrsToAdd[0].category,
                                          arabicText: dhikrsToAdd[0].arabicText,
                                          transliteration: dhikrsToAdd[0].transliteration,
                                          translation: dhikrsToAdd[0].translation,
                                          isPartOfSeries: true,
                                          seriesIndex: 0,
                                          seriesId: seriesId,
                                          audio: dhikrsToAdd[0].audio,
                                        }

                                        setActiveDhikr(firstDhikr)
                                      }, 500)
                                    }
                                  }}
                                >
                                  <Play className="mr-2 h-4 w-4" /> Seri Başlat
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )
                  })()}
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="recent">Son Çekilenler</TabsTrigger>
              <TabsTrigger value="planned">Çekilecekler</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {Object.entries(groupedCompletedDhikrs).length > 0 ? (
                Object.entries(groupedCompletedDhikrs).map(([date, dhikrs]) => (
                  <div key={date} className="space-y-2">
                    <div className="sticky top-0 bg-background z-10 py-1">
                      <h2 className="text-sm font-medium text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {date}
                      </h2>
                    </div>
                    {dhikrs.map((dhikr) => (
                      <Card key={dhikr.id} className="overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{dhikr.name}</CardTitle>
                              {dhikr.category && (
                                <Badge variant="outline" className="mt-1">
                                  {dhikr.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-green-500"
                                onClick={() => repeatDhikr(dhikr)}
                                title="Çekilecekler listesine ekle"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Zikir Silinecek</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu zikir kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteDhikr(dhikr.id)}>Sil</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 pb-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{dhikr.targetCount} kez tamamlandı</p>
                            <Badge variant="outline" className="text-xs">
                              {formatDistanceToNow(new Date(dhikr.dateCompleted!), { addSuffix: true, locale: tr })}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Henüz tamamlanmış zikir bulunmuyor</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedDate || searchTerm || selectedCategory
                      ? "Filtreleri temizlemeyi veya farklı bir arama yapmayı deneyin."
                      : "Zikir çekmeye başlamak için 'Çekilecekler' sekmesine geçin."}
                  </p>
                  {(selectedDate || searchTerm || selectedCategory) && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Filtreleri Temizle
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="planned" className="space-y-4">
              {filteredPlannedDhikrs.length > 0 ? (
                filteredPlannedDhikrs.map((dhikr) => (
                  <Card key={dhikr.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{dhikr.name}</CardTitle>
                          {dhikr.category && (
                            <Badge variant="outline" className="mt-1">
                              {dhikr.category}
                            </Badge>
                          )}
                          {dhikr.scheduledDays && dhikr.scheduledTime && (
                            <Badge variant="secondary" className="mt-1 ml-1">
                              <Clock className="h-3 w-3 mr-1" /> {dhikr.scheduledTime}
                            </Badge>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Zikir Silinecek</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu zikir kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteDhikr(dhikr.id)}>Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 pb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{dhikr.targetCount} kez</p>
                        <Badge variant="outline" className="text-xs">
                          {formatDistanceToNow(new Date(dhikr.dateCreated), { addSuffix: true, locale: tr })}
                        </Badge>
                      </div>
                      {dhikr.currentCount > 0 && (
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(dhikr.currentCount / dhikr.targetCount) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {dhikr.currentCount} / {dhikr.targetCount} (
                            {Math.round((dhikr.currentCount / dhikr.targetCount) * 100)}%)
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-2">
                      <Button variant="default" className="w-full" onClick={() => startDhikr(dhikr)}>
                        <Play className="mr-2 h-4 w-4" /> {dhikr.currentCount > 0 ? "Devam Et" : "Başla"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Henüz planlanmış zikir bulunmuyor</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory
                      ? "Filtreleri temizlemeyi veya farklı bir arama yapmayı deneyin."
                      : "Yeni bir zikir eklemek için aşağıdaki butona tıklayın."}
                  </p>
                  {searchTerm || selectedCategory ? (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Filtreleri Temizle
                    </Button>
                  ) : (
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Yeni Zikir Ekle
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {isMobile && (
            <BottomNav
              activeView={activeView}
              onNavigate={handleNavigation}
              onAddDhikr={() => setShowAddForm(true)}
              onShare={() => setShowShare(true)}
              onArabicDhikr={() => setShowArabicDhikr(true)}
              onDhikrLibrary={() => setShowDhikrLibrary(true)}
              onDhikrSeries={() => setShowDhikrSeries(true)}
            />
          )}

          {!isMobile && (
            <Button
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Tekrarla Modal */}
      {dhikrToRepeat && (
        <RepeatDhikrModal
          dhikr={dhikrToRepeat}
          open={repeatDhikrModalOpen}
          onOpenChange={setRepeatDhikrModalOpen}
          onRepeat={handleRepeatDhikr}
        />
      )}
    </div>
  )
}

