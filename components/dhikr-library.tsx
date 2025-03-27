"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Copy, Check, Edit, Trash2, Save, Volume2, VolumeX, BookOpen, Search, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { arabicDhikrs } from "@/lib/arabic-dhikrs"
import type { Dhikr } from "@/app/page"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface DhikrLibraryProps {
  onClose: () => void
  onAddDhikr: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
}

type CustomDhikr = {
  id: string
  name: string
  arabicText: string
  transliteration: string
  translation: string
  count: number
  category: string
  audio?: string
}

export function DhikrLibrary({ onClose, onAddDhikr }: DhikrLibraryProps) {
  const [activeTab, setActiveTab] = useState("collection")
  const [searchTerm, setSearchTerm] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrSoundEnabled")
    return saved !== null ? saved === "true" : true
  })
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [customDhikrs, setCustomDhikrs] = useState<CustomDhikr[]>([])
  const [editingDhikr, setEditingDhikr] = useState<CustomDhikr | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [clipboardText, setClipboardText] = useState<string | null>(null)
  const { toast } = useToast()

  // Load custom dhikrs from localStorage
  useEffect(() => {
    const savedCustomDhikrs = localStorage.getItem("customDhikrs")
    if (savedCustomDhikrs) {
      try {
        setCustomDhikrs(JSON.parse(savedCustomDhikrs))
      } catch (error) {
        console.error("Error parsing saved custom dhikrs:", error)
        setCustomDhikrs([])
      }
    }
  }, [])

  // Check clipboard for text
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText()
          if (text && text.trim()) {
            setClipboardText(text)
          }
        }
      } catch (error) {
        console.error("Error reading clipboard:", error)
      }
    }

    checkClipboard()
  }, [isAddingNew])

  // Save custom dhikrs to localStorage
  useEffect(() => {
    localStorage.setItem("customDhikrs", JSON.stringify(customDhikrs))
  }, [customDhikrs])

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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(id)

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

  const addToList = (dhikr: (typeof arabicDhikrs)[0] | CustomDhikr) => {
    onAddDhikr({
      name: dhikr.transliteration || dhikr.name,
      targetCount: dhikr.count,
      category: dhikr.category,
      arabicText: dhikr.name || dhikr.arabicText,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
    })

    toast({
      title: "Zikir Eklendi",
      description: `"${dhikr.transliteration || dhikr.name}" zikri çekilecekler listesine eklendi.`,
    })
  }

  const addNewCustomDhikr = () => {
    if (!editingDhikr) return

    if (!editingDhikr.arabicText.trim() && !editingDhikr.transliteration.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen en az Arapça metin veya Latin harfli okunuş girin.",
        variant: "destructive",
      })
      return
    }

    const newDhikr: CustomDhikr = {
      ...editingDhikr,
      id: Date.now().toString(),
    }

    setCustomDhikrs((prev) => [...prev, newDhikr])
    setEditingDhikr(null)
    setIsAddingNew(false)

    toast({
      title: "Zikir Kütüphaneye Eklendi",
      description: "Özel zikir başarıyla kütüphaneye eklendi.",
    })
  }

  const updateCustomDhikr = () => {
    if (!editingDhikr) return

    setCustomDhikrs((prev) => prev.map((d) => (d.id === editingDhikr.id ? editingDhikr : d)))
    setEditingDhikr(null)

    toast({
      title: "Zikir Güncellendi",
      description: "Özel zikir başarıyla güncellendi.",
    })
  }

  const deleteCustomDhikr = (id: string) => {
    setCustomDhikrs((prev) => prev.filter((d) => d.id !== id))

    toast({
      title: "Zikir Silindi",
      description: "Özel zikir kütüphaneden silindi.",
    })
  }

  const startEditing = (dhikr: CustomDhikr) => {
    setEditingDhikr({ ...dhikr })
  }

  const pasteFromClipboard = () => {
    if (!clipboardText) return

    if (editingDhikr) {
      // Determine if the clipboard text is likely Arabic
      const isArabic = /[\u0600-\u06FF]/.test(clipboardText)

      if (isArabic) {
        setEditingDhikr({
          ...editingDhikr,
          arabicText: clipboardText,
        })
      } else {
        setEditingDhikr({
          ...editingDhikr,
          transliteration: clipboardText,
        })
      }

      toast({
        title: "Metin Yapıştırıldı",
        description: isArabic ? "Arapça metin yapıştırıldı." : "Latin harfli metin yapıştırıldı.",
      })
    }
  }

  const filteredArabicDhikrs = arabicDhikrs.filter(
    (dhikr) =>
      dhikr.name.includes(searchTerm) ||
      dhikr.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dhikr.translation?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCustomDhikrs = customDhikrs.filter(
    (dhikr) =>
      dhikr.arabicText.includes(searchTerm) ||
      dhikr.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dhikr.translation?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Zikir Kütüphanesi</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      <div className="mb-4 relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Zikir ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsAddingNew(true)
              setEditingDhikr({
                id: "",
                name: "",
                arabicText: "",
                transliteration: "",
                translation: "",
                count: 33,
                category: "Tesbih",
              })
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isAddingNew || editingDhikr ? (
        <Card className="mb-6">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">{isAddingNew ? "Yeni Zikir Ekle" : "Zikir Düzenle"}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="arabicText">Arapça Metin</Label>
                <div className="flex items-center space-x-2">
                  <Textarea
                    id="arabicText"
                    value={editingDhikr?.arabicText || ""}
                    onChange={(e) => setEditingDhikr((prev) => (prev ? { ...prev, arabicText: e.target.value } : null))}
                    placeholder="Arapça metni girin"
                    className="font-arabic text-right"
                    dir="rtl"
                  />
                  {clipboardText && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={pasteFromClipboard}
                      title="Panodan Yapıştır"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="transliteration">Latin Harfli Okunuş</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="transliteration"
                    value={editingDhikr?.transliteration || ""}
                    onChange={(e) =>
                      setEditingDhikr((prev) => (prev ? { ...prev, transliteration: e.target.value } : null))
                    }
                    placeholder="Latin harfli okunuşu girin"
                  />
                  {clipboardText && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={pasteFromClipboard}
                      title="Panodan Yapıştır"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="translation">Türkçe Anlamı</Label>
                <Input
                  id="translation"
                  value={editingDhikr?.translation || ""}
                  onChange={(e) => setEditingDhikr((prev) => (prev ? { ...prev, translation: e.target.value } : null))}
                  placeholder="Türkçe anlamını girin (isteğe bağlı)"
                />
              </div>

              <div>
                <Label htmlFor="count">Hedef Sayı</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setEditingDhikr((prev) => (prev ? { ...prev, count: Math.max(1, (prev.count || 33) - 1) } : null))
                    }
                  >
                    -
                  </Button>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={editingDhikr?.count || 33}
                    onChange={(e) =>
                      setEditingDhikr((prev) =>
                        prev ? { ...prev, count: Number.parseInt(e.target.value) || 33 } : null,
                      )
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setEditingDhikr((prev) => (prev ? { ...prev, count: (prev.count || 33) + 1 } : null))
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={editingDhikr?.category || "Tesbih"}
                  onValueChange={(value) => setEditingDhikr((prev) => (prev ? { ...prev, category: value } : null))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tesbih">Tesbih</SelectItem>
                    <SelectItem value="Tevhid">Tevhid</SelectItem>
                    <SelectItem value="İstiğfar">İstiğfar</SelectItem>
                    <SelectItem value="Dua">Dua</SelectItem>
                    <SelectItem value="Salavat">Salavat</SelectItem>
                    <SelectItem value="Özel">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setEditingDhikr(null)
                setIsAddingNew(false)
              }}
            >
              İptal
            </Button>
            <Button onClick={isAddingNew ? addNewCustomDhikr : updateCustomDhikr}>
              <Save className="mr-2 h-4 w-4" />
              {isAddingNew ? "Ekle" : "Güncelle"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="collection">Koleksiyon</TabsTrigger>
            <TabsTrigger value="custom">Özel Zikirler</TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-4">
            {filteredArabicDhikrs.length > 0 ? (
              filteredArabicDhikrs.map((dhikr, index) => (
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
                          onClick={() => copyToClipboard(dhikr.name, `collection-${index}`)}
                        >
                          {copiedIndex === `collection-${index}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
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
                        <Plus className="mr-2 h-4 w-4" /> Listeye Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Zikir bulunamadı</h3>
                <p className="text-sm text-muted-foreground">
                  Arama kriterlerinize uygun zikir bulunamadı. Lütfen farklı bir arama yapın.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {filteredCustomDhikrs.length > 0 ? (
              filteredCustomDhikrs.map((dhikr) => (
                <Card key={dhikr.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        {dhikr.arabicText && (
                          <CardTitle className="text-lg font-arabic text-right text-2xl leading-relaxed">
                            {dhikr.arabicText}
                          </CardTitle>
                        )}
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
                          onClick={() => copyToClipboard(dhikr.arabicText, `custom-${dhikr.id}`)}
                        >
                          {copiedIndex === `custom-${dhikr.id}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => startEditing(dhikr)}
                        >
                          <Edit className="h-4 w-4" />
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
                                Bu zikiri kütüphaneden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCustomDhikr(dhikr.id)}>Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{dhikr.count} kez</p>
                      <Button variant="outline" size="sm" onClick={() => addToList(dhikr)}>
                        <Plus className="mr-2 h-4 w-4" /> Listeye Ekle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Henüz özel zikir eklenmemiş</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kendi özel zikirlerinizi eklemek için sağ üstteki + butonuna tıklayın.
                </p>
                <Button
                  onClick={() => {
                    setIsAddingNew(true)
                    setEditingDhikr({
                      id: "",
                      name: "",
                      arabicText: "",
                      transliteration: "",
                      translation: "",
                      count: 33,
                      category: "Tesbih",
                    })
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Yeni Zikir Ekle
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

