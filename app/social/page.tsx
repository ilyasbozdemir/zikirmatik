"use client"
import { SocialView } from "@/components/social-view"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function SocialPage() {
    const { user, isLoading } = useDhikrs()
    const router = useRouter()

    if (isLoading) return <div className="p-10 text-center animate-pulse">Sosyal dünya yükleniyor...</div>

    return <SocialView user={user} onClose={() => router.push('/')} onAddDhikrSeries={() => { }} />
}
