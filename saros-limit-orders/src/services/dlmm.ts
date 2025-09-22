import { 
  LiquidityBookServices, 
  MODE, 
  getPriceFromId, 
  getIdFromPrice 
} from '@saros-finance/dlmm-sdk';
import { PublicKey } from '@solana/web3.js';
import { PoolInfo, TokenInfo } from '@/types/order';

export class DLMMService {
  private service: LiquidityBookServices;
  
  constructor() {
    this.service = new LiquidityBookServices({
      mode: MODE.MAINNET,
    });
  }
  
  // Get pool information
  async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
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
  async getCurrentPrice(poolAddress: string): Promise<number> {
    const poolInfo = await this.getPoolInfo(poolAddress);
    return getPriceFromId(
      poolInfo.binStep,
      poolInfo.activeId,
      9, // Default decimals
      9  // Default decimals
    );
  }
  
  // Calculate bin ID from price
  calculateBinIdFromPrice(price: number, binStep: number, decimals: number = 9): number {
    return getIdFromPrice(price, binStep, decimals, decimals);
  }
  
  // Calculate price from bin ID
  calculatePriceFromBinId(binId: number, binStep: number, decimals: number = 9): number {
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
    return await this.service.fetchPoolAddresses();
  }
  
  // Get pool metadata
  async getPoolMetadata(poolAddress: string) {
    return await this.service.fetchPoolMetadata(poolAddress);
  }
  
  // Get user positions
  async getUserPositions(userWallet: string, poolAddress?: string) {
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
