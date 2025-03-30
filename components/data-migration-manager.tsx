"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Upload, Database, RefreshCw, Check, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { Progress } from "@/components/ui/progress"
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

interface DataMigrationManagerProps {
  onClose: () => void
  onReload: () => void
}

// Veri sürüm bilgisi
const CURRENT_DATA_VERSION = "1.1.0"

export function DataMigrationManager({ onClose, onReload }: DataMigrationManagerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dataVersion, setDataVersion] = useState<string | null>(null)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const { toast } = useToast()

  // Veri sürümünü kontrol et
  useEffect(() => {
    const version = getStorageItem("dataVersion", null)
    setDataVersion(version)

    // Eğer sürüm yoksa veya güncel değilse, migrasyon gerekiyor
    if (!version || version !== CURRENT_DATA_VERSION) {
      setNeedsMigration(true)
    }
  }, [])

  const exportAllData = async () => {
    try {
      setIsExporting(true)
      setProgress(10)

      // Tüm verileri topla
      const data = {
        version: CURRENT_DATA_VERSION,
        timestamp: Date.now(),
        dhikrs: getStorageItem("dhikrs", []),
        customDhikrs: getStorageItem("customDhikrs", []),
        dhikrCollections: getStorageItem("dhikrCollections", []),
        dhikrSeries: getStorageItem("dhikrSeries", []),
        settings: {
          theme: getStorageItem("theme", null),
          soundEnabled: getStorageItem("dhikrSoundEnabled", true),
          vibrationEnabled: getStorageItem("dhikrVibrationEnabled", true),
          hasSeenIntro: getStorageItem("hasSeenIntro", false),
        },
      }

      setProgress(50)

      // JSON dosyasını oluştur
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", `zikirmatik_yedek_${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(downloadAnchorNode)

      setProgress(80)

      // Dosyayı indir
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      setProgress(100)

      toast({
        title: "Veriler dışa aktarıldı",
        description: "Tüm verileriniz başarıyla dışa aktarıldı.",
      })
    } catch (error) {
      console.error("Veri dışa aktarma hatası:", error)
      toast({
        title: "Hata",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsExporting(false)
        setProgress(0)
      }, 1000)
    }
  }

  const importData = async (file: File) => {
    try {
      setIsImporting(true)
      setProgress(10)

      // Dosyayı oku
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error("Dosya okunamadı")
          }

          setProgress(30)

          // JSON verisini ayrıştır
          const data = JSON.parse(e.target.result as string)

          setProgress(50)

          // Veri doğrulama
          if (!data || !data.dhikrs) {
            throw new Error("Geçersiz veri formatı")
          }

          // Verileri localStorage'a kaydet
          if (data.dhikrs) {
            setStorageItem("dhikrs", data.dhikrs)
          }

          if (data.customDhikrs) {
            setStorageItem("customDhikrs", data.customDhikrs)
          }

          if (data.dhikrCollections) {
            setStorageItem("dhikrCollections", data.dhikrCollections)
          }

          if (data.dhikrSeries) {
            setStorageItem("dhikrSeries", data.dhikrSeries)
          }

          if (data.settings) {
            if (data.settings.theme) {
              setStorageItem("theme", data.settings.theme)
            }

            if (data.settings.soundEnabled !== undefined) {
              setStorageItem("dhikrSoundEnabled", data.settings.soundEnabled)
            }

            if (data.settings.vibrationEnabled !== undefined) {
              setStorageItem("dhikrVibrationEnabled", data.settings.vibrationEnabled)
            }

            if (data.settings.hasSeenIntro !== undefined) {
              setStorageItem("hasSeenIntro", data.settings.hasSeenIntro)
            }
          }

          // Veri sürümünü kaydet
          setStorageItem("dataVersion", data.version || CURRENT_DATA_VERSION)

          setProgress(100)

          toast({
            title: "Veriler içe aktarıldı",
            description: "Tüm verileriniz başarıyla içe aktarıldı. Değişikliklerin uygulanması için sayfa yenilenecek.",
          })

          // Sayfayı yenile
          setTimeout(() => {
            onReload()
          }, 2000)
        } catch (error) {
          console.error("Veri ayrıştırma hatası:", error)
          toast({
            title: "Hata",
            description: "Veriler ayrıştırılırken bir hata oluştu. Geçersiz dosya formatı.",
            variant: "destructive",
          })
          setIsImporting(false)
          setProgress(0)
        }
      }

      reader.onerror = () => {
        toast({
          title: "Hata",
          description: "Dosya okunurken bir hata oluştu.",
          variant: "destructive",
        })
        setIsImporting(false)
        setProgress(0)
      }

      // Dosyayı oku
      reader.readAsText(file)
    } catch (error) {
      console.error("Veri içe aktarma hatası:", error)
      toast({
        title: "Hata",
        description: "Veriler içe aktarılırken bir hata oluştu.",
        variant: "destructive",
      })
      setIsImporting(false)
      setProgress(0)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    importData(file)
  }

  const migrateData = () => {
    try {
      setIsMigrating(true)
      setProgress(10)

      // Eski verileri al
      const dhikrs = getStorageItem("dhikrs", [])

      setProgress(30)

      // Veri migrasyonu işlemleri
      // Örnek: Eski formattaki zikirleri yeni formata dönüştür
      const migratedDhikrs = dhikrs.map((dhikr: any) => {
        // Eksik alanları ekle
        if (!dhikr.category) {
          dhikr.category = "Genel"
        }

        // scheduledDays formatını kontrol et
        if (dhikr.scheduledDays) {
          if (typeof dhikr.scheduledDays === "string") {
            try {
              dhikr.scheduledDays = JSON.parse(dhikr.scheduledDays)
            } catch (e) {
              dhikr.scheduledDays = [dhikr.scheduledDays]
            }
          }

          // Tüm günleri küçük harfe çevir
          dhikr.scheduledDays = dhikr.scheduledDays.map((day: string) => day.toLowerCase())
        }

        return dhikr
      })

      setProgress(70)

      // Güncellenmiş verileri kaydet
      setStorageItem("dhikrs", migratedDhikrs)

      // Veri sürümünü güncelle
      setStorageItem("dataVersion", CURRENT_DATA_VERSION)

      setProgress(100)

      toast({
        title: "Veri migrasyonu tamamlandı",
        description: "Verileriniz başarıyla yeni sürüme yükseltildi.",
      })

      setDataVersion(CURRENT_DATA_VERSION)
      setNeedsMigration(false)

      setTimeout(() => {
        setIsMigrating(false)
        setProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Veri migrasyon hatası:", error)
      toast({
        title: "Hata",
        description: "Veri migrasyonu sırasında bir hata oluştu.",
        variant: "destructive",
      })
      setIsMigrating(false)
      setProgress(0)
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Veri Yönetimi</h1>
      </div>

      <div className="space-y-6">
        {needsMigration && (
          <Card className="border-amber-500 dark:border-amber-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" /> Veri Güncellemesi Gerekiyor
              </CardTitle>
              <CardDescription>
                Verilerinizin yeni uygulama sürümüyle uyumlu olması için güncellenmesi gerekiyor.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {isMigrating ? (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">Veriler güncelleniyor...</p>
                </div>
              ) : (
                <Button className="w-full" onClick={migrateData}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Verileri Güncelle
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Veri Yedekleme</CardTitle>
            <CardDescription>Tüm zikirlerinizi ve ayarlarınızı yedekleyin</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isExporting ? (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">Veriler dışa aktarılıyor...</p>
              </div>
            ) : (
              <Button className="w-full" onClick={exportAllData}>
                <Download className="mr-2 h-4 w-4" /> Tüm Verileri Yedekle
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Veri Geri Yükleme</CardTitle>
            <CardDescription>Önceden yedeklediğiniz verileri geri yükleyin</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isImporting ? (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">Veriler içe aktarılıyor...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <input type="file" id="file-upload" accept=".json" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="file-upload">
                  <Button className="w-full" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" /> Yedekten Geri Yükle
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground text-center">
                  Sadece .json formatındaki Zikirmatik yedek dosyaları desteklenir
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Veri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Veri Sürümü:</span>
                <span className="text-sm font-medium">
                  {dataVersion || "Belirlenmemiş"}{" "}
                  {dataVersion === CURRENT_DATA_VERSION && <Check className="inline h-4 w-4 text-green-500" />}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Güncel Sürüm:</span>
                <span className="text-sm font-medium">{CURRENT_DATA_VERSION}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Zikir Sayısı:</span>
                <span className="text-sm font-medium">{getStorageItem("dhikrs", []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Özel Zikir Sayısı:</span>
                <span className="text-sm font-medium">{getStorageItem("customDhikrs", []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Koleksiyon Sayısı:</span>
                <span className="text-sm font-medium">{getStorageItem("dhikrCollections", []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Seri Sayısı:</span>
                <span className="text-sm font-medium">{getStorageItem("dhikrSeries", []).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
              <Database className="mr-2 h-4 w-4" /> Tüm Verileri Sıfırla
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tüm veriler silinecek</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem tüm zikir verilerinizi, koleksiyonlarınızı ve ayarlarınızı silecek ve geri alınamaz. Devam
                etmek istediğinize emin misiniz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // Tüm verileri sil
                  localStorage.clear()

                  toast({
                    title: "Tüm veriler silindi",
                    description: "Tüm verileriniz başarıyla silindi. Sayfa yenilenecek.",
                  })

                  // Sayfayı yenile
                  setTimeout(() => {
                    onReload()
                  }, 2000)
                }}
              >
                Tüm Verileri Sıfırla
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

