"use client"
import { SettingsView } from "@/components/settings-view"
import { useRouter } from "next/navigation"
import { useDhikrs } from "@/context/dhikr-context"

export default function SettingsPage() {
    const { isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Ayarlar yükleniyor...</div>

    return <SettingsView onClose={() => router.push('/')} onShare={() => { }} />
}
