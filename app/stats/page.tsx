"use client"
import { StatsView } from "@/components/stats-view"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function StatsPage() {
    const { dhikrs, isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Veriler yükleniyor...</div>

    return <StatsView dhikrs={dhikrs || []} onClose={() => router.push('/')} />
}
