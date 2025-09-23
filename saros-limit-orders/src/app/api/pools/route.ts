import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    console.log('Pools API - starting...')
    
    const dlmmSdk = await import('@saros-finance/dlmm-sdk')
    const { LiquidityBookServices, MODE } = dlmmSdk
    const { clusterApiUrl, PublicKey, Connection } = await import('@solana/web3.js')
    
    const url = new URL(req.url)
    const limitParam = url.searchParams.get('limit') 
    const limit = Math.max(1, Math.min(50, Number(limitParam || 20) || 20))

    const mode = MODE.MAINNET
    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta')
    
    console.log('Creating DLMM service with mode:', mode, 'rpc:', rpcEndpoint)
    
    const connection = new Connection(rpcEndpoint)
    const service = new LiquidityBookServices({
      mode,
      connectionConfig: { endpoint: rpcEndpoint },
    })
    
    console.log('Fetching pool addresses...')
    const addresses = await service.fetchPoolAddresses()
    console.log('Got addresses:', addresses?.length || 0)
    
    if (!Array.isArray(addresses) || addresses.length === 0) {
      console.log('No pools found, returning empty array')
      return NextResponse.json({ pools: [] })
    }

    const target = addresses.slice(0, limit)
    console.log('Processing first', target.length, 'pools')
    
    const pools = []
    for (let i = 0; i < target.length; i++) {
      try {
        const addr = target[i]
        console.log(`Processing pool ${i + 1}/${target.length}: ${addr}`)
        
        const pairInfo = await service.getPairAccount(new PublicKey(addr))
        
        // Get token decimals
        const [tokenXInfo, tokenYInfo] = await Promise.all([
          connection.getParsedAccountInfo(pairInfo.tokenMintX),
          connection.getParsedAccountInfo(pairInfo.tokenMintY)
        ])
        
        const tokenXDecimals = (tokenXInfo.value?.data as any)?.parsed?.info?.decimals || 9
        const tokenYDecimals = (tokenYInfo.value?.data as any)?.parsed?.info?.decimals || 9
        
        // Calculate price based on active bin and bin step
        // Using the DLMM formula: price = (1 + binStep / 10000) ^ (activeId - 2^23)
        const binStepBasisPoints = pairInfo.binStep
        const activeId = pairInfo.activeId
        const baseId = 8388608 // 2^23, the neutral bin ID
        
        // Calculate price using DLMM pricing formula
        const priceMultiplier = 1 + (binStepBasisPoints / 10000)
        const exponent = activeId - baseId
        let rawPrice = Math.pow(priceMultiplier, exponent)
        
        // Adjust for token decimals (Y/X ratio)
        const currentPrice = rawPrice * Math.pow(10, tokenXDecimals - tokenYDecimals)
        
        pools.push({
          address: addr,
          tokenMintX: pairInfo.tokenMintX.toString(),
          tokenMintY: pairInfo.tokenMintY.toString(),
          activeId: pairInfo.activeId,
          binStep: pairInfo.binStep,
          baseFactor: pairInfo.staticFeeParameters.baseFactor,
          protocolShare: pairInfo.staticFeeParameters.protocolShare,
          currentPrice
        })
        
        console.log(`Pool ${i + 1} processed successfully`)
      } catch (error) {
        console.error('Error processing pool', target[i], ':', error)
      }
    }

    console.log('Returning', pools.length, 'pools')
    return NextResponse.json({ pools })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pools'
    console.error('Error fetching pools:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

