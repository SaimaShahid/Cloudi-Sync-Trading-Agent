import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, Info, ShieldCheck, Star } from 'lucide-react';
import { DEMO_COINS } from '@/data/demoMarketData';
import { useTerminalCoin } from '@/context/TerminalCoinContext';
import { submitManualOrder, fetchOpenTrades, fetchTradeHistory } from '@/api/trades';
import { formatApiError } from '@/lib/apiClient';
import type { ManualOrderResponse, OpenTradesResponse, OrderType, TradeHistoryResponse, TradeSide } from '@/types';

export const TradingTerminal: React.FC = () => {
  const { selectedCoinId, setSelectedCoinId } = useTerminalCoin();
  const selectedCoin = useMemo(
    () => DEMO_COINS.find((coin) => coin.id === selectedCoinId) ?? DEMO_COINS[0],
    [selectedCoinId],
  );

  const [livePrices, setLivePrices] = useState<number[]>(selectedCoin.sparkline);
  const [side, setSide] = useState<TradeSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState('0.01');
  const [limitPrice, setLimitPrice] = useState(selectedCoin.price.toFixed(2));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<ManualOrderResponse | null>(null);

  const [openTrades, setOpenTrades] = useState<OpenTradesResponse | null>(null);
  const [history, setHistory] = useState<TradeHistoryResponse | null>(null);

  useEffect(() => {
    setLivePrices(selectedCoin.sparkline);
    setLimitPrice(selectedCoin.price.toFixed(2));
    setSubmitResult(null);
    setSubmitError(null);
  }, [selectedCoin]);

  // Cosmetic simulated tick — no real market-data feed exists yet.
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(0.0001, last * (1 + (Math.random() - 0.5) * 0.01));
        return [...prev.slice(1), next];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedCoin.id]);

  const loadTrades = () => {
    fetchOpenTrades().then(setOpenTrades).catch(() => undefined);
    fetchTradeHistory().then(setHistory).catch(() => undefined);
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const chartPoints = useMemo(() => {
    const minP = Math.min(...livePrices);
    const maxP = Math.max(...livePrices);
    const range = maxP - minP || 0.0001;
    return livePrices.map((val, idx) => {
      const x = (idx / (livePrices.length - 1)) * 480;
      const y = 230 - ((val - minP) / range) * 170;
      return { x, y };
    });
  }, [livePrices]);

  const svgPath = chartPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const svgAreaPath = chartPoints.length ? `${svgPath} L ${chartPoints[chartPoints.length - 1].x},250 L 0,250 Z` : '';
  const isPositive = selectedCoin.change24h >= 0;
  const currentPrice = livePrices[livePrices.length - 1];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitResult(null);
    setIsSubmitting(true);
    try {
      const result = await submitManualOrder({
        symbol: selectedCoin.symbol,
        side,
        orderType,
        quantity: Number(quantity),
        price: orderType === 'market' ? undefined : Number(limitPrice),
      });
      setSubmitResult(result);
      loadTrades();
    } catch (err) {
      setSubmitError(formatApiError(err, 'Order submission failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 bg-surface-container-low p-3 rounded-xl border border-outline-variant/10 overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Quick Select:</span>
          {DEMO_COINS.slice(0, 6).map((coin) => (
            <button
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCoin.id === coin.id ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{coin.symbol}</span>
              <span className={coin.change24h >= 0 ? 'text-success' : 'text-danger'}>${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Coin metrics */}
        <div className="lg:col-span-3 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-white text-base border border-outline-variant/20 shrink-0">
                  {selectedCoin.symbol.substring(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-on-surface">{selectedCoin.name}</h1>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{selectedCoin.symbol}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">Rank #{selectedCoin.rank}</span>
                </div>
              </div>
              <Star className={`w-4 h-4 ${selectedCoin.isStarred ? 'fill-warning text-warning' : 'text-on-surface-variant'}`} />
            </div>

            <div className="mt-5">
              <div className="text-3xl font-black text-on-surface tracking-tight">
                ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {isPositive ? '+' : ''}
                  {selectedCoin.change24h}% (24h)
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3.5 pt-5 border-t border-outline-variant/10 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Market cap</span>
                <span className="font-bold text-on-surface">${selectedCoin.marketCap.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Volume (24h)</span>
                <span className="font-bold text-on-surface">${selectedCoin.volume24h.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Circulating supply</span>
                <span className="font-bold text-on-surface">{selectedCoin.circulatingSupply}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-success" /> Security Audit (demo)
              </span>
              <span className="text-success font-bold">{selectedCoin.auditScore}%</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-success h-full" style={{ width: `${selectedCoin.auditScore}%` }} />
            </div>
          </div>
        </div>

        {/* Center: Chart */}
        <div className="lg:col-span-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{selectedCoin.symbol}/USD</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-warning/15 text-warning border border-warning/30">
              <Info className="w-3 h-3" /> Simulated feed — market-data integration pending
            </span>
          </div>

          <div className="relative bg-background border border-outline-variant/10 rounded-2xl p-4 h-[320px] overflow-hidden">
            <svg viewBox="0 0 480 250" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="terminalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#16c784' : '#ea3943'} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={isPositive ? '#16c784' : '#ea3943'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="60" x2="480" y2="60" stroke="#292932" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="480" y2="120" stroke="#292932" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="480" y2="180" stroke="#292932" strokeDasharray="3 3" />
              <path d={svgAreaPath} fill="url(#terminalAreaGrad)" />
              <path d={svgPath} fill="none" stroke={isPositive ? '#16c784' : '#ea3943'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right: Order form + trade lists */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-xs font-bold text-on-surface">Trade Execution</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-xl text-xs font-bold">
              <button type="button" onClick={() => setSide('buy')} className={`py-1.5 rounded-lg transition-colors ${side === 'buy' ? 'bg-success text-white' : 'text-on-surface-variant'}`}>
                Buy
              </button>
              <button type="button" onClick={() => setSide('sell')} className={`py-1.5 rounded-lg transition-colors ${side === 'sell' ? 'bg-danger text-white' : 'text-on-surface-variant'}`}>
                Sell
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface rounded-xl text-[11px] font-bold">
                <button type="button" onClick={() => setOrderType('market')} className={`py-1 rounded-lg ${orderType === 'market' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant'}`}>
                  Market
                </button>
                <button type="button" onClick={() => setOrderType('limit')} className={`py-1 rounded-lg ${orderType === 'limit' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant'}`}>
                  Limit
                </button>
              </div>

              <div>
                <label className="text-on-surface-variant block mb-1">Quantity ({selectedCoin.symbol})</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="w-full bg-surface border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface font-mono focus:border-primary outline-none"
                />
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="text-on-surface-variant block mb-1">Limit Price (USD)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={limitPrice}
                    onChange={(event) => setLimitPrice(event.target.value)}
                    className="w-full bg-surface border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface font-mono focus:border-primary outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-xl font-bold text-white transition-all shadow-lg disabled:opacity-60 ${side === 'buy' ? 'bg-success hover:opacity-90' : 'bg-danger hover:opacity-90'}`}
              >
                {isSubmitting ? 'Submitting…' : `Submit ${side.toUpperCase()} ${selectedCoin.symbol}`}
              </button>
            </form>

            {submitError && (
              <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-[11px] flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {submitError}
              </div>
            )}

            {submitResult && (
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-[11px] text-on-surface space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Order accepted by backend
                </div>
                <p className="text-on-surface-variant leading-relaxed">{submitResult.workflow.nextStep}</p>
              </div>
            )}
          </div>

          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 space-y-2 flex-1">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Open Trades
              </span>
              <span className="text-[10px] text-on-surface-variant">{openTrades?.summary.openTradeCount ?? 0}</span>
            </div>
            {!openTrades?.openTrades.length ? (
              <p className="text-[11px] text-on-surface-variant py-3">{openTrades?.integration.message ?? 'No open trades yet.'}</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {openTrades.openTrades.map((trade, index) => (
                  <div key={index} className="p-2 bg-surface rounded-lg text-[11px] font-mono text-on-surface">
                    {JSON.stringify(trade)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
