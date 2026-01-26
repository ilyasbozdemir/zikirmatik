"use client"
import { HelpView } from "@/components/help-view"
import { useRouter } from "next/navigation"
import { useDhikrs } from "@/context/dhikr-context"

export default function HelpPage() {
    const { isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Yardım ekleniyor...</div>

    return <HelpView onClose={() => router.push('/')} />
}
