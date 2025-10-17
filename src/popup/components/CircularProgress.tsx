interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ 
  percentage, 
  size = 160, 
  strokeWidth = 8 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center p-8">
      {/* Outer glow effect - extends beyond the circle */}
      <div 
        className="absolute rounded-full bg-purple-500/20 blur-3xl animate-pulse"
        style={{
          width: size + 40,
          height: size + 40,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Secondary glow effect */}
      <div 
        className="absolute rounded-full bg-purple-400/30 blur-2xl"
        style={{
          width: size + 20,
          height: size + 20,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Rotating background rings */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute top-0 left-1/2 w-1 h-1 bg-purple-400/50 rounded-full -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400/30 rounded-full -translate-x-1/2" />
      </div>
      
      <svg width={size} height={size} className="rotate-[-90deg] relative z-10">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(107, 70, 193, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Secondary glow ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#glowGradient)"
          strokeWidth={strokeWidth + 4}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="opacity-40"
          filter="url(#glowFilter)"
        />
        
        {/* Main progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
          filter="url(#mainGlowFilter)"
        />
        
        {/* Inner decorative ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 15}
          stroke="rgba(168, 85, 247, 0.2)"
          strokeWidth={1}
          fill="none"
          strokeDasharray="4 4"
          className="animate-spin-slow"
        />
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          
          {/* Glow filters */}
          <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="mainGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-purple-400/50" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-purple-400/50" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-purple-400/50" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-purple-400/50" />
    </div>
  );
}

