import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { TerminalCoinProvider } from '@/context/TerminalCoinContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';
import { LandingPage } from '@/components/landing/LandingPage';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { TradingTerminal } from '@/components/terminal/TradingTerminal';
import { CoinMarketTable } from '@/components/markets/CoinMarketTable';
import { AboutAndFAQ } from '@/components/about/AboutAndFAQ';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <TerminalCoinProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<ClientDashboard />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="terminal" element={<TradingTerminal />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="markets" element={<CoinMarketTable />} />
                <Route path="about" element={<AboutAndFAQ />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TerminalCoinProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
