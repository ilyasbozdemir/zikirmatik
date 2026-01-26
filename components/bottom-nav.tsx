"use client"

import { Button } from "@/components/ui/button"
import { Home, Plus, Globe, BarChart3, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BottomNavProps {
  onAddDhikr: () => void
}

import { useDhikrs } from "@/context/dhikr-context"

export function BottomNav({ onAddDhikr }: BottomNavProps) {
  const pathname = usePathname()
  const { user } = useDhikrs()
  const isActive = (path: string) => pathname === path

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive(href) ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary/70'}`}
    >
      <Icon className={`h-6 w-6 ${isActive(href) ? 'fill-primary/10' : ''}`} />
      <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
    </Link>
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 border-t bg-background/80 backdrop-blur-xl flex items-center justify-around px-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <NavItem href="/" icon={Home} label="Ana" />
      <NavItem href="/stats" icon={BarChart3} label="İstat" />

      <div className="relative -mt-10 mx-2">
        <Button
          variant="default"
          size="icon"
          className="h-16 w-16 rounded-[2rem] shadow-premium bg-vibrant-gradient hover:scale-105 active:scale-95 transition-all border-none"
          onClick={onAddDhikr}
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </div>

      <NavItem href="/social" icon={Globe} label="Keşfet" />
      <NavItem href={user ? "/profile" : "/login"} icon={User} label="Profil" />
    </div>
  )
}

