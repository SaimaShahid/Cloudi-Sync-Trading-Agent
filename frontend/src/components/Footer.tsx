import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Globe, MessageCircle, Twitter } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => (
  <footer className="w-full bg-surface border-t border-outline-variant/10 text-on-surface-variant text-xs pt-10 pb-8 mt-12">
    <div className="max-w-[1700px] mx-auto px-4 lg:px-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Logo size="md" showText />
          <p className="text-on-surface-variant leading-relaxed max-w-sm">
            Cloudi Sync provides real-time cryptocurrency price tracking, market analytics, smart contract security
            audits, and an interactive paper/live trading terminal.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:text-on-surface transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:text-on-surface transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:text-on-surface transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:text-on-surface transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-on-surface uppercase text-[11px] tracking-wider mb-3">Products</h4>
          <ul className="space-y-2">
            <li><Link to="/app/terminal" className="hover:text-on-surface transition-colors">Trading Terminal</Link></li>
            <li><Link to="/app/markets" className="hover:text-on-surface transition-colors">Markets</Link></li>
            <li><Link to="/app/dashboard" className="hover:text-on-surface transition-colors">Client Dashboard</Link></li>
            <li><Link to="/app/portfolio" className="hover:text-on-surface transition-colors">Portfolio Tracker</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-on-surface uppercase text-[11px] tracking-wider mb-3">Security</h4>
          <ul className="space-y-2">
            <li>Audit Scanner</li>
            <li>Honeypot Detector</li>
            <li>Liquidity Locks</li>
            <li>Verified Contracts</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-on-surface uppercase text-[11px] tracking-wider mb-3">Support & Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/app/about" className="hover:text-on-surface transition-colors">About & FAQ</Link></li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-on-surface-variant">
        <div>© {new Date().getFullYear()} Cloudi Sync. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            All Systems Operational
          </span>
        </div>
      </div>
    </div>
  </footer>
);
