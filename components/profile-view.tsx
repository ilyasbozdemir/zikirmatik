"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
    User, Mail, Lock, ShieldCheck, KeyRound,
    LogOut, Award, Flame,
    Calendar, Settings, Loader2, X,
    CheckCircle2, Activity, Zap
} from "lucide-react"
import { dbService } from "@/lib/db-services"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useDhikrs } from "@/context/dhikr-context"
import { formatNumber } from "@/lib/format-number"
import { useRouter } from "next/navigation"

export function ProfileView() {
    const { user, dhikrs, isLoading: isContextLoading } = useDhikrs()
    const [profile, setProfile] = useState<any>(null)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [isUpdatingAuth, setIsUpdatingAuth] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    // Dhikr Stats
    const totalDhikrs = dhikrs.length
    const completedDhikrs = dhikrs.filter(d => d.status === 'completed').length
    const activeDhikrs = totalDhikrs - completedDhikrs
    const totalCount = dhikrs.reduce((acc, d) => acc + d.currentCount, 0)

    useEffect(() => {
        if (user) {
            loadProfile()
            setEmail(user.email || "")
        } else if (!isContextLoading) {
            router.push('/login')
        }
    }, [user, isContextLoading, router])

    const loadProfile = async () => {
        const data = await dbService.getProfile(user.id)
        if (data) {
            setProfile(data)
            setUsername(data.username || "")
        }
    }

    const handleUpdateProfile = async () => {
        if (!username.trim()) return
        setIsUpdating(true)
        try {
            await dbService.updateProfile({
                id: user.id,
                username: username.trim(),
                avatar_url: profile?.avatar_url
            })
            toast({ title: "Profil Güncellendi", description: "Bilgileriniz başarıyla kaydedildi." })
            await loadProfile()
        } catch (err) {
            toast({ title: "Hata", description: "Profil güncellenemedi.", variant: "destructive" })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleUpdateAuth = async () => {
        setIsUpdatingAuth(true)
        try {
            const updates: any = {}
            if (email !== user.email) updates.email = email
            if (newPassword) updates.password = newPassword

            if (Object.keys(updates).length === 0) return

            const { error } = await supabase.auth.updateUser(updates)
            if (error) throw error

            toast({ title: "Güvenlik Güncellendi", description: "E-posta veya şifre başarıyla güncellendi." })
            setNewPassword("")
        } catch (err: any) {
            toast({ title: "Hata", description: err.message, variant: "destructive" })
        } finally {
            setIsUpdatingAuth(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (isContextLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium italic">Profil yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto pb-24 px-4 pt-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                {/* Header & Avatar Section */}
                <div className="relative">
                    <div className="h-48 w-full bg-vibrant-gradient rounded-[3rem] shadow-premium opacity-90 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="px-6 -mt-20">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-8 border-background shadow-2xl">
                                    <AvatarImage src={profile?.avatar_url} />
                                    <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary">
                                        {username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-1 right-1 rounded-full shadow-lg border-4 border-background bg-secondary p-2 group-hover:scale-110 transition-transform">
                                    <Award className="h-5 w-5 text-amber-500" />
                                </div>
                            </div>

                            <div className="mt-4 space-y-1">
                                <h1 className="text-3xl font-black tracking-tight">@{username || 'isimsiz'}</h1>
                                <p className="text-muted-foreground font-medium">{user.email}</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 mt-6">
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-none font-black flex gap-2 shadow-sm">
                                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500" /> Aktif Seri
                                </Badge>
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-700 border-none font-black flex gap-2 shadow-sm">
                                    <ShieldCheck className="h-4 w-4" /> Doğrulanmış
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'TOPLAM', val: totalDhikrs, icon: Activity, color: 'text-primary' },
                        { label: 'BİTEN', val: completedDhikrs, icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'AKTİF', val: activeDhikrs, icon: Calendar, color: 'text-blue-500' },
                        { label: 'ADET', val: formatNumber(totalCount), icon: Zap, color: 'text-amber-500' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="glass p-4 rounded-[2rem] text-center shadow-sm relative overflow-hidden group"
                        >
                            <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
                            <div className="text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-widest mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Settings Block */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary opacity-60" />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Hesap Ayarları</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="rounded-xl text-primary font-bold">Zikirlere Dön</Button>
                    </div>

                    <Card className="glass border-none shadow-premium rounded-[2.5rem] p-6 space-y-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 ml-2">Profil İsmi</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="kullanici_adi"
                                        className="h-12 pl-12 rounded-2xl bg-background/40 border-none font-bold text-lg focus:ring-2 ring-primary/20 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full h-14 bg-vibrant-gradient text-white font-black rounded-2xl shadow-xl border-none active:scale-95 transition-all text-md"
                                onClick={handleUpdateProfile}
                                disabled={isUpdating}
                            >
                                {isUpdating ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                Profili Güncelle
                            </Button>
                        </div>

                        <div className="h-[1px] bg-primary/5" />

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 ml-2">E-Posta Güvenliği</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-12 rounded-2xl bg-background/40 border-none font-bold shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 ml-2">Yeni Şifre Belirle</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Dokunma, aynı kalsın"
                                        className="h-12 pl-12 rounded-2xl bg-background/40 border-none font-bold shadow-inner"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-14 border-2 border-primary/20 rounded-2xl font-black hover:bg-primary/5 transition-all gap-2 text-md"
                                onClick={handleUpdateAuth}
                                disabled={isUpdatingAuth || (email === user.email && !newPassword)}
                            >
                                {isUpdatingAuth ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Lock className="mr-2 h-5 w-5" />}
                                Güvenliği Kaydet
                            </Button>
                        </div>
                    </Card>

                    <div className="pt-6">
                        <Button
                            variant="ghost"
                            className="w-full h-16 rounded-[2rem] text-destructive hover:bg-destructive/10 font-black italic flex justify-between px-8 border-2 border-dashed border-destructive/20"
                            onClick={handleLogout}
                        >
                            <span className="text-lg">Hesaptan Çıkış Yap</span>
                            <LogOut className="h-6 w-6" />
                        </Button>
                        <div className="mt-8 text-center px-10">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">Zikirmatik Premium v1.5.0</p>
                            <p className="text-[9px] text-muted-foreground font-medium mt-1 leading-relaxed italic">© 2025 Zikrin gücünü paylaşın. Allah kabul etsin.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
