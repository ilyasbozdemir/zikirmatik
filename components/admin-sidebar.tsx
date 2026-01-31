"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    Activity,
    Settings,
    Shield,
    LogOut,
    Home
} from "lucide-react"

export function AdminSidebarContent({ onItemClick }: { onItemClick?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()

    const sidebarItems = [
        {
            title: "Genel Bakış",
            icon: LayoutDashboard,
            href: "/admin",
            variant: "default"
        },
        {
            title: "Kullanıcılar",
            icon: Users,
            href: "/admin/users",
            variant: "ghost"
        },
        {
            title: "Aktiviteler",
            icon: Activity,
            href: "/admin/activity",
            variant: "ghost"
        },
        {
            title: "Ayarlar",
            icon: Settings,
            href: "/admin/settings",
            variant: "ghost"
        }
    ]

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl">
            <div className="p-6 flex flex-col gap-1 items-center justify-center border-b border-primary/5">
                <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-center">Admin Paneli</h2>
                <p className="text-xs text-muted-foreground font-medium bg-primary/5 px-2 py-0.5 rounded-full">v1.0 Beta</p>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2">
                {sidebarItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start h-12 text-md font-bold rounded-xl transition-all",
                            pathname === item.href
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                        onClick={() => {
                            router.push(item.href)
                            if (onItemClick) onItemClick()
                        }}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.title}
                    </Button>
                ))}
            </div>

            <div className="p-4 border-t border-primary/5 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/')}
                >
                    <Home className="mr-3 h-4 w-4" />
                    Ana Sayfaya Dön
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    )
}

export function AdminSidebar() {
    return (
        <div className="w-64 border-r border-primary/10 h-full hidden md:block">
            <AdminSidebarContent />
        </div>
    )
}
