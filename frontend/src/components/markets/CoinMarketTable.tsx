import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Info, Search, ShieldCheck, Star, TrendingUp, Zap } from 'lucide-react';
import { DEMO_COINS } from '@/data/demoMarketData';
import { useTerminalCoin } from '@/context/TerminalCoinContext';

export const CoinMarketTable: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCoinId } = useTerminalCoin();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredCoins = DEMO_COINS.filter((coin) => {
    const matchesCategory = activeCategory === 'all' || coin.category === activeCategory;
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openInTerminal = (coinId: string) => {
    setSelectedCoinId(coinId);
    navigate('/app/terminal');
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-on-surface font-headline flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" /> Cryptocurrency Markets
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">Browse assets, then trade the ones your account actually holds in the Terminal.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search cryptocurrency…"
              className="w-full bg-surface border border-outline-variant/20 rounded-xl pl-9 pr-3 py-2 text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-warning/15 text-warning border border-warning/30">
            <Info className="w-3.5 h-3.5" /> Demo Data — live feed pending
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-outline-variant/10">
          {(['all', 'ai_cloud', 'layer1', 'defi', 'infrastructure'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === category
                  ? 'bg-primary text-on-primary shadow'
                  : 'bg-surface text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
              }`}
            >
              {category === 'all' ? 'All Assets' : category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface text-on-surface-variant uppercase tracking-wider text-[11px] border-b border-outline-variant/10">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">★</th>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">24h %</th>
                <th className="py-3.5 px-4 text-right">Market Cap</th>
                <th className="py-3.5 px-4 text-center">Audit</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface font-medium">
              {filteredCoins.map((coin) => (
                <tr key={coin.id} className="hover:bg-surface-container-high/40 transition-colors cursor-pointer" onClick={() => openInTerminal(coin.id)}>
                  <td className="py-4 px-4 text-center">
                    <Star className={`w-4 h-4 mx-auto ${coin.isStarred ? 'fill-warning text-warning' : 'text-on-surface-variant'}`} />
                  </td>
                  <td className="py-4 px-4 text-center text-on-surface-variant">{coin.rank}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center font-bold text-xs text-primary">
                        {coin.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface font-body">{coin.name}</span>
                          <span className="text-xs font-mono text-on-surface-variant uppercase">{coin.symbol}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant uppercase">{coin.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-sm">
                    ${coin.price.toLocaleString('en-US', { minimumFractionDigits: coin.price < 1 ? 4 : 2 })}
                  </td>
                  <td className={`py-4 px-4 text-right font-bold ${coin.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {coin.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold">${coin.marketCap.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success border border-success/30 rounded-lg text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> {coin.auditScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center" onClick={(event) => event.stopPropagation()}>
                    <button
                      onClick={() => openInTerminal(coin.id)}
                      className="px-3 py-1.5 bg-primary hover:opacity-90 text-on-primary rounded-lg font-bold text-xs flex items-center justify-center gap-1 mx-auto shadow transition-all"
                    >
                      <Zap className="w-3 h-3" /> Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
