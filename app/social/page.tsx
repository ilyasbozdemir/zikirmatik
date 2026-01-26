"use client"
import { SocialView } from "@/components/social-view"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function SocialPage() {
    const { user } = useDhikrs()
    const router = useRouter()
    return <SocialView user={user} onClose={() => router.push('/')} onAddDhikrSeries={() => { }} />
}
