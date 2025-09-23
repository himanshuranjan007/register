import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { WalletContextProvider } from '@/contexts/WalletContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Saros Protocol Limit Order Engine',
  description: 'Smart Limit Order System for DLMM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <WalletContextProvider>
          {children}
          <Toaster position="top-right" />
        </WalletContextProvider>
      </body>
    </html>
  )
}