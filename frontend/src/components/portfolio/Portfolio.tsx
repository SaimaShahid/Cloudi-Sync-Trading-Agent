import React, { useEffect, useState } from 'react';
import { AlertCircle, Briefcase, PieChart } from 'lucide-react';
import { fetchPortfolioHoldings, fetchPortfolioSummary } from '@/api/portfolio';
import { formatApiError } from '@/lib/apiClient';
import { useSocket } from '@/context/SocketContext';
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS } from '@/lib/socket';
import type { PortfolioHoldings, PortfolioSummary } from '@/types';

const formatMoney = (value: number | null) =>
  value === null ? '—' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const Portfolio: React.FC = () => {
  const socket = useSocket();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHoldings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = () => {
    Promise.all([fetchPortfolioSummary(), fetchPortfolioHoldings()])
      .then(([summaryData, holdingsData]) => {
        setSummary(summaryData);
        setHoldings(holdingsData);
        setError(null);
      })
      .catch((err) => setError(formatApiError(err, 'Could not load portfolio data. Please try again.')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    socket.emit(SOCKET_CLIENT_EVENTS.PORTFOLIO_SUBSCRIBE);
    const handleRefresh = () => loadAll();
    socket.on(SOCKET_SERVER_EVENTS.PORTFOLIO_UPDATE, handleRefresh);
    return () => {
      socket.emit(SOCKET_CLIENT_EVENTS.PORTFOLIO_UNSUBSCRIBE);
      socket.off(SOCKET_SERVER_EVENTS.PORTFOLIO_UPDATE, handleRefresh);
    };
  }, [socket]);

  if (isLoading) {
    return <div className="p-10 text-center text-sm text-on-surface-variant">Loading portfolio…</div>;
  }

  if (error || !summary || !holdings) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> {error ?? 'Portfolio data unavailable.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
        <h1 className="text-xl lg:text-2xl font-black text-on-surface font-headline flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" /> Crypto Portfolio Holdings
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">Real-time allocation, valuation, and P&L for your account.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-outline-variant/10">
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/10">
            <span className="text-on-surface-variant text-[10px] uppercase font-mono block">Total Equity</span>
            <span className="text-2xl font-black font-mono text-on-surface">{formatMoney(summary.summary.totalEquity)}</span>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/10">
            <span className="text-on-surface-variant text-[10px] uppercase font-mono block">Available Cash</span>
            <span className="text-2xl font-black font-mono text-on-surface">{formatMoney(summary.summary.availableCash)}</span>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/10">
            <span className="text-on-surface-variant text-[10px] uppercase font-mono block">Unrealized P&L</span>
            <span
              className={`text-2xl font-black font-mono ${
                summary.summary.unrealizedPnl && summary.summary.unrealizedPnl >= 0 ? 'text-success' : summary.summary.unrealizedPnl ? 'text-danger' : 'text-on-surface'
              }`}
            >
              {formatMoney(summary.summary.unrealizedPnl)}
            </span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-surface rounded-xl border border-outline-variant/10 text-[11px] text-on-surface-variant">
          {summary.integration.message}
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" /> Asset Holdings
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">{holdings.totals.holdingsCount} assets</span>
        </div>

        {holdings.holdings.length === 0 ? (
          <div className="p-10 text-center text-xs text-on-surface-variant">
            No holdings yet. {holdings.integration.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface text-on-surface-variant uppercase tracking-wider text-[11px] border-b border-outline-variant/10">
                <tr>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4 text-right">Avg Price</th>
                  <th className="py-3.5 px-4 text-right">Market Value</th>
                  <th className="py-3.5 px-4 text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface font-medium">
                {holdings.holdings.map((holding, index) => (
                  <tr key={index} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-4 px-4 font-bold">{holding.symbol}</td>
                    <td className="py-4 px-4 text-right">{holding.quantity ?? '—'}</td>
                    <td className="py-4 px-4 text-right">{holding.averagePrice ?? '—'}</td>
                    <td className="py-4 px-4 text-right">{holding.marketValue ?? '—'}</td>
                    <td className="py-4 px-4 text-right">{holding.unrealizedPnl ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
