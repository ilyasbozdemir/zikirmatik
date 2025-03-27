"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Calendar, Clock, Check, FileText } from "lucide-react"
import type { Dhikr } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { commonDhikrs } from "@/app/page"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/format-number"

interface ScheduleViewProps {
  dhikrs: Dhikr[]
  setDhikrs: React.Dispatch<React.SetStateAction<Dhikr[]>>
  onClose: () => void
  onAdvancedSchedule: () => void
}

export function ScheduleView({ dhikrs, setDhikrs, onClose, onAdvancedSchedule }: ScheduleViewProps) {
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState("08:00")
  const [activeTab, setActiveTab] = useState("existing")
  const [customName, setCustomName] = useState("")
  const [customCount, setCustomCount] = useState(33)
  const [customCategory, setCustomCategory] = useState("Tesbih")
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
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const selectAllDays = () => {
    setSelectedDays(weekdays.map((day) => day.value))
  }

  const clearAllDays = () => {
    setSelectedDays([])
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

    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      name: customName.trim(),
      targetCount: customCount,
      currentCount: 0,
      dateCreated: new Date().toISOString(),
      status: "planned",
      category: customCategory,
      scheduledDays: selectedDays,
      scheduledTime: selectedTime,
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
    setSelectedDays([])
    setActiveTab("existing")
  }

  const saveSchedule = () => {
    if (!selectedDhikr || selectedDays.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir gün seçin.",
        variant: "destructive",
      })
      return
    }

    setDhikrs((prev) =>
      prev.map((dhikr) => {
        if (dhikr.id === selectedDhikr.id) {
          return {
            ...dhikr,
            scheduledDays: selectedDays,
            scheduledTime: selectedTime,
          }
        }
        return dhikr
      }),
    )

    toast({
      title: "Zikir planlandı",
      description: `"${selectedDhikr.name}" zikri seçilen günlerde hatırlatılacak.`,
    })

    setSelectedDhikr(null)
    setSelectedDays([])
  }

  const clearSchedule = (dhikr: Dhikr) => {
    setDhikrs((prev) =>
      prev.map((d) => {
        if (d.id === dhikr.id) {
          // Destructuring ile scheduledDays ve scheduledTime'ı çıkarıp geri kalanı rest'e atıyoruz
          const { scheduledDays, scheduledTime, ...rest } = d
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
    setSelectedDays(dhikr.scheduledDays || [])
    setSelectedTime(dhikr.scheduledTime || "08:00")
  }

  const selectFromCollection = (preset: (typeof commonDhikrs)[0]) => {
    setCustomName(preset.name)
    setCustomCount(preset.count)
    setCustomCategory(preset.category || "Tesbih")
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

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Zikir Planla</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Planlı Zikirler</CardTitle>
              <Button variant="outline" size="sm" onClick={onAdvancedSchedule}>
                <Clock className="mr-2 h-4 w-4" /> Gelişmiş
              </Button>
            </div>
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
                        <p className="text-xs text-muted-foreground">{formatDays(dhikr.scheduledDays!)}</p>
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
                  Günlük veya haftalık hatırlatmalar için zikir planlayın.
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
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedDhikr ? selectedDhikr.name : "Zikir seçin"}
                          <Plus className="h-4 w-4 ml-2" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[50vh]">
                        <SheetHeader className="mb-4">
                          <SheetTitle>Zikir Seçin</SheetTitle>
                          <SheetDescription>Planlamak istediğiniz zikri seçin</SheetDescription>
                        </SheetHeader>
                        <div className="space-y-2">
                          {plannedDhikrs.length > 0 ? (
                            plannedDhikrs.map((dhikr) => (
                              <Button
                                key={dhikr.id}
                                variant="outline"
                                className="w-full justify-between"
                                onClick={() => {
                                  handleDhikrSelect(dhikr)
                                }}
                              >
                                <span>{dhikr.name}</span>
                                {dhikr.scheduledDays && dhikr.scheduledTime && (
                                  <Badge variant="secondary">Planlı</Badge>
                                )}
                              </Button>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                Henüz planlanabilecek zikir bulunmuyor. Önce bir zikir ekleyin veya koleksiyondan seçin.
                              </p>
                            </div>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {selectedDhikr && (
                    <>
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
                              variant={selectedDays.includes(day.value) ? "default" : "outline"}
                              className="h-10"
                              onClick={() => toggleDay(day.value)}
                            >
                              {day.label.substring(0, 3)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Saat</label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      <Button className="w-full" onClick={saveSchedule} disabled={selectedDays.length === 0}>
                        <Check className="mr-2 h-4 w-4" /> Planı Kaydet
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="collection">
                <div className="space-y-4">
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
                        <Badge variant="secondary">{formatNumber(dhikr.count)}</Badge>
                      </Button>
                    ))}
                  </div>
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
                          variant={selectedDays.includes(day.value) ? "default" : "outline"}
                          className="h-10"
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Saat</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={createCustomDhikr}
                    disabled={!customName.trim() || selectedDays.length === 0}
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

