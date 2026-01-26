"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogIn, Mail, UserPlus, LogOut, AlertCircle } from "lucide-react"

export function AuthComponent() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg(null)

        if (!isSupabaseConfigured) {
            setErrorMsg("Supabase bağlantısı eksik! Lütfen proje ayarlarından API anahtarlarını ekleyin.")
            toast({
                title: "Yapılandırma Hatası",
                description: "Supabase bağlantısı henüz kurulmamış.",
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                toast({
                    title: "Kayıt Başarılı",
                    description: "E-postanızı kontrol edin!",
                })
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                toast({
                    title: "Giriş Başarılı",
                    description: "Hoş geldiniz!",
                })
            }
        } catch (error: any) {
            let message = error.message
            if (error.status === 422) {
                message = "Şifreniz çok zayıf veya geçersiz e-posta. En az 6 karakter kullanın."
            } else if (message === "Failed to fetch") {
                message = "İnternet bağlantısı kurulamadı. Lütfen ağ ayarlarınızı kontrol edin."
            }
            setErrorMsg(message)
            toast({
                title: "Bağlantı Hatası",
                description: message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast({
            title: "Çıkış Yapıldı",
            description: "Yine bekleriz.",
        })
    }

    if (user) {
        return (
            <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Çıkış Yap">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        )
    }

    return (
        <Card className="w-full max-w-sm mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="text-center p-0 mb-4">
                <CardTitle className="text-xl">{isSignUp ? "Hesap Oluştur" : "Üye Girişi"}</CardTitle>
                <CardDescription>
                    {isSignUp ? "Verilerinizi buluta kaydetmek için hesap oluşturun" : "Zikirlerinizi senkronize etmek için giriş yapın"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <form onSubmit={handleAuth} className="space-y-4">
                    {errorMsg && (
                        <div className="bg-destructive/15 p-3 rounded-lg flex items-center gap-2 text-destructive text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4" />
                            <p>{errorMsg}</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="En az 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        {isSignUp && (
                            <p className="text-[10px] text-muted-foreground">Şifreniz en az 6 karakter olmalıdır.</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : isSignUp ? (
                            <UserPlus className="mr-2 h-4 w-4" />
                        ) : (
                            <LogIn className="mr-2 h-4 w-4" />
                        )}
                        {isSignUp ? "Kayıt Ol" : "Giriş Yap"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="p-0 mt-4 justify-center">
                <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-xs">
                    {isSignUp ? "Zaten hesabınız var mı? Giriş yapın" : "Hesabınız yok mu? Kayıt olun"}
                </Button>
            </CardFooter>
        </Card>
    )
}
