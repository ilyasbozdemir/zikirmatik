"use client";

import { Button } from "@/components/ui/button";
import { Home, BarChart3, Clock, Settings, Info, Plus } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { GitHub } from "lucide-react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onAddDhikr: () => void;
}

export function Sidebar({ activeView, onNavigate, onAddDhikr }: SidebarProps) {
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

      <div className="mt-auto">
        <Button className="w-full" onClick={onAddDhikr}>
          <Plus className="mr-2 h-5 w-5" />
          Yeni Zikir Ekle
        </Button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">v1.0.0-rc</p>
        <p className="text-xs text-muted-foreground mt-1">Ömür boyu ücretsiz</p>
        <p className="text-xs text-muted-foreground mt-2">
    <a href="https://github.com/ilyasbozdemir/zikirmatik" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center space-x-1">
      <GitHub className="w-4 h-4" />
      <span>GitHub Reposu</span>
    </a>
  </p>
      </div>
    </div>
  );
}
