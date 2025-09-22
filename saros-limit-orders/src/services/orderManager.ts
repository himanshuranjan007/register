import { PrismaClient } from '@prisma/client';
import { DLMMService } from './dlmm';
import { LimitOrder, OrderStatus } from '@/types/order';

export class OrderManager {
  private prisma: PrismaClient;
  private dlmmService: DLMMService;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.dlmmService = new DLMMService();
  }
  
  // Resolve a wallet address to an internal User record (create if missing)
  private async getOrCreateUserByWallet(walletAddress: string) {
    const existing = await this.prisma.user.findFirst({ where: { walletAddress } });
    if (existing) return existing;
    return await this.prisma.user.create({ data: { walletAddress } });
  }
  
  // Resolve provided identifier which may be a User.id or a wallet address
  private async resolveUserId(userIdentifier: string): Promise<string> {
    // Try exact User.id first
    const byId = await this.prisma.user.findUnique({ where: { id: userIdentifier } });
    if (byId) return byId.id;
    // Fallback to wallet address
    const user = await this.getOrCreateUserByWallet(userIdentifier);
    return user.id;
  }
  
  // Place a new limit order
  async placeLimitOrder(params: {
    userId: string; // May be wallet address; will be resolved to internal user id
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    targetPrice: number;
    orderType: 'buy' | 'sell';
    expiresAt?: Date;
  }): Promise<string> {
    
    // Validate order parameters
    await this.validateOrder(params);
    
    // Ensure we have a proper internal user id
    const resolvedUserId = await this.resolveUserId(params.userId);
    
    // Calculate target bin ID
    const poolInfo = await this.dlmmService.getPoolInfo(params.poolAddress);
    const targetBinId = this.dlmmService.calculateBinIdFromPrice(
      params.targetPrice,
      poolInfo.binStep,
      9 // Default decimals
    );
    
    // Check if order can be executed immediately
    const canExecuteNow = await this.canExecuteImmediately(
      params.poolAddress,
      targetBinId,
      params.orderType
    );
    
    if (canExecuteNow) {
      return await this.executeOrderImmediately({ ...params, userId: resolvedUserId }, targetBinId);
    }
    
    // Create pending order
    const order = await this.prisma.order.create({
      data: {
        userId: resolvedUserId,
        poolAddress: params.poolAddress,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn.toString(),
        targetPrice: params.targetPrice,
        targetBinId,
        orderType: params.orderType,
        status: 'pending',
        expiresAt: params.expiresAt,
      },
    });
    
    // Start monitoring this order
    await this.startMonitoringOrder(order.id);
    
    return order.id;
  }
  
  // Get user's orders
  async getUserOrders(userId: string): Promise<LimitOrder[]> {
    const resolvedUserId = await this.resolveUserId(userId);
    const orders = await this.prisma.order.findMany({
      where: { userId: resolvedUserId },
      orderBy: { createdAt: 'desc' },
    });
    
    return orders.map(this.mapDbOrderToLimitOrder);
  }
  
  // Get order by ID
  async getOrderById(orderId: string): Promise<LimitOrder | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    
    return order ? this.mapDbOrderToLimitOrder(order) : null;
  }
  
  // Cancel an order
  async cancelOrder(orderId: string, userId: string): Promise<boolean> {
    const resolvedUserId = await this.resolveUserId(userId);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId: resolvedUserId },
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.status !== 'pending') {
      throw new Error('Order cannot be cancelled');
    }
    
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
    
    return true;
  }
  
  // Check for triggered orders
  async checkTriggeredOrders(poolAddress: string, currentActiveId: number): Promise<void> {
    const triggeredOrders = await this.prisma.order.findMany({
      where: {
        poolAddress,
        status: 'pending',
        OR: [
          {
            orderType: 'buy',
            targetBinId: { gte: currentActiveId },
          },
          {
            orderType: 'sell',
            targetBinId: { lte: currentActiveId },
          },
        ],
      },
    });
    
    for (const order of triggeredOrders) {
      await this.executeOrder(order.id);
    }
  }
  
  // Execute an order
  private async executeOrder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order || order.status !== 'pending') {
      return;
    }
    
    try {
      // Get current pool state
      const poolInfo = await this.dlmmService.getPoolInfo(order.poolAddress);
      
      // Calculate execution parameters
      const executionParams = await this.calculateExecutionParams(order, poolInfo);
      
      // Create swap transaction
      const transaction = await this.dlmmService.executeSwap({
        poolAddress: order.poolAddress,
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amountIn: BigInt(order.amountIn),
        minAmountOut: executionParams.minAmountOut,
        swapForY: order.orderType === 'buy',
        isExactInput: true,
        userWallet: order.userId,
      });
      
      // For demo purposes, we'll simulate the transaction
      // In production, you'd sign and send the transaction
      const simulatedSignature = `simulated_${Date.now()}`;
      
      // Update order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'filled',
          executedAt: new Date(),
          executionPrice: executionParams.executionPrice,
          executionAmount: executionParams.executionAmount.toString(),
          feesPaid: executionParams.feesPaid.toString(),
          transactionSignature: simulatedSignature,
        },
      });
      
      // Record execution
      await this.prisma.orderExecution.create({
        data: {
          orderId,
          executionType: 'full',
          executedAmount: executionParams.executionAmount.toString(),
          executionPrice: executionParams.executionPrice,
          feesPaid: executionParams.feesPaid.toString(),
          transactionSignature: simulatedSignature,
        },
      });
      
    } catch (error) {
      console.error(`Error executing order ${orderId}:`, error);
      
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'failed' },
      });
    }
  }
  
  // Validate order parameters
  private async validateOrder(params: any): Promise<void> {
    // Check if pool exists
    try {
      await this.dlmmService.getPoolInfo(params.poolAddress);
    } catch (error) {
      throw new Error('Pool not found');
    }
    
    // Check if amount is valid
    if (params.amountIn <= 0) {
      throw new Error('Invalid amount');
    }
    
    // Check if price is valid
    if (params.targetPrice <= 0) {
      throw new Error('Invalid target price');
    }
  }
  
  // Check if order can be executed immediately
  private async canExecuteImmediately(
    poolAddress: string,
    targetBinId: number,
    orderType: 'buy' | 'sell'
  ): Promise<boolean> {
    const poolInfo = await this.dlmmService.getPoolInfo(poolAddress);
    
    if (orderType === 'buy') {
      return targetBinId >= poolInfo.activeId;
    } else {
      return targetBinId <= poolInfo.activeId;
    }
  }
  
  // Execute order immediately
  private async executeOrderImmediately(
    params: any,
    targetBinId: number
  ): Promise<string> {
    // Create order record
    const order = await this.prisma.order.create({
      data: {
        userId: params.userId,
        poolAddress: params.poolAddress,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn.toString(),
        targetPrice: params.targetPrice,
        targetBinId,
        orderType: params.orderType,
        status: 'filled',
        executedAt: new Date(),
        expiresAt: params.expiresAt,
      },
    });
    
    return order.id;
  }
  
  // Calculate execution parameters
  private async calculateExecutionParams(order: any, poolInfo: any): Promise<{
    minAmountOut: bigint;
    executionPrice: number;
    executionAmount: bigint;
    feesPaid: bigint;
  }> {
    // Get current price
    const currentPrice = this.dlmmService.calculatePriceFromBinId(
      poolInfo.activeId,
      poolInfo.binStep,
      9
    );
    
    // Calculate expected output
    const amountIn = BigInt(order.amountIn);
    const expectedOutput = order.orderType === 'buy' 
      ? amountIn / BigInt(Math.floor(currentPrice * 1e9))
      : amountIn * BigInt(Math.floor(currentPrice * 1e9));
    
    // Apply slippage tolerance
    const slippageTolerance = 0.5; // 0.5%
    const minAmountOut = expectedOutput * BigInt(Math.floor((100 - slippageTolerance) * 100)) / BigInt(10000);
    
    // Calculate fees (simplified)
    const feesPaid = amountIn * BigInt(poolInfo.baseFactor) / BigInt(1000000);
    
    return {
      minAmountOut,
      executionPrice: currentPrice,
      executionAmount: amountIn,
      feesPaid,
    };
  }
  
  // Start monitoring an order
  private async startMonitoringOrder(orderId: string): Promise<void> {
    // In a real implementation, you'd start a background job
    // For demo purposes, we'll just log it
    console.log(`Started monitoring order ${orderId}`);
  }
  
  // Map database order to LimitOrder interface
  private mapDbOrderToLimitOrder(dbOrder: any): LimitOrder {
    return {
      id: dbOrder.id,
      userId: dbOrder.userId,
      poolAddress: dbOrder.poolAddress,
      tokenIn: dbOrder.tokenIn,
      tokenOut: dbOrder.tokenOut,
      amountIn: BigInt(dbOrder.amountIn),
      targetPrice: dbOrder.targetPrice,
      targetBinId: dbOrder.targetBinId,
      orderType: dbOrder.orderType,
      status: dbOrder.status as OrderStatus,
      createdAt: dbOrder.createdAt,
      expiresAt: dbOrder.expiresAt,
      executedAt: dbOrder.executedAt,
      executionPrice: dbOrder.executionPrice,
      executionAmount: dbOrder.executionAmount ? BigInt(dbOrder.executionAmount) : undefined,
      feesPaid: dbOrder.feesPaid ? BigInt(dbOrder.feesPaid) : undefined,
      transactionSignature: dbOrder.transactionSignature,
    };
  }
}
