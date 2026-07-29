import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const iconSizes = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

const textSizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => (
  <div className={`flex items-center gap-2.5 font-bold tracking-wide select-none bg-transparent ${className}`}>
    <div className={`relative flex items-center justify-center bg-transparent shrink-0 ${iconSizes[size]}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(91,99,246,0.5)]"
      >
        <defs>
          <linearGradient id="cloudiLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bec2ff" />
            <stop offset="50%" stopColor="#5865f2" />
            <stop offset="100%" stopColor="#5b63f6" />
          </linearGradient>
        </defs>

        <path
          d="M 28,68 C 18,68 12,58 16,46 C 18,40 24,36 30,36 C 32,24 44,16 56,18 C 64,20 70,26 72,34 C 80,34 88,42 86,52 C 84,62 76,68 68,68 Z"
          stroke="url(#cloudiLogoGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d="M 32,68 L 50,68 L 50,48 M 50,48 C 50,38 64,38 64,48 C 64,58 50,58 50,58"
          stroke="url(#cloudiLogoGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        <circle cx="28" cy="68" r="4.5" fill="#bec2ff" />
        <circle cx="42" cy="68" r="4.5" fill="#5865f2" />
        <circle cx="42" cy="50" r="4" fill="#5865f2" />
        <circle cx="56" cy="22" r="4.5" fill="#5b63f6" />
        <circle cx="70" cy="46" r="4" fill="#5b63f6" />
      </svg>
    </div>

    {showText && (
      <div className="flex flex-col leading-none bg-transparent">
        <span className={`${textSizes[size]} font-black tracking-wider text-on-surface font-headline`}>
          Cloudi Sync
        </span>
      </div>
    )}
  </div>
);
