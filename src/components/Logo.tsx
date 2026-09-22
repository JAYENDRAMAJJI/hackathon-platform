import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
  showSubtitle?: boolean;
  variant?: 'dark' | 'light' | 'auto';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  collapsed = false,
  showSubtitle = true,
  variant = 'auto',
  interactive = true,
  onClick,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      // Reload current page without redirecting, preserving route and parameters
      window.location.reload();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick();
      } else {
        window.location.reload();
      }
    }
  };

  // Dimensions configuration based on size
  const sizeConfig = {
    sm: {
      iconSize: 'w-8 h-8 rounded-xl',
      svgSize: 'w-4 h-4',
      strokeWidth: '2.5',
      titleSize: 'text-sm font-black tracking-tight',
      badgeSize: 'text-[9px] px-1.5 py-0.5',
      subtitleSize: 'text-[9px]',
      gap: 'gap-2.5',
    },
    md: {
      iconSize: 'w-10 h-10 rounded-2xl',
      svgSize: 'w-5 h-5',
      strokeWidth: '2.5',
      titleSize: 'text-base sm:text-lg font-black tracking-tight',
      badgeSize: 'text-[10px] px-2 py-0.5',
      subtitleSize: 'text-[10.5px]',
      gap: 'gap-3',
    },
    lg: {
      iconSize: 'w-12 h-12 rounded-2xl',
      svgSize: 'w-6 h-6',
      strokeWidth: '2.5',
      titleSize: 'text-xl sm:text-2xl font-black tracking-tight',
      badgeSize: 'text-[11px] px-2.5 py-0.5',
      subtitleSize: 'text-xs',
      gap: 'gap-3.5',
    },
  };

  const currentSize = sizeConfig[size];

  // Text colors based on variant
  const titleColor =
    variant === 'dark'
      ? 'text-white'
      : variant === 'light'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const subtitleColor =
    variant === 'dark'
      ? 'text-slate-400'
      : variant === 'light'
      ? 'text-slate-500'
      : 'text-slate-500 dark:text-slate-400';

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={interactive ? 'Refresh current page' : undefined}
      aria-label="Hackathon Arena 2.0 - Refresh current page"
      className={`inline-flex items-center ${currentSize.gap} select-none ${
        interactive
          ? 'cursor-pointer group transition-all duration-200 hover:opacity-95 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
          : ''
      } ${className}`}
    >
      {/* Code-bracket icon (<>) in vivid blue-indigo gradient squircle */}
      <div
        className={`relative shrink-0 ${currentSize.iconSize} bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 ${
          interactive ? 'group-hover:shadow-indigo-600/40 group-hover:scale-[1.02]' : ''
        } transition-all duration-200`}
      >
        <svg
          className={currentSize.svgSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={currentSize.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Left bracket < */}
          <polyline points="9 7 4 12 9 17" />
          {/* Right bracket > */}
          <polyline points="15 7 20 12 15 17" />
        </svg>
      </div>

      {/* Typography & Badges Column (strictly 2-line layout matching official reference) */}
      {!collapsed && (
        <div className="flex flex-col text-left leading-none shrink-0 min-w-0">
          {/* Top Line: HACKATHON + ARENA 2.0 Pill Badge (strictly side-by-side, no wrapping) */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`${currentSize.titleSize} uppercase ${titleColor}`}>
              HACKATHON
            </span>

            {/* Official ARENA 2.0 Pill Badge */}
            <span
              className={`inline-flex items-center font-extrabold uppercase tracking-wider rounded-full bg-[#181a38] text-indigo-300 border border-indigo-500/50 shadow-xs whitespace-nowrap ${currentSize.badgeSize}`}
            >
              ARENA 2.0
            </span>
          </div>

          {/* Bottom Line: Subtitle */}
          {showSubtitle && (
            <span
              className={`${currentSize.subtitleSize} font-medium ${subtitleColor} tracking-normal mt-1 whitespace-nowrap truncate`}
            >
              University Coding Competition Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
