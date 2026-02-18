"use client"

import { Button } from "@/components/ui/button"
import { Home, BarChart3, Clock, Settings, Info, Plus, Share2, BookOpen, Database, List, Globe, User, UserPlus } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDhikrs } from "@/context/dhikr-context"

interface SidebarProps {
  onAddDhikr: () => void
}

export function Sidebar({ onAddDhikr }: SidebarProps) {
  const pathname = usePathname()

  const { user, supabaseError, retryAuth } = useDhikrs()
  const isActive = (path: string) => pathname === path

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Button
      variant={isActive(href) ? "default" : "ghost"}
      className={`w-full justify-start transition-all duration-300 ${isActive(href) ? 'shadow-md shadow-primary/20' : 'hover:bg-primary/5'}`}
      asChild
    >
      <Link href={href}>
        <Icon className={`mr-3 h-5 w-5 ${isActive(href) ? 'text-primary-foreground' : 'text-primary'}`} />
        <span className="font-medium text-sm">{label}</span>
      </Link>
    </Button>
  )

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r bg-background/60 backdrop-blur-xl p-6 flex flex-col z-50">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-vibrant-gradient rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
            <span className="text-white text-xl font-black">Z</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground/90">Zikirmatik</h1>
        </div>
        <ModeToggle />
      </div>

      <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
        <NavItem href="/" icon={Home} label="Ana Sayfa" />
        <NavItem href="/stats" icon={BarChart3} label="İstatistikler" />
        <NavItem href={user ? "/profile" : "/login"} icon={User} label="Profilim" />
        <NavItem href="/schedule" icon={Clock} label="Planlama" />
        <NavItem href="/social" icon={Globe} label="Keşfet & Sosyal" />
        <NavItem href="/library" icon={BookOpen} label="Kütüphane" />
        <NavItem href="/series" icon={List} label="Zikir Serileri" />

        <div className="my-4 border-t border-primary/5 pt-4">
          <NavItem href="/data" icon={Database} label="Veri Yönetimi" />
          <NavItem href="/help" icon={Info} label="Yardım" />
          <NavItem href="/settings" icon={Settings} label="Ayarlar" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Button className="w-full h-12 bg-vibrant-gradient hover:opacity-90 border-none shadow-lg text-white" onClick={onAddDhikr}>
          <Plus className="mr-2 h-5 w-5" />
          Yeni Zikir Ekle
        </Button>

        {!user && (
          <div className="p-4 rounded-2xl border border-primary/10 bg-primary/5 backdrop-blur-sm text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${supabaseError ? 'bg-destructive' : 'bg-orange-600'} animate-pulse`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${supabaseError ? 'text-destructive' : 'text-orange-600'} opacity-90`}>
                {supabaseError ? 'Bağlantı Sorunu / Yerel Mod' : 'Anonim Mod'}
              </span>
            </div>
            <p className="text-xs font-medium text-muted-foreground opacity-90">
              {supabaseError
                ? "Sunucuya bağlanılamadı. Proje 'uykuda' olabilir."
                : "Zikirleriniz yerel olarak kaydediliyor. Buluta yedeklemek için giriş yapın."}
            </p>
            {supabaseError ? (
              <Button variant="outline" size="sm" onClick={() => retryAuth()} className="w-full h-8 mt-2 text-xs border-destructive/20 hover:bg-destructive/10">
                Tekrar Dene
              </Button>
            ) : (
              <Button variant="outline" className="w-full h-10 rounded-xl font-bold border-2" asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
            )}
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">v1.5.0-premium</p>
        </div>
      </div>
    </div>
  )
}
