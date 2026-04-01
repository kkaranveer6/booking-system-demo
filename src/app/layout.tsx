import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DemoBanner } from '@/components/DemoBanner'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Find and book appointments with top providers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <DemoBanner />
        {children}
      </body>
    </html>
  )
}
