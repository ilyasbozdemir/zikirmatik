import type React from "react"
import "@/app/globals.css"
import { Inter, Amiri } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import { DhikrProvider } from "@/context/dhikr-context"
import { AppLayout } from "@/components/app-layout"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
})

import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Zikirmatik - Dijital Zikir Çekme Uygulaması</title>
        <meta
          name="description"
          content="Zikirmatik ile zikirlerinizi kolayca takip edin, planlayın ve istatistiklerinizi görüntüleyin."
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Zikirmatik" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Zikirmatik" />
      </head>
      <body className={`${inter.variable} ${amiri.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DhikrProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </DhikrProvider>
        </ThemeProvider>

        {/* Service Worker Kaydı */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('Service Worker başarıyla kaydedildi:', registration.scope);
                  
                  // Güncelleme kontrolü
                  registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                      newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('Yeni Service Worker kuruldu, güncelleme mevcut');
                        }
                      });
                    }
                  });
                  
                }, function(err) {
                  console.log('Service Worker kaydı başarısız:', err);
                });
                
                // Sayfa yüklendiğinde güncelleme kontrolü
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  console.log('Yeni Service Worker aktif');
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
  generator: 'v0.dev'
};
