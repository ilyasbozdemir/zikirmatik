"use client"

import { Button } from "@/components/ui/button"
import { Home, BarChart3, Settings, Plus, HelpCircle, Share2 } from "lucide-react"

interface BottomNavProps {
  activeView: string
  onNavigate: (view: string) => void
  onAddDhikr: () => void
  onShare: () => void
}

export function BottomNav({ activeView, onNavigate, onAddDhikr, onShare }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background flex items-center justify-around px-2 z-10">
      <Button
        variant="ghost"
        size="icon"
        className={activeView === "home" ? "text-primary" : "text-muted-foreground"}
        onClick={() => onNavigate("home")}
      >
        <Home className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={activeView === "stats" ? "text-primary" : "text-muted-foreground"}
        onClick={() => onNavigate("stats")}
      >
        <BarChart3 className="h-5 w-5" />
      </Button>

      <Button variant="default" size="icon" className="h-12 w-12 rounded-full shadow-lg -mt-6" onClick={onAddDhikr}>
        <Plus className="h-6 w-6" />
      </Button>

      <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={onShare}>
        <Share2 className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={activeView === "settings" || activeView === "help" ? "text-primary" : "text-muted-foreground"}
        onClick={() => onNavigate(activeView === "help" ? "settings" : "help")}
      >
        {activeView === "help" ? <Settings className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </Button>
    </div>
  )
}

