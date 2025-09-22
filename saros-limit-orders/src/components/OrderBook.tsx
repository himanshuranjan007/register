'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LimitOrder } from '@/types/order';
import { ApiService } from '@/services/api';
import toast from 'react-hot-toast';

interface OrderBookProps {
  orders: LimitOrder[];
  onOrderCancelled: (orderId: string) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({ orders, onOrderCancelled }) => {
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
  const apiService = new ApiService();
  const { publicKey } = useWallet();

  const handleCancelOrder = async (orderId: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }
    setCancellingOrders(prev => new Set(prev).add(orderId));
    
    try {
      await apiService.cancelOrder(orderId, publicKey.toString());
      onOrderCancelled(orderId);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(`Error cancelling order: ${error.message}`);
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'filled':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e9).toFixed(6);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(6);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Orders
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No orders found</p>
          <p className="text-sm text-gray-400 mt-2">
            Place your first limit order to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Orders ({orders.length})
      </h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.orderType === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {order.orderType.toUpperCase()}
                </span>
              </div>
              
              {order.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={cancellingOrders.has(order.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  {cancellingOrders.has(order.id) ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium">{formatAmount(order.amountIn)}</span>
              </div>
              
              <div>
                <span className="text-gray-500">Target Price:</span>
                <span className="ml-2 font-medium">{formatPrice(order.targetPrice)}</span>
              </div>
              
              <div>
                <span className="text-gray-500">Pool:</span>
                <span className="ml-2 font-medium text-xs">
                  {order.poolAddress.slice(0, 8)}...{order.poolAddress.slice(-8)}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {order.executionPrice && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">Executed at:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {formatPrice(order.executionPrice)}
                  </span>
                </div>
                {order.transactionSignature && (
                  <div className="text-xs text-gray-400 mt-1">
                    TX: {order.transactionSignature.slice(0, 16)}...
                  </div>
                )}
              </div>
            )}
            
            {order.expiresAt && (
              <div className="mt-2 text-xs text-gray-500">
                Expires: {new Date(order.expiresAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
