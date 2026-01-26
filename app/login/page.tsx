"use client"

import { AuthComponent } from "@/components/auth"
import { useDhikrs } from "@/context/dhikr-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
    const { user, isLoading } = useDhikrs()
    const router = useRouter()

    useEffect(() => {
        if (user && !isLoading) {
            router.push('/profile')
        }
    }, [user, isLoading, router])

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    )

    return (
        <div className="container max-w-md mx-auto min-h-screen flex flex-col justify-center animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-vibrant-gradient rounded-[2.5rem] mx-auto flex items-center justify-center shadow-premium mb-6 rotate-12"
                >
                    <Sparkles className="h-12 w-12 text-white" />
                </motion.div>
                <h1 className="text-4xl font-black bg-vibrant-gradient bg-clip-text text-transparent italic mb-2">Hoş Geldiniz</h1>
                <p className="text-muted-foreground font-medium px-10">Zikirlerinizi buluta yedeklemek ve her yerden erişmek için giriş yapın.</p>
            </div>

            <div className="glass p-8 rounded-[3rem] shadow-premium border-none mx-4">
                <AuthComponent />
            </div>

            <p className="text-center text-[10px] text-muted-foreground mt-12 uppercase tracking-[0.4em] font-black opacity-30">Zikirmatik © 2025</p>
        </div>
    )
}
