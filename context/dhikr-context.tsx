"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
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
    supabaseError: boolean
    addNewDhikr: (dhikr: Omit<Dhikr, "id" | "dateCreated" | "status" | "currentCount">) => void
    deleteDhikr: (id: string) => Promise<void>
    updateDhikrCount: (id: string, count: number) => void
    repeatDhikr: (dhikr: Dhikr) => void
    retryAuth: () => Promise<void>
}

const DhikrContext = createContext<DhikrContextType | undefined>(undefined)

export function DhikrProvider({ children }: { children: React.ReactNode }) {
    const [dhikrs, setDhikrs] = useState<Dhikr[]>([])
    const [isLoading, setIsLoading] = useState(true) // Start loading by default
    const [user, setUser] = useState<any>(null)
    const [isSyncing, setIsSyncing] = useState(false)
    const { toast } = useToast()

    const [isAdmin, setIsAdmin] = useState(false)
    const [supabaseError, setSupabaseError] = useState(false)

    // Auth Listener
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // If Supabase is not configured (missing env vars), just stay in local/anonymous mode
            // without triggering an error state.
            if (!isSupabaseConfigured) {
                if (mounted) {
                    setUser(null)
                    setIsAdmin(false)
                    setSupabaseError(false)
                }
                return
            }

            try {
                // Try to get session. If ERR_CERT_AUTHORITY_INVALID occurs, this fetch will fail.
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) throw error;

                if (mounted) {
                    const currentUser = session?.user ?? null
                    setUser(currentUser)
                    setIsAdmin(currentUser?.email === "bozdemir.ib70@gmail.com")
                    setSupabaseError(false)
                }
            } catch (error: any) {
                // Detailed handling for connectivity/SSL errors
                const isNetworkError =
                    error.message?.toLowerCase().includes('fetch') ||
                    error.name === 'TypeError' ||
                    error.status === 0 ||
                    error.message?.toLowerCase().includes('network');

                if (isNetworkError) {
                    if (mounted) {
                        setSupabaseError(true)
                        // Log once clearly then stay silent
                        console.warn("Zikirmatik: Bulut bağlantı sorunu (SSL/Ağ). Uygulama yerel modda devam ediyor.")
                    }
                } else {
                    console.error("Auth check failed", error)
                }
            }
        }

        initAuth()

        // Only listen for auth changes if we haven't encountered a major transport error
        let subscription: any = null;
        if (!supabaseError) {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                if (mounted) {
                    const currentUser = session?.user ?? null
                    setUser(currentUser)
                    setIsAdmin(currentUser?.email === "bozdemir.ib70@gmail.com")
                }
            })
            subscription = data.subscription;
        }

        return () => {
            mounted = false
            if (subscription) subscription.unsubscribe()
        }
    }, [supabaseError]) // Re-run if error cleared (manual retry logic could go here)

    const retryAuth = async () => {
        setSupabaseError(false)
        setIsLoading(true)
        // give it a moment to clear state, the useEffect [supabaseError] will re-trigger initAuth
        setTimeout(() => setIsLoading(false), 1000)
    }

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                let savedDhikrs: Dhikr[] = []
                // Only try to fetch from cloud if no supabase connection error
                if (user && !supabaseError) {
                    try {
                        savedDhikrs = await dbService.getDhikrs(user.id)
                    } catch (e) {
                        console.warn("Cloud fetch failed, using local storage", e)
                        savedDhikrs = getStorageItem<Dhikr[]>("dhikrs", [])
                    }

                    if (savedDhikrs.length === 0) {
                        const localDhikrs = getStorageItem<Dhikr[]>("dhikrs", [])
                        if (localDhikrs.length > 0) {
                            savedDhikrs = localDhikrs
                            await dbService.saveAllDhikrs(localDhikrs, user.id).catch(() => { })
                        } else {
                            savedDhikrs = getDefaultDhikrs()
                            await dbService.saveAllDhikrs(savedDhikrs, user.id).catch(() => { })
                        }
                    }
                } else {
                    // Anonymous or connection error
                    savedDhikrs = getStorageItem<Dhikr[]>("dhikrs", [])
                    if (savedDhikrs.length === 0) {
                        savedDhikrs = getDefaultDhikrs()
                    }
                }
                setDhikrs(savedDhikrs)
            } catch (error) {
                console.error("Error loading dhikrs:", error)
                // Final fallback
                setDhikrs(getStorageItem<Dhikr[]>("dhikrs", []) || getDefaultDhikrs())
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [user, supabaseError])

    const getDefaultDhikrs = (): Dhikr[] => {
        const now = new Date().toISOString()
        return [
            {
                id: "def-ramadan",
                name: "Ramazan Duası (Allahümme inneke afüvvün...)",
                targetCount: 100,
                currentCount: 0,
                category: "Ramazan Özel",
                status: "planned",
                dateCreated: now,
            },
            {
                id: "def-tevhid",
                name: "Kelime-i Tevhid (Lâ ilâhe illâllâh)",
                targetCount: 1000,
                currentCount: 0,
                category: "Tevhid",
                status: "planned",
                dateCreated: now,
            },
            {
                id: "def-tesbih",
                name: "Sübhanallahi ve bihamdihi",
                targetCount: 100,
                currentCount: 0,
                category: "Tesbih",
                status: "planned",
                dateCreated: now,
            },
            {
                id: "def-salavat",
                name: "Salavat-ı Şerife (Allahümme salli ala Muhammed)",
                targetCount: 100,
                currentCount: 0,
                category: "Salavat",
                status: "planned",
                dateCreated: now,
            },
            {
                id: "def-istigfar",
                name: "Günlük İstiğfar (Estağfirullah)",
                targetCount: 100,
                currentCount: 0,
                category: "İstiğfar",
                status: "planned",
                dateCreated: now,
            },
            {
                id: "def-yunus",
                name: "Hazreti Yunus (as) Duası",
                targetCount: 40,
                currentCount: 0,
                category: "Dua",
                status: "planned",
                dateCreated: now,
            }
        ]
    }

    // Sync to Cloud
    useEffect(() => {
        if (!isLoading) {
            setStorageItem("dhikrs", dhikrs)
            if (user) {
                const syncToCloud = async () => {
                    setIsSyncing(true)
                    try {
                        await dbService.saveAllDhikrs(dhikrs, user.id)
                        // If sync succeeds, we can clear any previous error state?
                        // Maybe safer to keep it manual (retryAuth) to avoid flip-flopping.
                    }
                    catch (err: any) {
                        console.error("Cloud sync failed:", err)
                        // If it's a network/db error, update status to show 'Connection Problem'
                        const isNetworkError =
                            err.message?.toLowerCase().includes('fetch') ||
                            err.message?.toLowerCase().includes('network') ||
                            err.message?.toLowerCase().includes('database error') ||
                            err.code === 'PGRST301' || // specific postgrest error
                            err.status === 500 ||
                            err.status === 503;

                        if (isNetworkError) {
                            setSupabaseError(true)
                        }
                    }
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
        <DhikrContext.Provider value={{
            dhikrs,
            setDhikrs,
            isLoading,
            user,
            isAdmin,
            isSyncing,
            supabaseError,
            addNewDhikr,
            deleteDhikr,
            updateDhikrCount,
            repeatDhikr,
            retryAuth
        }}>
            {children}
        </DhikrContext.Provider>
    )
}

export const useDhikrs = () => {
    const context = useContext(DhikrContext)
    if (!context) throw new Error("useDhikrs must be used within a DhikrProvider")
    return context
}
