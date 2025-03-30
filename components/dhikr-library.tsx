"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Edit,
  Trash2,
  Save,
  Volume2,
  VolumeX,
  BookOpen,
  Search,
  X,
  FolderPlus,
  Folder,
  Play,
  List,
} from "lucide-react"
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

// DhikrLibraryProps arayüzünü güncelleyelim
interface DhikrLibraryProps {
  onClose: () => void
  onAddDhikr: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
  onAddDhikrSeries: (dhikrs: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[]) => void
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

type DhikrCollection = {
  id: string
  name: string
  description: string
  dhikrs: string[] // CustomDhikr id'leri veya arabicDhikrs indeksleri
  type: "custom" | "arabic" | "mixed"
  category?: string
  dateCreated: string
}

export function DhikrLibrary({ onClose, onAddDhikr, onAddDhikrSeries }: DhikrLibraryProps) {
  const [activeTab, setActiveTab] = useState("collection")
  const [searchTerm, setSearchTerm] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrSoundEnabled")
    return saved !== null ? saved === "true" : true
  })
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [customDhikrs, setCustomDhikrs] = useState<CustomDhikr[]>([])
  const [collections, setCollections] = useState<DhikrCollection[]>([])
  const [editingDhikr, setEditingDhikr] = useState<CustomDhikr | null>(null)
  const [editingCollection, setEditingCollection] = useState<DhikrCollection | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isAddingCollection, setIsAddingCollection] = useState(false)
  const [clipboardText, setClipboardText] = useState<string | null>(null)
  const [selectedDhikrsForCollection, setSelectedDhikrsForCollection] = useState<string[]>([])
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

    const savedCollections = localStorage.getItem("dhikrCollections")
    if (savedCollections) {
      try {
        setCollections(JSON.parse(savedCollections))
      } catch (error) {
        console.error("Error parsing saved dhikr collections:", error)
        setCollections([])
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

  // Save collections to localStorage
  useEffect(() => {
    localStorage.setItem("dhikrCollections", JSON.stringify(collections))
  }, [collections])

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

    // Koleksiyonlardan da bu zikri kaldır
    setCollections((prev) =>
      prev.map((collection) => ({
        ...collection,
        dhikrs: collection.dhikrs.filter((dhikrId) => dhikrId !== id),
      })),
    )

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

  const addNewCollection = () => {
    if (!editingCollection) return

    if (!editingCollection.name.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen koleksiyon adı girin.",
        variant: "destructive",
      })
      return
    }

    if (editingCollection.dhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen koleksiyona en az bir zikir ekleyin.",
        variant: "destructive",
      })
      return
    }

    const newCollection: DhikrCollection = {
      ...editingCollection,
      id: Date.now().toString(),
      dateCreated: new Date().toISOString(),
    }

    setCollections((prev) => [...prev, newCollection])
    setEditingCollection(null)
    setIsAddingCollection(false)
    setSelectedDhikrsForCollection([])

    toast({
      title: "Koleksiyon Eklendi",
      description: `"${editingCollection.name}" koleksiyonu başarıyla oluşturuldu.`,
    })
  }

  const updateCollection = () => {
    if (!editingCollection) return

    if (!editingCollection.name.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen koleksiyon adı girin.",
        variant: "destructive",
      })
      return
    }

    if (editingCollection.dhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen koleksiyona en az bir zikir ekleyin.",
        variant: "destructive",
      })
      return
    }

    setCollections((prev) =>
      prev.map((collection) => (collection.id === editingCollection.id ? editingCollection : collection)),
    )

    setEditingCollection(null)
    setSelectedDhikrsForCollection([])

    toast({
      title: "Koleksiyon Güncellendi",
      description: `"${editingCollection.name}" koleksiyonu başarıyla güncellendi.`,
    })
  }

  const deleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((collection) => collection.id !== id))

    toast({
      title: "Koleksiyon Silindi",
      description: "Koleksiyon başarıyla silindi.",
    })
  }

  const toggleDhikrSelection = (dhikrId: string) => {
    if (selectedDhikrsForCollection.includes(dhikrId)) {
      setSelectedDhikrsForCollection((prev) => prev.filter((id) => id !== dhikrId))
    } else {
      setSelectedDhikrsForCollection((prev) => [...prev, dhikrId])
    }
  }

  const startEditingCollection = (collection: DhikrCollection) => {
    setEditingCollection({ ...collection })
    setSelectedDhikrsForCollection([...collection.dhikrs])
  }

  // addCollectionToList fonksiyonunu güncelleyelim
  const addCollectionToList = (collection: DhikrCollection) => {
    // Koleksiyondaki zikirleri çekilecekler listesine ekle
    const dhikrsToAdd: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">[] = []

    collection.dhikrs.forEach((dhikrId) => {
      // Özel zikirlerden ara
      const customDhikr = customDhikrs.find((d) => d.id === dhikrId)
      if (customDhikr) {
        dhikrsToAdd.push({
          name: customDhikr.transliteration || customDhikr.name,
          targetCount: customDhikr.count,
          category: customDhikr.category,
          arabicText: customDhikr.arabicText,
          transliteration: customDhikr.transliteration,
          translation: customDhikr.translation,
        })
        return
      }

      // Arapça zikirlerden ara (id'yi indeks olarak kullan)
      const arabicIndex = Number.parseInt(dhikrId)
      if (!isNaN(arabicIndex) && arabicIndex >= 0 && arabicIndex < arabicDhikrs.length) {
        const arabicDhikr = arabicDhikrs[arabicIndex]
        dhikrsToAdd.push({
          name: arabicDhikr.transliteration,
          targetCount: arabicDhikr.count,
          category: arabicDhikr.category,
          arabicText: arabicDhikr.name,
          transliteration: arabicDhikr.transliteration,
          translation: arabicDhikr.translation,
        })
      }
    })

    if (dhikrsToAdd.length > 0) {
      onAddDhikrSeries(dhikrsToAdd)

      toast({
        title: "Koleksiyon Eklendi",
        description: `"${collection.name}" koleksiyonundaki ${dhikrsToAdd.length} zikir çekilecekler listesine eklendi.`,
      })
    } else {
      toast({
        title: "Hata",
        description: "Koleksiyonda eklenecek zikir bulunamadı.",
        variant: "destructive",
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

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAddingCollection(true)
              setEditingCollection({
                id: "",
                name: "",
                description: "",
                dhikrs: [],
                type: "mixed",
                dateCreated: "",
              })
            }}
          >
            <FolderPlus className="h-5 w-5" />
          </Button>
        </div>
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

      {isAddingNew || (editingDhikr && !isAddingCollection) ? (
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
                    <SelectItem value="Ramazan">Ramazan</SelectItem>
                    <SelectItem value="Cuma">Cuma</SelectItem>
                    <SelectItem value="Kadir Gecesi">Kadir Gecesi</SelectItem>
                    <SelectItem value="Namaz Sonrası">Namaz Sonrası</SelectItem>
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
      ) : isAddingCollection || editingCollection ? (
        <Card className="mb-6">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">
              {isAddingCollection ? "Yeni Koleksiyon Oluştur" : "Koleksiyon Düzenle"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="collectionName">Koleksiyon Adı</Label>
                <Input
                  id="collectionName"
                  value={editingCollection?.name || ""}
                  onChange={(e) => setEditingCollection((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  placeholder="Örn: Ramazan Zikirleri"
                />
              </div>

              <div>
                <Label htmlFor="collectionDescription">Açıklama</Label>
                <Textarea
                  id="collectionDescription"
                  value={editingCollection?.description || ""}
                  onChange={(e) =>
                    setEditingCollection((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  placeholder="Koleksiyon hakkında kısa açıklama"
                />
              </div>

              <div>
                <Label htmlFor="collectionCategory">Kategori</Label>
                <Select
                  value={editingCollection?.category || "Özel"}
                  onValueChange={(value) =>
                    setEditingCollection((prev) => (prev ? { ...prev, category: value } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Özel">Özel</SelectItem>
                    <SelectItem value="Ramazan">Ramazan</SelectItem>
                    <SelectItem value="Cuma">Cuma</SelectItem>
                    <SelectItem value="Kadir Gecesi">Kadir Gecesi</SelectItem>
                    <SelectItem value="Namaz Sonrası">Namaz Sonrası</SelectItem>
                    <SelectItem value="Günlük">Günlük</SelectItem>
                    <SelectItem value="Haftalık">Haftalık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Zikirler</Label>
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-2">Arapça Zikirler</p>
                  {arabicDhikrs.map((dhikr, index) => (
                    <div key={`arabic-${index}`} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`arabic-${index}`}
                        checked={selectedDhikrsForCollection.includes(index.toString())}
                        onChange={() => toggleDhikrSelection(index.toString())}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`arabic-${index}`} className="text-sm flex-1">
                        {dhikr.transliteration} ({dhikr.count})
                      </label>
                    </div>
                  ))}

                  {customDhikrs.length > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mb-2 mt-4">Özel Zikirler</p>
                      {customDhikrs.map((dhikr) => (
                        <div key={`custom-${dhikr.id}`} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`custom-${dhikr.id}`}
                            checked={selectedDhikrsForCollection.includes(dhikr.id)}
                            onChange={() => toggleDhikrSelection(dhikr.id)}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`custom-${dhikr.id}`} className="text-sm flex-1">
                            {dhikr.transliteration || dhikr.name} ({dhikr.count})
                          </label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seçilen zikir sayısı: {selectedDhikrsForCollection.length}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setEditingCollection(null)
                setIsAddingCollection(false)
                setSelectedDhikrsForCollection([])
              }}
            >
              İptal
            </Button>
            <Button
              onClick={isAddingCollection ? addNewCollection : updateCollection}
              disabled={!editingCollection?.name || selectedDhikrsForCollection.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              {isAddingCollection ? "Oluştur" : "Güncelle"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="collection">Koleksiyonlar</TabsTrigger>
            <TabsTrigger value="arabic">Arapça Zikirler</TabsTrigger>
            <TabsTrigger value="custom">Özel Zikirler</TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="space-y-4">
            {filteredCollections.length > 0 ? (
              filteredCollections.map((collection) => (
                <Card key={collection.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                        )}
                        {collection.category && (
                          <Badge variant="outline" className="mt-2">
                            {collection.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => startEditingCollection(collection)}
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
                              <AlertDialogTitle>Koleksiyon Silinecek</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu koleksiyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCollection(collection.id)}>Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{collection.dhikrs.length} zikir</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => addCollectionToList(collection)}>
                          <List className="mr-2 h-4 w-4" /> Listeye Ekle
                        </Button>
                        <Button variant="default" size="sm" onClick={() => addCollectionToList(collection)}>
                          <Play className="mr-2 h-4 w-4" /> Seri Başlat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Henüz koleksiyon oluşturulmamış</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sık kullandığınız zikirleri koleksiyon halinde gruplayabilirsiniz.
                </p>
                <Button
                  onClick={() => {
                    setIsAddingCollection(true)
                    setEditingCollection({
                      id: "",
                      name: "",
                      description: "",
                      dhikrs: [],
                      type: "mixed",
                      dateCreated: "",
                    })
                  }}
                >
                  <FolderPlus className="mr-2 h-4 w-4" /> Yeni Koleksiyon Oluştur
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="arabic" className="space-y-4">
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

