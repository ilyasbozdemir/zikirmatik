"use client"
import { DataMigrationManager } from "@/components/data-migration-manager"
import { useRouter } from "next/navigation"
import { useDhikrs } from "@/context/dhikr-context"

export default function DataPage() {
    const { isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Veriler yükleniyor...</div>

    return <DataMigrationManager onClose={() => router.push('/')} onReload={() => window.location.reload()} />
}
