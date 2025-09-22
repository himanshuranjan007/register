import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { DLMMService } from '@/services/dlmm';

export async function GET() {
  try {
    const dlmmService = new DLMMService();
    const pools = await dlmmService.getAllPools();
    
    return NextResponse.json({ pools: pools.slice(0, 10) }); // Limit to first 10 for demo
  } catch (error) {
    console.error('Error fetching pools:', error);
    return NextResponse.json({ error: 'Failed to fetch pools' }, { status: 500 });
  }
}

