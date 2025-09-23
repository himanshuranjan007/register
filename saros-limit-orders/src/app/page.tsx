"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WalletConnection } from "@/components/wallet-connection"
import { PoolSelector } from "@/components/pool-selector"
import { OrderForm } from "@/components/order-form"
import { OrdersTable } from "@/components/orders-table"
import { PoolInfo } from "@/components/pool-info"
import { ThemeToggle } from "@/components/theme-toggle"
import { PoolProvider } from "@/contexts/PoolContext"
import { Activity, TrendingUp, Clock } from "lucide-react"
import { useWallet } from '@solana/wallet-adapter-react'
import { ApiService } from '@/services/api'
import { LimitOrder } from '@/types/order'
import toast from 'react-hot-toast'

export default function SarosLimitOrders() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <PoolProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Saros Protocol</h1>
                  <p className="text-xs text-muted-foreground font-mono">Limit Order Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono text-xs">
                  <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                  MAINNET
                </Badge>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <WalletConnection />
              <PoolSelector />
              <PoolInfo />
            </div>

          <div className="lg:col-span-1">
            <OrderForm />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trading Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold font-mono">24</div>
                    <div className="text-xs text-muted-foreground">Active Orders</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold font-mono">$12.4K</div>
                    <div className="text-xs text-muted-foreground">Total Volume</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-lg font-bold font-mono text-success">98.7%</div>
                  <div className="text-xs text-muted-foreground">Fill Rate</div>
                </div>
              </CardContent>
            </Card>

            <OrdersTable />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="font-mono">Saros SDK v2.1.0</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Powered by Solana</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono">Block: 245,891,234</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </PoolProvider>
  )
}