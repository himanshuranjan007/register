import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { OrderManager } from '@/services/orderManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const orderManager = new OrderManager();
    const orders = await orderManager.getUserOrders(userId);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, poolAddress, tokenIn, tokenOut, amountIn, targetPrice, orderType, expiresAt } = body;
    
    if (!userId || !poolAddress || !tokenIn || !tokenOut || !amountIn || !targetPrice || !orderType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const orderManager = new OrderManager();
    const orderId = await orderManager.placeLimitOrder({
      userId,
      poolAddress,
      tokenIn,
      tokenOut,
      amountIn: BigInt(amountIn),
      targetPrice,
      orderType,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    
    return NextResponse.json({ orderId });
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}

