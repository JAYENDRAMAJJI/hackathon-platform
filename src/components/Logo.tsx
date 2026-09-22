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
      iconSize: 'w-7.5 h-7.5 rounded-lg',
      svgSize: 'w-4 h-4',
      strokeWidth: '2.5',
      titleSize: 'text-xs font-black tracking-tight',
      badgeSize: 'text-[8.5px] px-1.5 py-0.5 font-bold',
      subtitleSize: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      iconSize: 'w-9 h-9 rounded-xl',
      svgSize: 'w-4.5 h-4.5',
      strokeWidth: '2.5',
      titleSize: 'text-sm font-black tracking-tight',
      badgeSize: 'text-[9px] px-1.5 py-0.5 font-bold',
      subtitleSize: 'text-[10px]',
      gap: 'gap-2.5',
    },
    lg: {
      iconSize: 'w-11 h-11 rounded-2xl',
      svgSize: 'w-5.5 h-5.5',
      strokeWidth: '2.5',
      titleSize: 'text-xl font-black tracking-tight',
      badgeSize: 'text-[10.5px] px-2 py-0.5 font-extrabold',
      subtitleSize: 'text-xs',
      gap: 'gap-3',
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
      className={`inline-flex items-center ${currentSize.gap} select-none min-w-0 max-w-full ${
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
        <div className="flex flex-col text-left leading-none min-w-0 flex-1 overflow-hidden">
          {/* Top Line: HACKATHON + ARENA 2.0 Pill Badge (strictly side-by-side, no wrapping) */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`${currentSize.titleSize} uppercase ${titleColor} tracking-tight`}>
              HACKATHON
            </span>

            {/* Official ARENA 2.0 Pill Badge */}
            <span
              className={`inline-flex items-center uppercase tracking-wider rounded-full bg-[#181a38] text-indigo-300 border border-indigo-500/40 shadow-xs whitespace-nowrap shrink-0 ${currentSize.badgeSize}`}
            >
              ARENA 2.0
            </span>
          </div>

          {/* Bottom Line: Subtitle */}
          {showSubtitle && (
            <span
              className={`${currentSize.subtitleSize} font-medium ${subtitleColor} tracking-tight mt-1 whitespace-nowrap truncate block max-w-full`}
              title="University Coding Competition Platform"
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

