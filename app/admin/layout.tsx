"use client"

import { useDhikrs } from "@/context/dhikr-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

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
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
