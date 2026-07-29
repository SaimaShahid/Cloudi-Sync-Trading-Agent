import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Search, ShieldCheck, X } from 'lucide-react';
import type { DemoCoin } from '@/types';

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: DemoCoin[];
  onSelectCoin: (coin: DemoCoin) => void;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({ isOpen, onClose, coins, onSelectCoin }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex items-center px-4 py-3.5 border-b border-outline-variant/10 bg-surface">
          <Search className="w-5 h-5 text-primary mr-3" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by coin name or symbol (BTC, ETH, CLOUD)…"
            className="w-full bg-transparent text-sm text-on-surface placeholder-on-surface-variant focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCoins.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-sm">No matching assets found.</div>
          ) : (
            <div className="space-y-1">
              {filteredCoins.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => {
                    onSelectCoin(coin);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-xs text-primary border border-outline-variant/20">
                      {coin.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-on-surface">{coin.name}</span>
                        <span className="text-xs font-mono text-on-surface-variant uppercase">{coin.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-mono">
                        <span>Rank #{coin.rank}</span>
                        <span className="flex items-center gap-1 text-success">
                          <ShieldCheck className="w-3 h-3" /> Audit {coin.auditScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-on-surface">
                      ${coin.price.toLocaleString('en-US', { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}
                    </div>
                    <div className={`flex items-center justify-end text-xs font-mono font-semibold ${coin.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                      {coin.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
