"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import toast from "react-hot-toast"

export function WalletConnection() {
  const { connected, publicKey, disconnect, wallet } = useWallet()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Get wallet balance
  useEffect(() => {
    if (connected && publicKey) {
      const getBalance = async () => {
        try {
          setLoading(true)
          const res = await fetch(`/api/wallet/balance?pubkey=${publicKey.toString()}`, { cache: 'no-store' })
          if (!res.ok) {
            throw new Error(`Balance request failed: ${res.status}`)
          }
          const data = await res.json()
          // data.balance is lamports (integer). Ensure numeric and divide by LAMPORTS_PER_SOL exactly once.
          const lamports = typeof data.balance === 'number' ? data.balance : parseInt(String(data.balance ?? 0), 10)
          setBalance(lamports / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setBalance(null)
        } finally {
          setLoading(false)
        }
      }
      getBalance()
    } else {
      setBalance(null)
    }
  }, [connected, publicKey])

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      toast.success('Address copied to clipboard!')
    }
  }

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  const viewOnExplorer = () => {
    if (publicKey) {
      const explorerUrl = `https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`
      window.open(explorerUrl, '_blank')
    }
  }

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnect} className="w-full">
            Connect Wallet
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">Connect your Solana wallet to start trading</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Wallet Connected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">
                {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Unknown'}
              </span>
              <Badge variant="secondary" className="text-xs">
                {wallet?.adapter.name || 'Wallet'}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Balance: Loading...' : balance !== null ? `Balance: ${balance.toFixed(4)} SOL (devnet)` : 'Balance: —'}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              Wallet Actions
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem onClick={viewOnExplorer}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
