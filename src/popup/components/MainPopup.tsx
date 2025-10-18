import { useState, useEffect } from 'react';
import { Clock, Users, Settings, Award, Zap, Target } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { LeaderboardItem } from './LeaderboardItem';
import { LockIcon } from './LockIcon';
import { ProfileModel } from './ProfileModel';
import { signInWithGoogleViaChrome } from '../../lib/auth';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserService, WorkSessionService, DailyStatsService, LeaderboardService, FriendService } from '../../services/firebase';
import { LeaderboardEntry } from '../../types/firebase';

interface MainPopupProps {
  onNavigate: (page: string) => void;
}

export function MainPopup({ onNavigate }: MainPopupProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workData, setWorkData] = useState({
    workTime: 0,
    dailyWorkTime: 0,
    isWorking: false
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [userStreak, setUserStreak] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(3);

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Convert milliseconds to hours
  const workHours = todayStats ? todayStats.totalWorkTime / (1000 * 60 * 60) : workData.dailyWorkTime / (1000 * 60 * 60);
  const targetHours = dailyGoal;
  const percentage = Math.min((workHours / targetHours) * 100, 100);

  // Set up authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Set user ID in background script
        chrome.runtime.sendMessage({ action: 'setUserId', userId: user.uid });
        
        // Create user document if it doesn't exist
        try {
          const existingUser = await UserService.getUser(user.uid);
          if (!existingUser) {
            await UserService.createUser({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Anonymous',
              photoURL: user.photoURL || undefined
            });
          }
        } catch (error) {
          console.error('Error creating user:', error);
        }
        
        // Load today's stats
        try {
          const stats = await DailyStatsService.getTodayStats(user.uid);
          setTodayStats(stats);
        } catch (error) {
          console.error('Error loading today stats:', error);
        }

        // Load user streak and daily goal
        try {
          const userData = await UserService.getUserWithStreak(user.uid);
          if (userData) {
            setUserStreak(userData.streak);
            setDailyGoal(userData.dailyGoal);
          }
        } catch (error) {
          console.error('Error loading user streak:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for sync messages from background script
  useEffect(() => {
    const handleMessage = async (message: any) => {
      if (message.action === 'syncDailyStats' && user) {
        try {
          await DailyStatsService.updateDailyStats(user.uid, message.dailyWorkTime, 'extension');
          // Refresh today's stats
          const stats = await DailyStatsService.getTodayStats(user.uid);
          setTodayStats(stats);
          
          // Refresh user streak and daily goal
          const userData = await UserService.getUserWithStreak(user.uid);
          if (userData) {
            setUserStreak(userData.streak);
            setDailyGoal(userData.dailyGoal);
          }
          
          // Leaderboard will auto-update via the real-time subscription
        } catch (error) {
          console.error('Error syncing daily stats:', error);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [user]);


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
        // Only log error if it's not a connection issue
        if (!(error instanceof Error && error.message?.includes('Could not establish connection'))) {
          console.error('Failed to fetch work data:', error);
        }
      }
    };

    fetchWorkData();
    
    // Update every 2 seconds for more responsive UI
    const interval = setInterval(fetchWorkData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time leaderboard updates
  useEffect(() => {
    if (!user) {
      setLeaderboard([]);
      setLeaderboardError(null);
      setLeaderboardLoading(false);
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError(null);

    try {
      const unsubscribe = LeaderboardService.subscribeToLeaderboard(
        period, 
        (entries) => {
          setLeaderboard(entries);
          setLeaderboardLoading(false);
          setLeaderboardError(null);
        }, 
        user.uid
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error subscribing to leaderboard:', error);
      setLeaderboardError('Failed to load leaderboard');
      setLeaderboard([]);
      setLeaderboardLoading(false);
    }
  }, [period, user]);

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      
      const result = await signInWithGoogleViaChrome();
      const user = result.user;
      console.log('Sign-in successful:', user?.displayName);
      
      // Show success message
      if (user?.displayName) {
        alert(`Welcome, ${user.displayName}!`);
      } else {
        alert('Successfully signed in!');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Sign-in failed: ${errorMessage}`);
    }
  };

  const handleAddFriend = async () => {
    if (!friendEmail.trim() || !user || isAddingFriend) {
      return;
    }

    setIsAddingFriend(true);
    try {
      await FriendService.sendFriendRequest(user.uid, friendEmail.trim());
      setFriendEmail('');
      setShowAddFriend(false);
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send request';
      if (errorMessage.includes('already sent')) {
        alert('Friend request already sent to this user!');
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleProfileClick = (userId: string, userName: string, userEmail: string) => {
    setSelectedProfile({ userId, userName, userEmail });
    setShowProfile(true);
  };

  const closeProfile = () => {
    setShowProfile(false);
    setSelectedProfile(null);
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
          <div className="flex items-center gap-4">
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

      <div className="flex-1 overflow-y-auto overflow-x-visible p-4 space-y-6 relative z-10">
        {/* Daily Work Counter */}
        <div className="relative bg-gradient-to-br from-[#2d2d2d] via-[#2d2d2d] to-[#252525] rounded-xl p-6 border border-white/5 shadow-2xl overflow-visible">
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
                {workHours >= targetHours 
                  ? "🎉 Goal Accomplished!" 
                  : `${(targetHours - workHours).toFixed(1)}h remaining to reach goal`
                }
              </div>
              {userStreak > 0 && (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1 justify-center">
                  <Award className="w-3 h-3" />
                  {userStreak} day streak
                </div>
              )}
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
            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#a3a3a3] text-sm">Loading leaderboard...</span>
                </div>
              </div>
            ) : leaderboardError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="text-red-400 text-sm">⚠️ {leaderboardError}</div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="text-[#a3a3a3] text-sm">No data available yet</div>
                  <div className="text-[#666] text-xs">Start working on tracked sites to appear on the leaderboard!</div>
                  <div className="text-[#666] text-xs">Add friends to see their progress too!</div>
                </div>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <LeaderboardItem 
                  key={entry.userId} 
                  rank={entry.rank}
                  name={entry.userName}
                  hours={entry.totalWorkTime / (1000 * 60 * 60)}
                  avatar="😊"
                  isCurrentUser={entry.userId === user?.uid}
                  userId={entry.userId}
                  userEmail={entry.userEmail}
                  onClick={handleProfileClick}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 pb-4">
          {/* Primary Actions Row */}
          <div className="grid grid-cols-2 gap-3">
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
              className="group relative bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 p-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex flex-col items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Settings className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-xs relative z-10 tracking-wide">Settings</span>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </button>
          </div>

        </div>

        {/* Sign-in Prompt for non-authenticated users */}
        {!user && (
          <div className="relative bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl p-4 border border-blue-500/30 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <h3 className="text-lg font-medium text-blue-300">Sign in to unlock features</h3>
              </div>
              <p className="text-sm text-blue-200/80">
                Connect with friends, track your progress, and compete on the leaderboard
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        )}
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
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
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
                  <button 
                    onClick={handleAddFriend}
                    disabled={isAddingFriend}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingFriend ? 'Adding...' : 'Add Friend'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-in Button */}
      {!user && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleGoogleSignIn}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* Profile Model */}
      {showProfile && selectedProfile && (
        <ProfileModel
          userId={selectedProfile.userId}
          userName={selectedProfile.userName}
          userEmail={selectedProfile.userEmail}
          isOpen={showProfile}
          onClose={closeProfile}
        />
      )}
    </div>
  );
}
