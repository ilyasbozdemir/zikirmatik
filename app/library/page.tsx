"use client"
import { DhikrLibrary } from "@/components/dhikr-library"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
    const { addNewDhikr, setDhikrs } = useDhikrs()
    const router = useRouter()

    const handleAddSeries = (dhikrs: any[]) => {
        dhikrs.forEach(d => addNewDhikr(d))
        router.push('/')
    }

    return (
        <DhikrLibrary
            onClose={() => router.push('/')}
            onAddDhikr={addNewDhikr}
            onAddDhikrSeries={handleAddSeries}
        />
    )
}
