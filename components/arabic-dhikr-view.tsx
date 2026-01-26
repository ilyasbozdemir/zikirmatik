"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Play, Volume2, VolumeX, Copy, Check, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { arabicDhikrs, specialDaysDhikrs, prayerDhikrs } from "@/lib/arabic-dhikrs"
import { getStorageItem } from "@/lib/storage-helper"
import type { Dhikr } from "@/types/dhikr"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ArabicDhikrViewProps {
  onClose: () => void
  onAddDhikr: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
}

export function ArabicDhikrView({ onClose, onAddDhikr }: ArabicDhikrViewProps) {
  const [activeTab, setActiveTab] = useState("regular")
  const [soundEnabled, setSoundEnabled] = useState(() => getStorageItem("dhikrSoundEnabled", true))
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [dhikrToAdd, setDhikrToAdd] = useState<any | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { toast } = useToast()

  const playAudio = (audioPath: string | undefined) => {
    if (!soundEnabled || !audioPath) return
    try {
      const audio = new Audio(audioPath)
      audio.volume = 0.5
      audio.play()
    } catch (error) { console.error("Ses çalma hatası:", error) }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast({ title: "Kopyalandı!", description: "Arapça metin panoya kopyalandı." })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast({ title: "Hata", description: "Metin kopyalanırken bir hata oluştu.", variant: "destructive" })
    }
  }

  const handleAddConfirm = (dhikr: any) => {
    setDhikrToAdd(dhikr)
    setShowConfirm(true)
  }

  const executeAdd = () => {
    if (dhikrToAdd) {
      onAddDhikr({
        name: dhikrToAdd.transliteration || dhikrToAdd.name,
        targetCount: dhikrToAdd.count,
        category: dhikrToAdd.category,
        arabicText: dhikrToAdd.name,
        transliteration: dhikrToAdd.transliteration,
        translation: dhikrToAdd.translation || "",
      })
      toast({ title: "Zikir Eklendi", description: `"${dhikrToAdd.transliteration}" listeye eklendi.` })
      setShowConfirm(false)
      setDhikrToAdd(null)
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4 flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black bg-vibrant-gradient bg-clip-text text-transparent italic">Kütüphane</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="rounded-2xl">
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 mb-4 glass p-1 rounded-xl">
          <TabsTrigger value="regular" className="rounded-lg font-bold">Genel</TabsTrigger>
          <TabsTrigger value="special" className="rounded-lg font-bold text-xs sm:text-sm">Özel Gün</TabsTrigger>
          <TabsTrigger value="prayer" className="rounded-lg font-bold text-xs sm:text-sm">Namaz</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto pr-1">
          <TabsContent value="regular" className="space-y-4 mt-0">
            {arabicDhikrs.map((dhikr, index) => (
              <Card key={index} className="glass border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-arabic text-right mb-2 leading-loose">{dhikr.name}</CardTitle>
                      <p className="text-sm font-bold text-primary">{dhikr.transliteration}</p>
                      {dhikr.translation && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{dhikr.translation}</p>}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => copyToClipboard(dhikr.name, index)}>
                        {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      {dhikr.audio && (
                        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" onClick={() => playAudio(dhikr.audio)} disabled={!soundEnabled}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="font-bold py-1 px-3 rounded-lg text-primary">{dhikr.count} Kez</Badge>
                    <Button className="rounded-xl bg-vibrant-gradient text-white font-black" size="sm" onClick={() => handleAddConfirm(dhikr)}>
                      <Plus className="mr-1 h-4 w-4" /> Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="special" className="space-y-6 mt-0">
            {specialDaysDhikrs.map((specialDay, dayIndex) => (
              <div key={dayIndex} className="space-y-4">
                <h2 className="text-lg font-black text-muted-foreground uppercase tracking-widest pl-2">{specialDay.name}</h2>
                {specialDay.dhikrs.map((dhikr, dhikrIndex) => (
                  <Card key={dhikrIndex} className="glass border-none shadow-sm rounded-2xl">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-arabic text-right mb-2 leading-loose">{dhikr.name}</CardTitle>
                          <p className="text-sm font-bold text-primary">{dhikr.transliteration}</p>
                        </div>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl ml-4" onClick={() => copyToClipboard(dhikr.name, dayIndex * 100 + dhikrIndex)}>
                          {copiedIndex === dayIndex * 100 + dhikrIndex ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="font-bold">{dhikr.count} Kez</Badge>
                        <Button className="rounded-xl bg-vibrant-gradient text-white font-black" size="sm" onClick={() => handleAddConfirm({ ...dhikr, audio: undefined })}>
                          <Plus className="mr-1 h-4 w-4" /> Ekle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="prayer" className="space-y-6 mt-0">
            {prayerDhikrs.map((prayerSet, setIndex) => (
              <div key={setIndex} className="space-y-4">
                <h2 className="text-lg font-black text-muted-foreground uppercase tracking-widest pl-2">{prayerSet.name}</h2>
                {prayerSet.dhikrs.map((dhikr, dhikrIndex) => (
                  <Card key={dhikrIndex} className="glass border-none shadow-sm rounded-2xl">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-arabic text-right mb-2 leading-loose">{dhikr.name}</CardTitle>
                          <p className="text-sm font-bold text-primary">{dhikr.transliteration}</p>
                        </div>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl ml-4" onClick={() => copyToClipboard(dhikr.name, setIndex * 100 + dhikrIndex)}>
                          {copiedIndex === setIndex * 100 + dhikrIndex ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="font-bold">{dhikr.count} Kez</Badge>
                        <Button className="rounded-xl bg-vibrant-gradient text-white font-black" size="sm" onClick={() => handleAddConfirm({ ...dhikr, transition: "", audio: undefined })}>
                          <Plus className="mr-1 h-4 w-4" /> Ekle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-premium">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl font-bold text-primary">
              <Plus className="h-6 w-6 mr-2" /> Zikre Başla?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              "{dhikrToAdd?.transliteration}" zikrini listenize eklemek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-none bg-secondary">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={executeAdd} className="rounded-xl bg-vibrant-gradient text-white border-none">Evet, Ekle</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
