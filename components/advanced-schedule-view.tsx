"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Check, Info, FileText, CalendarDays, CalendarRange } from "lucide-react"
import type { Dhikr } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"
import { commonDhikrs, arabicDhikrs } from "@/lib/arabic-dhikrs"

interface AdvancedScheduleViewProps {
  dhikrs: Dhikr[]
  setDhikrs: React.Dispatch<React.SetStateAction<Dhikr[]>>
  onClose: () => void
}

type ScheduleType = "daily" | "weekly" | "monthly" | "custom" | "one-time"
type RepeatInterval = "day" | "week" | "month" | "year"

interface ScheduleSettings {
  type: ScheduleType
  days: string[]
  startDate: Date
  endDate?: Date
  time: string
  repeatEvery: number
  repeatInterval: RepeatInterval
  specificDates: Date[]
}

export function AdvancedScheduleView({ dhikrs, setDhikrs, onClose }: AdvancedScheduleViewProps) {
  const [activeTab, setActiveTab] = useState("existing")
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null)
  const [customName, setCustomName] = useState("")
  const [customCount, setCustomCount] = useState(33)
  const [customCategory, setCustomCategory] = useState("Tesbih")
  const [scheduleType, setScheduleType] = useState<ScheduleType>("daily")
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    type: "daily",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    startDate: new Date(),
    time: "08:00",
    repeatEvery: 1,
    repeatInterval: "day",
    specificDates: [],
  })
  const [useArabicText, setUseArabicText] = useState(false)
  const [selectedArabicDhikr, setSelectedArabicDhikr] = useState<(typeof arabicDhikrs)[0] | null>(null)
  const { toast } = useToast()

  const plannedDhikrs = dhikrs.filter((d) => d.status === "planned" || d.status === "in-progress")
  const scheduledDhikrs = plannedDhikrs.filter((d) => d.scheduledDays && d.scheduledTime)

  const weekdays = [
    { value: "monday", label: "Pazartesi" },
    { value: "tuesday", label: "Salı" },
    { value: "wednesday", label: "Çarşamba" },
    { value: "thursday", label: "Perşembe" },
    { value: "friday", label: "Cuma" },
    { value: "saturday", label: "Cumartesi" },
    { value: "sunday", label: "Pazar" },
  ]

  const toggleDay = (day: string) => {
    if (scheduleSettings.days.includes(day)) {
      setScheduleSettings({
        ...scheduleSettings,
        days: scheduleSettings.days.filter((d) => d !== day),
      })
    } else {
      setScheduleSettings({
        ...scheduleSettings,
        days: [...scheduleSettings.days, day],
      })
    }
  }

  const selectAllDays = () => {
    setScheduleSettings({
      ...scheduleSettings,
      days: weekdays.map((day) => day.value),
    })
  }

  const clearAllDays = () => {
    setScheduleSettings({
      ...scheduleSettings,
      days: [],
    })
  }

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type)
    setScheduleSettings({
      ...scheduleSettings,
      type,
    })
  }

  const addSpecificDate = (date: Date) => {
    // Tarih zaten eklenmişse, kaldır
    if (scheduleSettings.specificDates.some((d) => isSameDay(d, date))) {
      setScheduleSettings({
        ...scheduleSettings,
        specificDates: scheduleSettings.specificDates.filter((d) => !isSameDay(d, date)),
      })
    } else {
      // Değilse ekle
      setScheduleSettings({
        ...scheduleSettings,
        specificDates: [...scheduleSettings.specificDates, date],
      })
    }
  }

  const createCustomDhikr = () => {
    if (!customName.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir zikir adı girin.",
        variant: "destructive",
      })
      return
    }

    // Planlama ayarlarını hazırla
    let scheduledDays: string[] = []
    let scheduledDates: string[] = []

    if (scheduleType === "daily") {
      scheduledDays = scheduleSettings.days
    } else if (scheduleType === "weekly") {
      scheduledDays = scheduleSettings.days
    } else if (scheduleType === "custom" || scheduleType === "one-time") {
      scheduledDates = scheduleSettings.specificDates.map((date) => date.toISOString())
    }

    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      name: customName.trim(),
      targetCount: customCount,
      currentCount: 0,
      dateCreated: new Date().toISOString(),
      status: "planned",
      category: customCategory,
      scheduledDays: scheduledDays,
      scheduledTime: scheduleSettings.time,
      scheduledDates: scheduledDates.length > 0 ? scheduledDates : undefined,
      scheduleType: scheduleType,
      scheduleSettings: {
        repeatEvery: scheduleSettings.repeatEvery,
        repeatInterval: scheduleSettings.repeatInterval,
        startDate: scheduleSettings.startDate.toISOString(),
        endDate: scheduleSettings.endDate?.toISOString(),
      },
      arabicText: selectedArabicDhikr?.name,
      transliteration: selectedArabicDhikr?.transliteration,
      translation: selectedArabicDhikr?.translation,
    }

    setDhikrs((prev) => [...prev, newDhikr])

    toast({
      title: "Zikir oluşturuldu ve planlandı",
      description: `"${customName}" zikri oluşturuldu ve planlandı.`,
    })

    // Reset form
    setCustomName("")
    setCustomCount(33)
    setCustomCategory("Tesbih")
    setScheduleSettings({
      type: "daily",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      startDate: new Date(),
      time: "08:00",
      repeatEvery: 1,
      repeatInterval: "day",
      specificDates: [],
    })
    setActiveTab("existing")
    setSelectedArabicDhikr(null)
    setUseArabicText(false)
  }

  const saveSchedule = () => {
    if (!selectedDhikr) {
      toast({
        title: "Hata",
        description: "Lütfen bir zikir seçin.",
        variant: "destructive",
      })
      return
    }

    // Planlama ayarlarını hazırla
    let scheduledDays: string[] = []
    let scheduledDates: string[] = []

    if (scheduleType === "daily" || scheduleType === "weekly") {
      if (scheduleSettings.days.length === 0) {
        toast({
          title: "Hata",
          description: "Lütfen en az bir gün seçin.",
          variant: "destructive",
        })
        return
      }
      scheduledDays = scheduleSettings.days
    } else if (scheduleType === "custom" || scheduleType === "one-time") {
      if (scheduleSettings.specificDates.length === 0) {
        toast({
          title: "Hata",
          description: "Lütfen en az bir tarih seçin.",
          variant: "destructive",
        })
        return
      }
      scheduledDates = scheduleSettings.specificDates.map((date) => date.toISOString())
    }

    setDhikrs((prev) =>
      prev.map((dhikr) => {
        if (dhikr.id === selectedDhikr.id) {
          return {
            ...dhikr,
            scheduledDays: scheduledDays,
            scheduledTime: scheduleSettings.time,
            scheduledDates: scheduledDates.length > 0 ? scheduledDates : undefined,
            scheduleType: scheduleType,
            scheduleSettings: {
              repeatEvery: scheduleSettings.repeatEvery,
              repeatInterval: scheduleSettings.repeatInterval,
              startDate: scheduleSettings.startDate.toISOString(),
              endDate: scheduleSettings.endDate?.toISOString(),
            },
          }
        }
        return dhikr
      }),
    )

    toast({
      title: "Zikir planlandı",
      description: `"${selectedDhikr.name}" zikri seçilen plana göre hatırlatılacak.`,
    })

    setSelectedDhikr(null)
    setScheduleSettings({
      type: "daily",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      startDate: new Date(),
      time: "08:00",
      repeatEvery: 1,
      repeatInterval: "day",
      specificDates: [],
    })
  }

  const clearSchedule = (dhikr: Dhikr) => {
    setDhikrs((prev) =>
      prev.map((d) => {
        if (d.id === dhikr.id) {
          // Destructuring ile planlama özelliklerini çıkarıp geri kalanı rest'e atıyoruz
          const { scheduledDays, scheduledTime, scheduledDates, scheduleType, scheduleSettings, ...rest } = d
          return rest
        }
        return d
      }),
    )

    toast({
      title: "Plan kaldırıldı",
      description: `"${dhikr.name}" zikri için planlama kaldırıldı.`,
    })
  }

  const handleDhikrSelect = (dhikr: Dhikr) => {
    setSelectedDhikr(dhikr)

    // Mevcut planlama ayarlarını yükle
    if (dhikr.scheduleType) {
      setScheduleType(dhikr.scheduleType)

      const settings: ScheduleSettings = {
        type: dhikr.scheduleType,
        days: dhikr.scheduledDays || [],
        startDate: dhikr.scheduleSettings?.startDate ? new Date(dhikr.scheduleSettings.startDate) : new Date(),
        endDate: dhikr.scheduleSettings?.endDate ? new Date(dhikr.scheduleSettings.endDate) : undefined,
        time: dhikr.scheduledTime || "08:00",
        repeatEvery: dhikr.scheduleSettings?.repeatEvery || 1,
        repeatInterval: dhikr.scheduleSettings?.repeatInterval || "day",
        specificDates: dhikr.scheduledDates ? dhikr.scheduledDates.map((date) => new Date(date)) : [],
      }

      setScheduleSettings(settings)
    } else {
      // Varsayılan ayarlar
      setScheduleType("daily")
      setScheduleSettings({
        type: "daily",
        days: dhikr.scheduledDays || [],
        startDate: new Date(),
        time: dhikr.scheduledTime || "08:00",
        repeatEvery: 1,
        repeatInterval: "day",
        specificDates: [],
      })
    }
  }

  const selectFromCollection = (preset: (typeof commonDhikrs)[0]) => {
    setCustomName(preset.name)
    setCustomCount(preset.count)
    setCustomCategory(preset.category || "Tesbih")
    setSelectedArabicDhikr(null)
    setUseArabicText(false)
  }

  const selectFromArabicCollection = (preset: (typeof arabicDhikrs)[0]) => {
    setCustomName(preset.transliteration)
    setCustomCount(preset.count)
    setCustomCategory(preset.category || "Tesbih")
    setSelectedArabicDhikr(preset)
    setUseArabicText(true)
  }

  const formatDays = (days: string[]) => {
    if (!days || days.length === 0) return ""

    if (days.length === 7) return "Her gün"

    return days
      .map((day) => {
        const dayObj = weekdays.find((d) => d.value === day)
        return dayObj ? dayObj.label.substring(0, 3) : ""
      })
      .join(", ")
  }

  const formatScheduleType = (type: ScheduleType, settings: any) => {
    switch (type) {
      case "daily":
        return "Günlük"
      case "weekly":
        return "Haftalık"
      case "monthly":
        return "Aylık"
      case "custom":
        return "Özel"
      case "one-time":
        return "Tek Seferlik"
      default:
        return "Planlı"
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Gelişmiş Planlama</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Planlı Zikirler
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Planlı zikirler, seçtiğiniz günlerde ve saatte size hatırlatılır.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {scheduledDhikrs.length > 0 ? (
              <div className="space-y-4">
                {scheduledDhikrs.map((dhikr) => (
                  <div key={dhikr.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{dhikr.name}</p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2">
                          <Clock className="h-3 w-3 mr-1" /> {dhikr.scheduledTime}
                        </Badge>
                        <Badge variant="secondary" className="mr-2">
                          {dhikr.scheduleType
                            ? formatScheduleType(dhikr.scheduleType, dhikr.scheduleSettings)
                            : "Planlı"}
                        </Badge>
                        {dhikr.scheduledDays && dhikr.scheduledDays.length > 0 && (
                          <p className="text-xs text-muted-foreground">{formatDays(dhikr.scheduledDays)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDhikrSelect(dhikr)}>
                        Düzenle
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => clearSchedule(dhikr)}>
                        Kaldır
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Henüz planlı zikir yok</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Günlük, haftalık veya aylık hatırlatmalar için zikir planlayın.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Yeni Plan Ekle</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="existing">Mevcut Zikirler</TabsTrigger>
                <TabsTrigger value="collection">Koleksiyon</TabsTrigger>
                <TabsTrigger value="custom">Yeni Oluştur</TabsTrigger>
              </TabsList>

              <TabsContent value="existing">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Zikir Seçin</label>
                    <Select
                      value={selectedDhikr?.id || ""}
                      onValueChange={(value) => {
                        const dhikr = plannedDhikrs.find((d) => d.id === value)
                        if (dhikr) handleDhikrSelect(dhikr)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zikir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {plannedDhikrs.length > 0 ? (
                          plannedDhikrs.map((dhikr) => (
                            <SelectItem key={dhikr.id} value={dhikr.id}>
                              {dhikr.name} {dhikr.scheduledDays && dhikr.scheduledTime && "(Planlı)"}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Henüz planlanabilecek zikir bulunmuyor
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDhikr && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Plan Türü</label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            variant={scheduleType === "daily" ? "default" : "outline"}
                            className="w-full"
                            onClick={() => handleScheduleTypeChange("daily")}
                          >
                            <Calendar className="mr-2 h-4 w-4" /> Günlük
                          </Button>
                          <Button
                            type="button"
                            variant={scheduleType === "weekly" ? "default" : "outline"}
                            className="w-full"
                            onClick={() => handleScheduleTypeChange("weekly")}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" /> Haftalık
                          </Button>
                          <Button
                            type="button"
                            variant={scheduleType === "custom" ? "default" : "outline"}
                            className="w-full"
                            onClick={() => handleScheduleTypeChange("custom")}
                          >
                            <CalendarRange className="mr-2 h-4 w-4" /> Özel
                          </Button>
                        </div>
                      </div>

                      {(scheduleType === "daily" || scheduleType === "weekly") && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Günler</label>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={selectAllDays}>
                                Tümünü Seç
                              </Button>
                              <Button variant="outline" size="sm" onClick={clearAllDays}>
                                Temizle
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {weekdays.map((day) => (
                              <Button
                                key={day.value}
                                type="button"
                                size="sm"
                                variant={scheduleSettings.days.includes(day.value) ? "default" : "outline"}
                                className="h-10"
                                onClick={() => toggleDay(day.value)}
                              >
                                {day.label.substring(0, 3)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {scheduleType === "custom" && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Özel Tarihler</label>
                          <div className="border rounded-md p-2">
                            <CalendarComponent
                              mode="multiple"
                              selected={scheduleSettings.specificDates}
                              onSelect={(dates) => {
                                if (dates && Array.isArray(dates)) {
                                  setScheduleSettings({
                                    ...scheduleSettings,
                                    specificDates: dates,
                                  })
                                }
                              }}
                              className="rounded-md"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Seçilen tarih sayısı: {scheduleSettings.specificDates.length}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium mb-1 block">Saat</label>
                        <input
                          type="time"
                          value={scheduleSettings.time}
                          onChange={(e) =>
                            setScheduleSettings({
                              ...scheduleSettings,
                              time: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      {(scheduleType === "daily" || scheduleType === "weekly") && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Tekrar Sıklığı</label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1"
                                value={scheduleSettings.repeatEvery}
                                onChange={(e) =>
                                  setScheduleSettings({
                                    ...scheduleSettings,
                                    repeatEvery: Number.parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-20"
                              />
                              <Select
                                value={scheduleSettings.repeatInterval}
                                onValueChange={(value: RepeatInterval) =>
                                  setScheduleSettings({
                                    ...scheduleSettings,
                                    repeatInterval: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="day">Gün</SelectItem>
                                  <SelectItem value="week">Hafta</SelectItem>
                                  <SelectItem value="month">Ay</SelectItem>
                                  <SelectItem value="year">Yıl</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Başlangıç Tarihi</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                  {format(scheduleSettings.startDate, "PPP", { locale: tr })}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={scheduleSettings.startDate}
                                  onSelect={(date) =>
                                    date &&
                                    setScheduleSettings({
                                      ...scheduleSettings,
                                      startDate: date,
                                    })
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}

                      <Button className="w-full" onClick={saveSchedule}>
                        <Check className="mr-2 h-4 w-4" /> Planı Kaydet
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="collection">
                <div className="space-y-4">
                  <Tabs defaultValue="turkish">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="turkish">Türkçe</TabsTrigger>
                      <TabsTrigger value="arabic">Arapça</TabsTrigger>
                    </TabsList>

                    <TabsContent value="turkish" className="space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        {commonDhikrs.map((dhikr) => (
                          <Button
                            key={dhikr.name}
                            variant="outline"
                            onClick={() => {
                              selectFromCollection(dhikr)
                              setActiveTab("custom")
                            }}
                            className="justify-between"
                          >
                            <span>{dhikr.name}</span>
                            <Badge variant="secondary">{dhikr.count}</Badge>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="arabic" className="space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        {arabicDhikrs.map((dhikr) => (
                          <Button
                            key={dhikr.name}
                            variant="outline"
                            onClick={() => {
                              selectFromArabicCollection(dhikr)
                              setActiveTab("custom")
                            }}
                            className="justify-between"
                          >
                            <span>{dhikr.transliteration}</span>
                            <Badge variant="secondary">{dhikr.count}</Badge>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="custom">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customName">Zikir Adı</Label>
                    <Input
                      id="customName"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Örn: Sübhanallah"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="useArabicText" checked={useArabicText} onCheckedChange={setUseArabicText} />
                    <Label htmlFor="useArabicText">Arapça metin kullan</Label>
                  </div>

                  {useArabicText && (
                    <div>
                      <Label htmlFor="arabicText">Arapça Metin</Label>
                      {selectedArabicDhikr ? (
                        <div className="mt-1 p-2 border rounded-md">
                          <p className="font-arabic text-right text-xl">{selectedArabicDhikr.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{selectedArabicDhikr.transliteration}</p>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(value) => {
                            const dhikr = arabicDhikrs.find((d) => d.transliteration === value)
                            if (dhikr) selectFromArabicCollection(dhikr)
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Arapça zikir seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {arabicDhikrs.map((dhikr) => (
                              <SelectItem key={dhikr.transliteration} value={dhikr.transliteration}>
                                {dhikr.transliteration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="customCategory">Kategori</Label>
                    <Input
                      id="customCategory"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Örn: Tesbih"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customCount">Hedef Sayı</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCustomCount((prev) => Math.max(1, prev - 1))}
                      >
                        -
                      </Button>
                      <Input
                        id="customCount"
                        type="number"
                        min="1"
                        value={customCount}
                        onChange={(e) => setCustomCount(Number.parseInt(e.target.value) || 1)}
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCustomCount((prev) => prev + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Plan Türü</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={scheduleType === "daily" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleScheduleTypeChange("daily")}
                      >
                        <Calendar className="mr-2 h-4 w-4" /> Günlük
                      </Button>
                      <Button
                        type="button"
                        variant={scheduleType === "weekly" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleScheduleTypeChange("weekly")}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" /> Haftalık
                      </Button>
                      <Button
                        type="button"
                        variant={scheduleType === "custom" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleScheduleTypeChange("custom")}
                      >
                        <CalendarRange className="mr-2 h-4 w-4" /> Özel
                      </Button>
                    </div>
                  </div>

                  {(scheduleType === "daily" || scheduleType === "weekly") && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Günler</label>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={selectAllDays}>
                            Tümünü Seç
                          </Button>
                          <Button variant="outline" size="sm" onClick={clearAllDays}>
                            Temizle
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {weekdays.map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            size="sm"
                            variant={scheduleSettings.days.includes(day.value) ? "default" : "outline"}
                            className="h-10"
                            onClick={() => toggleDay(day.value)}
                          >
                            {day.label.substring(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {scheduleType === "custom" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Özel Tarihler</label>
                      <div className="border rounded-md p-2">
                        <CalendarComponent
                          mode="multiple"
                          selected={scheduleSettings.specificDates}
                          onSelect={(dates) => {
                            if (dates && Array.isArray(dates)) {
                              setScheduleSettings({
                                ...scheduleSettings,
                                specificDates: dates,
                              })
                            }
                          }}
                          className="rounded-md"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seçilen tarih sayısı: {scheduleSettings.specificDates.length}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1 block">Saat</label>
                    <input
                      type="time"
                      value={scheduleSettings.time}
                      onChange={(e) =>
                        setScheduleSettings({
                          ...scheduleSettings,
                          time: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  {(scheduleType === "daily" || scheduleType === "weekly") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tekrar Sıklığı</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            value={scheduleSettings.repeatEvery}
                            onChange={(e) =>
                              setScheduleSettings({
                                ...scheduleSettings,
                                repeatEvery: Number.parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-20"
                          />
                          <Select
                            value={scheduleSettings.repeatInterval}
                            onValueChange={(value: RepeatInterval) =>
                              setScheduleSettings({
                                ...scheduleSettings,
                                repeatInterval: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Gün</SelectItem>
                              <SelectItem value="week">Hafta</SelectItem>
                              <SelectItem value="month">Ay</SelectItem>
                              <SelectItem value="year">Yıl</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Başlangıç Tarihi</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {format(scheduleSettings.startDate, "PPP", { locale: tr })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={scheduleSettings.startDate}
                              onSelect={(date) =>
                                date &&
                                setScheduleSettings({
                                  ...scheduleSettings,
                                  startDate: date,
                                })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={createCustomDhikr}
                    disabled={
                      !customName.trim() ||
                      (scheduleType !== "custom" && scheduleSettings.days.length === 0) ||
                      (scheduleType === "custom" && scheduleSettings.specificDates.length === 0)
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" /> Oluştur ve Planla
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

