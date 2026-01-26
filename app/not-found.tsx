import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                <FileQuestion className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-black mb-2">Sayfa Bulunamadı</h2>
            <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">
                Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </p>
            <Link href="/">
                <Button variant="default" size="lg" className="rounded-2xl font-bold px-8">
                    Ana Sayfaya Dön
                </Button>
            </Link>
        </div>
    )
}
