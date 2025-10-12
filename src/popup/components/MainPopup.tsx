import { useState, useEffect } from 'react';
import { Clock, Users, Settings, Award, Zap, Target } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { LeaderboardItem } from './LeaderboardItem';
import { LockIcon } from './LockIcon';
import { signInWithGoogleViaChrome } from '../../lib/auth';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface MainPopupProps {
  onNavigate: (page: string) => void;
}

export function MainPopup({ onNavigate }: MainPopupProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [workData, setWorkData] = useState({
    workTime: 0,
    dailyWorkTime: 0,
    isWorking: false
  });

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Convert milliseconds to hours
  const workHours = workData.dailyWorkTime / (1000 * 60 * 60);
  const targetHours = 8;
  const percentage = Math.min((workHours / targetHours) * 100, 100);

  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', hours: 42, avatar: '👩' },
    { rank: 2, name: 'Alex Morgan', hours: 38, avatar: '👨' },
    { rank: 3, name: 'You', hours: Math.round(workHours), avatar: '😊', isCurrentUser: true },
    { rank: 4, name: 'Jamie Lee', hours: 32, avatar: '🧑' },
    { rank: 5, name: 'Chris Park', hours: 28, avatar: '👤' },
  ];

  // Set up authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch work data from background script
  useEffect(() => {
    const fetchWorkData = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getWorkTime' });
        if (response) {
          setWorkData({
            workTime: response.workTime || 0,
            dailyWorkTime: response.dailyWorkTime || 0,
            isWorking: response.isWorking || false
          });
        }
      } catch (error) {
        console.error('Failed to fetch work data:', error);
      }
    };

    fetchWorkData();
    
    // Update every 5 seconds
    const interval = setInterval(fetchWorkData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      const result = await signInWithGoogleViaChrome();
      const user = result.user;
      console.log('Sign-in successful:', user?.displayName);
      alert(`Welcome, ${user.displayName}!`);
    } catch (error) {
      console.error('Sign-in error:', error);
      alert(`Failed to sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] text-[#e5e5e5] overflow-hidden flex flex-col relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/10 to-transparent animate-scan" />
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#2d2d2d] via-[#2d2d2d] to-[#3a3a3a] p-4 border-b border-white/10 backdrop-blur-xl">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/50" />
        
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
              <LockIcon className="w-4 h-4 text-white" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-lg animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl tracking-wide">LockedIn</h1>
              <div className="h-px w-16 bg-gradient-to-r from-purple-500 to-transparent" />
            </div>
          </div>
          <button 
            onClick={() => onNavigate('settings')}
            className="relative p-2 hover:bg-white/5 rounded-lg transition-all duration-300 group"
          >
            <Settings className="w-5 h-5 text-[#a3a3a3] group-hover:text-purple-400 transition-colors group-hover:rotate-90 duration-300" />
            <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-lg transition-colors" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[#a3a3a3] relative z-10">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="font-mono">{currentTime}</span>
          <div className="ml-auto flex items-center gap-1">
            <Zap className={`w-3 h-3 ${workData.isWorking ? 'text-green-400' : 'text-gray-400'}`} />
            <span className={`text-xs ${workData.isWorking ? 'text-green-400' : 'text-gray-400'}`}>
              {workData.isWorking ? 'Working' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
        {/* Daily Work Counter */}
        <div className="relative bg-gradient-to-br from-[#2d2d2d] via-[#2d2d2d] to-[#252525] rounded-xl p-6 border border-white/5 shadow-2xl overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400/40" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400/40" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-400/40" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-400/40" />
          
          <div className="flex flex-col items-center relative z-10">
            <div className="relative mb-4">
              <CircularProgress percentage={percentage} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl text-white tracking-wider font-mono drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  {workHours.toFixed(1)}
                </div>
                <div className="text-xs text-[#a3a3a3] uppercase tracking-widest">hours</div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <Target className="w-4 h-4 text-purple-400" />
                <div className="text-[#a3a3a3] text-sm">Today's Progress</div>
              </div>
              <div className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                {(targetHours - workHours).toFixed(1)}h remaining to reach goal
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="mt-4 flex gap-2">
              <div className="group relative px-3 py-1.5 bg-gradient-to-r from-purple-500/20 via-purple-600/20 to-purple-700/20 rounded-full border border-purple-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300">
                <Award className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="text-xs text-purple-300 tracking-wide">5 Day Streak</span>
                <div className="absolute inset-0 bg-purple-400/0 group-hover:bg-purple-400/10 rounded-full transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg tracking-wide">Leaderboard</h2>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
          </div>
          <div className="relative flex bg-[#2d2d2d] rounded-lg p-1 border border-white/5 shadow-inner">
            <button
              onClick={() => setPeriod('daily')}
              className={`relative px-4 py-1.5 rounded text-sm transition-all duration-300 ${
                period === 'daily'
                  ? 'text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              {period === 'daily' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded shadow-lg" />
              )}
              <span className="relative z-10">Daily</span>
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`relative px-4 py-1.5 rounded text-sm transition-all duration-300 ${
                period === 'weekly'
                  ? 'text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              {period === 'weekly' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded shadow-lg" />
              )}
              <span className="relative z-10">Weekly</span>
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="relative bg-gradient-to-br from-[#2d2d2d] to-[#252525] rounded-xl p-4 border border-white/5 shadow-2xl overflow-hidden space-y-2">
          {/* Background effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-2">
            {leaderboard.map((user) => (
              <LeaderboardItem key={user.rank} {...user} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button
            onClick={() => setShowAddFriend(true)}
            className="group relative bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 p-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-purple-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Users className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="text-xs relative z-10 tracking-wide">Add Friend</span>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </button>
          
          <button
            onClick={() => onNavigate('settings')}
            className="group relative bg-[#2d2d2d] hover:bg-[#3a3a3a] p-4 rounded-lg transition-all duration-300 border border-white/5 hover:border-purple-500/30 flex flex-col items-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Settings className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs relative z-10 tracking-wide">Settings</span>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30" />
          </button>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="relative bg-gradient-to-br from-[#2d2d2d] via-[#2d2d2d] to-[#252525] rounded-xl p-6 w-full max-w-sm border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/60" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/60" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500/60" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/60" />
            
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Add Friend
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#a3a3a3] mb-2 block tracking-wide">Email or Username</label>
                  <input
                    type="text"
                    placeholder="friend@example.com"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-[#505050]"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="flex-1 bg-[#3a3a3a] hover:bg-[#404040] px-4 py-2.5 rounded-lg transition-all border border-white/5 hover:border-white/10"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                    Add Friend
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-in Button */}
      {!user && (
        <button
          onClick={handleGoogleSignIn}
          className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
