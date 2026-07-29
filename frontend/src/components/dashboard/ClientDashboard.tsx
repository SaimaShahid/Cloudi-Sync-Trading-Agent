import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, Clock, PieChart, ShieldCheck, TrendingUp, Wallet, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDashboardSummary } from '@/api/dashboard';
import { fetchPortfolioHoldings } from '@/api/portfolio';
import { fetchTradeHistory } from '@/api/trades';
import { formatApiError } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS } from '@/lib/socket';
import type { DashboardSummary, PortfolioHoldings, TradeHistoryResponse } from '@/types';

const formatMoney = (value: number | null) =>
  value === null ? '—' : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHoldings | null>(null);
  const [history, setHistory] = useState<TradeHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = () => {
    Promise.all([fetchDashboardSummary(), fetchPortfolioHoldings(), fetchTradeHistory()])
      .then(([dashboardData, holdingsData, historyData]) => {
        setDashboard(dashboardData);
        setHoldings(holdingsData);
        setHistory(historyData);
        setError(null);
      })
      .catch((err) => setError(formatApiError(err, 'Could not load dashboard data. Please try again.')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    socket.emit(SOCKET_CLIENT_EVENTS.DASHBOARD_SUBSCRIBE);
    socket.emit(SOCKET_CLIENT_EVENTS.PORTFOLIO_SUBSCRIBE);
    socket.emit(SOCKET_CLIENT_EVENTS.TRADE_SUBSCRIBE);

    const handleRefresh = () => loadAll();

    socket.on(SOCKET_SERVER_EVENTS.DASHBOARD_UPDATE, handleRefresh);
    socket.on(SOCKET_SERVER_EVENTS.PORTFOLIO_UPDATE, handleRefresh);
    socket.on(SOCKET_SERVER_EVENTS.TRADE_UPDATE, handleRefresh);

    return () => {
      socket.emit(SOCKET_CLIENT_EVENTS.DASHBOARD_UNSUBSCRIBE);
      socket.emit(SOCKET_CLIENT_EVENTS.PORTFOLIO_UNSUBSCRIBE);
      socket.emit(SOCKET_CLIENT_EVENTS.TRADE_UNSUBSCRIBE);
      socket.off(SOCKET_SERVER_EVENTS.DASHBOARD_UPDATE, handleRefresh);
      socket.off(SOCKET_SERVER_EVENTS.PORTFOLIO_UPDATE, handleRefresh);
      socket.off(SOCKET_SERVER_EVENTS.TRADE_UPDATE, handleRefresh);
    };
  }, [socket]);

  if (isLoading) {
    return <div className="p-10 text-center text-sm text-on-surface-variant">Loading dashboard…</div>;
  }

  if (error || !dashboard) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> {error ?? 'Dashboard data unavailable.'}
      </div>
    );
  }

  const isEngineLive = dashboard.metadata.sources.tradingEngine === 'live';

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 rounded-md uppercase">
                {dashboard.overview.tradingMode}
              </span>
              <span className="text-xs text-success font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Session
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-on-surface font-headline">Client Analytics Dashboard</h1>
            <p className="text-xs text-on-surface-variant mt-1 font-mono">
              Welcome back, <span className="text-on-surface font-bold">{user?.name}</span> ({user?.email})
            </p>
          </div>
          <Link
            to="/app/terminal"
            className="px-4 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all w-fit"
          >
            <Zap className="w-4 h-4" /> Launch Terminal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-on-surface-variant mb-2 font-mono text-xs uppercase">
            <span>Portfolio Value</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black font-mono text-on-surface">{formatMoney(dashboard.overview.portfolioValue)}</div>
          <div className="text-[11px] font-mono text-on-surface-variant mt-1">Open positions: {dashboard.overview.openPositions}</div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-on-surface-variant mb-2 font-mono text-xs uppercase">
            <span>Daily P&L</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className={`text-2xl font-black font-mono ${dashboard.overview.dailyPnl && dashboard.overview.dailyPnl >= 0 ? 'text-success' : dashboard.overview.dailyPnl ? 'text-danger' : 'text-on-surface'}`}>
            {formatMoney(dashboard.overview.dailyPnl)}
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant mt-1">Active strategies: {dashboard.overview.activeStrategies}</div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-on-surface-variant mb-2 font-mono text-xs uppercase">
            <span>Trading Engine</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className={`text-lg font-black font-mono uppercase ${isEngineLive ? 'text-success' : 'text-warning'}`}>{dashboard.tradingEngine.status}</div>
          <div className="text-[11px] font-mono text-on-surface-variant mt-1">{dashboard.tradingEngine.message}</div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-on-surface-variant mb-2 font-mono text-xs uppercase">
            <span>Unread Notifications</span>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black font-mono text-on-surface">{dashboard.notifications.unreadCount}</div>
          <div className="text-[11px] font-mono text-on-surface-variant mt-1">{dashboard.notifications.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Holdings
            </h3>
            <span className="text-xs font-mono text-on-surface-variant">{holdings?.totals.holdingsCount ?? 0} assets</span>
          </div>

          {!holdings?.holdings.length ? (
            <div className="p-6 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/20 rounded-xl">
              No holdings yet. {holdings?.integration.message}
            </div>
          ) : (
            <div className="space-y-2">
              {holdings.holdings.map((holding, index) => (
                <div key={index} className="p-3 bg-surface border border-outline-variant/10 rounded-xl text-xs font-mono text-on-surface">
                  {JSON.stringify(holding)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Trade History
            </h3>
            <span className="text-xs font-mono text-on-surface-variant">{history?.summary.totalTrades ?? 0} trades</span>
          </div>

          {!history?.trades.length ? (
            <div className="p-6 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/20 rounded-xl">
              No trades yet. {history?.integration.message}
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {history.trades.map((trade, index) => (
                <div key={index} className="p-3 bg-surface border border-outline-variant/10 rounded-xl text-xs font-mono text-on-surface">
                  {JSON.stringify(trade)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Integration Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          {Object.entries(dashboard.metadata.sources).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/10">
              <span className="text-on-surface-variant capitalize">{key}</span>
              <span className={value === 'live' ? 'text-success font-bold' : 'text-warning font-bold'}>{value}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">{dashboard.marketSnapshot.message}</p>
      </div>
    </div>
  );
};
