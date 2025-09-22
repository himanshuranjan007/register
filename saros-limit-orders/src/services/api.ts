import { LimitOrder } from '@/types/order';

export class ApiService {
  private baseUrl = '/api';

  // Get user's orders
  async getUserOrders(userId: string): Promise<LimitOrder[]> {
    const response = await fetch(`${this.baseUrl}/orders?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data = await response.json();
    return data.orders;
  }

  // Place a new order
  async placeOrder(params: {
    userId: string;
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: string; // Pass as string to avoid BigInt serialization issues
    targetPrice: number;
    orderType: 'buy' | 'sell';
    expiresAt?: string;
  }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to place order');
    }

    const data = await response.json();
    return data.orderId;
  }

  // Cancel an order
  async cancelOrder(orderId: string, userId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}?userId=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel order');
    }

    const data = await response.json();
    return data.success;
  }

  // Get all pools
  async getAllPools(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/pools`);
    if (!response.ok) {
      throw new Error('Failed to fetch pools');
    }
    const data = await response.json();
    return data.pools;
  }

  // Get pool info
  async getPoolInfo(poolAddress: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pools/${poolAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pool info');
    }
    const data = await response.json();
    return data.poolInfo;
  }
}

