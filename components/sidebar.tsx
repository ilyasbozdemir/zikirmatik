"use client"

import { Button } from "@/components/ui/button"
import { Home, BarChart3, Clock, Settings, Info, Plus, Share2, BookOpen, Database, List, Globe } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { AuthComponent } from "@/components/auth"

interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  onAddDhikr: () => void
  onShare: () => void
  onDhikrLibrary: () => void
  onDhikrSeries: () => void
  onDataMigration: () => void
  onArabicDhikr?: () => void
}

export function Sidebar({
  activeView,
  onNavigate,
  onAddDhikr,
  onShare,
  onDhikrLibrary,
  onDhikrSeries,
  onDataMigration,
}: SidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-background p-4 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Zikirmatik</h1>
        <ModeToggle />
      </div>

      <div className="space-y-2">
        <Button
          variant={activeView === "home" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("home")}
        >
          <Home className="mr-2 h-5 w-5" />
          Ana Sayfa
        </Button>

        <Button
          variant={activeView === "stats" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("stats")}
        >
          <BarChart3 className="mr-2 h-5 w-5" />
          İstatistikler
        </Button>

        <Button
          variant={activeView === "schedule" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("schedule")}
        >
          <Clock className="mr-2 h-5 w-5" />
          Planlama
        </Button>

        <Button
          variant={activeView === "social" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("social")}
        >
          <Globe className="mr-2 h-5 w-5" />
          Keşfet & Sosyal
        </Button>

        <Button
          variant={activeView === "series" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("series")}
        >
          <List className="mr-2 h-5 w-5" />
          Zikir Serileri
        </Button>

        <Button variant="ghost" className="w-full justify-start" onClick={onShare}>
          <Share2 className="mr-2 h-5 w-5" />
          Paylaş ve Aktar
        </Button>

        <Button variant="ghost" className="w-full justify-start" onClick={onDhikrLibrary}>
          <BookOpen className="mr-2 h-5 w-5" />
          Zikir Kütüphanesi
        </Button>

        <Button
          variant={activeView === "data" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("data")}
        >
          <Database className="mr-2 h-5 w-5" />
          Veri Yönetimi
        </Button>

        <Button
          variant={activeView === "help" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("help")}
        >
          <Info className="mr-2 h-5 w-5" />
          Yardım
        </Button>

        <Button
          variant={activeView === "settings" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigate("settings")}
        >
          <Settings className="mr-2 h-5 w-5" />
          Ayarlar
        </Button>
      </div>

      <div className="mt-auto space-y-4">
        <div className="pt-4 border-t">
          <Button className="w-full mb-4" onClick={onAddDhikr}>
            <Plus className="mr-2 h-5 w-5" />
            Yeni Zikir Ekle
          </Button>
        </div>

        <div className="p-2 bg-muted/30 rounded-lg">
          <AuthComponent />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">v1.2.0-cloud</p>
          <p className="text-xs text-muted-foreground mt-1">Ömür boyu ücretsiz • Bulut Senkronizasyon</p>
        </div>
      </div>
    </div>
  )
}

