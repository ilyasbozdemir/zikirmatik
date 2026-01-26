"use client"
import { DataMigrationManager } from "@/components/data-migration-manager"
import { useRouter } from "next/navigation"

export default function DataPage() {
    const router = useRouter()
    return <DataMigrationManager onClose={() => router.push('/')} onReload={() => window.location.reload()} />
}
