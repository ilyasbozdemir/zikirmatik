"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, BarChart3 } from "lucide-react"
import type { Dhikr } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"

interface StatsViewProps {
  dhikrs: Dhikr[]
  onClose: () => void
}

export function StatsView({ dhikrs, onClose }: StatsViewProps) {
  const [selectedTab, setSelectedTab] = useState("daily")

  // Get completed dhikrs
  const completedDhikrs = dhikrs.filter((d) => d.status === "completed" && d.dateCompleted)

  // Calculate total completed
  const totalCompleted = completedDhikrs.length

  // Calculate total count
  const totalCount = completedDhikrs.reduce((sum, d) => sum + d.targetCount, 0)

  // Get most frequent dhikr
  const dhikrCounts: Record<string, number> = {}
  completedDhikrs.forEach((d) => {
    dhikrCounts[d.name] = (dhikrCounts[d.name] || 0) + 1
  })

  const mostFrequentDhikr = Object.entries(dhikrCounts).sort((a, b) => b[1] - a[1])[0]

  // Get today's completions
  const today = new Date()
  const todayCompletions = completedDhikrs.filter((d) => {
    const date = new Date(d.dateCompleted!)
    return isToday(date)
  })

  // Get this week's data
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek })

  const weeklyData = daysOfWeek.map((day) => {
    const count = completedDhikrs.filter((d) => {
      const date = new Date(d.dateCompleted!)
      return isSameDay(date, day)
    }).length

    return {
      day: format(day, "EEEEEE", { locale: tr }),
      date: day,
      count,
    }
  })

  // Get category stats
  const categoryStats: Record<string, number> = {}
  completedDhikrs.forEach((d) => {
    const category = d.category || "Diğer"
    categoryStats[category] = (categoryStats[category] || 0) + 1
  })

  const categoryData = Object.entries(categoryStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">İstatistikler</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Zikir</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Sayı</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bugün</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{todayCompletions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Sık</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold truncate">{mostFrequentDhikr ? mostFrequentDhikr[0] : "-"}</div>
            <div className="text-xs text-muted-foreground">
              {mostFrequentDhikr ? `${mostFrequentDhikr[1]} kez` : ""}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="daily">Günlük</TabsTrigger>
          <TabsTrigger value="weekly">Haftalık</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Günlük İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {todayCompletions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Bugün</h3>
                      <p className="text-sm text-muted-foreground">{format(today, "d MMMM yyyy", { locale: tr })}</p>
                    </div>
                    <div className="text-2xl font-bold">{todayCompletions.length}</div>
                  </div>

                  <div className="space-y-2">
                    {todayCompletions.map((dhikr) => (
                      <div key={dhikr.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{dhikr.name}</p>
                          <p className="text-xs text-muted-foreground">{dhikr.targetCount} kez</p>
                        </div>
                        <div className="text-sm">{format(new Date(dhikr.dateCompleted!), "HH:mm", { locale: tr })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">Bugün tamamlanan zikir yok</h3>
                  <p className="text-sm text-muted-foreground">Bugün henüz zikir tamamlanmamış.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Haftalık İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {format(startOfCurrentWeek, "d MMM", { locale: tr })} -{" "}
                  {format(endOfCurrentWeek, "d MMM", { locale: tr })}
                </p>
                <div className="text-sm font-medium">Toplam: {weeklyData.reduce((sum, day) => sum + day.count, 0)}</div>
              </div>

              <div className="flex items-end justify-between h-40 mt-6">
                {weeklyData.map((day, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="bg-primary/80 w-8 rounded-t-md transition-all"
                      style={{
                        height: day.count ? `${Math.min(day.count * 20, 120)}px` : "4px",
                        opacity: isToday(day.date) ? 1 : 0.7,
                      }}
                    />
                    <div className={`text-xs mt-2 font-medium ${isToday(day.date) ? "text-primary" : ""}`}>
                      {day.day}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{day.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Kategori İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {categoryData.length > 0 ? (
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm font-medium">{category.count}</div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full"
                          style={{ width: `${(category.count / totalCompleted) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((category.count / totalCompleted) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">Kategori verisi yok</h3>
                  <p className="text-sm text-muted-foreground">Henüz tamamlanmış zikir bulunmuyor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

