'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bir şeyler ters gitti!</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
                Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                variant="outline"
                className="rounded-xl"
            >
                Tekrar Dene
            </Button>
        </div>
    )
}
