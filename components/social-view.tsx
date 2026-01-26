"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, Globe, Users, Heart, Plus, Loader2, X, UserPlus2 } from "lucide-react"
import { dbService } from "@/lib/db-services"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface SocialViewProps {
    user: any
    onClose: () => void
    onAddDhikrSeries: (dhikrs: any[]) => void
}

export function SocialView({ user, onClose, onAddDhikrSeries }: SocialViewProps) {
    const [activeTab, setActiveTab] = useState("discover")
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [publicCollections, setPublicCollections] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadPublicCollections()
    }, [])

    const loadPublicCollections = async () => {
        setIsLoading(true)
        const data = await dbService.getPublicCollections()
        setPublicCollections(data)
        setIsLoading(false)
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
        <div className="container max-w-md mx-auto p-4 flex flex-col h-screen bg-background overflow-hidden relative z-50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black bg-vibrant-gradient bg-clip-text text-transparent italic">Sosyal Alan</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive">
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="discover" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6 glass p-1 rounded-2xl h-14">
                    <TabsTrigger value="discover" className="flex items-center gap-2 rounded-xl font-bold">
                        <Globe className="h-4 w-4" /> Keşfet
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2 rounded-xl font-bold">
                        <Users className="h-4 w-4" /> Kişiler
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto pr-1 pb-24 custom-scrollbar">
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
                </div>
            </Tabs>
        </div>
    )
}
