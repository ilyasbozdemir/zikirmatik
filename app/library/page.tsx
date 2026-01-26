"use client"
import { DhikrLibrary } from "@/components/dhikr-library"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
    const { addNewDhikr, isLoading } = useDhikrs()
    const router = useRouter()

    const handleAddSeries = (dhikrs: any[]) => {
        dhikrs.forEach(d => addNewDhikr(d))
        router.push('/')
    }

    if (isLoading) return <div className="p-10 text-center animate-pulse">Kütüphane yükleniyor...</div>

    return (
        <DhikrLibrary
            onClose={() => router.push('/')}
            onAddDhikr={addNewDhikr}
            onAddDhikrSeries={handleAddSeries}
        />
    )
}
