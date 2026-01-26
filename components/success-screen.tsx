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
    <div className="fixed inset-0 bg-background z-[200] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        className="glass p-10 rounded-[3rem] shadow-premium max-w-sm w-full relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-vibrant-gradient" />

        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-black mb-3 tracking-tight bg-vibrant-gradient bg-clip-text text-transparent italic">Maaşallah!</h1>
        <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">Zikrinizi başarıyla tamamladınız. Allah kabul etsin.</p>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            size="lg"
            className="w-full h-16 bg-vibrant-gradient text-white text-xl font-black rounded-2xl border-none shadow-xl premium-shimmer overflow-hidden"
            onClick={onClose}
          >
            <Home className="mr-3 h-6 w-6 fill-current" /> Devam Et
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

