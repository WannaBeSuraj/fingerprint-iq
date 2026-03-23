import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FingerprintIQ — Browser Privacy Intelligence',
  description: 'See what your browser tells every website you visit. Real-time browser fingerprint analysis, privacy leakage scoring, and threat classification.',
  openGraph: {
    title: 'FingerprintIQ — Browser Privacy Intelligence',
    description: 'Scan your browser and see exactly what you leak to every website.',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
