"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Play, RotateCcw, Calendar, Search, Trash2, BarChart3, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HelpViewProps {
  onClose: () => void
}

export function HelpView({ onClose }: HelpViewProps) {
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Yardım</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Hoş Geldiniz</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-muted-foreground mb-4">
              Zikirmatik uygulaması, günlük zikirlerinizi takip etmenize, kaydetmenize ve istatistiklerini görmenize
              yardımcı olur.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Temel Özellikler</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-4">
              <li className="flex">
                <Plus className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Zikir Ekle</p>
                  <p className="text-sm text-muted-foreground">
                    Yeni zikir eklemek için sağ alttaki + butonuna tıklayın veya özelliğini kullanın.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Play className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Zikir Çek</p>
                  <p className="text-sm text-muted-foreground">
                    Başla butonuna tıklayarak zikir çekmeye başlayabilirsiniz. Sayaç ekranında tek tıklama +1, çift
                    tıklama +2, üçlü tıklama +5 ekler.
                  </p>
                </div>
              </li>
              <li className="flex">
                <RotateCcw className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Tekrarla</p>
                  <p className="text-sm text-muted-foreground">
                    Tamamlanan bir zikri tekrar başlatmak için tekrarla butonuna tıklayın. Bu işlem zikri "Çekilecekler"
                    listesine ekler.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Trash2 className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Sil</p>
                  <p className="text-sm text-muted-foreground">
                    İstemediğiniz zikirleri silmek için çöp kutusu simgesine tıklayın.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Calendar className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Tarih Filtresi</p>
                  <p className="text-sm text-muted-foreground">
                    Belirli bir tarihteki zikirleri görmek için tarih filtresini kullanın.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Search className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Arama</p>
                  <p className="text-sm text-muted-foreground">
                    Zikirleri isimlerine göre aramak için arama kutusunu kullanın.
                  </p>
                </div>
              </li>
              <li className="flex">
                <BarChart3 className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">İstatistikler</p>
                  <p className="text-sm text-muted-foreground">
                    Zikir istatistiklerinizi görmek için istatistik butonuna tıklayın.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Clock className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Planlama</p>
                  <p className="text-sm text-muted-foreground">
                    Günlük, haftalık veya aylık olarak zikir planlaması yapabilirsiniz.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Veri Güvenliği</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Tüm verileriniz tamamen yerel olarak tarayıcınızda depolanır ve hiçbir sunucuya gönderilmez. Bu,
              verilerinizin gizliliğini sağlar ancak tarayıcı verilerinizi temizlerseniz kaybolabilir.
            </p>
            <p className="text-sm text-muted-foreground">
              Daha fazla bilgi için{" "}
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                localStorage hakkında bilgi
              </a>{" "}
              edinebilirsiniz.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">İpuçları</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Günlük seri oluşturmak için her gün en az bir zikir tamamlayın.</li>
              <li>• Kategorilere göre filtreleme yaparak belirli türdeki zikirleri görebilirsiniz.</li>
              <li>• Zikir çekerken ses efektlerini açıp kapatabilirsiniz.</li>
              <li>• İstatistikler bölümünden ilerlemenizi takip edebilirsiniz.</li>
              <li>• Önemli verilerinizi kaybetmemek için ayarlar bölümünden yedekleme yapabilirsiniz.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

