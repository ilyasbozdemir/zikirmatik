"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dhikr } from "@/types/dhikr"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface RepeatDhikrModalProps {
  dhikr: Dhikr
  open: boolean
  onOpenChange: (open: boolean) => void
  onRepeat: (dhikr: Dhikr, count: number, addToSeries: boolean, scheduleNow: boolean) => void
}

export function RepeatDhikrModal({ dhikr, open, onOpenChange, onRepeat }: RepeatDhikrModalProps) {
  const [count, setCount] = useState(dhikr.targetCount)
  const [addToSeries, setAddToSeries] = useState(false)
  const [scheduleNow, setScheduleNow] = useState(true)
  const { toast } = useToast()

  const handleRepeat = () => {
    if (count <= 0) {
      toast({
        title: "Geçersiz sayı",
        description: "Lütfen geçerli bir hedef sayı girin.",
        variant: "destructive",
      })
      return
    }

    onRepeat(dhikr, count, addToSeries, scheduleNow)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zikir Tekrarla</DialogTitle>
          <DialogDescription>"{dhikr.name}" zikrini tekrar çekmek için ayarları düzenleyin.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="count" className="text-right">
              Hedef Sayı
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCount((prev) => Math.max(1, prev - 1))}
              >
                -
              </Button>
              <Input
                id="count"
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(Number.parseInt(e.target.value) || 1)}
                className="text-center"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setCount((prev) => prev + 1)}>
                +
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preset" className="text-right">
              Hazır Sayılar
            </Label>
            <div className="col-span-3">
              <Select onValueChange={(value) => setCount(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Hazır sayı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="33">33 (Tesbih)</SelectItem>
                  <SelectItem value="99">99 (Esma-ül Hüsna)</SelectItem>
                  <SelectItem value="100">100 (Yüz)</SelectItem>
                  <SelectItem value="500">500 (Beş Yüz)</SelectItem>
                  <SelectItem value="1000">1000 (Bin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="addToSeries" className="text-right">
              Seriye Ekle
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="addToSeries" checked={addToSeries} onCheckedChange={setAddToSeries} />
              <Label htmlFor="addToSeries" className="text-sm text-muted-foreground">
                Mevcut bir zikir serisine ekle
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scheduleNow" className="text-right">
              Şimdi Planla
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="scheduleNow" checked={scheduleNow} onCheckedChange={setScheduleNow} />
              <Label htmlFor="scheduleNow" className="text-sm text-muted-foreground">
                Çekilecekler listesine ekle
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleRepeat}>Tekrarla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

