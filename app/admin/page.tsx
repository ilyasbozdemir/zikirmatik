"use client"

import { useEffect, useState } from "react"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, CheckCircle2, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

export default function AdminPage() {
    const { isAdmin, user, isLoading } = useDhikrs()
    const router = useRouter()
    const [newRequirement, setNewRequirement] = useState("")
    const [requirements, setRequirements] = useState<any[]>([])

    // Load requirements from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("adminRequirements")
        if (saved) {
            try {
                setRequirements(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse requirements", e)
            }
        } else {
            // Default initial requirements
            setRequirements([
                { id: 1, text: "Admin paneli tasarımı yapılacak", completed: true },
                { id: 2, text: "Kullanıcı rolleri entegrasyonu", completed: true },
                { id: 3, text: "Geri bildirim modülü eklenecek", completed: false },
            ])
        }
    }, [])

    // Save requirements to localStorage
    useEffect(() => {
        if (requirements.length > 0) {
            localStorage.setItem("adminRequirements", JSON.stringify(requirements))
        }
    }, [requirements])

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push("/")
        }
    }, [isAdmin, isLoading, router])

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 text-center">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Erişim Reddedildi</h1>
                <p className="text-muted-foreground">Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.</p>
                <Button onClick={() => router.push("/")} variant="outline">Ana Sayfaya Dön</Button>
            </div>
        )
    }

    const addRequirement = () => {
        if (!newRequirement.trim()) return
        setRequirements([
            ...requirements,
            { id: Date.now(), text: newRequirement, completed: false }
        ])
        setNewRequirement("")
    }

    const toggleRequirement = (id: number) => {
        setRequirements(requirements.map(req =>
            req.id === id ? { ...req, completed: !req.completed } : req
        ))
    }

    const deleteRequirement = (id: number) => {
        setRequirements(requirements.filter(req => req.id !== id))
    }

    // Temporary fix for framer-motion React 19 types compatibility
    const MotionDiv = motion.div as any

    return (
        <div className="min-h-screen bg-transparent p-6 pb-24 md:p-12 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                            Admin Paneli <Badge variant="secondary" className="bg-primary/10 text-primary">Beta</Badge>
                        </h1>
                        <p className="text-muted-foreground">
                            Hoşgeldiniz, {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <Card className="glass border-none shadow-premium md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Sistem Durumu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                            <span className="text-sm font-medium">Veritabanı</span>
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">Aktif</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                            <span className="text-sm font-medium">PWA</span>
                            <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none">Hazır</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                            <span className="text-sm font-medium">Versiyon</span>
                            <span className="text-sm font-bold text-muted-foreground">v1.0.0-beta</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements / Notes Panel */}
                <Card className="glass border-none shadow-premium md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Gereksinimler & Notlar
                        </CardTitle>
                        <CardDescription>
                            Yapılacaklar listesi ve geliştirme notları
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-3">
                            <Input
                                placeholder="Yeni bir madde ekle..."
                                value={newRequirement}
                                onChange={(e) => setNewRequirement(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addRequirement()}
                                className="bg-muted/30 border-primary/10"
                            />
                            <Button onClick={addRequirement} className="bg-vibrant-gradient text-white">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {requirements.map((req) => (
                                <MotionDiv
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group flex items-center justify-between p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors border border-transparent hover:border-primary/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-5 w-5 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors ${req.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}
                                            onClick={() => toggleRequirement(req.id)}
                                        >
                                            {req.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <span className={`font-medium ${req.completed ? 'text-muted-foreground line-through' : ''}`}>
                                            {req.text}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteRequirement(req.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </MotionDiv>
                            ))}

                            {requirements.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Henüz bir not eklenmemiş.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Additional admin widgets can go here */}
            </div>
        </div>
    )
}
