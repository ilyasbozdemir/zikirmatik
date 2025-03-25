"use client"

import { Button } from "@/components/ui/button"
import { Home, BarChart3, Clock, Settings, Plus } from "lucide-react"

interface BottomNavProps {
  activeView: string
  onNavigate: (view: string) => void
  onAddDhikr: () => void
}

export function BottomNav({ activeView, onNavigate, onAddDhikr }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background flex items-center justify-around px-2">
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

      <Button
        variant="ghost"
        size="icon"
        className={activeView === "schedule" ? "text-primary" : "text-muted-foreground"}
        onClick={() => onNavigate("schedule")}
      >
        <Clock className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={activeView === "settings" ? "text-primary" : "text-muted-foreground"}
        onClick={() => onNavigate("settings")}
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  )
}

