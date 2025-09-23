"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, AlertCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePool } from "@/contexts/PoolContext"
import toast from "react-hot-toast"

// Helper function to get token symbols from mint addresses (same as pool selector)
const getTokenSymbol = (mintAddress: string): string => {
  const knownTokens: Record<string, string> = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'So11111111111111111111111111111111111111112': 'SOL',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
    'SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL': 'SAROS',
    'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': 'PYTH',
    'C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9': 'C98',
    'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn': 'PUMP',
    'EGNjqB7LfRxpkbVMSroA6UaKtGPuy6wWPx7bmijmPuCD': 'EGN',
  };
  
  return knownTokens[mintAddress] || `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`;
};

export function PoolInfo() {
  const { selectedPool, isLoading } = usePool()

  const copyAddress = (address: string, type: string) => {
    navigator.clipboard.writeText(address)
    toast.success(`${type} address copied to clipboard!`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          Pool Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedPool ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground text-center py-4">
            <AlertCircle className="w-4 h-4" />
            Select a pool to view information
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pool Address */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pool Address</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyAddress(selectedPool.address, 'Pool')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                {selectedPool.address}
              </div>
            </div>

            {/* Token Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Token X ({getTokenSymbol(selectedPool.tokenMintX)})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyAddress(selectedPool.tokenMintX, 'Token X')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                {selectedPool.tokenMintX}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Token Y ({getTokenSymbol(selectedPool.tokenMintY)})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyAddress(selectedPool.tokenMintY, 'Token Y')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded">
                {selectedPool.tokenMintY}
              </div>
            </div>

            {/* Pool Details */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Price</span>
                <Badge variant="outline" className="font-mono text-xs">
                  ${selectedPool.currentPrice.toFixed(6)}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fee Tier</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {(selectedPool.binStep / 100).toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Bin ID</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedPool.activeId}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Protocol Share</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {(selectedPool.protocolShare / 100).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
