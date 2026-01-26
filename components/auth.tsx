"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogIn, Mail, UserPlus, LogOut, AlertCircle } from "lucide-react"

// ... existing code ...

const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

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
        }
        setErrorMsg(message)
        toast({
            title: "Hata",
            description: message,
            variant: "destructive",
        })
    } finally {
        setLoading(false)
    }
}
// ... existing code ...

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
        </Card >
    )
}
