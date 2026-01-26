"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { useMobile } from "@/hooks/use-mobile"
import { AddDhikrForm } from "@/components/add-dhikr-form"
import { useDhikrs } from "@/context/dhikr-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useMobile()
    const [showAddForm, setShowAddForm] = useState(false)
    const { addNewDhikr } = useDhikrs()

    return (
        <div className={`flex ${!isMobile ? "flex-row" : "flex-col"} min-h-screen bg-background`}>
            {!isMobile && <Sidebar onAddDhikr={() => setShowAddForm(true)} />}

            <main className={`flex-1 ${!isMobile ? "ml-64" : "pb-20"}`}>
                <div className="container mx-auto max-w-4xl p-4 sm:p-8">
                    {children}
                </div>
            </main>

            {isMobile && (
                <BottomNav
                    activeView=""
                    onNavigate={() => { }}
                    onAddDhikr={() => setShowAddForm(true)}
                    onShare={() => { }}
                    onDhikrLibrary={() => { }}
                    onDhikrSeries={() => { }}
                />
            )}

            <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
                <SheetContent side="bottom" className="h-[90vh] p-0 overflow-y-auto">
                    <AddDhikrForm onAdd={(d) => { addNewDhikr(d); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} />
                </SheetContent>
            </Sheet>
        </div>
    )
}
