"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Droplets, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePool } from "@/contexts/PoolContext"

// Helper function to get token symbols from mint addresses (placeholder)
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

export function PoolSelector() {
  const { pools, selectedPool, isLoading, error, setSelectedPool, refreshPools } = usePool()

  const handlePoolChange = (poolAddress: string) => {
    const pool = pools.find(p => p.address === poolAddress);
    if (pool) {
      setSelectedPool(pool);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          Liquidity Pool
          {!isLoading && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 w-6 p-0"
              onClick={refreshPools}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading pools...
          </div>
        ) : error ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
            <Button variant="outline" size="sm" onClick={refreshPools} className="w-full">
              <RefreshCw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          </div>
        ) : pools.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No pools available
          </div>
        ) : (
          <>
            <Select 
              value={selectedPool?.address || ""} 
              onValueChange={handlePoolChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a pool">
                  {selectedPool && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getTokenSymbol(selectedPool.tokenMintX)}/{getTokenSymbol(selectedPool.tokenMintY)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {(selectedPool.binStep / 100).toFixed(2)}%
                      </Badge>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => (
                  <SelectItem key={pool.address} value={pool.address}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        {getTokenSymbol(pool.tokenMintX)}/{getTokenSymbol(pool.tokenMintY)}
                      </span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="secondary" className="text-xs">
                          {(pool.binStep / 100).toFixed(2)}%
                        </Badge>
                        <div className="text-xs text-muted-foreground font-mono">
                          ${pool.currentPrice.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPool && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-mono font-medium">${selectedPool.currentPrice.toFixed(6)}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-muted-foreground">Fee Tier</div>
                  <div className="font-mono font-medium">{(selectedPool.binStep / 100).toFixed(2)}%</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
