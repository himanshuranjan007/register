"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { List, MoreHorizontal, X, Eye, ExternalLink } from "lucide-react"

const mockOrders = [
  {
    id: "1",
    type: "buy",
    amount: "5.25",
    token: "SOL",
    targetPrice: "95.50",
    status: "active",
    created: "2024-01-15 14:30",
    expires: "2024-01-20 14:30",
  },
  {
    id: "2",
    type: "sell",
    amount: "2.10",
    token: "SOL",
    targetPrice: "102.00",
    status: "filled",
    created: "2024-01-14 09:15",
    expires: "2024-01-19 09:15",
  },
  {
    id: "3",
    type: "buy",
    amount: "10.00",
    token: "SOL",
    targetPrice: "90.00",
    status: "cancelled",
    created: "2024-01-13 16:45",
    expires: "2024-01-18 16:45",
  },
]

export function OrdersTable() {
  const [orders, setOrders] = useState(mockOrders)

  const cancelOrder = (orderId: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-warning text-warning-foreground">Active</Badge>
      case "filled":
        return <Badge className="bg-success text-success-foreground">Filled</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "buy" ? "default" : "destructive"} className="text-xs font-mono">
        {type.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <List className="w-4 h-4" />
          Your Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm mb-2">No orders found</div>
            <div className="text-xs text-muted-foreground">Place your first limit order to get started</div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(order.type)}
                    {getStatusBadge(order.status)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </DropdownMenuItem>
                      {order.status === "active" && (
                        <DropdownMenuItem onClick={() => cancelOrder(order.id)} className="text-destructive">
                          <X className="w-4 h-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Amount</div>
                    <div className="font-mono font-medium">
                      {order.amount} {order.token}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Target Price</div>
                    <div className="font-mono font-medium">${order.targetPrice}</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground font-mono">Created: {order.created}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
