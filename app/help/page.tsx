"use client"
import { HelpView } from "@/components/help-view"
import { useRouter } from "next/navigation"

export default function HelpPage() {
    const router = useRouter()
    return <HelpView onClose={() => router.push('/')} />
}
