"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Save, Trash2, Play, List, AlertTriangle } from "lucide-react"
import type { Dhikr } from "@/types/dhikr"
import { useToast } from "@/hooks/use-toast"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PRESET_DHIKRS } from "@/lib/arabic-dhikrs"
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

interface DhikrSeries {
  id: string
  name: string
  description?: string
  dhikrs: string[] // List of dhikr IDs or names
  dateCreated: string
}

interface DhikrSeriesManagerProps {
  onClose: () => void
  onStartSeries: (seriesId: string) => void
  onAddToList: (seriesId: string) => void
}

export function DhikrSeriesManager({ onClose, onStartSeries, onAddToList }: DhikrSeriesManagerProps) {
  const [series, setSeries] = useState<DhikrSeries[]>([])
  const [editingSeries, setEditingSeries] = useState<Partial<DhikrSeries> | null>(null)
  const [selectedDhikrs, setSelectedDhikrs] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedSeries = getStorageItem("dhikrSeries", [])
    setSeries(savedSeries)
  }, [])

  useEffect(() => {
    if (series.length > 0) {
      setStorageItem("dhikrSeries", series)
    }
  }, [series])

  const createNewSeries = () => {
    setEditingSeries({
      name: "",
      description: "",
      dhikrs: [],
    })
    setSelectedDhikrs([])
    setIsCreating(true)
  }

  const editSeries = (seriesItem: DhikrSeries) => {
    setEditingSeries(seriesItem)
    setSelectedDhikrs(seriesItem.dhikrs)
    setIsCreating(false)
  }

  const saveSeries = () => {
    if (!editingSeries || !editingSeries.name) {
      toast({
        title: "Hata",
        description: "Lütfen seri için bir isim girin.",
        variant: "destructive",
      })
      return
    }

    if (selectedDhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen seriye en az bir zikir ekleyin.",
        variant: "destructive",
      })
      return
    }

    if (isCreating) {
      const newSeries: DhikrSeries = {
        id: Date.now().toString(),
        name: editingSeries.name,
        description: editingSeries.description,
        dhikrs: selectedDhikrs,
        dateCreated: new Date().toISOString(),
      }
      setSeries((prev) => [...prev, newSeries])
      toast({ title: "Seri oluşturuldu", description: `"${newSeries.name}" serisi başarıyla oluşturuldu.` })
    } else {
      setSeries((prev) =>
        prev.map((s) => (s.id === editingSeries.id ? { ...s, name: editingSeries.name!, description: editingSeries.description, dhikrs: selectedDhikrs } : s)),
      )
      toast({ title: "Seri güncellendi", description: `"${editingSeries.name}" serisi başarıyla güncellendi.` })
    }

    setEditingSeries(null)
    setSelectedDhikrs([])
  }

  const handleDeleteConfirm = (id: string) => {
    setSeriesToDelete(id)
  }

  const executeDeleteSeries = () => {
    if (seriesToDelete) {
      setSeries((prev) => prev.filter((s) => s.id !== seriesToDelete))
      toast({ title: "Silindi", description: "Zikir serisi başarıyla silindi." })
      setSeriesToDelete(null)
    }
  }

  const toggleDhikr = (dhikrName: string) => {
    setSelectedDhikrs((prev) =>
      prev.includes(dhikrName) ? prev.filter((d) => d !== dhikrName) : [...prev, dhikrName],
    )
  }

  if (editingSeries) {
    return (
      <div className="container max-w-md mx-auto p-4 flex flex-col h-screen overflow-hidden">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setEditingSeries(null)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">{isCreating ? "Yeni Seri" : "Seriyi Düzenle"}</h1>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pb-20 pr-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seriesName">Seri Adı</Label>
              <Input
                id="seriesName"
                placeholder="Örn: Namaz Tesbihatı"
                value={editingSeries.name}
                onChange={(e) => setEditingSeries({ ...editingSeries, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seriesDesc">Açıklama (İsteğe Bağlı)</Label>
              <Input
                id="seriesDesc"
                placeholder="Bu seri hakkında kısa bilgi..."
                value={editingSeries.description}
                onChange={(e) => setEditingSeries({ ...editingSeries, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-lg">Zikirleri Seçin</Label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_DHIKRS.map((dhikr: any) => (
                <div
                  key={dhikr.name}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedDhikrs.includes(dhikr.name) ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
                  onClick={() => toggleDhikr(dhikr.name)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedDhikrs.includes(dhikr.name)} />
                    <span className="font-bold">{dhikr.name}</span>
                  </div>
                  <Badge variant="secondary">{dhikr.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
          <Button className="w-full h-14 bg-vibrant-gradient text-white text-lg font-black rounded-2xl shadow-xl" onClick={saveSeries}>
            <Save className="mr-2 h-6 w-6" /> Seriyi Kaydet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto p-4 flex flex-col h-screen overflow-hidden">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Zikir Serilerim</h1>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pb-20 pr-1">
        {series.length > 0 ? (
          series.map((s) => (
            <Card key={s.id} className="glass border-none shadow-premium rounded-[2rem] overflow-hidden group">
              <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black">{s.name}</CardTitle>
                    {s.description && <CardDescription className="font-medium mt-1">{s.description}</CardDescription>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10" onClick={() => editSeries(s)}>
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteConfirm(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-2 mt-4">
                  {s.dhikrs.map((dName, idx) => (
                    <Badge key={idx} variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold">
                      {dName}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-2 bg-primary/5 flex gap-2">
                <Button variant="ghost" className="flex-1 font-bold rounded-xl" onClick={() => onAddToList(s.id)}>
                  Listeye Ekle
                </Button>
                <Button className="flex-1 bg-vibrant-gradient text-white font-black rounded-xl" onClick={() => onStartSeries(s.id)}>
                  <Play className="mr-2 h-4 w-4 fill-current" /> Başla
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-[3rem] border-dashed border-2 border-primary/20">
            <List className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-bold mb-2">Henüz seriniz yok</h3>
            <p className="text-muted-foreground px-10">Zikirleri gruplayarak daha hızlı çekim yapabilirsiniz.</p>
          </div>
        )}

        <Button className="w-full h-14 border-2 border-dashed bg-transparent hover:bg-primary/5 text-primary font-bold rounded-[2rem] mt-6" onClick={createNewSeries}>
          <Plus className="mr-2 h-6 w-6" /> Yeni Seri Oluştur
        </Button>
      </div>

      <AlertDialog open={!!seriesToDelete} onOpenChange={(open) => !open && setSeriesToDelete(null)}>
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-premium">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl font-bold">
              <AlertTriangle className="h-6 w-6 text-destructive mr-2" /> Seriyi Sil?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              Bu zikir serisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-none bg-secondary">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteSeries} className="rounded-xl bg-destructive text-white">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
