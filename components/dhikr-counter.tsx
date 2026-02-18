"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, RotateCcw, Volume2, VolumeX, Vibrate, AlertTriangle } from "lucide-react"
import type { Dhikr } from "@/types/dhikr"
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
      <div className="fixed inset-0 bg-background z-[101] flex flex-col items-center justify-center overflow-hidden">
        {/* Full-screen clickable area */}
        <div
          className="absolute inset-0 w-full h-full cursor-pointer touch-manipulation active:bg-primary/5 transition-colors z-0"
          onClick={incrementCount}
          role="button"
          tabIndex={0}
          aria-label="Zikir Çek"
        />

        {/* Top Controls (Minimal) */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleClose}
              className="w-12 h-12 rounded-full shadow-lg bg-background border opacity-80 hover:opacity-100"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="pointer-events-auto flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className={`w-12 h-12 rounded-full ${soundEnabled ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              {soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetCount}
              className="w-12 h-12 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Central Content */}
        <div className="relative z-10 text-center pointer-events-none select-none px-6 w-full max-w-lg flex flex-col items-center justify-center h-full pb-20">

          {/* Progress Bar (Subtle) */}
          <div className="w-full max-w-xs mb-12 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dhikr Text */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground/90">
              {dhikr.name}
            </h2>
            {dhikr.translation && (
              <p className="text-xl md:text-2xl text-muted-foreground font-medium mt-4 opacity-80">
                {dhikr.translation}
              </p>
            )}
          </div>

          {/* Massive Counter */}
          <div className="relative animate-in zoom-in duration-300">
            <span className="text-[12rem] md:text-[16rem] font-black leading-none bg-vibrant-gradient bg-clip-text text-transparent drop-shadow-sm tabular-nums tracking-tighter select-none">
              {formatNumber(count)}
            </span>
            <p className="text-lg md:text-xl font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-60">
              Hedef: {formatNumber(dhikr.targetCount)}
            </p>
          </div>

        </div>

        {/* Tap Instruction */}
        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-40 animate-pulse">
          <p className="text-sm font-black uppercase tracking-[0.3em]">Saymak için ekrana dokun</p>
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
