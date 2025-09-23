import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
import { Connection, PublicKey, clusterApiUrl, Commitment } from '@solana/web3.js'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pubkey = searchParams.get('pubkey')
    if (!pubkey) {
      return NextResponse.json({ error: 'Missing pubkey' }, { status: 400 })
    }

    let publicKey: PublicKey
    try {
      publicKey = new PublicKey(pubkey)
    } catch {
      return NextResponse.json({ error: 'Invalid pubkey' }, { status: 400 })
    }

    // Switch to MAINNET. If a custom RPC is set but isn't mainnet, ignore it.
    const custom = process.env.NEXT_PUBLIC_SOLANA_RPC || ''
    const isMainnetCustom = /mainnet/i.test(custom)
    const rpcUrl = isMainnetCustom ? custom : clusterApiUrl('mainnet-beta')

    const connection = new Connection(rpcUrl)
    const commitment: Commitment = 'confirmed'
    const balance = await connection.getBalance(publicKey, commitment)

    return NextResponse.json({ balance })
  } catch (error: any) {
    console.error('Balance API error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch balance' }, { status: 500 })
  }
}


