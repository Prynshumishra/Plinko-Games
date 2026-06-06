import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plinko — Provably Fair',
  description: 'Provably-fair Plinko game with commit-reveal RNG',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-slate-200 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
