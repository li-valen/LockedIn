interface LockIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'minimal';
}

export function LockIcon({ 
  className = "w-[45px] h-[45px]", 
  size = 'md',
  variant = 'gradient'
}: LockIconProps) {
  const sizeClasses = {
    sm: 'w-[32px] h-[32px]',
    md: 'w-[45px] h-[45px]',
    lg: 'w-[60px] h-[60px]'
  };

  const iconSizes = {
    sm: 'w-[18px] h-[18px]',
    md: 'w-[24px] h-[24px]',
    lg: 'w-[32px] h-[32px]'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 shadow-lg shadow-purple-500/30';
      case 'minimal':
        return 'bg-purple-600/20 border border-purple-500/30';
      default:
        return 'bg-purple-600';
    }
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} flex items-center justify-center
        ${getVariantClasses()}
        rounded-xl cursor-pointer
        transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40
        ${className}
      `}
    >
      <svg
        className={`${iconSizes[size]} text-white`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lock body */}
        <rect
          x="6"
          y="10"
          width="12"
          height="8"
          rx="2"
          ry="2"
          fill="currentColor"
          className="drop-shadow-sm"
        />
        {/* Lock shackle */}
        <path
          d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Keyhole */}
        <circle
          cx="12"
          cy="13"
          r="1.5"
          fill="white"
          opacity="0.9"
        />
        <rect
          x="11.5"
          y="13"
          width="1"
          height="2"
          fill="white"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
