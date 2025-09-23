"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Zap, TrendingUp, TrendingDown } from "lucide-react"

export function OrderForm() {
  const [orderType, setOrderType] = useState("buy")
  const [amount, setAmount] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle order submission
    console.log("Order submitted:", { orderType, amount, targetPrice, expiresAt })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Place Limit Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Order Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={orderType === "buy" ? "default" : "outline"}
                onClick={() => setOrderType("buy")}
                className={`justify-center gap-2 ${
                  orderType === "buy"
                    ? "bg-success text-success-foreground hover:bg-success/90"
                    : "hover:bg-success/10 hover:text-success hover:border-success"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Buy
              </Button>
              <Button
                type="button"
                variant={orderType === "sell" ? "default" : "outline"}
                onClick={() => setOrderType("sell")}
                className={`justify-center gap-2 ${
                  orderType === "sell"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Sell
              </Button>
            </div>
          </div>

          <Separator />

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono pr-16"
                step="0.000001"
              />
              <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono">
                SOL
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: 12.45 SOL</span>
              <button type="button" className="text-primary hover:underline" onClick={() => setAmount("12.45")}>
                Max
              </button>
            </div>
          </div>

          {/* Target Price Input */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="text-sm font-medium">
              Target Price
            </Label>
            <div className="relative">
              <Input
                id="targetPrice"
                type="number"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="font-mono pr-20"
                step="0.01"
              />
              <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono">
                USDC
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">Current price: $98.45 USDC</div>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expires At (Optional)
            </Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="font-mono"
            />
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
            <div className="text-sm font-medium">Order Summary</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant={orderType === "buy" ? "default" : "destructive"} className="text-xs">
                  {orderType.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono">{amount || "0.00"} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Price</span>
                <span className="font-mono">${targetPrice || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Total</span>
                <span className="font-mono">
                  ${((Number.parseFloat(amount) || 0) * (Number.parseFloat(targetPrice) || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className={`w-full ${
              orderType === "buy"
                ? "bg-success hover:bg-success/90 text-success-foreground"
                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            }`}
            disabled={!amount || !targetPrice}
          >
            Place {orderType === "buy" ? "Buy" : "Sell"} Order
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
