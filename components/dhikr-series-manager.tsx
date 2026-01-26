"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Save, Trash2, Play, List } from "lucide-react"
import type { Dhikr } from "@/types/dhikr"
import { useToast } from "@/hooks/use-toast"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
} from "@hello-pangea/dnd"

// Zikir serisi tipi
export type DhikrSeries = {
  id: string
  name: string
  description: string
  dhikrs: string[] // Dhikr ID'leri
  dateCreated: string
  lastUsed?: string
  color?: string
  icon?: string
}

interface DhikrSeriesManagerProps {
  dhikrs: Dhikr[]
  onClose: () => void
  onStartSeries: (seriesId: string) => void
  onAddToList: (seriesId: string) => void
}

export function DhikrSeriesManager({ dhikrs, onClose, onStartSeries, onAddToList }: DhikrSeriesManagerProps) {
  const [series, setSeries] = useState<DhikrSeries[]>([])
  const [editingSeries, setEditingSeries] = useState<DhikrSeries | null>(null)
  const [selectedDhikrs, setSelectedDhikrs] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // Serileri localStorage'dan yükle
  useEffect(() => {
    const savedSeries = getStorageItem("dhikrSeries", [])
    setSeries(savedSeries)
  }, [])

  // Serileri localStorage'a kaydet
  useEffect(() => {
    if (series.length > 0) {
      setStorageItem("dhikrSeries", series)
    }
  }, [series])

  const plannedDhikrs = dhikrs.filter((d) => d.status === "planned" || d.status === "in-progress")

  const createNewSeries = () => {
    setEditingSeries({
      id: "",
      name: "",
      description: "",
      dhikrs: [],
      dateCreated: "",
      color: "#3b82f6", // Default blue color
      icon: "list",
    })
    setSelectedDhikrs([])
    setIsCreating(true)
  }

  const editSeries = (seriesId: string) => {
    const seriesItem = series.find((s) => s.id === seriesId)
    if (seriesItem) {
      setEditingSeries(seriesItem)
      setSelectedDhikrs([...seriesItem.dhikrs])
      setIsCreating(false)
    }
  }

  const saveSeries = () => {
    if (!editingSeries) return

    if (!editingSeries.name.trim()) {
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
      // Yeni seri oluştur
      const newSeries: DhikrSeries = {
        ...editingSeries,
        id: Date.now().toString(),
        dhikrs: selectedDhikrs,
        dateCreated: new Date().toISOString(),
      }

      setSeries((prev) => [...prev, newSeries])

      toast({
        title: "Seri oluşturuldu",
        description: `"${newSeries.name}" serisi başarıyla oluşturuldu.`,
      })
    } else {
      // Mevcut seriyi güncelle
      setSeries((prev) =>
        prev.map((s) => (s.id === editingSeries.id ? { ...editingSeries, dhikrs: selectedDhikrs } : s)),
      )

      toast({
        title: "Seri güncellendi",
        description: `"${editingSeries.name}" serisi başarıyla güncellendi.`,
      })
    }

    setEditingSeries(null)
    setSelectedDhikrs([])
  }

  const deleteSeries = (seriesId: string) => {
    setSeries((prev) => prev.filter((s) => s.id !== seriesId))

    toast({
      title: "Seri silindi",
      description: "Zikir serisi başarıyla silindi.",
    })
  }

  const toggleDhikrSelection = (dhikrId: string) => {
    if (selectedDhikrs.includes(dhikrId)) {
      setSelectedDhikrs((prev) => prev.filter((id) => id !== dhikrId))
    } else {
      setSelectedDhikrs((prev) => [...prev, dhikrId])
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(selectedDhikrs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedDhikrs(items)
  }

  const getDhikrById = (id: string) => {
    return dhikrs.find((d) => d.id === id)
  }

  // Eğer bir seri düzenliyorsak
  if (editingSeries) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingSeries(null)
              setSelectedDhikrs([])
            }}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">{isCreating ? "Yeni Zikir Serisi" : "Seriyi Düzenle"}</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Seri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Seri Adı</Label>
                  <Input
                    id="name"
                    value={editingSeries.name}
                    onChange={(e) => setEditingSeries((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    placeholder="Örn: Sabah Zikirleri"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıklama (İsteğe Bağlı)</Label>
                  <Input
                    id="description"
                    value={editingSeries.description}
                    onChange={(e) =>
                      setEditingSeries((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                    placeholder="Seri hakkında kısa açıklama"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Zikirler</CardTitle>
              <CardDescription>Seriye eklemek istediğiniz zikirleri seçin ve sıralayın</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-2">Mevcut Zikirler</p>
                  {plannedDhikrs.length > 0 ? (
                    plannedDhikrs.map((dhikr) => (
                      <div key={dhikr.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id={`dhikr-${dhikr.id}`}
                          checked={selectedDhikrs.includes(dhikr.id)}
                          onChange={() => toggleDhikrSelection(dhikr.id)}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`dhikr-${dhikr.id}`} className="text-sm flex-1">
                          {dhikr.name} ({dhikr.targetCount})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Henüz çekilecek zikir bulunmuyor. Önce zikir ekleyin.
                    </p>
                  )}
                </div>

                {selectedDhikrs.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Seçilen Zikirler (Sıralamak için sürükleyin)</Label>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="dhikrs">
                        {(provided: DroppableProvided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="border rounded-md p-2">
                            {selectedDhikrs.map((dhikrId, index) => {
                              const dhikr = getDhikrById(dhikrId)
                              if (!dhikr) return null

                              return (
                                <Draggable key={dhikrId} draggableId={dhikrId} index={index}>
                                  {(provided: DraggableProvided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-between p-2 mb-2 bg-secondary/50 rounded-md"
                                    >
                                      <div>
                                        <p className="font-medium">{dhikr.name}</p>
                                        <p className="text-xs text-muted-foreground">{dhikr.targetCount} kez</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => toggleDhikrSelection(dhikrId)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEditingSeries(null)
                setSelectedDhikrs([])
              }}
            >
              İptal
            </Button>
            <Button
              className="flex-1"
              onClick={saveSeries}
              disabled={!editingSeries.name || selectedDhikrs.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              {isCreating ? "Oluştur" : "Güncelle"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Ana seri listesi görünümü
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Zikir Serileri</h1>
      </div>

      <div className="space-y-6">
        {series.length > 0 ? (
          series.map((seriesItem) => (
            <Card key={seriesItem.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{seriesItem.name}</CardTitle>
                    {seriesItem.description && <CardDescription>{seriesItem.description}</CardDescription>}
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">
                        {seriesItem.dhikrs.length} zikir
                      </Badge>
                      {seriesItem.lastUsed && (
                        <p className="text-xs text-muted-foreground">
                          Son kullanım: {new Date(seriesItem.lastUsed).toLocaleDateString("tr-TR")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => editSeries(seriesItem.id)}
                    >
                      <Plus className="h-4 w-4" />
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
                          <AlertDialogTitle>Seri Silinecek</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu zikir serisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSeries(seriesItem.id)}>Sil</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {seriesItem.dhikrs.slice(0, 3).map((dhikrId) => {
                    const dhikr = getDhikrById(dhikrId)
                    if (!dhikr) return null

                    return (
                      <div key={dhikrId} className="flex items-center justify-between">
                        <p className="text-sm">{dhikr.name}</p>
                        <Badge variant="outline">{dhikr.targetCount}</Badge>
                      </div>
                    )
                  })}

                  {seriesItem.dhikrs.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{seriesItem.dhikrs.length - 3} daha fazla zikir
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-2 flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => onAddToList(seriesItem.id)}>
                  <List className="mr-2 h-4 w-4" /> Listeye Ekle
                </Button>
                <Button className="flex-1" onClick={() => onStartSeries(seriesItem.id)}>
                  <Play className="mr-2 h-4 w-4" /> Seriye Başla
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Henüz zikir serisi oluşturulmamış</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sık kullandığınız zikirleri seri halinde gruplayabilirsiniz.
            </p>
          </div>
        )}

        <Button className="w-full" onClick={createNewSeries}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Zikir Serisi Oluştur
        </Button>
      </div>
    </div>
  )
}

