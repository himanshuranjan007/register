import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { OrderManager } from '@/services/orderManager';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const orderManager = new OrderManager();
    const success = await orderManager.cancelOrder(params.orderId, userId);
    
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel order' }, { status: 500 });
  }
}

