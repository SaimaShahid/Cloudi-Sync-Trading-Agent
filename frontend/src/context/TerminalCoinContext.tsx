import React, { createContext, useContext, useMemo, useState } from 'react';
import { DEMO_COINS } from '@/data/demoMarketData';

interface TerminalCoinContextValue {
  selectedCoinId: string;
  setSelectedCoinId: (coinId: string) => void;
}

const TerminalCoinContext = createContext<TerminalCoinContextValue | undefined>(undefined);

export const TerminalCoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCoinId, setSelectedCoinId] = useState<string>(DEMO_COINS[0]?.id ?? 'bitcoin');

  const value = useMemo(() => ({ selectedCoinId, setSelectedCoinId }), [selectedCoinId]);

  return <TerminalCoinContext.Provider value={value}>{children}</TerminalCoinContext.Provider>;
};

export const useTerminalCoin = (): TerminalCoinContextValue => {
  const context = useContext(TerminalCoinContext);
  if (!context) {
    throw new Error('useTerminalCoin must be used within a TerminalCoinProvider');
  }
  return context;
};
