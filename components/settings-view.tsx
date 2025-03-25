"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, Download, Trash2, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsViewProps {
  onClose: () => void;
}

export function SettingsView({ onClose }: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrSoundEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem("dhikrVibrationEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("dhikrSoundEnabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("dhikrVibrationEnabled", vibrationEnabled.toString());
  }, [vibrationEnabled]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const exportData = () => {
    try {
      const dhikrs = localStorage.getItem("dhikrs") || "[]";
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(dhikrs);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "zikirmatik_yedek.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast({
        title: "Veriler dışa aktarıldı",
        description: "Zikirleriniz başarıyla dışa aktarıldı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler dışa aktarılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]; // Kullanıcıdan dosya seçildi mi kontrol et
      if (!file) {
        toast({
          title: "Hata",
          description: "Lütfen bir dosya seçin.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string); // Dosyanın içeriğini JSON olarak parse et
          localStorage.setItem("dhikrs", JSON.stringify(importedData)); // Veriyi localStorage'a kaydet

          toast({
            title: "Veriler içe aktarıldı",
            description: "Zikirleriniz başarıyla içe aktarıldı.",
          });
        } catch (error) {
          toast({
            title: "Hata",
            description: "Geçersiz dosya formatı.",
            variant: "destructive",
          });
        }
      };

      reader.readAsText(file); // Dosyayı metin olarak oku
    } catch (error) {
      toast({
        title: "Hata",
        description: "Veriler içe aktarılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const clearAllData = () => {
    localStorage.removeItem("dhikrs");

    toast({
      title: "Tüm veriler silindi",
      description: "Tüm zikir verileri silindi.",
    });

    // Reload the page to reflect changes
    window.location.reload();
  };

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Ayarlar</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Görünüm</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Açık veya koyu tema seçin
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" /> Açık
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" /> Koyu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Bildirimler</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound">Ses Efektleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Zikir çekerken ses efektlerini etkinleştir
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vibration">Titreşim</Label>
                  <p className="text-sm text-muted-foreground">
                    Zikir çekerken titreşimi etkinleştir
                  </p>
                </div>
                <Switch
                  id="vibration"
                  checked={vibrationEnabled}
                  onCheckedChange={setVibrationEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Veri Yönetimi</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  //onClick={handleButtonClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Verileri İçe Aktar (Beta)
                </Button>

                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={importData}
                />
              </div>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={exportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Verileri Dışa Aktar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Tüm Verileri Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tüm veriler silinecek</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem tüm zikir verilerinizi silecek ve geri alınamaz.
                      Devam etmek istediğinize emin misiniz?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllData}>
                      Tüm Verileri Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Zikirmatik v1.0.0-rc
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              © {new Date().getFullYear()} Tüm hakları saklıdır.
            </p>

            <p className="text-sm text-primary mt-2 font-medium">
              Ömür boyu ücretsiz
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <a
                href="https://github.com/ilyasbozdemir/zikirmatik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                <span>GitHub Reposu</span>
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
