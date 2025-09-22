'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { OrderForm } from '@/components/OrderForm';
import { OrderBook } from '@/components/OrderBook';
import { PoolSelector } from '@/components/PoolSelector';
import { ApiService } from '@/services/api';
import { LimitOrder } from '@/types/order';
import toast from 'react-hot-toast';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [selectedPool, setSelectedPool] = useState<string>('');
  const [userOrders, setUserOrders] = useState<LimitOrder[]>([]);
  const [pools, setPools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const apiService = new ApiService();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && connected && publicKey) {
      loadUserData();
    }
  }, [mounted, connected, publicKey]);

  const loadUserData = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // Load user orders
      const orders = await apiService.getUserOrders(publicKey.toString());
      setUserOrders(orders);
      
      // Load available pools
      const availablePools = await apiService.getAllPools();
      setPools(availablePools);
      
      if (availablePools.length > 0 && !selectedPool) {
        setSelectedPool(availablePools[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPlaced = async (orderId: string) => {
    toast.success(`Order placed successfully! Order ID: ${orderId}`);
    await loadUserData(); // Refresh orders
  };

  const handleOrderCancelled = async (orderId: string) => {
    toast.success('Order cancelled successfully');
    await loadUserData(); // Refresh orders
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Saros Limit Orders
          </h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to start placing limit orders on DLMM pools
          </p>
          <WalletMultiButton className="mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Saros Limit Orders
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pool Selector */}
            <div className="lg:col-span-1">
              <PoolSelector
                pools={pools}
                selectedPool={selectedPool}
                onPoolSelect={setSelectedPool}
              />
            </div>

            {/* Order Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Place Limit Order
                </h2>
                {selectedPool ? (
                  <OrderForm
                    poolAddress={selectedPool}
                    onOrderPlaced={handleOrderPlaced}
                  />
                ) : (
                  <p className="text-gray-500">Please select a pool first</p>
                )}
              </div>
            </div>

            {/* Order Book */}
            <div className="lg:col-span-1">
              <OrderBook
                orders={userOrders}
                onOrderCancelled={handleOrderCancelled}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}