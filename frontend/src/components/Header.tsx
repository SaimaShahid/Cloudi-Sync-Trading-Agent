import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Search, User } from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onOpenSearchModal: () => void;
}

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'text-on-surface bg-surface-container-high font-semibold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
  }`;

export const Header: React.FC<HeaderProps> = ({ onOpenSearchModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/10">
      <div className="max-w-[1700px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <NavLink to={user ? '/app/terminal' : '/'} className="flex items-center gap-2 group focus:outline-none">
            <Logo size="md" showText />
          </NavLink>

          {user && (
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink to="/app/terminal" className={navLinkClasses}>
                Terminal
              </NavLink>
              <NavLink to="/app/markets" className={navLinkClasses}>
                Markets
              </NavLink>
              <NavLink to="/app/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
              <NavLink to="/app/portfolio" className={navLinkClasses}>
                Portfolio
              </NavLink>
              <NavLink to="/app/about" className={navLinkClasses}>
                About & FAQ
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-primary/15 text-primary border border-primary/30">
            Paper Trading Mode
          </span>

          <button
            onClick={onOpenSearchModal}
            className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface px-3.5 py-1.5 rounded-lg text-sm border border-outline-variant/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search coin…</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <NotificationBell />

              <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-surface-container-high border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials || <User className="w-4 h-4" />}
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-on-surface">{user.name}</span>
                  <span className="text-[10px] text-on-surface-variant truncate max-w-[110px]">{user.email}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-on-surface-variant hover:text-danger hover:bg-danger/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-3.5 py-1.5 text-sm font-semibold text-on-surface bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 rounded-lg transition-colors"
              >
                Log In
              </NavLink>
              <NavLink
                to="/register"
                className="px-3.5 py-1.5 text-sm font-semibold text-on-primary bg-primary hover:opacity-90 rounded-lg transition-colors shadow-lg shadow-primary/20"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
