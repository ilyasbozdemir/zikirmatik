"use client"

import { useEffect, useState } from "react"
import { useDhikrs } from "@/context/dhikr-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, CheckCircle2, ShieldAlert, User, Mail, Shield, Activity, Zap, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Kontrol Paneli
                        </span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Genel bakış ve sistem durumu</p>
                </div>
                <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary text-sm font-bold rounded-full">
                    v1.0.0-beta
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Profile Section - "Ver Coşkuyu" Area */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="glass border-none shadow-premium relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-vibrant-gradient opacity-90" />
                        <CardContent className="pt-24 pb-8 px-6 text-center relative">
                            <MotionDiv
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-24 h-24 mx-auto bg-background rounded-full p-1.5 shadow-xl mb-4"
                            >
                                <Avatar className="w-full h-full border-4 border-background">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">AD</AvatarFallback>
                                </Avatar>
                            </MotionDiv>

                            <h2 className="text-2xl font-black tracking-tight text-foreground">{user?.email?.split('@')[0]}</h2>
                            <div className="flex items-center justify-center gap-2 mt-1 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="text-sm font-medium">{user?.email}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Rol</div>
                                    <div className="font-black text-primary flex items-center justify-center gap-1">
                                        <Shield className="h-3.5 w-3.5" /> Admin
                                    </div>
                                </div>
                                <div className="p-3 bg-green-500/5 rounded-2xl border border-green-500/10">
                                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Durum</div>
                                    <div className="font-black text-green-600 flex items-center justify-center gap-1">
                                        <Zap className="h-3.5 w-3.5" /> Online
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="glass border-none shadow-premium">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-orange-500" /> Sistem Özeti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-white/5 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <Server className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Veritabanı</span>
                                        <span className="text-[10px] text-muted-foreground">Supabase Postgres</span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-white/5 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">Performans</span>
                                        <span className="text-[10px] text-muted-foreground">Optimal</span>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-blue-600">98%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Requirements / Notes Panel */}
                <div className="md:col-span-8">
                    <Card className="glass border-none shadow-premium h-full flex flex-col">
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
        </div>
    )
}
