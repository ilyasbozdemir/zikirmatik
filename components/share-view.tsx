"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download, Upload, Check, Link, List, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Dhikr } from "@/app/page"
import { createShareableLink, createDataExportLink, importDataFromLink, extractSharedData } from "@/lib/share-utils"
import { Badge } from "@/components/ui/badge"
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

interface ShareViewProps {
  dhikrs: Dhikr[]
  onAddDhikrs: (dhikrs: Dhikr[]) => void
  onClose: () => void
  onReload: () => void
}

export function ShareView({ dhikrs, onAddDhikrs, onClose, onReload }: ShareViewProps) {
  const [activeTab, setActiveTab] = useState("share")
  const [shareableLink, setShareableLink] = useState("")
  const [importLink, setImportLink] = useState("")
  const [selectedDhikrs, setSelectedDhikrs] = useState<Dhikr[]>([])
  const [copied, setCopied] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const { toast } = useToast()

  // URL'den paylaşılan verileri kontrol et
  useEffect(() => {
    const checkSharedData = () => {
      const sharedData = extractSharedData(window.location.href)

      if (sharedData) {
        // Paylaşılan verileri işle
        if (sharedData.dhikrs && sharedData.dhikrs.length > 0) {
          setSelectedDhikrs(sharedData.dhikrs)
          setActiveTab("import")

          toast({
            title: "Paylaşılan Zikirler Bulundu",
            description: `${sharedData.dhikrs.length} zikir bulundu. İçe aktarmak için 'İçe Aktar' sekmesine bakın.`,
          })
        }

        // URL'den paylaşım parametresini temizle
        const url = new URL(window.location.href)
        url.searchParams.delete("shared")
        window.history.replaceState({}, document.title, url.toString())
      }

      // İçe aktarma verilerini kontrol et
      const importResult = importDataFromLink(window.location.href)
      if (importResult) {
        setImportSuccess(true)
        setActiveTab("import")

        toast({
          title: "Veriler İçe Aktarıldı",
          description: "Tüm veriler başarıyla içe aktarıldı. Uygulamayı yenileyebilirsiniz.",
        })

        // URL'den import parametresini temizle
        const url = new URL(window.location.href)
        url.searchParams.delete("import")
        window.history.replaceState({}, document.title, url.toString())
      }
    }

    checkSharedData()
  }, [toast])

  const plannedDhikrs = dhikrs.filter((d) => d.status === "planned" || d.status === "in-progress")
  const completedDhikrs = dhikrs.filter((d) => d.status === "completed")

  const createLink = (type: "single" | "list") => {
    if (selectedDhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen paylaşmak için en az bir zikir seçin.",
        variant: "destructive",
      })
      return
    }

    const link = createShareableLink(selectedDhikrs, type)
    setShareableLink(link)
  }

  const createExportLink = () => {
    const link = createDataExportLink()
    setShareableLink(link)
  }

  const copyToClipboard = async () => {
    if (!shareableLink) return

    try {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)

      toast({
        title: "Kopyalandı!",
        description: "Link panoya kopyalandı.",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Link kopyalanırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const toggleDhikrSelection = (dhikr: Dhikr) => {
    if (selectedDhikrs.some((d) => d.id === dhikr.id)) {
      setSelectedDhikrs(selectedDhikrs.filter((d) => d.id !== dhikr.id))
    } else {
      setSelectedDhikrs([...selectedDhikrs, dhikr])
    }
  }

  const importSelectedDhikrs = () => {
    if (selectedDhikrs.length === 0) {
      toast({
        title: "Hata",
        description: "İçe aktarılacak zikir bulunamadı.",
        variant: "destructive",
      })
      return
    }

    // Zikirleri içe aktar
    onAddDhikrs(selectedDhikrs)

    toast({
      title: "Zikirler İçe Aktarıldı",
      description: `${selectedDhikrs.length} zikir başarıyla çekilecekler listesine eklendi.`,
    })

    // Seçimleri temizle
    setSelectedDhikrs([])
  }

  const handleImportFromLink = () => {
    if (!importLink) {
      toast({
        title: "Hata",
        description: "Lütfen bir içe aktarma linki girin.",
        variant: "destructive",
      })
      return
    }

    try {
      // Önce paylaşılan zikirleri kontrol et
      const sharedData = extractSharedData(importLink)

      if (sharedData && sharedData.dhikrs.length > 0) {
        setSelectedDhikrs(sharedData.dhikrs)

        toast({
          title: "Zikirler Bulundu",
          description: `${sharedData.dhikrs.length} zikir bulundu. İçe aktarmak için 'İçe Aktar' butonuna tıklayın.`,
        })

        return
      }

      // Sonra tam veri içe aktarma linkini kontrol et
      const importResult = importDataFromLink(importLink)

      if (importResult) {
        setImportSuccess(true)

        toast({
          title: "Veriler İçe Aktarıldı",
          description: "Tüm veriler başarıyla içe aktarıldı. Uygulamayı yenileyebilirsiniz.",
        })
      } else {
        toast({
          title: "Hata",
          description: "Geçersiz içe aktarma linki. Lütfen doğru bir link girdiğinizden emin olun.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İçe aktarma işlemi sırasında bir hata oluştu.",
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
        <h1 className="text-2xl font-bold ml-2">Paylaş ve Aktar</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="share">Paylaş</TabsTrigger>
          <TabsTrigger value="import">İçe Aktar</TabsTrigger>
        </TabsList>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Zikir Paylaş</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Zikirlerinizi başkalarıyla paylaşmak için seçin ve bir paylaşım linki oluşturun.
                </p>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Çekilecek Zikirler</h3>
                  {plannedDhikrs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {plannedDhikrs.map((dhikr) => (
                        <Button
                          key={dhikr.id}
                          variant={selectedDhikrs.some((d) => d.id === dhikr.id) ? "default" : "outline"}
                          className="justify-between"
                          onClick={() => toggleDhikrSelection(dhikr)}
                        >
                          <span>{dhikr.name}</span>
                          <Badge variant="secondary">{dhikr.targetCount}</Badge>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Henüz çekilecek zikir bulunmuyor.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tamamlanan Zikirler</h3>
                  {completedDhikrs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {completedDhikrs.map((dhikr) => (
                        <Button
                          key={dhikr.id}
                          variant={selectedDhikrs.some((d) => d.id === dhikr.id) ? "default" : "outline"}
                          className="justify-between"
                          onClick={() => toggleDhikrSelection(dhikr)}
                        >
                          <span>{dhikr.name}</span>
                          <Badge variant="secondary">{dhikr.targetCount}</Badge>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Henüz tamamlanan zikir bulunmuyor.</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => createLink("single")}
                    disabled={selectedDhikrs.length === 0}
                  >
                    <Link className="mr-2 h-4 w-4" /> Zikir Linki Oluştur
                  </Button>
                  <Button className="flex-1" onClick={() => createLink("list")} disabled={selectedDhikrs.length === 0}>
                    <List className="mr-2 h-4 w-4" /> Liste Linki Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Veri Aktarımı</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tüm verilerinizi başka bir cihaza veya tarayıcıya aktarmak için bir link oluşturun.
                </p>

                <Button className="w-full" onClick={createExportLink}>
                  <Download className="mr-2 h-4 w-4" /> Veri Aktarım Linki Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>

          {shareableLink && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Oluşturulan Link</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input value={shareableLink} readOnly className="flex-1" />
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Bu linki paylaşarak seçtiğiniz zikirleri veya tüm verilerinizi başkalarıyla paylaşabilirsiniz.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Zikir İçe Aktar</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Paylaşılan zikirleri veya tüm verileri içe aktarmak için bir link girin.
                </p>

                <div className="flex items-center space-x-2">
                  <Input
                    value={importLink}
                    onChange={(e) => setImportLink(e.target.value)}
                    placeholder="İçe aktarma linkini yapıştırın"
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={handleImportFromLink}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedDhikrs.length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Bulunan Zikirler</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {selectedDhikrs.map((dhikr) => (
                      <div key={dhikr.id} className="flex items-center justify-between border p-2 rounded-md">
                        <div>
                          <p className="font-medium">{dhikr.name}</p>
                          <p className="text-xs text-muted-foreground">{dhikr.targetCount} kez</p>
                        </div>
                        {dhikr.category && <Badge variant="outline">{dhikr.category}</Badge>}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" onClick={importSelectedDhikrs}>
                    <Download className="mr-2 h-4 w-4" /> Zikirleri İçe Aktar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {importSuccess && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Veriler İçe Aktarıldı</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tüm veriler başarıyla içe aktarıldı. Değişikliklerin uygulanması için uygulamayı yenilemeniz
                    gerekiyor.
                  </p>

                  <Button className="w-full" onClick={onReload}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Uygulamayı Yenile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Mevcut Verileri Değiştir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dikkat</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem, mevcut tüm verilerinizin üzerine yazacak ve geri alınamaz. Devam etmek istediğinize emin
                  misiniz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleImportFromLink}>Devam Et</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

