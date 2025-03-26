import type { Dhikr } from "@/app/page"

/**
 * Zikir verilerini paylaşılabilir bir URL'ye dönüştürür
 */
export function createShareableLink(dhikrs: Dhikr[], type: "single" | "list" = "single"): string {
  try {
    // Paylaşılacak verileri hazırla
    const data = {
      type,
      dhikrs,
      timestamp: Date.now(),
    }

    // Verileri JSON'a dönüştür ve Base64 ile kodla
    const encodedData = btoa(encodeURIComponent(JSON.stringify(data)))

    // URL oluştur
    const url = `${window.location.origin}?shared=${encodedData}`
    return url
  } catch (error) {
    console.error("Paylaşım linki oluşturulurken hata:", error)
    return ""
  }
}

/**
 * URL'den paylaşılan zikir verilerini çıkarır
 */
export function extractSharedData(url: string): { type: "single" | "list"; dhikrs: Dhikr[] } | null {
  try {
    // URL'den paylaşım parametresini al
    const urlObj = new URL(url)
    const sharedParam = urlObj.searchParams.get("shared")

    if (!sharedParam) return null

    // Base64'ten çöz ve JSON'a dönüştür
    const decodedData = JSON.parse(decodeURIComponent(atob(sharedParam)))

    return {
      type: decodedData.type,
      dhikrs: decodedData.dhikrs,
    }
  } catch (error) {
    console.error("Paylaşılan veri çözümlenirken hata:", error)
    return null
  }
}

/**
 * Tüm localStorage verilerini paylaşılabilir bir URL'ye dönüştürür
 */
export function createDataExportLink(): string {
  try {
    // localStorage'dan tüm verileri al
    const data = {
      dhikrs: localStorage.getItem("dhikrs") || "[]",
      settings: {
        sound: localStorage.getItem("dhikrSoundEnabled"),
        vibration: localStorage.getItem("dhikrVibrationEnabled"),
        theme: localStorage.getItem("theme"),
        hasSeenIntro: localStorage.getItem("hasSeenIntro"),
      },
      timestamp: Date.now(),
    }

    // Verileri JSON'a dönüştür ve Base64 ile kodla
    const encodedData = btoa(encodeURIComponent(JSON.stringify(data)))

    // URL oluştur
    const url = `${window.location.origin}?import=${encodedData}`
    return url
  } catch (error) {
    console.error("Veri dışa aktarma linki oluşturulurken hata:", error)
    return ""
  }
}

/**
 * URL'den paylaşılan tüm verileri çıkarır ve localStorage'a yükler
 */
export function importDataFromLink(url: string): boolean {
  try {
    // URL'den import parametresini al
    const urlObj = new URL(url)
    const importParam = urlObj.searchParams.get("import")

    if (!importParam) return false

    // Base64'ten çöz ve JSON'a dönüştür
    const decodedData = JSON.parse(decodeURIComponent(atob(importParam)))

    // Verileri localStorage'a yükle
    if (decodedData.dhikrs) {
      localStorage.setItem("dhikrs", decodedData.dhikrs)
    }

    if (decodedData.settings) {
      if (decodedData.settings.sound !== null) {
        localStorage.setItem("dhikrSoundEnabled", decodedData.settings.sound)
      }
      if (decodedData.settings.vibration !== null) {
        localStorage.setItem("dhikrVibrationEnabled", decodedData.settings.vibration)
      }
      if (decodedData.settings.theme !== null) {
        localStorage.setItem("theme", decodedData.settings.theme)
      }
      if (decodedData.settings.hasSeenIntro !== null) {
        localStorage.setItem("hasSeenIntro", decodedData.settings.hasSeenIntro)
      }
    }

    return true
  } catch (error) {
    console.error("Veri içe aktarılırken hata:", error)
    return false
  }
}

