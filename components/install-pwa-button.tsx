"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // PWA kurulum olayını dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      // Chrome 76+ için kurulum olayını engelle
      e.preventDefault()
      // Olayı daha sonra kullanmak üzere sakla
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // iOS Safari kontrolü
    const checkIfIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent) && !window.navigator.standalone
    }

    // Kurulum durumunu kontrol et
    const checkIfInstalled = () => {
      // PWA zaten kuruluysa veya tarayıcı üzerinden açılmışsa
      if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
        setIsInstalled(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    setIsIOS(checkIfIOS())
    checkIfInstalled()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        toast({
          title: "iOS'ta Kurulum",
          description:
            "Ana ekrana eklemek için Safari'de paylaş butonuna tıklayın ve 'Ana Ekrana Ekle' seçeneğini seçin.",
        })
      } else {
        toast({
          title: "Kurulum Bilgisi",
          description: "Bu uygulama zaten kurulu veya kurulum desteklenmiyor.",
        })
      }
      return
    }

    // Kurulum istemini göster
    deferredPrompt.prompt()

    // Kullanıcının seçimini bekle
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast({
        title: "Kurulum Başarılı",
        description: "Zikirmatik uygulaması başarıyla kuruldu!",
      })
      setIsInstalled(true)
    } else {
      toast({
        title: "Kurulum İptal Edildi",
        description: "Daha sonra tekrar deneyebilirsiniz.",
      })
    }

    // İstemi temizle
    setDeferredPrompt(null)
  }

  if (isInstalled) {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        <Check className="mr-2 h-4 w-4" /> Uygulama Kurulu
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={handleInstallClick}>
      <Download className="mr-2 h-4 w-4" />
      {isIOS ? "Ana Ekrana Ekle" : "Uygulamayı Kur"}
    </Button>
  )
}

