'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import { PoolInfo } from '@/types/order';

interface PoolSelectorProps {
  pools: string[];
  selectedPool: string;
  onPoolSelect: (poolAddress: string) => void;
}

export const PoolSelector: React.FC<PoolSelectorProps> = ({ 
  pools, 
  selectedPool, 
  onPoolSelect 
}) => {
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const apiService = new ApiService();

  useEffect(() => {
    if (selectedPool) {
      loadPoolInfo();
    }
  }, [selectedPool]);

  const loadPoolInfo = async () => {
    if (!selectedPool) return;
    
    setLoading(true);
    try {
      const info = await apiService.getPoolInfo(selectedPool);
      setPoolInfo(info);
      setCurrentPrice(info.currentPrice);
    } catch (error) {
      console.error('Error loading pool info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="border border-neutral-200 rounded-md p-6">
      <h2 className="text-lg font-medium mb-4">
        Select Pool
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Available Pools
          </label>
          <select
            value={selectedPool}
            onChange={(e) => onPoolSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            {pools.map((pool) => (
              <option key={pool} value={pool}>
                {formatAddress(pool)}
              </option>
            ))}
          </select>
        </div>

        {selectedPool && (
          <div className="border-t pt-4">
            <h3 className="text-base font-medium mb-3">
              Pool Information
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="loading-spinner h-6 w-6"></div>
              </div>
            ) : poolInfo ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pool Address:</span>
                  <span className="font-mono text-xs">
                    {formatAddress(poolInfo.address)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Token X:</span>
                  <span className="font-mono text-xs">
                    {formatAddress(poolInfo.tokenMintX)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Token Y:</span>
                  <span className="font-mono text-xs">
                    {formatAddress(poolInfo.tokenMintY)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Active Bin ID:</span>
                  <span className="font-medium">{poolInfo.activeId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Bin Step:</span>
                  <span className="font-medium">{poolInfo.binStep}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Current Price:</span>
                  <span className="font-medium">
                    {currentPrice.toFixed(6)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Base Factor:</span>
                  <span className="font-medium">{poolInfo.baseFactor}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-500">Protocol Share:</span>
                  <span className="font-medium">{poolInfo.protocolShare}%</span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">Failed to load pool information</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
