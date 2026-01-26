"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, User, Globe, Users, Heart, Share2, Plus, Loader2, ArrowLeft } from "lucide-react"
import { dbService } from "@/lib/db-services"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface SocialViewProps {
    user: any
    onClose: () => void
    onAddDhikrSeries: (dhikrs: any[]) => void
}

export function SocialView({ user, onClose, onAddDhikrSeries }: SocialViewProps) {
    const [activeTab, setActiveTab] = useState("discover")
    const [profile, setProfile] = useState<any>(null)
    const [username, setUsername] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [publicCollections, setPublicCollections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            loadProfile()
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setIsLoading(true)
        const results = await dbService.searchUsers(searchQuery.trim())
        setSearchResults(results)
        setIsLoading(false)
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
        <div className="container max-w-md mx-auto p-4 h-screen flex flex-col bg-background">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-2xl font-bold ml-2">Sosyal & Keşfet</h1>
            </div>

            <Tabs defaultValue="discover" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="discover" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Keşfet
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Kişiler
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Profil
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="discover" className="flex-1 overflow-y-auto pb-20">
                    <div className="space-y-4">
                        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}

                        {!isLoading && publicCollections.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground">
                                Henüz paylaşılan koleksiyon yok.
                            </div>
                        )}

                        {publicCollections.map((col) => (
                            <motion.div
                                key={col.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="overflow-hidden border-none shadow-md bg-muted/30">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{col.name}</CardTitle>
                                                <CardDescription>@{col.profiles?.username || 'isimsiz'}</CardDescription>
                                            </div>
                                            <Badge variant="secondary">{col.dhikrs?.length || 0} Zikir</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {col.description || "Bu koleksiyon için açıklama girilmemiş."}
                                        </p>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            {col.dhikrs?.slice(0, 3).map((d: any, i: number) => (
                                                <Badge key={i} variant="outline" className="text-[10px]">{d.name}</Badge>
                                            ))}
                                            {(col.dhikrs?.length > 3) && <Badge variant="outline" className="text-[10px]">+{col.dhikrs.length - 3}</Badge>}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleCopyCollection(col)}>
                                            <Plus className="h-4 w-4" /> Listeme Ekle
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="users" className="flex-1 flex flex-col">
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Kullanıcı ara..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Ara"}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-20 space-y-2">
                        {searchResults.map((u) => (
                            <Card key={u.id} className="p-3 border-none bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={u.avatar_url} />
                                        <AvatarFallback>{u.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-medium">@{u.username}</h3>
                                        <p className="text-xs text-muted-foreground">Koleksiyonlarını gör</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Takip Et</Button>
                            </Card>
                        ))}
                        {searchResults.length === 0 && !isLoading && searchQuery && (
                            <div className="text-center p-8 text-muted-foreground">Kullanıcı bulunamadı.</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="profile" className="flex-1">
                    {user ? (
                        <Card className="border-none bg-muted/20">
                            <CardHeader>
                                <div className="flex flex-col items-center gap-4 mb-4">
                                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                                        <AvatarImage src={profile?.avatar_url} />
                                        <AvatarFallback className="text-2xl">{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <CardTitle className="text-xl">Profil Ayarları</CardTitle>
                                        <CardDescription>Diğer kullanıcılar sizi bu isimle görecek</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kullanıcı Adı</label>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="kullanici_adi"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Harf, rakam ve alt çizgi kullanabilirsiniz.</p>
                                </div>
                                <Button className="w-full" onClick={handleUpdateProfile} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Profilimi Güncelle"}
                                </Button>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <div className="w-full h-[1px] bg-border my-2" />
                                <h4 className="text-sm font-semibold w-full">İstatistiklerim</h4>
                                <div className="grid grid-cols-2 w-full gap-4 text-center">
                                    <div className="p-3 rounded-lg bg-background shadow-sm">
                                        <div className="text-2xl font-bold text-primary">0</div>
                                        <div className="text-[10px] uppercase text-muted-foreground">Takipçi</div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-background shadow-sm">
                                        <div className="text-2xl font-bold text-primary">0</div>
                                        <div className="text-[10px] uppercase text-muted-foreground">Paylaşım</div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="text-center p-8">
                            <p className="mb-4 text-muted-foreground">Profilinizi yönetmek için giriş yapmalısınız.</p>
                            <Button onClick={onClose} variant="outline">Giriş Yap</Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
