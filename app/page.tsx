"use client"

import { useState } from "react"
import { useDhikrs } from "@/context/dhikr-context"
import { DhikrCounter } from "@/components/dhikr-counter"
import { SuccessScreen } from "@/components/success-screen"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { AddDhikrForm } from "@/components/add-dhikr-form"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  RotateCcw,
  Trash2,
  Play,
  Loader2,
  AlertTriangle,
  Globe,
  Shield,
  User
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { InstallPWAButton, UpdatePWAButton } from "@/components/pwa-manager"
import { motion, AnimatePresence } from "framer-motion"
import type { Dhikr } from "@/types/dhikr"
import { formatNumber } from "@/lib/format-number"

export default function Home() {
  const { dhikrs, isLoading, deleteDhikr, updateDhikrCount, repeatDhikr, addNewDhikr, isAdmin, user } = useDhikrs()
  const router = useRouter()
  const [activeDhikr, setActiveDhikr] = useState<any>(null)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("planned")
  const [dhikrToDelete, setDhikrToDelete] = useState<string | null>(null)
  const [dhikrToRepeat, setDhikrToRepeat] = useState<Dhikr | null>(null)

  // Temporary fix for framer-motion React 19 types compatibility
  const MotionDiv = motion.div as any

  const handleRepeatConfirm = (dhikr: Dhikr) => {
    setDhikrToRepeat(dhikr)
  }

  const handleExecuteRepeat = () => {
    if (dhikrToRepeat) {
      repeatDhikr(dhikrToRepeat)
      setActiveTab("planned")
      setDhikrToRepeat(null)
    }
  }

  const handleDeleteConfirm = (id: string) => {
    setDhikrToDelete(id)
  }

  const handleExecuteDelete = async () => {
    if (dhikrToDelete) {
      await deleteDhikr(dhikrToDelete)
      setDhikrToDelete(null)
    }
  }

  const handleAddFromPage = (d: any) => {
    addNewDhikr(d)
    setIsAddSheetOpen(false)
  }

  const plannedDhikrs = dhikrs.filter((d) => d.status !== "completed")
  const completedDhikrs = dhikrs.filter((d) => d.status === "completed")

  const filteredPlanned = plannedDhikrs.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateCount = (id: string, count: number) => {
    updateDhikrCount(id, count)
    const dhikr = dhikrs.find(d => d.id === id)
    if (dhikr && count >= dhikr.targetCount) {
      setActiveDhikr(null)
      setShowSuccess(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Zikirler yükleniyor...</p>
      </div>
    )
  }

  if (showSuccess) {
    return <SuccessScreen onClose={() => setShowSuccess(false)} />
  }

  if (activeDhikr) {
    return <DhikrCounter dhikr={activeDhikr} onUpdate={handleUpdateCount} onClose={() => setActiveDhikr(null)} />
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-vibrant-gradient bg-clip-text text-transparent">Zikirlerim</h1>
            <p className="text-muted-foreground mt-1">Günlük zikirlerinizi takip edin</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* User Status Badge */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-primary/10 shadow-sm mr-2">
                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-primary animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs font-bold text-foreground/80">
                  {isAdmin ? 'Admin' : 'Kullanıcı'}
                </span>
              </div>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/admin')}
                className="rounded-full bg-primary/10 hover:bg-primary/20 border-primary/20"
              >
                <Shield className="h-5 w-5 text-primary" />
              </Button>
            )}
            <UpdatePWAButton />
            <InstallPWAButton />
          </div>
        </div>

        {/* Mobile User Status */}
        {user && (
          <div className="md:hidden flex items-center gap-2 px-4 py-2 -mt-4 rounded-xl bg-muted/5 border border-primary/5">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground/70 truncate flex-1">{user.email}</span>
            <Badge variant={isAdmin ? "default" : "secondary"} className="text-[10px] h-5">
              {isAdmin ? 'YÖNETİCİ' : 'ÜYE'}
            </Badge>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Zikirlerde ara..."
            className="pl-12 h-14 glass border-primary/10 rounded-2xl text-lg shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 glass p-1.5 rounded-2xl h-14">
          <TabsTrigger value="planned" className="rounded-xl text-md font-bold data-[state=active]:shadow-lg">Çekilecekler</TabsTrigger>
          <TabsTrigger value="recent" className="rounded-xl text-md font-bold data-[state=active]:shadow-lg">Geçmiş</TabsTrigger>
        </TabsList>

        <TabsContent value="planned" className="space-y-4 outline-none">
          <AnimatePresence mode="popLayout">
            {filteredPlanned.length > 0 ? (
              filteredPlanned.map((dhikr) => (
                <motion.div
                  key={dhikr.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <Card className="glass border-none shadow-premium group relative overflow-hidden rounded-3xl">
                    <div className="absolute top-0 left-0 w-2 h-full bg-vibrant-gradient opacity-80" />
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-black tracking-tight">{dhikr.name}</CardTitle>
                          {dhikr.category && (
                            <Badge variant="secondary" className="mt-3 bg-primary/10 text-primary hover:bg-primary/20 border-none transition-colors">
                              {dhikr.category}
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => handleDeleteConfirm(dhikr.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                          <span>İlerleme Durumu</span>
                          <span className="text-primary">{Math.round((dhikr.currentCount / dhikr.targetCount) * 100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden p-0.5 border border-primary/5">
                          <MotionDiv
                            className="h-full bg-vibrant-gradient rounded-full shadow-lg"
                            initial={{ width: 0 }}
                            animate={{ width: `${(dhikr.currentCount / dhikr.targetCount) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                          />
                        </div>
                        <div className="flex items-baseline gap-1 justify-center">
                          <span className="text-2xl font-black text-primary">{formatNumber(dhikr.currentCount)}</span>
                          <span className="text-muted-foreground font-bold">/ {formatNumber(dhikr.targetCount)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 bg-muted/10">
                      <Button className="w-full h-14 bg-vibrant-gradient hover:opacity-90 border-none shadow-xl text-white text-lg font-black rounded-2xl transition-transform active:scale-95" onClick={() => setActiveDhikr(dhikr)}>
                        <Play className="mr-2 h-6 w-6 fill-current" /> {dhikr.currentCount > 0 ? "Devam Et" : "Başla"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-primary/20 bg-muted/5">
                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-2xl font-black text-foreground/80 mb-2">Listeniz Tertemiz</h3>
                <div className="grid gap-4 mt-4 w-full max-w-lg mx-auto">
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-3 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    onClick={() => setIsAddSheetOpen(true)}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">Yeni Zikir Ekle</h4>
                      <p className="text-sm text-muted-foreground">Kendi hedeflerinizi belirleyin</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-3 border-dashed border-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    onClick={() => router.push('/social')}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">Keşfet</h4>
                      <p className="text-sm text-muted-foreground">Başkalarının listelerini inceleyin</p>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0 overflow-y-auto rounded-t-[2rem] border-none shadow-premium">
            <AddDhikrForm onAdd={handleAddFromPage} onCancel={() => setIsAddSheetOpen(false)} />
          </SheetContent>
        </Sheet>

        <TabsContent value="recent" className="space-y-3 outline-none">
          {completedDhikrs.length > 0 ? (
            completedDhikrs.slice(0, 15).map((dhikr) => (
              <motion.div key={dhikr.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="glass border-none opacity-90 overflow-hidden rounded-2xl hover:opacity-100 transition-opacity">
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                          <RotateCcw className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{dhikr.name}</CardTitle>
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {dhikr.dateCompleted && format(new Date(dhikr.dateCompleted), "d MMMM • HH:mm", { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all" onClick={() => handleRepeatConfirm(dhikr)}>
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground italic font-medium">Henüz tamamlanan bir zikir bulunmuyor.</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Onay Dialogları */}
      <AlertDialog open={!!dhikrToDelete} onOpenChange={(open) => !open && setDhikrToDelete(null)}>
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-premium">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl font-bold">
              <AlertTriangle className="h-6 w-6 text-destructive mr-2" /> Emin Misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              Bu zikri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-none bg-secondary">İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteDelete} className="rounded-xl bg-destructive text-white hover:bg-destructive/90">Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!dhikrToRepeat} onOpenChange={(open) => !open && setDhikrToRepeat(null)}>
        <AlertDialogContent className="glass rounded-[2rem] border-none shadow-premium">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl font-bold text-primary">
              <RotateCcw className="h-6 w-6 mr-2" /> Tekrarla
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              Bu zikri tekrar çekilecekler listesine eklemek ister misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl border-none bg-secondary">Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteRepeat} className="rounded-xl bg-vibrant-gradient text-white border-none">Evet, Ekle</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
