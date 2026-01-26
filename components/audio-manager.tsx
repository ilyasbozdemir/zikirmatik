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

  // Ses dosyalarını yükle ve Tarayıcı kısıtlamalarını aş (Unlock)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const clickSound = new Audio("/click.mp3")
      clickSound.preload = "auto"
      clickSound.volume = 0.5

      const unlockAudio = () => {
        clickSound.play().then(() => {
          clickSound.pause()
          clickSound.currentTime = 0
          setIsAudioLoaded(true)
          console.log("Audio Unlocked & Ready")
        }).catch(e => console.warn("Audio unlock pending interaction"))
        window.removeEventListener('click', unlockAudio)
        window.removeEventListener('touchstart', unlockAudio)
      }

      window.addEventListener('click', unlockAudio)
      window.addEventListener('touchstart', unlockAudio)

      clickSoundRef.current = clickSound

      return () => {
        window.removeEventListener('click', unlockAudio)
        window.removeEventListener('touchstart', unlockAudio)
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

