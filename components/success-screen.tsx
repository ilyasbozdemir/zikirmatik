"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Home } from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { useEffect } from "react"

interface SuccessScreenProps {
  onClose: () => void
}

export function SuccessScreen({ onClose }: SuccessScreenProps) {
  useEffect(() => {
    // Trigger confetti effect
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // since particles fall down, start a bit higher than random
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      )
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      )
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container max-w-md mx-auto p-4 h-screen flex flex-col items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Tebrikler!</h1>
        <p className="text-xl text-muted-foreground mb-8">Zikir başarıyla tamamlandı.</p>
        <Button size="lg" className="w-full" onClick={onClose}>
          <Home className="mr-2 h-5 w-5" /> Ana Sayfaya Dön
        </Button>
      </motion.div>
    </div>
  )
}

