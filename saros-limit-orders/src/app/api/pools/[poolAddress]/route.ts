import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { DLMMService } from '@/services/dlmm';

export async function GET(
  request: NextRequest,
  { params }: { params: { poolAddress: string } }
) {
  try {
    const poolAddress = params.poolAddress;
    if (!poolAddress || poolAddress.length < 32) {
      return NextResponse.json({ error: 'Invalid pool address' }, { status: 400 });
    }

    const dlmmService = new DLMMService();
    const poolInfo = await dlmmService.getPoolInfo(poolAddress);
    const currentPrice = await dlmmService.getCurrentPrice(poolAddress);
    
    return NextResponse.json({ 
      poolInfo: {
        ...poolInfo,
        currentPrice
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pool info';
    console.error('Error fetching pool info:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

