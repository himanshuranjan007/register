import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js'
import { PoolInfo, TokenInfo } from '@/types/order';

export class DLMMService {
  private service: any;
  private connection: Connection;
  private rpcEndpoint: string;
  private initialized: boolean = false;
  
  constructor() {
    this.rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta')
    this.connection = new Connection(this.rpcEndpoint)
    console.log('DLMMService constructor - RPC:', this.rpcEndpoint)
  }
  
  private async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing DLMM service...')
    const { LiquidityBookServices, MODE } = await import('@saros-finance/dlmm-sdk')
    
    const mode = MODE.MAINNET
    console.log('DLMMService initialize - Mode:', mode)

    this.service = new LiquidityBookServices({
      mode,
      connectionConfig: { endpoint: this.rpcEndpoint },
    })
    
    this.initialized = true
    console.log('DLMMService initialized')
  }
  
  // Get pool information
  async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
    await this.initialize()
    const pairInfo = await this.service.getPairAccount(new PublicKey(poolAddress));
    
    return {
      address: poolAddress,
      tokenMintX: pairInfo.tokenMintX.toString(),
      tokenMintY: pairInfo.tokenMintY.toString(),
      activeId: pairInfo.activeId,
      binStep: pairInfo.binStep,
      baseFactor: pairInfo.staticFeeParameters.baseFactor,
      protocolShare: pairInfo.staticFeeParameters.protocolShare,
    };
  }
  
  // Get current price from active bin
  async getMintDecimals(mintAddress: string): Promise<number> {
    const info = await this.connection.getParsedAccountInfo(new PublicKey(mintAddress))
    const parsed: any = info.value?.data
    // When parsed is of type ParsedAccountData
    const decimals = parsed?.parsed?.info?.decimals
    if (typeof decimals === 'number') return decimals
    // Fallback to 9 if unable to parse
    return 9
  }

  async getCurrentPrice(poolAddress: string): Promise<number> {
    await this.initialize()
    const { getPriceFromId } = await import('@saros-finance/dlmm-sdk')
    
    const poolInfo = await this.getPoolInfo(poolAddress)
    const [decX, decY] = await Promise.all([
      this.getMintDecimals(poolInfo.tokenMintX),
      this.getMintDecimals(poolInfo.tokenMintY),
    ])
    return getPriceFromId(poolInfo.binStep, poolInfo.activeId, decX, decY)
  }
  
  // Calculate bin ID from price
  async calculateBinIdFromPrice(price: number, binStep: number, decimals: number = 9): Promise<number> {
    const { getIdFromPrice } = await import('@saros-finance/dlmm-sdk')
    return getIdFromPrice(price, binStep, decimals, decimals);
  }
  
  // Calculate price from bin ID
  async calculatePriceFromBinId(binId: number, binStep: number, decimals: number = 9): Promise<number> {
    const { getPriceFromId } = await import('@saros-finance/dlmm-sdk')
    return getPriceFromId(binStep, binId, decimals, decimals);
  }
  
  // Get swap quote
  async getSwapQuote(params: {
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    isExactInput: boolean;
    swapForY: boolean;
    tokenInDecimals: number;
    tokenOutDecimals: number;
    slippage: number;
  }) {
    await this.initialize()
    return await this.service.getQuote({
      amount: params.amountIn,
      isExactInput: params.isExactInput,
      swapForY: params.swapForY,
      pair: new PublicKey(params.poolAddress),
      tokenBase: new PublicKey(params.tokenIn),
      tokenQuote: new PublicKey(params.tokenOut),
      tokenBaseDecimal: params.tokenInDecimals,
      tokenQuoteDecimal: params.tokenOutDecimals,
      slippage: params.slippage,
    });
  }
  
  // Execute swap
  async executeSwap(params: {
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
    swapForY: boolean;
    isExactInput: boolean;
    userWallet: string;
  }) {
    await this.initialize()
    return await this.service.swap({
      tokenMintX: new PublicKey(params.tokenIn),
      tokenMintY: new PublicKey(params.tokenOut),
      amount: params.amountIn,
      otherAmountOffset: params.minAmountOut,
      swapForY: params.swapForY,
      isExactInput: params.isExactInput,
      pair: new PublicKey(params.poolAddress),
      hook: new PublicKey(this.service.hooksConfig),
      payer: new PublicKey(params.userWallet),
    });
  }
  
  // Get all available pools
  async getAllPools(): Promise<string[]> {
    console.log('DLMMService.getAllPools() called')
    try {
      await this.initialize()
      console.log('Service initialized, calling fetchPoolAddresses...')
      const addresses = await this.service.fetchPoolAddresses()
      console.log('fetchPoolAddresses returned:', typeof addresses, Array.isArray(addresses))
      console.log('Number of addresses:', addresses?.length || 0)
      console.log('First few addresses:', addresses?.slice(0, 3))
      return addresses
    } catch (error) {
      console.error('Error in getAllPools:', error)
      throw error
    }
  }
  
  // Get pool metadata
  async getPoolMetadata(poolAddress: string) {
    await this.initialize()
    return await this.service.fetchPoolMetadata(poolAddress);
  }
  
  // Get user positions
  async getUserPositions(userWallet: string, poolAddress?: string) {
    await this.initialize()
    if (poolAddress) {
      return await this.service.getUserPositions({
        payer: new PublicKey(userWallet),
        pair: new PublicKey(poolAddress),
      });
    }
    
    // Get positions from all pools
    const pools = await this.getAllPools();
    const allPositions = [];
    
    for (const pool of pools.slice(0, 10)) { // Limit to first 10 pools for demo
      try {
        const positions = await this.service.getUserPositions({
          payer: new PublicKey(userWallet),
          pair: new PublicKey(pool),
        });
        allPositions.push(...positions);
      } catch (error) {
        console.error(`Error fetching positions for pool ${pool}:`, error);
      }
    }
    
    return allPositions;
  }
}
