import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchBarModal } from './SearchBarModal';
import { DEMO_COINS } from '@/data/demoMarketData';
import { useTerminalCoin } from '@/context/TerminalCoinContext';

export const AppLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setSelectedCoinId } = useTerminalCoin();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">
      <Header onOpenSearchModal={() => setIsSearchOpen(true)} />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />

      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        coins={DEMO_COINS}
        onSelectCoin={(coin) => {
          setSelectedCoinId(coin.id);
          navigate('/app/terminal');
        }}
      />
    </div>
  );
};
