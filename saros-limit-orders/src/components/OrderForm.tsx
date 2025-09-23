'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ApiService } from '@/services/api';
import toast from 'react-hot-toast';

interface OrderFormProps {
  poolAddress: string;
  onOrderPlaced: (orderId: string) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ poolAddress, onOrderPlaced }) => {
  const { publicKey } = useWallet();
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const apiService = new ApiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || !targetPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get pool info to determine tokens
      const poolInfo = await apiService.getPoolInfo(poolAddress);
      
      // Determine token in/out based on order type
      const tokenIn = orderType === 'buy' ? poolInfo.tokenMintY : poolInfo.tokenMintX;
      const tokenOut = orderType === 'buy' ? poolInfo.tokenMintX : poolInfo.tokenMintY;
      
      // Convert amount to string (BigInt will be handled on server)
      const amountIn = Math.floor(parseFloat(amount) * 1e9).toString();
      
      // Parse target price
      const targetPriceNum = parseFloat(targetPrice);
      
      // Parse expiration date
      const expiresAtDate = expiresAt ? new Date(expiresAt).toISOString() : undefined;
      
      // Place the order
      const orderId = await apiService.placeOrder({
        userId: publicKey.toString(),
        poolAddress,
        tokenIn,
        tokenOut,
        amountIn,
        targetPrice: targetPriceNum,
        orderType,
        expiresAt: expiresAtDate,
      });
      
      onOrderPlaced(orderId);
      
      // Reset form
      setAmount('');
      setTargetPrice('');
      setExpiresAt('');
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(`Error placing order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Order Type
        </label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as 'buy' | 'sell')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          step="0.000001"
          min="0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Target Price
        </label>
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Enter target price"
          step="0.000001"
          min="0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Expires At (Optional)
        </label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
};
