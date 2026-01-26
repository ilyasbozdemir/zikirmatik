"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, User, Globe, Users, Heart, Share2, Plus, Loader2, X, Mail, Lock, CheckCircle2, UserPlus2, LogOut, ShieldCheck, KeyRound } from "lucide-react"
import { dbService } from "@/lib/db-services"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useDhikrs } from "@/context/dhikr-context"
import { formatNumber } from "@/lib/format-number"

interface SocialViewProps {
    user: any
    onClose: () => void
    onAddDhikrSeries: (dhikrs: any[]) => void
}

export function SocialView({ user, onClose, onAddDhikrSeries }: SocialViewProps) {
    const [activeTab, setActiveTab] = useState("discover")
    const [profile, setProfile] = useState<any>(null)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState(user?.email || "")
    const [newPassword, setNewPassword] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [publicCollections, setPublicCollections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUpdatingAuth, setIsUpdatingAuth] = useState(false)
    const { toast } = useToast()
    const { dhikrs } = useDhikrs()

    // Dhikr Stats
    const totalDhikrs = dhikrs.length
    const completedDhikrs = dhikrs.filter(d => d.status === 'completed').length
    const activeDhikrs = totalDhikrs - completedDhikrs
    const totalCount = dhikrs.reduce((acc, d) => acc + d.currentCount, 0)

    useEffect(() => {
        if (user) {
            loadProfile()
            setEmail(user.email || "")
        }
        loadPublicCollections()
    }, [user])

    const loadProfile = async () => {
        const data = await dbService.getProfile(user.id)
        if (data) {
            setProfile(data)
            setUsername(data.username || "")
        }
    }

    const loadPublicCollections = async () => {
        setIsLoading(true)
        const data = await dbService.getPublicCollections()
        setPublicCollections(data)
        setIsLoading(false)
    }

    const handleUpdateProfile = async () => {
        if (!username.trim()) return
        setIsLoading(true)
        try {
            await dbService.updateProfile({
                id: user.id,
                username: username.trim(),
                avatar_url: profile?.avatar_url
            })
            toast({ title: "Profil Güncellendi", description: "Kullanıcı adınız başarıyla kaydedildi." })
            await loadProfile()
        } catch (err) {
            toast({ title: "Hata", description: "Profil güncellenemedi.", variant: "destructive" })
        } finally {
            setIsLoading(false)
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setIsLoading(true)
        const results = await dbService.searchUsers(searchQuery.trim())
        setSearchResults(results)
        setIsLoading(false)
    }

    const handleFollow = (targetUser: any) => {
        toast({
            title: "Takip Edildi",
            description: `@${targetUser.username} kişisini takip etmeye başladınız!`,
        })
    }

    const handleCopyCollection = (collection: any) => {
        if (collection.dhikrs && Array.isArray(collection.dhikrs)) {
            onAddDhikrSeries(collection.dhikrs)
            toast({
                title: "Koleksiyon Eklendi",
                description: `"${collection.name}" listenize eklendi.`
            })
        }
    }

    return (
        <div className="container max-w-md mx-auto p-4 flex flex-col h-screen bg-background overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black bg-vibrant-gradient bg-clip-text text-transparent italic">Sosyal Alan</h1>
                </div>
                <div className="flex items-center gap-2">
                    {user && (
                        <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} className="rounded-2xl text-destructive hover:bg-destructive/10">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive">
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="discover" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6 glass p-1 rounded-2xl h-14">
                    <TabsTrigger value="discover" className="flex items-center gap-2 rounded-xl font-bold">
                        <Globe className="h-4 w-4" /> Keşfet
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2 rounded-xl font-bold">
                        <Users className="h-4 w-4" /> Kişiler
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2 rounded-xl font-bold font-black">
                        <User className="h-4 w-4" /> Profil
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto pr-1 pb-20 custom-scrollbar">
                    <TabsContent value="discover" className="mt-0">
                        <div className="space-y-4">
                            {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}

                            {!isLoading && publicCollections.length === 0 && (
                                <div className="text-center py-20 glass rounded-[2rem] border-dashed border-2">
                                    <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground font-medium">Henüz paylaşılan koleksiyon yok.</p>
                                </div>
                            )}

                            {publicCollections.map((col) => (
                                <motion.div key={col.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                                    <Card className="overflow-hidden border-none shadow-premium glass rounded-[2rem] group">
                                        <CardHeader className="p-5 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                                                        <AvatarFallback className="font-bold bg-primary/5 text-primary">{col.profiles?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-lg font-black">{col.name}</CardTitle>
                                                        <CardDescription className="font-bold text-primary/60">@{col.profiles?.username || 'isimsiz'}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="rounded-lg bg-vibrant-gradient text-white border-none">{col.dhikrs?.length || 0} Zikir</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 pt-0 mt-3">
                                            <p className="text-sm text-muted-foreground font-medium line-clamp-2 italic mb-4">
                                                "{col.description || "Zikirlerin gücünü keşfedin."}"
                                            </p>
                                            <div className="flex gap-2 mb-2 flex-wrap">
                                                {col.dhikrs?.slice(0, 3).map((d: any, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5">{d.name}</Badge>
                                                ))}
                                                {(col.dhikrs?.length > 3) && <Badge variant="outline" className="text-[10px] font-bold">+{col.dhikrs.length - 3}</Badge>}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-3 bg-muted/5 flex justify-between gap-2">
                                            <Button variant="ghost" size="sm" className="flex-1 gap-2 font-black rounded-xl hover:bg-primary/10" onClick={() => handleCopyCollection(col)}>
                                                <Plus className="h-4 w-4" /> Koleksiyona Ekle
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:text-red-500">
                                                <Heart className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="mt-0">
                        <div className="flex gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Kullanıcı adı ile ara..."
                                    className="pl-12 h-12 glass border-none rounded-2xl font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={isLoading} className="h-12 w-12 rounded-2xl bg-primary text-white">
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {searchResults.map((u) => (
                                    <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                        <Card className="p-4 border-none glass rounded-[1.5rem] flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:scale-110 transition-transform">
                                                    <AvatarImage src={u.avatar_url} />
                                                    <AvatarFallback className="font-black bg-primary/5 text-primary">{u.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-black text-lg">@{u.username}</h3>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktif Zikir Çekiyor</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="rounded-xl border-2 font-bold hover:bg-primary hover:text-white transition-all gap-2" onClick={() => handleFollow(u)}>
                                                <UserPlus2 className="h-4 w-4" /> Takip Et
                                            </Button>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {searchResults.length === 0 && !isLoading && searchQuery && (
                                <div className="text-center py-12 glass rounded-3xl border-dashed border-2">
                                    <p className="text-muted-foreground font-bold">Böyle bir mümin bulunamadı.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="profile" className="mt-0">
                        {user ? (
                            <div className="space-y-6 pb-10">
                                {/* Profile Card */}
                                <Card className="border-none glass rounded-[2.5rem] overflow-hidden">
                                    <div className="h-24 bg-vibrant-gradient w-full opacity-80" />
                                    <CardContent className="px-6 pb-6 -mt-12 text-center">
                                        <Avatar className="h-24 w-24 border-4 border-background mx-auto shadow-xl mb-4">
                                            <AvatarImage src={profile?.avatar_url} />
                                            <AvatarFallback className="text-3xl font-black bg-primary/5 text-primary">{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-black">@{username || 'isimsiz'}</h2>
                                            <p className="text-sm font-medium text-muted-foreground">{email}</p>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { label: 'Toplam', val: totalDhikrs, color: 'text-primary' },
                                                { label: 'Biten', val: completedDhikrs, color: 'text-green-500' },
                                                { label: 'Aktif', val: activeDhikrs, color: 'text-blue-500' },
                                                { label: 'Sayı', val: formatNumber(totalCount), color: 'text-amber-500' }
                                            ].map((stat, i) => (
                                                <div key={i} className="flex flex-col items-center p-2 rounded-2xl bg-background/40 shadow-inner">
                                                    <span className={`text-xl font-black ${stat.color}`}>{stat.val}</span>
                                                    <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-tighter">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Edit Sections */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2 mb-2">
                                        <User className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Profil Kimliği</h3>
                                    </div>
                                    <div className="space-y-3 glass p-5 rounded-[2rem] border-none shadow-sm">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Kullanıcı Adı</label>
                                            <Input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="kullanici_adi"
                                                className="h-12 rounded-xl bg-background/50 border-none font-bold text-lg"
                                            />
                                        </div>
                                        <Button className="w-full h-12 bg-vibrant-gradient text-white font-black rounded-xl shadow-lg border-none active:scale-95 transition-transform" onClick={handleUpdateProfile} disabled={isLoading}>
                                            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                            İsmi Güncelle
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2 px-2 mb-2 mt-8">
                                        <Lock className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Hesap Güvenliği</h3>
                                    </div>
                                    <div className="space-y-4 glass p-5 rounded-[2rem] border-none shadow-sm">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">E-Posta Adresi</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-12 pl-10 rounded-xl bg-background/50 border-none font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Yeni Şifre</label>
                                            <div className="relative">
                                                <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                                    className="h-12 pl-10 rounded-xl bg-background/50 border-none font-medium"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 border-2 rounded-xl font-bold hover:bg-primary/5 transition-all"
                                            onClick={handleUpdateAuth}
                                            disabled={isUpdatingAuth || (email === user.email && !newPassword)}
                                        >
                                            {isUpdatingAuth ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Lock className="mr-2 h-5 w-5" />}
                                            Güvenlik Bilgilerini Kaydet
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 glass rounded-[2.5rem] mt-10">
                                <UserPlus2 className="h-16 w-16 mx-auto text-primary/20 mb-6" />
                                <CardTitle className="text-2xl font-black mb-2">Eyvallah!</CardTitle>
                                <p className="mb-8 text-muted-foreground font-medium px-10 leading-relaxed">Profilinizi yönetmek ve verilerinizi buluta kaydetmek için giriş yapmalısınız.</p>
                                <Button onClick={onClose} variant="default" className="h-14 px-8 rounded-2xl bg-vibrant-gradient text-white border-none shadow-xl font-black italic">Hemen Giriş Yap</Button>
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
