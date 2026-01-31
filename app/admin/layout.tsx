"use client"

import { useDhikrs } from "@/context/dhikr-context"
import { AdminSidebar, AdminSidebarContent } from "@/components/admin-sidebar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ShieldAlert, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAdmin, isLoading } = useDhikrs()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push("/")
        }
    }, [isAdmin, isLoading, router])

    const [isMobileOpen, setIsMobileOpen] = useState(false)

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAdmin) {
        return null // Will redirect via useEffect
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <AdminSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-primary/10 flex items-center justify-between bg-background/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                        <span className="font-black text-lg">Admin Paneli</span>
                    </div>
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r border-primary/10 w-72">
                            <AdminSidebarContent onItemClick={() => setIsMobileOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
