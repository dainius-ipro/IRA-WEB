// app/layout.tsx
// Root layout for IRA Web Platform

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'IRA - Intelligent Racing Analytics',
    template: '%s | IRA',
  },
  description:
    'Transform karting telemetry into improvements. AI coaching, track visualization, lap analysis for racing drivers and families.',
  keywords: [
    'karting',
    'telemetry',
    'racing',
    'analytics',
    'AI coaching',
    'lap time',
    'mychron',
  ],
  authors: [{ name: 'Ipro Racing S.L.', url: 'https://ira.ipro.cat' }],
  creator: 'Dainius Jarutis',
  publisher: 'Ipro Racing S.L.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ira.ipro.cat',
    siteName: 'IRA - Intelligent Racing Analytics',
    title: 'IRA - Intelligent Racing Analytics',
    description:
      'Transform karting telemetry into improvements. AI coaching for racing families.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IRA - Intelligent Racing Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRA - Intelligent Racing Analytics',
    description: 'Transform karting telemetry into improvements.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#15151E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=process.env.NEXT_PUBLIC_GA4_ID);
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', process.env.NEXT_PUBLIC_GA4_ID);
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <body className="min-h-screen bg-ira-carbon-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}