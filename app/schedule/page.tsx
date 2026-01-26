"use client"
import { ScheduleView } from "@/components/schedule-view"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function SchedulePage() {
    const { dhikrs, setDhikrs } = useDhikrs()
    const router = useRouter()
    return <ScheduleView dhikrs={dhikrs} setDhikrs={setDhikrs} onClose={() => router.push('/')} onAdvancedSchedule={() => { }} />
}
