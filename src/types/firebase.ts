// Firebase data models and types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastActiveAt: Date;
  totalWorkTime: number; // in milliseconds
  dailyGoal: number; // in hours
  streak: number;
  achievements: string[];
}

export interface WorkSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in milliseconds
  website: string;
  isActive: boolean;
}

export interface DailyStats {
  id: string; // format: userId_date (e.g., "user123_2024-01-15")
  userId: string;
  date: string; // YYYY-MM-DD format
  totalWorkTime: number; // in milliseconds
  sessions: number;
  websites: string[];
  goalAchieved: boolean;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendEmail: string;
  friendName: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  avatar?: string; // Add avatar field
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'work_time' | 'streak' | 'sessions' | 'goal';
    value: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userEmail: string;
  totalWorkTime: number;
  rank: number;
  streak: number;
  isCurrentUser?: boolean;
}
