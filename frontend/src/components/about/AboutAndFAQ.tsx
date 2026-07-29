import React, { useState } from 'react';
import { ChevronDown, Cpu, HelpCircle, ShieldCheck, Zap } from 'lucide-react';
import { FAQS } from '@/data/demoMarketData';
import { Logo } from '@/components/Logo';

export const AboutAndFAQ: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="border-b border-outline-variant/10 pb-6">
          <Logo size="lg" />
          <p className="text-sm text-on-surface-variant max-w-2xl mt-4 leading-relaxed">
            Cloudi Sync is an AI-assisted cryptocurrency intelligence terminal and paper/live trading engine. It pairs
            real-time account data with automated contract security audits and risk-management tooling, all behind a
            single secured backend gateway.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/10 space-y-2">
            <Zap className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-on-surface text-sm">Realtime Account Sync</h4>
            <p className="text-on-surface-variant text-[11px] leading-normal">
              Dashboard, portfolio, and trade activity stream over authenticated WebSocket channels.
            </p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/10 space-y-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h4 className="font-bold text-on-surface text-sm">Security-First Design</h4>
            <p className="text-on-surface-variant text-[11px] leading-normal">
              JWT-authenticated APIs, rate-limited auth endpoints, and a backend gateway that's the only path to the
              trading engine.
            </p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-outline-variant/10 space-y-2">
            <Cpu className="w-5 h-5 text-primary-fixed" />
            <h4 className="font-bold text-on-surface text-sm">Paper & Live Terminal</h4>
            <p className="text-on-surface-variant text-[11px] leading-normal">
              Test strategies with paper capital using the same execution path that live trading will use.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-on-surface font-headline flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="bg-surface border border-outline-variant/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-surface-container-high/30 transition-colors"
                >
                  <span className="font-bold text-sm text-on-surface">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
