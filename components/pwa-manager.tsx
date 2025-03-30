"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Check, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const { toast } = useToast()

  // PWA kurulum ve güncelleme olaylarını dinle
  useEffect(() => {
    if (typeof window === "undefined") return

    // PWA kurulum olayını dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      // Chrome 76+ için kurulum olayını engelle
      e.preventDefault()
      // Olayı daha sonra kullanmak üzere sakla
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      console.log("PWA kurulum olayı yakalandı")
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

    // Service Worker güncellemelerini kontrol et
    const checkForUpdates = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg) {
            setRegistration(reg)

            // Güncelleme kontrolü
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true)
                    toast({
                      title: "Güncelleme Mevcut",
                      description: "Zikirmatik uygulaması için yeni bir güncelleme mevcut.",
                    })
                  }
                })
              }
            })

            // Manuel güncelleme kontrolü
            reg.update().catch((err) => console.error("Service worker güncelleme hatası:", err))
          }
        } catch (error) {
          console.error("Service worker kontrol hatası:", error)
        }
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    setIsIOS(checkIfIOS())
    checkIfInstalled()
    checkForUpdates()

    // Temizlik
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [toast])

  // Uygulamayı kur
  const installApp = async () => {
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
      return { success: false }
    }

    try {
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
        setDeferredPrompt(null)
        return { success: true }
      } else {
        toast({
          title: "Kurulum İptal Edildi",
          description: "Daha sonra tekrar deneyebilirsiniz.",
        })
        return { success: false }
      }
    } catch (error) {
      console.error("PWA kurulum hatası:", error)
      toast({
        title: "Kurulum Hatası",
        description: "Uygulama kurulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
      return { success: false }
    }
  }

  // Uygulamayı güncelle
  const updateApp = () => {
    if (registration && registration.waiting) {
      // Service worker'a güncelleme mesajı gönder
      registration.waiting.postMessage({ type: "SKIP_WAITING" })

      // Sayfayı yenile
      window.location.reload()
      return true
    }
    return false
  }

  return {
    isInstalled,
    isIOS,
    canInstall: !!deferredPrompt || isIOS,
    installApp,
    updateAvailable,
    updateApp,
  }
}

export function InstallPWAButton() {
  const { isInstalled, isIOS, canInstall, installApp } = usePWA()
  const { toast } = useToast()
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSHelp(true)
      return
    }

    const result = await installApp()
    if (!result.success) {
      // Kurulum başarısız olduğunda veya desteklenmediğinde
      toast({
        title: "Kurulum Bilgisi",
        description: "Tarayıcınız PWA kurulumunu desteklemiyor veya uygulama zaten kurulu.",
      })
    }
  }

  if (isInstalled) {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        <Check className="mr-2 h-4 w-4" /> Uygulama Kurulu
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleInstallClick}
        disabled={!canInstall && !isIOS}
      >
        <Download className="mr-2 h-4 w-4" />
        {isIOS ? "Ana Ekrana Ekle" : "Uygulamayı Kur"}
      </Button>

      <AlertDialog open={showIOSHelp} onOpenChange={setShowIOSHelp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Info className="h-5 w-5 text-blue-500 mr-2" /> iOS'ta Kurulum
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">iOS cihazınıza Zikirmatik uygulamasını eklemek için şu adımları izleyin:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Safari tarayıcısında paylaş butonuna dokunun</li>
                <li>Açılan menüde "Ana Ekrana Ekle" seçeneğini bulun</li>
                <li>"Ekle" butonuna dokunun</li>
              </ol>
              <p className="mt-4 text-sm">Not: Bu işlem yalnızca Safari tarayıcısında çalışır.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Anladım</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function UpdatePWAButton() {
  const { updateAvailable, updateApp } = usePWA()

  if (!updateAvailable) return null

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={updateApp}>
      <RefreshCw className="mr-2 h-4 w-4" /> Güncellemeyi Yükle
    </Button>
  )
}

