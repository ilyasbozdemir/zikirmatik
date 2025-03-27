"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react"
import type { Dhikr } from "@/app/page"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { formatNumber } from "@/lib/format-number"

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
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrSoundEnabled")
    return saved !== null ? saved === "true" : true
  })
  const { toast } = useToast()

  useEffect(() => {
    setProgress((count / dhikr.targetCount) * 100)
    onUpdate(dhikr.id, count)

    // Show toast when reaching milestones
    if (count > 0 && count % 10 === 0) {
      toast({
        title: "İlerleme",
        description: `${formatNumber(count)} zikir tamamlandı. ${formatNumber(dhikr.targetCount - count)} zikir kaldı.`,
      })
    }
  }, [count, dhikr.id, dhikr.targetCount, onUpdate, toast])

  // Save sound preference
  useEffect(() => {
    localStorage.setItem("dhikrSoundEnabled", soundEnabled.toString())
  }, [soundEnabled])

  const playSound = () => {
    if (!soundEnabled) return

    try {
      const audio = new Audio("/click.mp3")
      audio.volume = 0.3
      audio.play()
    } catch (error) {
      console.error("Sound playback failed:", error)
    }
  }

  const incrementCount = () => {
    const now = Date.now()
    const isDoubleTap = now - lastTapTime < 300

    if (isDoubleTap) {
      setDoubleTapCount((prev) => prev + 1)

      // Increment by 5 on triple tap (after 2 double taps)
      if (doubleTapCount >= 2) {
        if (count + 5 <= dhikr.targetCount) {
          setCount((prev) => prev + 5)
          playSound()
          toast({
            title: "+5",
            description: "Hızlı sayım: 5 zikir eklendi",
          })
        } else {
          setCount(dhikr.targetCount)
          playSound()
        }
        setDoubleTapCount(0)
      } else {
        // Increment by 2 on double tap
        if (count + 2 <= dhikr.targetCount) {
          setCount((prev) => prev + 2)
          playSound()
          toast({
            title: "+2",
            description: "Çift tıklama: 2 zikir eklendi",
          })
        } else {
          setCount(dhikr.targetCount)
          playSound()
        }
      }
    } else {
      setDoubleTapCount(0)
      if (count < dhikr.targetCount) {
        setCount((prev) => prev + 1)
        playSound()
      }
    }

    setLastTapTime(now)

    // Add vibration if supported
    if ("vibrate" in navigator) {
      navigator.vibrate(20)
    }
  }

  const resetCount = () => {
    setIsVibrating(true)
    setTimeout(() => setIsVibrating(false), 500)
    setCount(0)

    toast({
      title: "Sayaç sıfırlandı",
      description: "Zikir sayacı sıfırlandı.",
    })

    // Add stronger vibration for reset if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([30, 50, 30])
    }
  }

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev)
    toast({
      title: soundEnabled ? "Ses kapatıldı" : "Ses açıldı",
      description: soundEnabled ? "Zikir sesleri kapatıldı." : "Zikir sesleri açıldı.",
    })
  }

  return (
    <div className="container max-w-md mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Zikir Çek</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSound}>
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
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
          <div className="text-7xl font-bold mb-2">{formatNumber(count)}</div>
          <p className="text-muted-foreground">Kalan: {formatNumber(dhikr.targetCount - count)}</p>
          <p className="text-xs text-muted-foreground mt-2">Çift tıklama: +2 • Üçlü tıklama: +5</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <Button variant="outline" size="lg" className="h-16 text-lg" onClick={resetCount}>
            <RotateCcw className="mr-2 h-5 w-5" /> Sıfırla
          </Button>
          <Button variant="default" size="lg" className="h-16 text-lg" onClick={incrementCount}>
            Sayaç {count < dhikr.targetCount ? "+1" : "✓"}
          </Button>
        </div>
      </div>
    </div>
  )
}

