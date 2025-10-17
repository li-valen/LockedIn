interface LeaderboardItemProps {
  rank: number;
  name: string;
  hours: number;
  avatar: string;
  isCurrentUser?: boolean;
  userId?: string;
  userEmail?: string;
  onClick?: (userId: string, userName: string, userEmail: string) => void;
}

export function LeaderboardItem({ rank, name, hours, avatar, isCurrentUser, userId, userEmail, onClick }: LeaderboardItemProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-purple-400';
  };

  const getRankGlow = (rank: number) => {
    if (rank === 1) return 'shadow-[0_0_20px_rgba(250,204,21,0.3)]';
    if (rank === 2) return 'shadow-[0_0_15px_rgba(209,213,219,0.2)]';
    if (rank === 3) return 'shadow-[0_0_15px_rgba(251,146,60,0.2)]';
    return '';
  };

  const handleClick = () => {
    if (onClick && userId && userEmail && !isCurrentUser) {
      onClick(userId, name, userEmail);
    }
  };

  return (
    <div 
      className={`group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/5 ring-1 ring-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
          : 'hover:bg-gradient-to-r hover:from-[#3a3a3a] hover:to-[#2d2d2d] cursor-pointer'
      }`}
      onClick={handleClick}
    >
      {/* Corner accent - top left */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30 transition-all group-hover:border-purple-400/60" />
      
      {/* Rank indicator */}
      <div className={`flex items-center justify-center w-8 h-8 ${getMedalColor(rank)} ${getRankGlow(rank)} transition-all`}>
        {rank <= 3 ? (
          <span className="text-xl drop-shadow-[0_0_8px_currentColor]">🏆</span>
        ) : (
          <div className="relative">
            <span className="opacity-60 text-sm">#{rank}</span>
          </div>
        )}
      </div>
      
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/20">
          <span className="text-white">{avatar}</span>
        </div>
        {isCurrentUser && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#2d2d2d] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
        )}
      </div>
      
      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="truncate flex items-center gap-2">
          <span>{name}</span>
          {rank === 1 && (
            <div className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 rounded text-[10px] border border-yellow-400/30">
              TOP
            </div>
          )}
        </div>
        <div className="text-[#a3a3a3] text-sm flex items-center gap-1">
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
          {hours.toFixed(1)}h worked
        </div>
      </div>
      
      {/* Current user badge */}
      {isCurrentUser && (
        <div className="px-2.5 py-1 bg-gradient-to-r from-purple-500/30 to-purple-600/20 text-purple-300 rounded-md text-xs border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
          You
        </div>
      )}
      
      {/* Corner accent - bottom right */}
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30 transition-all group-hover:border-purple-400/60" />
    </div>
  );
}

