"use client"

import { useState, useEffect } from "react"
import { useDhikrs } from "@/context/dhikr-context"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RefreshCw, AlertCircle, Sparkles, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function MigrationManager() {
    const { user, dhikrs, setDhikrs, isSyncing } = useDhikrs()
    const [showMigrationModal, setShowMigrationModal] = useState(false)
    const [hasLegacyData, setHasLegacyData] = useState(false)

    useEffect(() => {
        // 1. LocalStorage'da eski veri var mı kontrol et
        const localData = getStorageItem("dhikrs", [])
        const migrationDone = getStorageItem("dhikr_migration_v1_done", false)

        if (localData.length > 0 && !migrationDone) {
            setHasLegacyData(true)
            // Biraz gecikmeli gösterelim ki uygulama yüklensin
            const timer = setTimeout(() => {
                setShowMigrationModal(true)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleMigrate = async () => {
        // Migration işlemi: Mevcut verileri koru, migration flag'ini set et
        setStorageItem("dhikr_migration_v1_done", true)
        setShowMigrationModal(false)

        // Eğer kullanıcı giriş yapmışsa, Context zaten sync işlemini başlatıyor 
        // ama manuel tetiklemek isterseniz burada ekstra logic kurulabilir.
    }

    const handleDismiss = () => {
        setStorageItem("dhikr_migration_v1_done", true)
        setShowMigrationModal(false)
    }

    return (
        <AnimatePresence>
            {showMigrationModal && (
                <AlertDialog open={showMigrationModal} onOpenChange={setShowMigrationModal}>
                    <AlertDialogContent className="glass rounded-[2.5rem] border-none shadow-2xl p-8 max-w-md">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-vibrant-gradient rounded-3xl flex items-center justify-center shadow-xl rotate-12">
                            <Sparkles className="h-10 w-10 text-white animate-pulse" />
                        </div>

                        <AlertDialogHeader className="mt-6">
                            <AlertDialogTitle className="text-3xl font-black text-center bg-vibrant-gradient bg-clip-text text-transparent">
                                Yeni Sürüm Hazır!
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-md font-medium text-muted-foreground mt-4 leading-relaxed">
                                Cihazınızda eski sürümden kalan zikirler bulundu. Verilerinizi yeni **Bulut Senkronizasyonu** sistemine aktaralım mı?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="bg-primary/5 rounded-2xl p-4 my-6 border border-primary/10">
                            <div className="flex items-start gap-3">
                                <Cloud className="h-5 w-5 text-primary mt-1" />
                                <p className="text-sm text-primary/80 font-medium italic">
                                    Giriş yaparak tüm cihazlarınızdan verilerinize erişebilir ve asla kaybetmezsiniz.
                                </p>
                            </div>
                        </div>

                        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
                            <AlertDialogCancel
                                onClick={handleDismiss}
                                className="flex-1 rounded-2xl h-14 font-bold border-2"
                            >
                                Daha Sonra
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleMigrate}
                                className="flex-1 rounded-2xl h-14 font-black bg-vibrant-gradient text-white border-none shadow-lg premium-shimmer overflow-hidden active:scale-95 transition-transform"
                            >
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin-slow" />
                                Hemen Aktar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </AnimatePresence>
    )
}
