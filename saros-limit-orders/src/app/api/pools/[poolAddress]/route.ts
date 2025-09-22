import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { DLMMService } from '@/services/dlmm';

export async function GET(
  request: NextRequest,
  { params }: { params: { poolAddress: string } }
) {
  try {
    const dlmmService = new DLMMService();
    const poolInfo = await dlmmService.getPoolInfo(params.poolAddress);
    const currentPrice = await dlmmService.getCurrentPrice(params.poolAddress);
    
    return NextResponse.json({ 
      poolInfo: {
        ...poolInfo,
        currentPrice
      }
    });
  } catch (error) {
    console.error('Error fetching pool info:', error);
    return NextResponse.json({ error: 'Failed to fetch pool info' }, { status: 500 });
  }
}

