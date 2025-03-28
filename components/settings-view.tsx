"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Moon, Sun, Download, Trash2, Github, Share2, Volume2, Vibrate } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SettingsViewProps {
  onClose: () => void
  onShare?: () => void
}

export function SettingsView({ onClose, onShare }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrSoundEnabled")
    return saved !== null ? saved === "true" : true
  })
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrVibrationEnabled")
    return saved !== null ? saved === "true" : true
  })
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem("dhikrSoundEnabled", soundEnabled.toString())
  }, [soundEnabled])

  useEffect(() => {
    localStorage.setItem("dhikrVibrationEnabled", vibrationEnabled.toString())
  }, [vibrationEnabled])

  const exportData = () => {
    try {
      const dhikrs = localStorage.getItem("dhikrs") || "[]"
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(dhikrs)
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "zikirmatik_yedek.json")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      toast({
        title: "Veriler dışa aktarıldı",
        description: "Zikirleriniz başarıyla dışa aktarıldı.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const clearAllData = () => {
    localStorage.removeItem("dhikrs")

    toast({
      title: "Tüm veriler silindi",
      description: "Tüm zikir verileri silindi.",
    })

    // Reload the page to reflect changes
    window.location.reload()
  }

  const openGithub = () => {
    window.open("https://github.com/ilyasbozdemir/zikirmatik", "_blank")
  }

  const testSound = () => {
    try {
      const audio = new Audio("/click.mp3")
      audio.volume = 0.5
      audio.play()

      toast({
        title: "Ses Testi",
        description: "Ses çalışıyor.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ses çalınırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const testVibration = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100])

      toast({
        title: "Titreşim Testi",
        description: "Titreşim çalışıyor.",
      })
    } else {
      toast({
        title: "Hata",
        description: "Cihazınız titreşim özelliğini desteklemiyor.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Ayarlar</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Görünüm</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">Açık veya koyu tema seçin</p>
              </div>
              <div className="flex space-x-2">
                <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4 mr-2" /> Açık
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4 mr-2" /> Koyu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Bildirimler ve Geri Bildirim</CardTitle>
            <CardDescription className="text-sm">
              Zikir çekerken ses ve titreşim ayarlarını yapılandırın
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound" className="flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" /> Ses Efektleri
                  </Label>
                  <p className="text-sm text-muted-foreground">Zikir çekerken tıklama sesi çalar</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  <Button variant="outline" size="sm" onClick={testSound} disabled={!soundEnabled}>
                    Test Et
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vibration" className="flex items-center">
                    <Vibrate className="h-4 w-4 mr-2" /> Titreşim
                  </Label>
                  <p className="text-sm text-muted-foreground">Zikir çekerken cihazınız titreşir</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="vibration" checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
                  <Button variant="outline" size="sm" onClick={testVibration} disabled={!vibrationEnabled}>
                    Test Et
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Veri Yönetimi</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Verileri Dışa Aktar
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onShare?.()}>
                <Share2 className="mr-2 h-4 w-4" />
                Paylaş ve Veri Aktar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Tüm Verileri Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tüm veriler silinecek</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem tüm zikir verilerinizi silecek ve geri alınamaz. Devam etmek istediğinize emin misiniz?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllData}>Tüm Verileri Sil</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Zikirmatik v1.0.0</p>
            <p className="text-sm text-muted-foreground mt-1">© 2023 Tüm hakları saklıdır.</p>
            <p className="text-sm text-primary mt-2 font-medium">Ömür boyu ücretsiz</p>

            <div className="mt-4">
              <Button variant="outline" className="w-full justify-start" onClick={openGithub}>
                <Github className="mr-2 h-4 w-4" />
                GitHub'da Görüntüle
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Bu uygulama açık kaynak kodludur. Sorunlar için GitHub üzerinden issue açabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

