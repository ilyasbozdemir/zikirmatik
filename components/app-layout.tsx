"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { AddDhikrForm } from "@/components/add-dhikr-form"
import { useDhikrs } from "@/context/dhikr-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { MigrationManager } from "@/components/migration-manager"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [showAddForm, setShowAddForm] = useState(false)
    const { addNewDhikr } = useDhikrs()
    const router = useRouter()

    const handleAdd = (d: any) => {
        addNewDhikr(d)
        setShowAddForm(false)
        router.push("/")
    }

    return (
        <div className="flex min-h-screen bg-background">
            <MigrationManager />

            {/* Desktop Sidebar - Hidden on mobile, Fixed width on desktop */}
            <div className="hidden md:block w-64 shrink-0">
                <Sidebar onAddDhikr={() => setShowAddForm(true)} />
            </div>

            <main className="flex-1 pb-24 md:pb-8 md:pl-0">
                <div className="container mx-auto max-w-4xl p-4 sm:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav - Hidden on desktop */}
            <div className="md:hidden">
                <BottomNav onAddDhikr={() => setShowAddForm(true)} />
            </div>

            <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
                <SheetContent side="bottom" className="h-[90vh] p-0 overflow-y-auto rounded-t-[2rem] border-none shadow-premium">
                    <AddDhikrForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
                </SheetContent>
            </Sheet>
        </div>
    )
}
