"use client"
import { ScheduleView } from "@/components/schedule-view"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function SchedulePage() {
    const { dhikrs, setDhikrs, isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Planlar yükleniyor...</div>

    return <ScheduleView dhikrs={dhikrs || []} setDhikrs={setDhikrs} onClose={() => router.push('/')} onAdvancedSchedule={() => { }} />
}
