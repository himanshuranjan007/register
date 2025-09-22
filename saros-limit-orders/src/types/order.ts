export interface LimitOrder {
  id: string;
  userId: string;
  poolAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  targetPrice: number;
  targetBinId: number;
  orderType: 'buy' | 'sell';
  status: OrderStatus;
  createdAt: Date;
  expiresAt?: Date;
  executedAt?: Date;
  executionPrice?: number;
  executionAmount?: bigint;
  feesPaid?: bigint;
  transactionSignature?: string;
}

export interface StopLossOrder {
  id: string;
  userId: string;
  positionId: string;
  triggerPrice: number;
  triggerBinId: number;
  amount: bigint;
  isTrailing: boolean;
  trailDistance?: number;
  status: OrderStatus;
}

export interface TakeProfitOrder {
  id: string;
  userId: string;
  positionId: string;
  targetPrice: number;
  targetBinId: number;
  amount: bigint;
  status: OrderStatus;
}

export type OrderStatus = 
  | 'pending' 
  | 'partial' 
  | 'filled' 
  | 'cancelled' 
  | 'expired' 
  | 'failed';

export interface OrderExecution {
  id: string;
  orderId: string;
  executionType: 'full' | 'partial' | 'cancelled';
  executedAmount: bigint;
  executionPrice: number;
  feesPaid: bigint;
  transactionSignature: string;
  executedAt: Date;
}

export interface PoolInfo {
  address: string;
  tokenMintX: string;
  tokenMintY: string;
  activeId: number;
  binStep: number;
  baseFactor: number;
  protocolShare: number;
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}
