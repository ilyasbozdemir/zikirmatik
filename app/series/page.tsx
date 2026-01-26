"use client"
import { DhikrSeriesManager } from "@/components/dhikr-series-manager"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function SeriesPage() {
    const { dhikrs, isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Seriler yükleniyor...</div>

    return (
        <DhikrSeriesManager
            dhikrs={dhikrs || []}
            onClose={() => router.push('/')}
            onStartSeries={(id) => router.push('/')}
            onAddToList={(id) => router.push('/')}
        />
    )
}
