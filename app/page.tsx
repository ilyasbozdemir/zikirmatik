"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import { Plus, Play, Trash2, RotateCcw, Calendar, X, BarChart3, Info, Clock } from "lucide-react"
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
  const { theme, setTheme } = useTheme()
  const isMobile = useMobile()

  // Load dhikrs from localStorage on component mount
  useEffect(() => {
    const savedDhikrs = localStorage.getItem("dhikrs")
    if (savedDhikrs) {
      setDhikrs(JSON.parse(savedDhikrs))
    } else {
      // Empty initial state
      setDhikrs([])
      localStorage.setItem("dhikrs", JSON.stringify([]))
    }

    // Check if it's the first time opening the app
    const hasSeenIntro = localStorage.getItem("hasSeenIntro")
    if (!hasSeenIntro) {
      setShowHelp(true)
      localStorage.setItem("hasSeenIntro", "true")
    }

    // Check for scheduled dhikrs
    checkScheduledDhikrs()
  }, [])

  // Save dhikrs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dhikrs", JSON.stringify(dhikrs))

    // Calculate streak
    calculateStreak()
  }, [dhikrs])

  // Check for scheduled dhikrs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkScheduledDhikrs()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [dhikrs])

  const checkScheduledDhikrs = () => {
    const now = new Date()
    // 'lowercase' geçerli bir seçenek değil, bunun yerine 'long' kullanıp sonra küçük harfe çevirelim
    const currentDay = now.toLocaleDateString("tr-TR", { weekday: "long" }).toLowerCase()
    console.log(currentDay); 
    const currentTime = format(now, "HH:mm")

    dhikrs.forEach((dhikr) => {
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
    setDhikrs((prev) =>
      prev.map((dhikr) => {
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
      }),
    )

    if (activeDhikr && activeDhikr.id === id) {
      if (count >= activeDhikr.targetCount) {
        setShowSuccess(true)
        setActiveDhikr(null)
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

  const deleteDhikr = (id: string) => {
    const dhikrToDelete = dhikrs.find((d) => d.id === id)
    setDhikrs((prev) => prev.filter((dhikr) => dhikr.id !== id))

    if (dhikrToDelete) {
      toast({
        title: "Zikir silindi",
        description: `"${dhikrToDelete.name}" zikri silindi.`,
      })
    }
  }

  const repeatDhikr = (dhikr: Dhikr) => {
    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      name: dhikr.name,
      targetCount: dhikr.targetCount,
      currentCount: 0,
      dateCreated: new Date().toISOString(),
      status: "planned",
      category: dhikr.category,
      scheduledDays: dhikr.scheduledDays,
      scheduledTime: dhikr.scheduledTime,
    }

    setDhikrs((prev) => [...prev, newDhikr])

    toast({
      title: "Zikir tekrarlanıyor",
      description: `"${dhikr.name}" zikri "Çekilecekler" listesine eklendi.`,
    })
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



  const handleNavigation = (view: string) => {
    setActiveView(view)

    switch (view) {
      case "home":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(false)
        break
      case "stats":
        setShowStats(true)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(false)
        break
      case "schedule":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(false)
        setShowSchedule(true)
        break
      case "help":
        setShowStats(false)
        setShowHelp(true)
        setShowSettings(false)
        setShowSchedule(false)
        break
      case "settings":
        setShowStats(false)
        setShowHelp(false)
        setShowSettings(true)
        setShowSchedule(false)
        break
    }
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
    return <SettingsView onClose={() => handleNavigation("home")} />
  }

  if (showSchedule) {
    return <ScheduleView dhikrs={dhikrs} setDhikrs={setDhikrs} onClose={() => handleNavigation("home")} />
  }

  return (
    <div className={`flex ${!isMobile ? "flex-row" : "flex-col"} min-h-screen`}>
      {!isMobile && (
        <Sidebar activeView={activeView} onNavigate={handleNavigation} onAddDhikr={() => setShowAddForm(true)} />
      )}

      <div className={`${!isMobile ? "flex-1 ml-64" : "w-full"} pb-20`}>
        <div className="container max-w-md mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Zikirmatik</h1>
            <div className="flex items-center space-x-2">
              {isMobile && (
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
                </>
              )}
              <ModeToggle />
            </div>
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


            {(selectedDate || searchTerm || selectedCategory) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            )}
          </div>

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
            <BottomNav activeView={activeView} onNavigate={handleNavigation} onAddDhikr={() => setShowAddForm(true)} />
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
    </div>
  )
}

