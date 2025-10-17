import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Trophy, Target, TrendingUp, User, Mail } from 'lucide-react';
import { DailyStatsService, UserService } from '../../services/firebase';
import { DailyStats, User as FirebaseUser } from '../../types/firebase';

interface ProfileModelProps {
  userId: string;
  userName: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModel({ userId, userName, userEmail, isOpen, onClose }: ProfileModelProps) {
  const [userData, setUserData] = useState<FirebaseUser | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData();
    }
  }, [isOpen, userId]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      console.log('Loading profile data for user:', userId);
      
      // Load user data
      const user = await UserService.getUser(userId);
      console.log('User data loaded:', user);
      setUserData(user);

      // Load weekly stats
      const stats = await DailyStatsService.getUserWeeklyStats(userId);
      console.log('Weekly stats loaded:', stats);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalWeeklyHours = weeklyStats.reduce((total, stat) => total + stat.totalWorkTime, 0) / (1000 * 60 * 60);
  const averageDailyHours = weeklyStats.length > 0 ? totalWeeklyHours / weeklyStats.length : 0;
  const goalAchievedDays = weeklyStats.filter(stat => stat.goalAchieved).length;
  
  // Calculate total work time from all daily stats if user data doesn't have it
  const calculatedTotalWorkTime = userData?.totalWorkTime || 0;
  const totalWorkTimeHours = calculatedTotalWorkTime > 0 ? 
    (calculatedTotalWorkTime / (1000 * 60 * 60)).toFixed(1) : 
    '0.0';

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-[#2d2d2d] via-[#2d2d2d] to-[#252525] rounded-xl w-full max-w-sm border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-4 border-b border-white/10">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-400/30" />
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-sm shadow-lg shadow-purple-500/50 ring-2 ring-purple-400/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-medium text-white truncate">{userName}</h2>
              <p className="text-xs text-[#a3a3a3] truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative bg-gradient-to-br from-purple-600/20 to-purple-700/10 rounded-lg p-3 border border-purple-500/20">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-lg font-mono text-purple-300">{totalWeeklyHours.toFixed(1)}h</div>
                      <div className="text-xs text-[#a3a3a3]">This Week</div>
                    </div>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-blue-600/20 to-blue-700/10 rounded-lg p-3 border border-blue-500/20">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400/30" />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-lg font-mono text-blue-300">{averageDailyHours.toFixed(1)}h</div>
                      <div className="text-xs text-[#a3a3a3]">Daily Avg</div>
                    </div>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-green-600/20 to-green-700/10 rounded-lg p-3 border border-green-500/20">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-400/30" />
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-lg font-mono text-green-300">{goalAchievedDays}</div>
                      <div className="text-xs text-[#a3a3a3]">Goal Days</div>
                    </div>
                  </div>
                </div>

                <div className="relative bg-gradient-to-br from-yellow-600/20 to-yellow-700/10 rounded-lg p-3 border border-yellow-500/20">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-400/30" />
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-lg font-mono text-yellow-300">{userData?.streak || 0}</div>
                      <div className="text-xs text-[#a3a3a3]">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Breakdown */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  This Week's Progress
                </h3>
                <div className="space-y-2">
                  {weeklyStats.length > 0 ? (
                    weeklyStats.map((stat, index) => {
                      const hours = stat.totalWorkTime / (1000 * 60 * 60);
                      const date = new Date(stat.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
                      return (
                        <div key={stat.id} className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-xs font-medium text-purple-300">
                              {dayName}
                            </div>
                            <div>
                              <div className="text-xs text-white">{date.toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono text-purple-300">{hours.toFixed(1)}h</div>
                            {stat.goalAchieved && (
                              <div className="text-xs text-green-400">✓</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-[#a3a3a3] text-sm">
                      No work data available for this week
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-lg p-3 border border-white/5">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30" />
                
                <h4 className="text-xs font-medium text-white mb-2 flex items-center gap-2">
                  <User className="w-3 h-3 text-purple-400" />
                  Profile Info
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">Daily Goal:</span>
                    <span className="text-white">{userData?.dailyGoal || 8}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">Total Work Time:</span>
                    <span className="text-white">{totalWorkTimeHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">Member Since:</span>
                    <span className="text-white">
                      {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">Current Streak:</span>
                    <span className="text-white">{userData?.streak || 0} days</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
