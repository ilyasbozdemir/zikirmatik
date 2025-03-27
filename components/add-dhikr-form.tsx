"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check } from "lucide-react"
import type { Dhikr } from "@/app/page"
import { motion } from "framer-motion"
import { commonDhikrs } from "@/lib/arabic-dhikrs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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
  const [clipboardText, setClipboardText] = useState<string | null>(null)
  const [clipboardCopied, setClipboardCopied] = useState(false)
  const { toast } = useToast()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && targetCount > 0) {
      onAdd({
        name: name.trim(),
        targetCount,
        category: showCustomCategory ? customCategory : category,
        arabicText: useArabicText ? arabicText : undefined,
        translation: translation || undefined,
      })
    }
  }

  const handleSelectDhikr = (value: string) => {
    if (value === "custom") {
      setCustomInput(true)
      setName("")
      setArabicText("")
      setTranslation("")
      return
    }

    setCustomInput(false)
    const selected = commonDhikrs.find((d) => d.name === value)
    if (selected) {
      setName(selected.name)
      setTargetCount(selected.count)
      setCategory(selected.category || "Tesbih")
      setShowCustomCategory(false)
      setArabicText("")
      setTranslation("")
      setUseArabicText(false)
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

    // Determine if the clipboard text is likely Arabic
    const isArabic = /[\u0600-\u06FF]/.test(clipboardText)

    if (field === "name") {
      setName(clipboardText)
    } else if (field === "arabicText") {
      setArabicText(clipboardText)
    } else if (field === "translation") {
      setTranslation(clipboardText)
    }

    setClipboardCopied(true)

    toast({
      title: "Metin Yapıştırıldı",
      description: isArabic ? "Arapça metin yapıştırıldı." : "Metin yapıştırıldı.",
    })

    setTimeout(() => setClipboardCopied(false), 2000)
  }

  // Get unique categories from common dhikrs
  const categories = [...new Set(commonDhikrs.map((d) => d.category).filter(Boolean))]

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Yeni Zikir Ekle</h1>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-2">
          <Label htmlFor="preset">Hazır Zikirler</Label>
          <Select onValueChange={handleSelectDhikr} defaultValue="custom">
            <SelectTrigger>
              <SelectValue placeholder="Hazır zikir seçin veya özel ekleyin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Özel Zikir</SelectItem>
              {commonDhikrs.map((dhikr) => (
                <SelectItem key={dhikr.name} value={dhikr.name}>
                  {dhikr.name} ({dhikr.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Zikir Adı</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="name"
              placeholder="Örn: Sübhanallah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!customInput}
              required
              className="flex-1"
            />
            {clipboardText && customInput && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                onClick={() => pasteFromClipboard("name")}
                title="Panodan Yapıştır"
              >
                {clipboardCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {customInput && (
          <div className="flex items-center space-x-2">
            <Switch
              id="useArabicText"
              checked={useArabicText}
              onCheckedChange={setUseArabicText}
              disabled={!customInput}
            />
            <Label htmlFor="useArabicText">Arapça metin ekle</Label>
          </div>
        )}

        {customInput && useArabicText && (
          <div className="space-y-2">
            <Label htmlFor="arabicText">Arapça Metin</Label>
            <div className="flex items-center space-x-2">
              <Textarea
                id="arabicText"
                placeholder="Arapça metni girin"
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                className="font-arabic text-right flex-1"
                dir="rtl"
              />
              {clipboardText && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => pasteFromClipboard("arabicText")}
                  title="Panodan Yapıştır"
                >
                  {clipboardCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        )}

        {customInput && useArabicText && (
          <div className="space-y-2">
            <Label htmlFor="translation">Türkçe Anlamı (İsteğe Bağlı)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="translation"
                placeholder="Türkçe anlamını girin"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="flex-1"
              />
              {clipboardText && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => pasteFromClipboard("translation")}
                  title="Panodan Yapıştır"
                >
                  {clipboardCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={showCustomCategory ? "custom" : category}
            onValueChange={handleCategoryChange}
            disabled={!customInput}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="Diğer">Diğer</SelectItem>
              <SelectItem value="custom">Özel Kategori</SelectItem>
            </SelectContent>
          </Select>

          {showCustomCategory && (
            <div className="mt-2">
              <Input
                placeholder="Özel kategori adı"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required={showCustomCategory}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="count">Hedef Sayı</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
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
              className="text-center"
              disabled={!customInput}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setTargetCount((prev) => prev + 1)}
              disabled={!customInput}
            >
              +
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit" className="flex-1">
            Ekle
          </Button>
        </div>
      </motion.form>
    </div>
  )
}

