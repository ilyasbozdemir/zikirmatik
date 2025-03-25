"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import type { Dhikr } from "@/app/page"
import { motion } from "framer-motion"
import { commonDhikrs } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && targetCount > 0) {
      onAdd({
        name: name.trim(),
        targetCount,
        category: showCustomCategory ? customCategory : category,
      })
    }
  }

  const handleSelectDhikr = (value: string) => {
    if (value === "custom") {
      setCustomInput(true)
      setName("")
      return
    }

    setCustomInput(false)
    const selected = commonDhikrs.find((d) => d.name === value)
    if (selected) {
      setName(selected.name)
      setTargetCount(selected.count)
      setCategory(selected.category || "Tesbih")
      setShowCustomCategory(false)
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
          <Input
            id="name"
            placeholder="Örn: Sübhanallah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!customInput}
            required
          />
        </div>

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

