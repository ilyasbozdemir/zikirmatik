"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, RotateCcw, Volume2, VolumeX, Vibrate, AlertTriangle } from "lucide-react"
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

  const { soundEnabled, setSoundEnabled, playSound, audioError } = useAudioManager()

  useEffect(() => {
    const interval = setInterval(() => {
      if (count > 0 && count !== dhikr.currentCount) {
        onUpdate(dhikr.id, count)
      }
    }, 5000)
    setAutoSaveInterval(interval)
    return () => { if (interval) clearInterval(interval) }
  }, [count, dhikr.id, dhikr.currentCount, onUpdate])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (count > 0 && count !== dhikr.currentCount) {
        onUpdate(dhikr.id, count)
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
      if (count > 0 && count !== dhikr.currentCount) {
        onUpdate(dhikr.id, count)
      }
    }
  }, [count, dhikr.id, dhikr.currentCount, dhikr.targetCount, onUpdate])

  useEffect(() => {
    setProgress((count / dhikr.targetCount) * 100)
    if (count > 0 && count % 10 === 0) {
      toast({
        title: "İlerleme",
        description: `${formatNumber(count)} zikir tamamlandı. ${formatNumber(dhikr.targetCount - count)} zikir kaldı.`,
      })
    }
  }, [count, dhikr.targetCount, toast])

  useEffect(() => {
    setStorageItem("dhikrVibrationEnabled", vibrationEnabled)
  }, [vibrationEnabled])

  useEffect(() => {
    if (audioError) {
      toast({ title: "Ses Hatası", description: audioError, variant: "destructive" })
    }
  }, [audioError, toast])

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!vibrationEnabled || !("vibrate" in navigator)) return
      try {
        navigator.vibrate(pattern)
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
        vibrate(20)
      }
    }
    setLastTapTime(now)
  }, [count, dhikr.targetCount, dhikr.audio, doubleTapCount, lastTapTime, playSound, vibrate])

  const resetCount = useCallback(() => {
    setCount(0)
    toast({ title: "Sayaç sıfırlandı", description: "Zikir sayacı sıfırlandı." })
    vibrate([50, 70, 50])
  }, [toast, vibrate])

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled)
  }, [soundEnabled, setSoundEnabled])

  const toggleVibration = useCallback(() => {
    setVibrationEnabled((prev: boolean) => !prev)
  }, [])

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
      <div className="fixed inset-0 bg-background z-[101] flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="container max-w-md mx-auto p-4 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-black bg-vibrant-gradient bg-clip-text text-transparent italic">Zikir Zamanı</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive order-last ml-2">
                <X className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleSound}>
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleVibration}>
                <Vibrate className={`h-5 w-5 ${vibrationEnabled ? "" : "opacity-30"}`} />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-black mb-2 px-4">{dhikr.name}</h2>
              {dhikr.arabicText && <p className="font-arabic text-3xl mb-3 leading-relaxed text-primary/80">{dhikr.arabicText}</p>}
              <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-60">Hedef: {formatNumber(dhikr.targetCount)}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mb-10 px-2">
              <Progress value={progress} className="h-3 shadow-inner rounded-full border border-primary/5" />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-center mb-12`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={count}
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.2, y: 20 }}
                  className="text-9xl font-black bg-vibrant-gradient bg-clip-text text-transparent select-none"
                >
                  {formatNumber(count)}
                </motion.div>
              </AnimatePresence>
              <p className="text-muted-foreground font-black mt-4 uppercase tracking-[0.3em] opacity-40 text-xs">Kalan: {formatNumber(dhikr.targetCount - count)}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-2">
              <Button variant="outline" size="lg" className="h-24 text-lg rounded-[2.5rem] border-2 border-primary/10 hover:bg-primary/5 font-black uppercase tracking-wider" onClick={resetCount}>
                <RotateCcw className="mr-2 h-5 w-5" /> Sıfırla
              </Button>
              <motion.div
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-24 text-2xl font-black rounded-[2.5rem] bg-vibrant-gradient border-none shadow-premium premium-shimmer overflow-hidden active:brightness-110 active:scale-95 transition-all text-white"
                  onClick={incrementCount}
                >
                  {count < dhikr.targetCount ? "Zikret" : "Tamamla"}
                </Button>
              </motion.div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-10 uppercase tracking-[0.4em] font-black opacity-30 text-center">Hızlı sayım için seri dokunuş yapabilirsiniz</p>
          </div>
        </div>
      </div>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-premium">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl font-bold">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" /> Ara Verilsin mi?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              Zikir henüz tamamlanmadı. İlerlemeniz otomatik olarak güvenli bir şekilde kaydedilecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl border-none bg-secondary font-bold flex-1">Devam Et</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="rounded-xl bg-destructive text-white font-black flex-1">Kaydet ve Çık</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
