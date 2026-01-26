"use client"
import { StatsView } from "@/components/stats-view"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function StatsPage() {
    const { dhikrs } = useDhikrs()
    const router = useRouter()
    return <StatsView dhikrs={dhikrs} onClose={() => router.push('/')} />
}
