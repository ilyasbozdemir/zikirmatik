'use client'

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-foreground font-sans">
                <div className="text-center">
                    <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h2 className="text-3xl font-black mb-2">Kritik Hata</h2>
                    <p className="text-muted-foreground font-medium mb-8">Uygulama yüklenirken ciddi bir sorun oluştu.</p>
                    <Button onClick={() => reset()} size="lg" className="rounded-2xl font-bold">
                        Yeniden Başlat
                    </Button>
                </div>
            </body>
        </html>
    )
}
