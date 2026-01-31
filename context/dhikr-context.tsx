"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { supabase } from "@/lib/supabase"
import { dbService } from "@/lib/db-services"
import { useToast } from "@/hooks/use-toast"
import { Dhikr } from "@/types/dhikr"

interface DhikrContextType {
    dhikrs: Dhikr[]
    setDhikrs: React.Dispatch<React.SetStateAction<Dhikr[]>>
    isLoading: boolean
    user: any
    isAdmin: boolean
    isSyncing: boolean
    addNewDhikr: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
    deleteDhikr: (id: string) => Promise<void>
    updateDhikrCount: (id: string, count: number) => void
    repeatDhikr: (dhikr: Dhikr) => void
}

const DhikrContext = createContext<DhikrContextType | undefined>(undefined)

export function DhikrProvider({ children }: { children: React.ReactNode }) {
    const [dhikrs, setDhikrs] = useState<Dhikr[]>([])
    const [isLoading, setIsLoading] = useState(true) // Start loading by default
    const [user, setUser] = useState<any>(null)
    const [isSyncing, setIsSyncing] = useState(false)
    const { toast } = useToast()

    const [isAdmin, setIsAdmin] = useState(false)

    // Auth Listener
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // We don't set loading purely here because we wait for data load too
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (mounted) {
                    const currentUser = session?.user ?? null
                    setUser(currentUser)
                    setIsAdmin(currentUser?.email === "bozdemir.ib70@gmail.com")
                }
            } catch (error) {
                console.error("Auth check failed", error)
            }
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                const currentUser = session?.user ?? null
                setUser(currentUser)
                setIsAdmin(currentUser?.email === "bozdemir.ib70@gmail.com")
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                // Ensure we have a small delay or check to allow auth to settle if needed,
                // but relying on 'user' dependency is usually enough.
                // However, initial render user is null.

                let savedDhikrs = []
                if (user) {
                    savedDhikrs = await dbService.getDhikrs(user.id)
                    if (savedDhikrs.length === 0) {
                        const localDhikrs = getStorageItem("dhikrs", [])
                        if (localDhikrs.length > 0) {
                            savedDhikrs = localDhikrs
                            await dbService.saveAllDhikrs(localDhikrs, user.id)
                        }
                    }
                } else {
                    savedDhikrs = getStorageItem("dhikrs", [])
                }
                setDhikrs(savedDhikrs)
            } catch (error) {
                console.error("Error loading dhikrs:", error)
            } finally {
                setIsLoading(false)
            }
        }

        // Only trigger loadData after we've had a chance to check auth?
        // Actually, user change triggers this.
        // We just need to make sure initial loading state covers the gap.
        loadData()
    }, [user])

    // Sync to Cloud
    useEffect(() => {
        if (!isLoading) {
            setStorageItem("dhikrs", dhikrs)
            if (user) {
                const syncToCloud = async () => {
                    setIsSyncing(true)
                    try { await dbService.saveAllDhikrs(dhikrs, user.id) }
                    catch (err) { console.error("Cloud sync failed:", err) }
                    finally { setIsSyncing(false) }
                }
                syncToCloud()
            }
        }
    }, [dhikrs, isLoading, user])

    const addNewDhikr = (dhikrData: any) => {
        const newDhikr: Dhikr = {
            ...dhikrData,
            id: Date.now().toString(),
            currentCount: 0,
            dateCreated: new Date().toISOString(),
            status: "planned",
        }
        setDhikrs((prev) => [newDhikr, ...prev])
        toast({ title: "Zikir eklendi", description: `"${newDhikr.name}" listeye eklendi.` })
    }

    const deleteDhikr = async (id: string) => {
        setDhikrs((prev) => prev.filter((d) => d.id !== id))
        if (user) await dbService.deleteDhikr(id)
        toast({ title: "Silindi", description: "Zikir başarıyla silindi." })
    }

    const updateDhikrCount = (id: string, count: number) => {
        setDhikrs((prev) =>
            prev.map((d) => {
                if (d.id === id) {
                    const isCompleted = count >= d.targetCount
                    return {
                        ...d,
                        currentCount: count,
                        status: isCompleted ? "completed" : "in-progress",
                        dateCompleted: isCompleted ? new Date().toISOString() : d.dateCompleted,
                    }
                }
                return d
            })
        )
    }

    const repeatDhikr = (dhikr: Dhikr) => {
        const newDhikr: Dhikr = {
            ...dhikr,
            id: Date.now().toString(),
            currentCount: 0,
            dateCreated: new Date().toISOString(),
            status: "planned",
            dateCompleted: undefined,
        }
        setDhikrs((prev) => [newDhikr, ...prev])
        toast({ title: "Eklendi", description: "Zikir tekrar çekilmek üzere eklendi." })
    }

    return (
        <DhikrContext.Provider value={{ dhikrs, setDhikrs, isLoading, user, isAdmin, isSyncing, addNewDhikr, deleteDhikr, updateDhikrCount, repeatDhikr }}>
            {children}
        </DhikrContext.Provider>
    )
}

export const useDhikrs = () => {
    const context = useContext(DhikrContext)
    if (!context) throw new Error("useDhikrs must be used within a DhikrProvider")
    return context
}
