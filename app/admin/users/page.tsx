"use client"

import { useEffect, useState } from "react"
import { dbService } from "@/lib/db-services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Calendar, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await dbService.getAllProfiles()
                setUsers(data || [])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        loadUsers()
    }, [])

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Kullanıcı Yönetimi</h1>
                    <p className="text-muted-foreground">Sistemdeki kayıtlı kullanıcıları ve detaylarını görüntüleyin.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Kullanıcı ara..."
                        className="pl-9 w-full md:w-64 bg-background/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <Card key={user.id} className="group hover:scale-[1.02] transition-all duration-300 border-none shadow-sm hover:shadow-xl bg-gradient-to-b from-background to-muted/20">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                            {user.username?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-bold">{user.full_name || user.username || "İsimsiz"}</CardTitle>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            {user.email ? (
                                                <><Mail className="h-3 w-3" /> {user.email}</>
                                            ) : (
                                                <span className="opacity-50">@{user.username}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Profili Görüntüle</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Engelle</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm mt-2 pt-4 border-t border-primary/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Kayıt Tarihi</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {user.created_at ? format(new Date(user.created_at), "d MMM yyyy", { locale: tr }) : "-"}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className={user.id === 'admin-id-mock' ? "bg-primary/10 text-primary" : "bg-muted"}>
                                        {user.id === 'admin-id-mock' ? 'Admin' : 'Üye'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            Kullanıcı bulunamadı.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
