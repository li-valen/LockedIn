import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, User, Globe, Bell, Users, Award, CheckCircle, Sparkles } from 'lucide-react';
import { Switch } from './ui/switch';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'sites' | 'friends' | 'profile' | 'notifications'>('sites');
  const [newSite, setNewSite] = useState('');
  const [newFriend, setNewFriend] = useState('');
  
  const [workSites, setWorkSites] = useState<string[]>([]);

  const [friends, setFriends] = useState([
    { id: 1, name: 'Sarah Chen', email: 'sarah@example.com', avatar: '👩' },
    { id: 2, name: 'Alex Morgan', email: 'alex@example.com', avatar: '👨' },
    { id: 3, name: 'Jamie Lee', email: 'jamie@example.com', avatar: '🧑' },
  ]);

  const [notifications, setNotifications] = useState({
    dailyGoal: true,
    friendActivity: true,
    weeklyReport: false,
    achievements: true,
  });

  // Load work sites from background script
  useEffect(() => {
    const fetchWorkSites = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getWorkSites' });
        if (response && response.workSites) {
          setWorkSites(response.workSites);
        }
      } catch (error) {
        console.error('Failed to fetch work sites:', error);
      }
    };

    fetchWorkSites();
  }, []);

  const addSite = async () => {
    if (newSite.trim()) {
      try {
        const response = await chrome.runtime.sendMessage({ 
          action: 'addWorkSite', 
          site: newSite.trim() 
        });
        if (response && response.success) {
          setWorkSites([...workSites, newSite.trim()]);
          setNewSite('');
        }
      } catch (error) {
        console.error('Failed to add work site:', error);
      }
    }
  };

  const removeSite = async (site: string) => {
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'removeWorkSite', 
        site: site 
      });
      if (response && response.success) {
        setWorkSites(workSites.filter(s => s !== site));
      }
    } catch (error) {
      console.error('Failed to remove work site:', error);
    }
  };

  const removeFriend = (id: number) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const tabs = [
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="w-full h-full bg-[#1a1a1a] text-[#e5e5e5] flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#2d2d2d] via-[#2d2d2d] to-[#3a3a3a] p-4 border-b border-white/10">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500/50" />
        
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('main')}
            className="p-2 hover:bg-white/5 rounded-lg transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl tracking-wide">Settings</h1>
            <div className="h-px w-16 bg-gradient-to-r from-purple-500 to-transparent" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 bg-[#2d2d2d] relative">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 transition-all duration-300 relative ${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-[#a3a3a3] hover:text-[#e5e5e5]'
              }`}
            >
              <Icon className={`w-4 h-4 transition-all ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : ''}`} />
              <span className="text-xs tracking-wide">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        {activeTab === 'sites' && (
          <div className="space-y-4">
            <p className="text-sm text-[#a3a3a3] leading-relaxed">
              Add websites where you do productive work. LockedIn will track time spent on these sites.
            </p>

            {/* Add Site */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSite()}
                placeholder="example.com"
                className="flex-1 bg-[#2d2d2d] border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-[#505050]"
              />
              <button
                onClick={addSite}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Sites List */}
            <div className="space-y-2">
              {workSites.map((site, index) => (
                <div
                  key={site}
                  className="group relative bg-gradient-to-br from-[#2d2d2d] to-[#252525] rounded-lg p-3 border border-white/5 flex items-center justify-between hover:border-purple-500/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30 group-hover:border-purple-400/60 transition-colors" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30 group-hover:border-purple-400/60 transition-colors" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>{site}</span>
                  </div>
                  <button
                    onClick={() => removeSite(site)}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-all group/btn relative z-10"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4">
            <p className="text-sm text-[#a3a3a3] leading-relaxed">
              Connect with friends to see their productivity and compete on the leaderboard.
            </p>

            {/* Add Friend */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="Email or username"
                className="flex-1 bg-[#2d2d2d] border border-white/10 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-[#505050]"
              />
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Friends List */}
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="group relative bg-gradient-to-br from-[#2d2d2d] to-[#252525] rounded-lg p-3 border border-white/5 flex items-center justify-between hover:border-purple-500/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30 group-hover:border-purple-400/60 transition-colors" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30 group-hover:border-purple-400/60 transition-colors" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <span>{friend.avatar}</span>
                    </div>
                    <div>
                      <div>{friend.name}</div>
                      <div className="text-xs text-[#a3a3a3]">{friend.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-all group/btn relative z-10"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="relative bg-gradient-to-br from-[#2d2d2d] via-[#2d2d2d] to-[#252525] rounded-xl p-6 border border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50 ring-4 ring-purple-400/20">
                  😊
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-[#2d2d2d] shadow-[0_0_15px_rgba(74,222,128,0.6)] flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg tracking-wide">You</h3>
                  <p className="text-sm text-[#a3a3a3]">you@example.com</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Time', value: '156h', color: 'purple' },
                { label: 'Days Active', value: '23', color: 'blue' },
                { label: 'Current Streak', value: '5', color: 'green' },
                { label: 'Achievements', value: '12', color: 'yellow' }
              ].map((stat, index) => (
                <div key={stat.label} className="relative bg-gradient-to-br from-[#2d2d2d] to-[#252525] rounded-lg p-4 border border-white/5 text-center overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30" />
                  
                  <div className="relative z-10">
                    <div className="text-2xl text-purple-400 mb-1 font-mono">{stat.value}</div>
                    <div className="text-xs text-[#a3a3a3] uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Recent Achievements
              </h3>
              <div className="space-y-2">
                {[
                  { icon: '🏆', title: '5 Day Streak', desc: 'Work 5 days in a row', color: 'yellow' },
                  { icon: '💯', title: '100 Hours', desc: 'Reach 100 total hours', color: 'purple' }
                ].map((achievement) => (
                  <div key={achievement.title} className="relative bg-gradient-to-br from-[#2d2d2d] to-[#252525] rounded-lg p-3 border border-white/5 flex items-center gap-3 overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
                    
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div>{achievement.title}</div>
                      <div className="text-xs text-[#a3a3a3]">{achievement.desc}</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <p className="text-sm text-[#a3a3a3] leading-relaxed">
              Choose what notifications you'd like to receive.
            </p>

            <div className="space-y-3">
              {[
                { key: 'dailyGoal', title: 'Daily Goal Reminders', desc: 'Get reminded about your daily work goal' },
                { key: 'friendActivity', title: 'Friend Activity', desc: 'See when friends are working' },
                { key: 'weeklyReport', title: 'Weekly Report', desc: 'Receive weekly productivity summary' },
                { key: 'achievements', title: 'Achievement Unlocked', desc: 'Get notified about new achievements' }
              ].map((notif) => (
                <div key={notif.key} className="relative bg-gradient-to-br from-[#2d2d2d] to-[#252525] rounded-lg p-4 border border-white/5 flex items-center justify-between overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-400/30" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-400/30" />
                  
                  <div className="relative z-10">
                    <div>{notif.title}</div>
                    <div className="text-xs text-[#a3a3a3]">{notif.desc}</div>
                  </div>
                  <Switch
                    checked={notifications[notif.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [notif.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
