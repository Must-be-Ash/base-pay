import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: "#FF6B35",
}

export const metadata: Metadata = {
  title: "Base Pay Demo | Pay-Per-Use Image Transformation",
  description: "Experience Base Pay in action with this pay-per-use image transformation demo. Pay only $0.20 per transformation - no subscriptions required.",
  keywords: [
    "Base Pay",
    "Pay Per Use",
    "Blockchain Payments",
    "Crypto Payments",
    "Image Transformation",
    "AI Demo",
    "Web3 Payments",
    "Ethereum Payments",
  ],
  authors: [{ name: "@must_be_ash" }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/android-chrome-192x192.png' },
    ],
    other: [
      { 
        rel: 'android-chrome',
        url: '/android-chrome-192x192.png',
        sizes: '192x192'
      },
      { 
        rel: 'android-chrome',
        url: '/android-chrome-512x512.png',
        sizes: '512x512'
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Base Pay Demo | Pay-Per-Use Image Transformation",
    description: "Experience Base Pay in action with this pay-per-use image transformation demo. Pay only $0.20 per transformation - no subscriptions required.",
    url: "https://base-pay-cyan.vercel.app",
    siteName: "Base Pay Demo",
    type: "website",
    images: [
      {
        url: "https://base-pay-cyan.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Base Pay Demo - Pay-Per-Use Image Transformation with Base Pay",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Pay Demo | Pay-Per-Use Image Transformation",
    description: "Experience Base Pay in action with this pay-per-use image transformation demo. Pay only $0.20 per transformation - no subscriptions required.",
    images: ["https://base-pay-cyan.vercel.app/og.png"],
    creator: "@must_be_ash",
  },
  metadataBase: new URL("https://base-pay-cyan.vercel.app"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="author" content="@must_be_ash" />
        <meta name="creator" content="@must_be_ash" />
        <meta name="application-name" content="Base Pay Demo" />
        <meta name="apple-mobile-web-app-title" content="Base Pay Demo" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#FF6B35" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#FF6B35" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
