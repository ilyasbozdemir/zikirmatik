import type React from "react"
import "@/app/globals.css"
import { Inter, Amiri } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Zikirmatik - Dijital Zikir Çekme Uygulaması</title>
        <meta
          name="description"
          content="Zikirmatik ile zikirlerinizi kolayca takip edin, planlayın ve istatistiklerinizi görüntüleyin."
        />
      </head>
      <body className={`${inter.variable} ${amiri.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
