"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Vibrate, AlertTriangle } from "lucide-react"
import type { Dhikr } from "@/types/dhikr"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { formatNumber } from "@/lib/format-number"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { useAudioManager } from "@/components/audio-manager"
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

interface DhikrCounterProps {
  dhikr: Dhikr
  onUpdate: (id: string, count: number) => void
  onClose: () => void
}

export function DhikrCounter({ dhikr, onUpdate, onClose }: DhikrCounterProps) {
  const [count, setCount] = useState(dhikr.currentCount)
  const [progress, setProgress] = useState((dhikr.currentCount / dhikr.targetCount) * 100)
  const [isVibrating, setIsVibrating] = useState(false)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [doubleTapCount, setDoubleTapCount] = useState(0)
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    return getStorageItem("dhikrVibrationEnabled", true)
  })
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Ses yöneticisini kullan
  const { soundEnabled, setSoundEnabled, playSound, audioError } = useAudioManager()

  // Otomatik kaydetme işlemi
  useEffect(() => {
    // Her 5 saniyede bir ilerlemeyi kaydet
    const interval = setInterval(() => {
      if (count > 0 && count !== dhikr.currentCount) {
        onUpdate(dhikr.id, count)
      }
    }, 5000)

    setAutoSaveInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [count, dhikr.id, dhikr.currentCount, onUpdate])

  // Sayfa kapatılırken veya yenilenirken ilerleyişi kaydet
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (count > 0 && count !== dhikr.currentCount) {
        onUpdate(dhikr.id, count)

        // Kullanıcıya bir uyarı göster
        if (count < dhikr.targetCount) {
          e.preventDefault()
          e.returnValue = "Zikir tamamlanmadı. Çıkmak istediğinize emin misiniz?"
          return e.returnValue
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)

      // Bileşen kaldırıldığında son durumu kaydet
      if (count > 0 && count !== dhikr.currentCount) {
        onUpdate(dhikr.id, count)
      }
    }
  }, [count, dhikr.id, dhikr.currentCount, dhikr.targetCount, onUpdate])

  useEffect(() => {
    setProgress((count / dhikr.targetCount) * 100)

    // Show toast when reaching milestones
    if (count > 0 && count % 10 === 0) {
      toast({
        title: "İlerleme",
        description: `${formatNumber(count)} zikir tamamlandı. ${formatNumber(dhikr.targetCount - count)} zikir kaldı.`,
      })
    }
  }, [count, dhikr.targetCount, toast])

  // Save vibration preference
  useEffect(() => {
    setStorageItem("dhikrVibrationEnabled", vibrationEnabled)
  }, [vibrationEnabled])

  // Ses hatası varsa uyarı göster
  useEffect(() => {
    if (audioError) {
      toast({
        title: "Ses Hatası",
        description: audioError,
        variant: "destructive",
      })
    }
  }, [audioError, toast])

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!vibrationEnabled || !("vibrate" in navigator)) return

      try {
        if (typeof pattern === "number") {
          navigator.vibrate(pattern * 1.5)
        } else {
          navigator.vibrate(pattern.map((p) => p * 1.5))
        }
      } catch (error) {
        console.error("Vibration failed:", error)
      }
    },
    [vibrationEnabled],
  )

  const incrementCount = useCallback(() => {
    const now = Date.now()
    const isDoubleTap = now - lastTapTime < 300

    if (isDoubleTap) {
      setDoubleTapCount((prev) => prev + 1)

      if (doubleTapCount >= 2) {
        if (count + 5 <= dhikr.targetCount) {
          setCount((prev) => prev + 5)
          playSound(dhikr.audio)
          vibrate([40, 30, 40, 30, 40])
          toast({
            title: "+5",
            description: "Hızlı sayım: 5 zikir eklendi",
          })
        } else {
          setCount(dhikr.targetCount)
          playSound(dhikr.audio)
          vibrate([40, 30, 40, 30, 40])
        }
        setDoubleTapCount(0)
      } else {
        if (count + 2 <= dhikr.targetCount) {
          setCount((prev) => prev + 2)
          playSound(dhikr.audio)
          vibrate([30, 20, 30])
          toast({
            title: "+2",
            description: "Çift tıklama: 2 zikir eklendi",
          })
        } else {
          setCount(dhikr.targetCount)
          playSound(dhikr.audio)
          vibrate([30, 20, 30])
        }
      }
    } else {
      setDoubleTapCount(0)
      if (count < dhikr.targetCount) {
        setCount((prev) => prev + 1)
        playSound(dhikr.audio)
        vibrate(30)
      }
    }

    setLastTapTime(now)
  }, [count, dhikr.targetCount, dhikr.audio, doubleTapCount, lastTapTime, playSound, toast, vibrate])

  const resetCount = useCallback(() => {
    setIsVibrating(true)
    setTimeout(() => setIsVibrating(false), 500)
    setCount(0)

    toast({
      title: "Sayaç sıfırlandı",
      description: "Zikir sayacı sıfırlandı.",
    })

    vibrate([50, 70, 50])
  }, [toast, vibrate])

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled)

    toast({
      title: soundEnabled ? "Ses kapatıldı" : "Ses açıldı",
      description: soundEnabled ? "Zikir sesleri kapatıldı." : "Zikir sesleri açıldı.",
    })
  }, [soundEnabled, setSoundEnabled, toast])

  const toggleVibration = useCallback(() => {
    setVibrationEnabled((prev: boolean) => !prev)

    if (!vibrationEnabled && "vibrate" in navigator) {
      setTimeout(() => {
        navigator.vibrate([30, 50, 30])
      }, 300)
    }

    toast({
      title: vibrationEnabled ? "Titreşim kapatıldı" : "Titreşim açıldı",
      description: vibrationEnabled ? "Zikir titreşimleri kapatıldı." : "Zikir titreşimleri açıldı.",
    })
  }, [vibrationEnabled, toast])

  const handleClose = useCallback(() => {
    if (count > 0 && count < dhikr.targetCount) {
      setShowExitConfirm(true)
    } else {
      if (autoSaveInterval) clearInterval(autoSaveInterval)
      onUpdate(dhikr.id, count)
      onClose()
    }
  }, [autoSaveInterval, count, dhikr.id, dhikr.targetCount, onClose, onUpdate])

  const confirmExit = useCallback(() => {
    if (autoSaveInterval) clearInterval(autoSaveInterval)
    onUpdate(dhikr.id, count)
    onClose()
  }, [autoSaveInterval, count, dhikr.id, onClose, onUpdate])

  return (
    <>
      <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-y-auto">
        <div className="container max-w-md mx-auto p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold ml-2">Zikir Çek</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleSound} title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}>
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVibration}
                title={vibrationEnabled ? "Titreşimi Kapat" : "Titreşimi Aç"}
              >
                <Vibrate className={`h-5 w-5 ${vibrationEnabled ? "" : "opacity-50"}`} />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-2">{dhikr.name}</h2>
              {dhikr.arabicText && <p className="font-arabic text-2xl mb-2 leading-relaxed">{dhikr.arabicText}</p>}
              {dhikr.transliteration && dhikr.transliteration !== dhikr.name && (
                <p className="text-sm text-muted-foreground mb-1">{dhikr.transliteration}</p>
              )}
              {dhikr.translation && <p className="text-xs text-muted-foreground mb-2">{dhikr.translation}</p>}
              <p className="text-muted-foreground">Hedef: {formatNumber(dhikr.targetCount)}</p>
              {dhikr.category && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                    {dhikr.category}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div
              className="w-full mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Progress value={progress} className="h-3" />
            </motion.div>

            <motion.div
              className={`text-center mb-12 ${isVibrating ? "animate-shake" : ""}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={count}
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.2, y: 20 }}
                  transition={{ duration: 0.15 }}
                  className="text-7xl font-black bg-vibrant-gradient bg-clip-text text-transparent"
                >
                  {formatNumber(count)}
                </motion.div>
              </AnimatePresence>
              <p className="text-muted-foreground font-bold mt-2 lowercase tracking-widest opacity-60">Kalan: {formatNumber(dhikr.targetCount - count)}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" size="lg" className="h-20 text-lg rounded-[2rem] border-2" onClick={resetCount}>
                <RotateCcw className="mr-2 h-5 w-5" /> Sıfırla
              </Button>
              <motion.div
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-20 text-2xl font-black rounded-[2rem] bg-vibrant-gradient border-none shadow-premium premium-shimmer overflow-hidden active:brightness-110 transition-all"
                  onClick={incrementCount}
                >
                  {count < dhikr.targetCount ? "Zikret" : "Tamamla"}
                </Button>
              </motion.div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-6 uppercase tracking-[0.3em] font-bold opacity-30">Hızlı sayım için ekrana seri dokunun</p>
          </div>
        </div>

      </div>
    </div >

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-premium">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl font-bold">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" /> Tamamlanmadı
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Zikir henüz tamamlanmadı. İlerlemeniz otomatik olarak buluta kaydedilecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-none bg-secondary">Devam Et</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="rounded-xl bg-destructive text-white">Çık ve Kaydet</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
      )
}
