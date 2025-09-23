'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PoolData {
  address: string;
  tokenMintX: string;
  tokenMintY: string;
  activeId: number;
  binStep: number;
  baseFactor: number;
  protocolShare: number;
  currentPrice: number;
}

interface PoolContextType {
  pools: PoolData[];
  selectedPool: PoolData | null;
  isLoading: boolean;
  error: string | null;
  setSelectedPool: (pool: PoolData | null) => void;
  refreshPools: () => Promise<void>;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const usePool = () => {
  const context = useContext(PoolContext);
  if (!context) {
    throw new Error('usePool must be used within a PoolProvider');
  }
  return context;
};

interface PoolProviderProps {
  children: ReactNode;
}

export const PoolProvider: React.FC<PoolProviderProps> = ({ children }) => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/pools?limit=20');
      if (!response.ok) {
        throw new Error(`Failed to fetch pools: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPools(data.pools || []);
      
      // Auto-select first pool if none selected
      if (!selectedPool && data.pools && data.pools.length > 0) {
        setSelectedPool(data.pools[0]);
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pools';
      setError(message);
      console.error('Error fetching pools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPools = async () => {
    await fetchPools();
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const value: PoolContextType = {
    pools,
    selectedPool,
    isLoading,
    error,
    setSelectedPool,
    refreshPools,
  };

  return (
    <PoolContext.Provider value={value}>
      {children}
    </PoolContext.Provider>
  );
};
