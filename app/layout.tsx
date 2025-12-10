import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

// Derive a site URL that works locally, on Vercel preview, and in production
const siteUrl = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`
  return "http://localhost:3000"
})()

export const metadata: Metadata = {
  title: "Superlink - Genuine Goods | Affordable Prices",
  description:
    "Zambia's premier marketplace for genuine goods at affordable prices. Buy and sell electronics, appliances, and more with secure escrow protection.",
  generator: "Superlink Marketplace",
  keywords: [
    "Zambia marketplace",
    "buy sell online",
    "electronics Zambia",
    "genuine products",
    "affordable prices",
    "secure shopping",
    "escrow protection",
    "mobile money payments",
    "MTN Airtel payments",
    "Lusaka shopping",
    "Zambian e-commerce",
  ],
  authors: [{ name: "Joshua Muhali" }],
  creator: "Joshua Muhali",
  publisher: "Superlink Marketplace",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Superlink - Genuine Goods | Affordable Prices",
    description:
      "Zambia's premier marketplace for genuine goods at affordable prices. Buy and sell electronics, appliances, and more with secure escrow protection.",
    url: siteUrl,
    siteName: "Superlink Marketplace",
    images: [
      {
        url: "/images/superlink-logo.png",
        width: 1200,
        height: 630,
        alt: "Superlink - Genuine Goods | Affordable Prices",
      },
    ],
    locale: "en_ZM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Superlink - Genuine Goods | Affordable Prices",
    description:
      "Zambia's premier marketplace for genuine goods at affordable prices. Buy and sell electronics, appliances, and more with secure escrow protection.",
    images: ["/images/superlink-logo.png"],
    creator: "@superlink_zm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "e-commerce",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/superlink-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/superlink-logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="application-name" content="Superlink" />
        <meta name="apple-mobile-web-app-title" content="Superlink" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
