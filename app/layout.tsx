kg// app/layout.tsx - with Google Analytics
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IRA - Intelligent Racing Analytics',
  description: 'AI-powered karting telemetry analysis. Built for drivers. Trusted by coaches.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-85YM4N7MNS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              'analytics_storage': 'granted'
            });
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
