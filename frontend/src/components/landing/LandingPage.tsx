import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Bell, PieChart, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBarModal } from '@/components/SearchBarModal';
import { DEMO_COINS } from '@/data/demoMarketData';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'AI-Assisted Trading Terminal',
    description: 'Submit paper or live orders through a single execution path, with real-time order status streamed straight to your terminal.',
  },
  {
    icon: ShieldCheck,
    title: 'Automated Security Audits',
    description: 'Contract-level honeypot, tax, and liquidity-lock scanning designed to keep capital preservation front and center.',
  },
  {
    icon: PieChart,
    title: 'Live Portfolio & Dashboard',
    description: 'Track equity, PnL, and open positions from an authenticated dashboard backed by a secured Node.js gateway.',
  },
];

const STEPS = [
  { title: 'Create your account', description: 'Sign up with your email — your JWT-secured session unlocks the full terminal.' },
  { title: 'Trade in Paper Mode', description: 'Practice order execution and risk allocation with virtual capital, no real funds at risk.' },
  { title: 'Track everything live', description: 'Dashboard, portfolio, and notifications update in real time over authenticated WebSockets.' },
  { title: 'Graduate to live trading', description: 'When you\'re ready, the same execution path carries over to live-market orders.' },
];

export const LandingPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">
      <Header onOpenSearchModal={() => setIsSearchOpen(true)} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 lg:px-8 py-20 lg:py-28">
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(91,99,246,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(88,101,242,0.2), transparent 45%)',
          }} />
          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> AI Trading & Security Terminal
            </span>
            <h1 className="text-4xl lg:text-6xl font-black font-headline tracking-tight text-on-surface">
              Trade Smarter With <span className="text-primary">Cloudi Sync</span>
            </h1>
            <p className="text-base lg:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              A single secured gateway for paper and live crypto trading, real-time portfolio tracking, and automated
              contract security audits — built for traders who want capital preservation first.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/30 transition-all"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded-xl border border-outline-variant/20 transition-all"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 lg:px-8 py-16 bg-surface-container-low/40">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-on-surface font-headline">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-black font-headline text-center text-on-surface mb-10">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-2">
                  <span className="text-xs font-mono font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="text-sm font-bold text-on-surface">{step.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary highlights */}
        <section className="px-4 lg:px-8 py-16 bg-surface-container-low/40">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <Wallet className="w-6 h-6 text-primary mx-auto" />
              <p className="text-sm font-bold text-on-surface">Paper & Live Modes</p>
            </div>
            <div className="space-y-2">
              <Bell className="w-6 h-6 text-primary mx-auto" />
              <p className="text-sm font-bold text-on-surface">Realtime Notifications</p>
            </div>
            <div className="space-y-2">
              <ShieldCheck className="w-6 h-6 text-primary mx-auto" />
              <p className="text-sm font-bold text-on-surface">JWT-Secured Sessions</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 lg:px-8 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl lg:text-3xl font-black font-headline text-on-surface">Ready to put an AI in your trading desk?</h2>
            <p className="text-sm text-on-surface-variant">Create your account and start paper trading in minutes.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-on-primary font-bold rounded-xl shadow-lg shadow-primary/30 transition-all"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        coins={DEMO_COINS}
        onSelectCoin={() => setIsSearchOpen(false)}
      />
    </div>
  );
};
