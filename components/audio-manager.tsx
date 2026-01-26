"use client"

import { useState, useEffect, useRef } from "react"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"

// Ses dosyalarını önceden yüklemek ve yönetmek için bir bileşen
export function useAudioManager() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return getStorageItem("dhikrSoundEnabled", true)
  })

  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  // Ses dosyalarını yükle
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Click sesi için yeni bir Audio nesnesi oluştur
        // Eğer dosya yoksa hata vermemesi için sessizce başarısız olmasını sağlayalım
        const clickSound = new Audio("/click.mp3")

        const handleCanPlayThrough = () => {
          setIsAudioLoaded(true)
          setAudioError(null)
          console.log("Audio system ready")
        }

        const handleError = (e: any) => {
          console.warn("Audio file issue:", e)
          // Don't set isAudioLoaded to false permanently, let it try to play anyway
        }

        clickSound.addEventListener("canplaythrough", handleCanPlayThrough)
        clickSound.addEventListener("error", handleError)

        clickSound.load()
        clickSoundRef.current = clickSound

        return () => {
          clickSound.removeEventListener("canplaythrough", handleCanPlayThrough)
          clickSound.removeEventListener("error", handleError)
        }
      } catch (error) {
        console.error("Audio error:", error)
      }
    }
  }, [])

  // Ses ayarını localStorage'a kaydet
  useEffect(() => {
    setStorageItem("dhikrSoundEnabled", soundEnabled)
  }, [soundEnabled])

  // Ses çalma fonksiyonu
  const playSound = (customSound?: string) => {
    if (!soundEnabled) return false

    try {
      // Özel ses dosyası veya varsayılan tıklama sesi
      if (customSound) {
        // Özel ses için yeni bir Audio nesnesi oluştur
        const audio = new Audio(customSound)
        audio.volume = 0.5

        // Sesi çal
        const playPromise = audio.play()

        // Bazı tarayıcılarda play() bir Promise döndürür
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Özel ses çalma hatası:", error)
            // Hata durumunda varsayılan sesi çalmayı dene
            if (clickSoundRef.current && isAudioLoaded) {
              clickSoundRef.current.currentTime = 0
              clickSoundRef.current.play().catch((e) => console.error("Varsayılan ses çalma hatası:", e))
            }
          })
        }
      } else {
        // Varsayılan tıklama sesini çal
        if (clickSoundRef.current && isAudioLoaded) {
          clickSoundRef.current.currentTime = 0
          clickSoundRef.current.play().catch((e) => console.error("Varsayılan ses çalma hatası:", e))
        }
      }

      return true
    } catch (error) {
      console.error("Ses çalma hatası:", error)
      return false
    }
  }

  // Test sesi çalma fonksiyonu
  const testSound = () => {
    if (!soundEnabled) {
      return { success: false, message: "Ses kapalı" }
    }

    if (!isAudioLoaded) {
      return { success: false, message: "Ses dosyası henüz yüklenmedi" }
    }

    try {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0
        clickSoundRef.current.play().catch((e) => {
          console.error("Test ses çalma hatası:", e)
          throw e
        })
        return { success: true, message: "Ses çalışıyor" }
      } else {
        return { success: false, message: "Ses dosyası bulunamadı" }
      }
    } catch (error) {
      console.error("Test ses çalma hatası:", error)
      return { success: false, message: "Ses çalınamadı" }
    }
  }

  return {
    soundEnabled,
    setSoundEnabled,
    playSound,
    testSound,
    isAudioLoaded,
    audioError,
  }
}

