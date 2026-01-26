"use client"
import { SettingsView } from "@/components/settings-view"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const router = useRouter()
    return <SettingsView onClose={() => router.push('/')} onShare={() => { }} />
}
