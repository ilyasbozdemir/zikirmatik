import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, Sparkles, Save, BookOpen } from "lucide-react"
import type { Dhikr } from "@/types/dhikr"
import { motion, AnimatePresence } from "framer-motion"
import { PRESET_DHIKRS } from "@/lib/arabic-dhikrs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"

interface AddDhikrFormProps {
  onAdd: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
  onCancel: () => void
}

export function AddDhikrForm({ onAdd, onCancel }: AddDhikrFormProps) {
  const [name, setName] = useState("")
  const [targetCount, setTargetCount] = useState(33)
  const [customInput, setCustomInput] = useState(true)
  const [category, setCategory] = useState<string>("Tesbih")
  const [customCategory, setCustomCategory] = useState("")
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [useArabicText, setUseArabicText] = useState(false)
  const [arabicText, setArabicText] = useState("")
  const [translation, setTranslation] = useState("")
  const [saveToLibrary, setSaveToLibrary] = useState(false)
  const [clipboardText, setClipboardText] = useState<string | null>(null)
  const [clipboardCopied, setClipboardCopied] = useState(false)
  const [libraryDhikrs, setLibraryDhikrs] = useState<any[]>([])
  const { toast } = useToast()

  // Load library dhikrs
  useEffect(() => {
    const custom = getStorageItem("customDhikrs", [])
    setLibraryDhikrs(custom)
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
  }, [])

  // Auto-detect Arabic when name changes
  useEffect(() => {
    if (customInput && name) {
      const isArabic = /[\u0600-\u06FF]/.test(name)
      if (isArabic && !useArabicText) {
        setUseArabicText(true)
        setArabicText(name)
      }
    }
  }, [name, customInput])

  const allPresets = useMemo(() => {
    // Merge built-in presets and library items
    // Avoid duplicates by name (prefer library)
    const builtInNames = new Set(PRESET_DHIKRS.map(d => d.name))
    const uniqueLibrary = libraryDhikrs.filter(d => !builtInNames.has(d.name))
    return {
      builtIn: PRESET_DHIKRS,
      custom: uniqueLibrary
    }
  }, [libraryDhikrs])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && targetCount > 0) {
      const newDhikr = {
        name: name.trim(),
        targetCount,
        category: showCustomCategory ? customCategory : category,
        arabicText: useArabicText ? arabicText : undefined,
        translation: translation || undefined,
      }

      onAdd(newDhikr)

      // Save to library if requested
      if (saveToLibrary) {
        const customDhikrs = getStorageItem("customDhikrs", [])
        // Check if already in library
        const alreadyExists = customDhikrs.some((d: any) => d.name.toLowerCase() === name.trim().toLowerCase())

        if (!alreadyExists) {
          const newLibraryItem = {
            id: Date.now().toString(),
            name: name.trim(),
            arabicText: arabicText || "",
            transliteration: name.trim(),
            translation: translation || "",
            count: targetCount,
            category: showCustomCategory ? customCategory : category,
          }
          setStorageItem("customDhikrs", [...customDhikrs, newLibraryItem])

          toast({
            title: "Kütüphaneye Kaydedildi",
            description: "Zikir başarıyla kütüphanenize eklendi.",
          })
        }
      }
    }
  }

  const handleSelectDhikr = (value: string) => {
    if (value === "custom") {
      setCustomInput(true)
      setName("")
      setArabicText("")
      setTranslation("")
      setUseArabicText(false)
      return
    }

    setCustomInput(false)
    // Search in both built-in and custom
    const selected = [...PRESET_DHIKRS, ...libraryDhikrs].find((d: any) => d.name === value)
    if (selected) {
      setName(selected.name)
      setTargetCount(selected.count || selected.targetCount || 33)
      setCategory(selected.category || "Tesbih")
      setShowCustomCategory(false)
      setArabicText(selected.arabicText || "")
      setTranslation(selected.translation || "")
      setUseArabicText(!!selected.arabicText)
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCategory(true)
    } else {
      setShowCustomCategory(false)
      setCategory(value)
    }
  }

  const pasteFromClipboard = (field: "name" | "arabicText" | "translation") => {
    if (!clipboardText) return

    const isArabic = /[\u0600-\u06FF]/.test(clipboardText)

    if (field === "name") {
      setName(clipboardText)
      if (isArabic) {
        setUseArabicText(true)
        setArabicText(clipboardText)
      }
    } else if (field === "arabicText") {
      setArabicText(clipboardText)
      setUseArabicText(true)
    } else if (field === "translation") {
      setTranslation(clipboardText)
    }

    setClipboardCopied(true)

    toast({
      title: "Metin Yapıştırıldı",
      description: isArabic ? "Arapça metin tespit edildi ve yapıştırıldı." : "Metin yapıştırıldı.",
    })

    setTimeout(() => setClipboardCopied(false), 2000)
  }

  // Get unique categories from all sources
  const categories = useMemo(() => {
    const all = [...PRESET_DHIKRS, ...libraryDhikrs]
    return [...new Set(all.map((d: any) => d.category).filter(Boolean))]
  }, [libraryDhikrs])

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-black ml-2 bg-vibrant-gradient bg-clip-text text-transparent">Yeni Zikir</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            <div className="space-y-3 glass p-4 rounded-3xl border-primary/5 shadow-premium">
              <Label htmlFor="preset" className="text-sm font-black uppercase tracking-widest opacity-60 ml-1">Hızlı Seçim</Label>
              <Select onValueChange={handleSelectDhikr} defaultValue="custom">
                <SelectTrigger className="h-14 rounded-2xl border-primary/10 bg-background/50 text-lg font-bold">
                  <SelectValue placeholder="Ön tanımlı bir zikir seçin" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-premium glass max-h-[400px]">
                  <SelectItem value="custom" className="font-bold py-3">✨ Özel Zikir Ekle</SelectItem>

                  {allPresets.custom.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="px-2 py-1.5 text-xs font-black uppercase tracking-widest opacity-40 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" /> Kütüphaneniz
                      </SelectLabel>
                      {allPresets.custom.map((dhikr: any) => (
                        <SelectItem key={`custom-${dhikr.id || dhikr.name}`} value={dhikr.name} className="py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">{dhikr.name}</span>
                            <span className="text-[10px] opacity-60 uppercase">{dhikr.category || "Genel"} • {dhikr.count || dhikr.targetCount || 33} Adet</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  <SelectGroup>
                    <SelectLabel className="px-2 py-1.5 text-xs font-black uppercase tracking-widest opacity-40">Önerilenler</SelectLabel>
                    {allPresets.builtIn.map((dhikr: any) => (
                      <SelectItem key={`preset-${dhikr.name}`} value={dhikr.name} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold">{dhikr.name}</span>
                          <span className="text-[10px] opacity-60 uppercase">{dhikr.category} • {dhikr.count} Adet</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 glass p-6 rounded-[2.5rem] border-primary/5 shadow-premium">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest opacity-60 ml-1">Zikir Adı / Okunuşu</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="name"
                    placeholder="Örn: Sübhanallah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!customInput}
                    required
                    className="h-14 rounded-2xl border-primary/10 bg-background/50 text-xl font-bold px-4"
                  />
                  {clipboardText && customInput && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-2xl flex-shrink-0 border-primary/10"
                      onClick={() => pasteFromClipboard("name")}
                    >
                      {clipboardCopied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                    </Button>
                  )}
                </div>
              </div>

              {customInput && (
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useArabicText"
                      checked={useArabicText}
                      onCheckedChange={setUseArabicText}
                      disabled={!customInput}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="useArabicText" className="font-bold text-sm">Arapça Metin Ekle</Label>
                  </div>
                  {useArabicText && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                </div>
              )}

              <AnimatePresence>
                {useArabicText && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="space-y-2 overflow-hidden py-2">
                      <Label htmlFor="arabicText" className="text-sm font-black uppercase tracking-widest opacity-60 ml-1">Arapça Yazılışı</Label>
                      <div className="flex items-center space-x-2">
                        <Textarea
                          id="arabicText"
                          placeholder="سُبْحَانَ اللّهِ"
                          value={arabicText}
                          onChange={(e) => setArabicText(e.target.value)}
                          className="font-arabic text-3xl text-right rounded-2xl border-primary/10 bg-background/50 p-4 min-h-[100px] leading-relaxed"
                          dir="rtl"
                        />
                        {clipboardText && customInput && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-full min-h-[100px] w-14 rounded-2xl flex-shrink-0 border-primary/10"
                            onClick={() => pasteFromClipboard("arabicText")}
                          >
                            <Copy className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {useArabicText && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="space-y-2 overflow-hidden py-2">
                      <Label htmlFor="translation" className="text-sm font-black uppercase tracking-widest opacity-60 ml-1">Anlamı</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="translation"
                          placeholder="Türkçe anlamını girin"
                          value={translation}
                          onChange={(e) => setTranslation(e.target.value)}
                          className="h-12 rounded-xl border-primary/10 bg-background/50 font-medium italic"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 glass p-5 rounded-3xl border-primary/5 shadow-premium">
                <Label htmlFor="category" className="text-sm font-black uppercase tracking-widest opacity-60 ml-1">Kategori</Label>
                <Select
                  value={showCustomCategory ? "custom" : category}
                  onValueChange={handleCategoryChange}
                  disabled={!customInput}
                >
                  <SelectTrigger className="h-12 rounded-xl border-primary/10 bg-background/50 font-bold">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-premium glass">
                    {categories.map((cat: any) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="Diğer">Diğer</SelectItem>
                    <SelectItem value="custom">✨ Özel Kategori</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomCategory && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Input
                      placeholder="Kategori adı..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required={showCustomCategory}
                      className="h-12 rounded-xl border-primary/10 mt-2"
                    />
                  </motion.div>
                )}
              </div>

              <div className="space-y-3 glass p-5 rounded-3xl border-primary/5 shadow-premium">
                <Label htmlFor="count" className="text-sm font-black uppercase tracking-widest opacity-60 ml-1">Hedef Sayı</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-primary/10 font-black text-xl"
                    onClick={() => setTargetCount((prev) => Math.max(1, prev - 1))}
                    disabled={!customInput}
                  >
                    -
                  </Button>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number.parseInt(e.target.value) || 1)}
                    className="h-12 text-center text-xl font-black rounded-xl border-primary/10 bg-background/50"
                    disabled={!customInput}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-primary/10 font-black text-xl"
                    onClick={() => setTargetCount((prev) => prev + 1)}
                    disabled={!customInput}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {customInput && (
              <div className="flex items-center space-x-2 px-2">
                <Switch
                  id="saveToLibrary"
                  checked={saveToLibrary}
                  onCheckedChange={setSaveToLibrary}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="saveToLibrary" className="font-bold flex items-center">
                  <Save className="h-4 w-4 mr-2 opacity-60" /> Kütüphaneye de Kaydet
                </Label>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="ghost" className="flex-1 h-16 rounded-2xl font-bold text-lg" onClick={onCancel}>
                İptal
              </Button>
              <Button type="submit" className="flex-1 h-16 rounded-2xl bg-vibrant-gradient border-none shadow-xl text-white text-xl font-black transition-transform active:scale-95">
                Ekle
              </Button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  )
}
