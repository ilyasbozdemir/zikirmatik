"use client"
import { DhikrSeriesManager } from "@/components/dhikr-series-manager"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function SeriesPage() {
    const { dhikrs, addNewDhikr } = useDhikrs()
    const router = useRouter()

    return (
        <DhikrSeriesManager
            dhikrs={dhikrs}
            onClose={() => router.push('/')}
            onStartSeries={(id) => router.push('/')}
            onAddToList={(id) => router.push('/')}
        />
    )
}
