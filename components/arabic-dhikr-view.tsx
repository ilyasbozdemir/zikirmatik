"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Volume2, VolumeX, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { arabicDhikrs, specialDaysDhikrs, prayerDhikrs } from "@/lib/arabic-dhikrs"
import type { Dhikr } from "@/app/page"

interface ArabicDhikrViewProps {
  onClose: () => void
  onAddDhikr: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
}

export function ArabicDhikrView({ onClose, onAddDhikr }: ArabicDhikrViewProps) {
  const [activeTab, setActiveTab] = useState("regular")
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrSoundEnabled")
    return saved !== null ? saved === "true" : true
  })
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const playAudio = (audioPath: string | undefined) => {
    if (!soundEnabled || !audioPath) return

    try {
      const audio = new Audio(audioPath)
      audio.volume = 0.5
      audio.play()
    } catch (error) {
      console.error("Ses çalma hatası:", error)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)

      toast({
        title: "Kopyalandı!",
        description: "Arapça metin panoya kopyalandı.",
      })

      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Metin kopyalanırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const addToList = (dhikr: (typeof arabicDhikrs)[0]) => {
    onAddDhikr({
      name: dhikr.name,
      targetCount: dhikr.count,
      category: dhikr.category,
      arabicText: dhikr.name,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
    })

    toast({
      title: "Zikir Eklendi",
      description: `"${dhikr.transliteration}" zikri çekilecekler listesine eklendi.`,
    })
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Arapça Zikirler</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="regular">Genel</TabsTrigger>
          <TabsTrigger value="special">Özel Günler</TabsTrigger>
          <TabsTrigger value="prayer">Namaz Sonrası</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
          {arabicDhikrs.map((dhikr, index) => (
            <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-arabic text-right text-2xl leading-relaxed">
                      {dhikr.name}
                    </CardTitle>
                    <p className="text-sm font-medium mt-1">{dhikr.transliteration}</p>
                    {dhikr.translation && <p className="text-xs text-muted-foreground mt-1">{dhikr.translation}</p>}
                    {dhikr.category && (
                      <Badge variant="outline" className="mt-2">
                        {dhikr.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => copyToClipboard(dhikr.name, index)}
                    >
                      {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    {dhikr.audio && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => playAudio(dhikr.audio)}
                        disabled={!soundEnabled}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{dhikr.count} kez</p>
                  <Button variant="outline" size="sm" onClick={() => addToList(dhikr)}>
                    <Play className="mr-2 h-4 w-4" /> Listeye Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="special" className="space-y-6">
          {specialDaysDhikrs.map((specialDay, dayIndex) => (
            <div key={dayIndex} className="space-y-4">
              <h2 className="text-lg font-medium">{specialDay.name}</h2>
              {specialDay.dhikrs.map((dhikr, dhikrIndex) => (
                <Card key={dhikrIndex} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-arabic text-right text-2xl leading-relaxed">
                          {dhikr.name}
                        </CardTitle>
                        <p className="text-sm font-medium mt-1">{dhikr.transliteration}</p>
                        {dhikr.translation && <p className="text-xs text-muted-foreground mt-1">{dhikr.translation}</p>}
                        {dhikr.category && (
                          <Badge variant="outline" className="mt-2">
                            {dhikr.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => copyToClipboard(dhikr.name, dayIndex * 100 + dhikrIndex)}
                      >
                        {copiedIndex === dayIndex * 100 + dhikrIndex ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{dhikr.count} kez</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addToList({
                            ...dhikr,
                            audio: undefined,
                          })
                        }
                      >
                        <Play className="mr-2 h-4 w-4" /> Listeye Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="prayer" className="space-y-6">
          {prayerDhikrs.map((prayerSet, setIndex) => (
            <div key={setIndex} className="space-y-4">
              <h2 className="text-lg font-medium">{prayerSet.name}</h2>
              {prayerSet.dhikrs.map((dhikr, dhikrIndex) => (
                <Card key={dhikrIndex} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-arabic text-right text-2xl leading-relaxed">
                          {dhikr.name}
                        </CardTitle>
                        <p className="text-sm font-medium mt-1">{dhikr.transliteration}</p>
                        {dhikr.category && (
                          <Badge variant="outline" className="mt-2">
                            {dhikr.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => copyToClipboard(dhikr.name, setIndex * 100 + dhikrIndex)}
                      >
                        {copiedIndex === setIndex * 100 + dhikrIndex ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{dhikr.count} kez</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addToList({
                            ...dhikr,
                            translation: "",
                            audio: undefined,
                          })
                        }
                      >
                        <Play className="mr-2 h-4 w-4" /> Listeye Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

