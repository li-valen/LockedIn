import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  or,
  and
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, WorkSession, DailyStats, Friend, Achievement, LeaderboardEntry } from '../types/firebase';

// User Management
export class UserService {
  static async createUser(userData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userData.uid!);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      totalWorkTime: 0,
      dailyGoal: 3, // 3 hours default
      streak: 0,
      achievements: []
    });
  }

  static async getUser(uid: string): Promise<User | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
      } as User;
    }
    return null;
  }

  static async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      lastActiveAt: serverTimestamp()
    });
  }

  static async updateUserActivity(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastActiveAt: serverTimestamp()
    });
  }

  static async getUserWithStreak(uid: string): Promise<{ streak: number; dailyGoal: number } | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        streak: data.streak || 0,
        dailyGoal: data.dailyGoal || 3
      };
    }
    return null;
  }
}

// Work Session Management
export class WorkSessionService {
  static async startSession(userId: string, website: string): Promise<string> {
    const sessionRef = await addDoc(collection(db, 'workSessions'), {
      userId,
      startTime: serverTimestamp(),
      duration: 0,
      website,
      isActive: true
    });
    return sessionRef.id;
  }

  static async endSession(sessionId: string): Promise<void> {
    const sessionRef = doc(db, 'workSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      const startTime = sessionData.startTime.toDate();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      await updateDoc(sessionRef, {
        endTime: serverTimestamp(),
        duration,
        isActive: false
      });

      // Update user's total work time
      await this.updateUserWorkTime(sessionData.userId, duration);
    }
  }

  static async getActiveSession(userId: string): Promise<WorkSession | null> {
    const q = query(
      collection(db, 'workSessions'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startTime: data.startTime.toDate(),
        endTime: data.endTime?.toDate(),
      } as WorkSession;
    }
    return null;
  }

  static async getUserSessions(userId: string, limitCount: number = 50): Promise<WorkSession[]> {
    const q = query(
      collection(db, 'workSessions'),
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime.toDate(),
      endTime: doc.data().endTime?.toDate(),
    })) as WorkSession[];
  }

  private static async updateUserWorkTime(userId: string, additionalTime: number): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentTotal = userSnap.data().totalWorkTime || 0;
      await updateDoc(userRef, {
        totalWorkTime: currentTotal + additionalTime
      });
    }
  }
}

// Daily Stats Management
export class DailyStatsService {
  static async updateDailyStats(userId: string, workTime: number, website: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const statsId = `${userId}_${today}`;
    const statsRef = doc(db, 'dailyStats', statsId);
    
    const statsSnap = await getDoc(statsRef);
    const userSnap = await getDoc(doc(db, 'users', userId));
    const dailyGoal = userSnap.data()?.dailyGoal || 3;
    const goalAchieved = workTime >= (dailyGoal * 60 * 60 * 1000);
    
    if (statsSnap.exists()) {
      const currentData = statsSnap.data();
      const websites = [...new Set([...currentData.websites, website])];
      
      // Set the total work time to the current value (not add to it)
      await updateDoc(statsRef, {
        totalWorkTime: workTime, // Set to current work time, don't add
        sessions: currentData.sessions + 1,
        websites,
        goalAchieved: goalAchieved
      });
    } else {
      await setDoc(statsRef, {
        userId,
        date: today,
        totalWorkTime: workTime,
        sessions: 1,
        websites: [website],
        goalAchieved: goalAchieved
      });
    }

    // Update streak if goal was achieved
    if (goalAchieved) {
      await this.updateStreak(userId);
    }
  }

  static async updateStreak(userId: string): Promise<void> {
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Check consecutive days backwards from today
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const statsId = `${userId}_${dateStr}`;
      const statsRef = doc(db, 'dailyStats', statsId);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        if (data.goalAchieved) {
          currentStreak++;
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Goal not achieved, streak ends
          break;
        }
      } else {
        // No data for this day, streak ends
        break;
      }
    }
    
    // Update user's streak
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      streak: currentStreak,
      lastActiveAt: serverTimestamp()
    });
  }

  static async getTodayStats(userId: string): Promise<DailyStats | null> {
    const today = new Date().toISOString().split('T')[0];
    const statsId = `${userId}_${today}`;
    const statsRef = doc(db, 'dailyStats', statsId);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      return { id: statsSnap.id, ...statsSnap.data() } as DailyStats;
    }
    return null;
  }

  static async getUserWeeklyStats(userId: string): Promise<DailyStats[]> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const q = query(
      collection(db, 'dailyStats'),
      where('userId', '==', userId),
      where('date', '>=', weekAgoStr),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DailyStats[];
  }
}

// Leaderboard Management
export class LeaderboardService {
  static async getLeaderboard(period: 'daily' | 'weekly' = 'daily'): Promise<LeaderboardEntry[]> {
    const today = new Date().toISOString().split('T')[0];
    
    if (period === 'daily') {
      const q = query(
        collection(db, 'dailyStats'),
        where('date', '==', today),
        orderBy('totalWorkTime', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const stats = docSnapshot.data();
        const userSnap = await getDoc(doc(db, 'users', stats.userId));
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as any;
          // Only include real users (exclude any test users)
          if (!stats.userId.startsWith('test-user-')) {
            entries.push({
              userId: stats.userId,
              userName: userData.displayName,
              userEmail: userData.email,
              totalWorkTime: stats.totalWorkTime,
              rank: entries.length + 1,
              streak: userData.streak || 0
            });
          }
        }
      }
      
      return entries;
    } else {
      // Weekly leaderboard - sum up last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      
      const q = query(
        collection(db, 'dailyStats'),
        where('date', '>=', weekAgoStr),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const userTotals: { [userId: string]: { totalTime: number, userName: string, userEmail: string, streak: number } } = {};
      
      for (const docSnapshot of querySnapshot.docs) {
        const stats = docSnapshot.data();
        // Only process real users (exclude test users)
        if (!stats.userId.startsWith('test-user-')) {
          if (!userTotals[stats.userId]) {
            const userSnap = await getDoc(doc(db, 'users', stats.userId));
            if (userSnap.exists()) {
              const userData = userSnap.data() as any;
              userTotals[stats.userId] = {
                totalTime: 0,
                userName: userData.displayName,
                userEmail: userData.email,
                streak: userData.streak || 0
              };
            }
          }
          if (userTotals[stats.userId]) {
            userTotals[stats.userId].totalTime += stats.totalWorkTime;
          }
        }
      }
      
      const entries = Object.entries(userTotals)
        .map(([userId, data]) => ({
          userId,
          userName: data.userName,
          userEmail: data.userEmail,
          totalWorkTime: data.totalTime,
          rank: 0, // Will be assigned after sorting
          streak: data.streak
        }))
        .sort((a, b) => b.totalWorkTime - a.totalWorkTime)
        .slice(0, 10);
      
      // Assign correct ranks after sorting
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      return entries;
    }
  }

  static subscribeToLeaderboard(
    period: 'daily' | 'weekly',
    callback: (entries: LeaderboardEntry[]) => void,
    currentUserId?: string
  ): () => void {
    const today = new Date().toISOString().split('T')[0];
    
    if (period === 'daily') {
      const q = query(
        collection(db, 'dailyStats'),
        where('date', '==', today),
        orderBy('totalWorkTime', 'desc'),
        limit(50) // Get more to filter by friends
      );
      
      return onSnapshot(q, async (querySnapshot) => {
        const entries: LeaderboardEntry[] = [];
        
        // Get current user's friends if userId is provided
        let friendIds: string[] = [];
        if (currentUserId) {
          try {
            const friends = await FriendService.getFriends(currentUserId);
            friendIds = friends.map(friend => 
              friend.userId === currentUserId ? friend.friendId : friend.userId
            );
            // Always include current user in leaderboard
            friendIds.push(currentUserId);
          } catch (error) {
            console.error('Error getting friends for leaderboard:', error);
          }
        }
        
        for (const docSnapshot of querySnapshot.docs) {
          const stats = docSnapshot.data();
          const userSnap = await getDoc(doc(db, 'users', stats.userId));
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as any;
            // Only include real users (exclude test users) and friends
            if (!stats.userId.startsWith('test-user-') && 
                (friendIds.length === 0 || friendIds.includes(stats.userId))) {
              entries.push({
                userId: stats.userId,
                userName: userData.displayName,
                userEmail: userData.email,
                totalWorkTime: stats.totalWorkTime,
                rank: entries.length + 1,
                streak: userData.streak || 0
              });
            }
          }
        }
        
        // Sort by work time and limit to top 10
        entries.sort((a, b) => b.totalWorkTime - a.totalWorkTime);
        entries.forEach((entry, index) => {
          entry.rank = index + 1;
        });
        
        callback(entries.slice(0, 10));
      });
    } else {
      // Weekly leaderboard subscription
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      
      const q = query(
        collection(db, 'dailyStats'),
        where('date', '>=', weekAgoStr),
        orderBy('date', 'desc')
      );
      
      return onSnapshot(q, async (querySnapshot) => {
        const userTotals: { [userId: string]: { totalTime: number, userName: string, userEmail: string, streak: number } } = {};
        
        // Get current user's friends if userId is provided
        let friendIds: string[] = [];
        if (currentUserId) {
          try {
            const friends = await FriendService.getFriends(currentUserId);
            friendIds = friends.map(friend => 
              friend.userId === currentUserId ? friend.friendId : friend.userId
            );
            // Always include current user in leaderboard
            friendIds.push(currentUserId);
          } catch (error) {
            console.error('Error getting friends for weekly leaderboard:', error);
          }
        }
        
        for (const docSnapshot of querySnapshot.docs) {
          const stats = docSnapshot.data();
          // Only process real users (exclude test users) and friends
          if (!stats.userId.startsWith('test-user-') && 
              (friendIds.length === 0 || friendIds.includes(stats.userId))) {
            if (!userTotals[stats.userId]) {
              const userSnap = await getDoc(doc(db, 'users', stats.userId));
              if (userSnap.exists()) {
                const userData = userSnap.data() as any;
                userTotals[stats.userId] = {
                  totalTime: 0,
                  userName: userData.displayName,
                  userEmail: userData.email,
                  streak: userData.streak || 0
                };
              }
            }
            if (userTotals[stats.userId]) {
              userTotals[stats.userId].totalTime += stats.totalWorkTime;
            }
          }
        }
        
        const entries = Object.entries(userTotals)
          .map(([userId, data]) => ({
            userId,
            userName: data.userName,
            userEmail: data.userEmail,
            totalWorkTime: data.totalTime,
            rank: 0, // Will be assigned after sorting
            streak: data.streak
          }))
          .sort((a, b) => b.totalWorkTime - a.totalWorkTime)
          .slice(0, 10);
        
        // Assign correct ranks after sorting
        entries.forEach((entry, index) => {
          entry.rank = index + 1;
        });
        
        callback(entries);
      });
    }
  }
}


// Friend System
export class FriendService {
  static async sendFriendRequest(userId: string, friendEmail: string): Promise<void> {
    // Prevent adding yourself as a friend
    if (auth.currentUser?.email === friendEmail) {
      throw new Error('You cannot add yourself as a friend');
    }

    // First, find the user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', friendEmail),
      limit(1)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    if (usersSnapshot.empty) {
      throw new Error('User not found');
    }
    
    const friendDoc = usersSnapshot.docs[0];
    const friendId = friendDoc.id;
    
    // Check if any friendship already exists (pending or accepted)
    const friendshipQuery = query(
      collection(db, 'friends'),
      where('userId', '==', userId),
      where('friendId', '==', friendId)
    );
    
    const friendshipSnapshot = await getDocs(friendshipQuery);
    if (!friendshipSnapshot.empty) {
      const existingFriend = friendshipSnapshot.docs[0].data();
      if (existingFriend.status === 'pending') {
        throw new Error('Friend request already sent');
      } else if (existingFriend.status === 'accepted') {
        throw new Error('This user is already your friend');
      }
    }
    
    // Also check reverse friendship (if they already sent you a request)
    const reverseFriendshipQuery = query(
      collection(db, 'friends'),
      where('userId', '==', friendId),
      where('friendId', '==', userId)
    );
    
    const reverseFriendshipSnapshot = await getDocs(reverseFriendshipQuery);
    if (!reverseFriendshipSnapshot.empty) {
      const existingFriend = reverseFriendshipSnapshot.docs[0].data();
      if (existingFriend.status === 'pending') {
        throw new Error('This user has already sent you a friend request');
      } else if (existingFriend.status === 'accepted') {
        throw new Error('This user is already your friend');
      }
    }
    
    // Create friend request
    await addDoc(collection(db, 'friends'), {
      userId,
      friendId,
      friendEmail,
      friendName: friendDoc.data().displayName,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  }

  static async getFriends(userId: string): Promise<Friend[]> {
    const q = query(
    collection(db, 'friends'),
    or(
      and(where('userId', '==', userId), where('status', '==', 'accepted')),
      and(where('friendId', '==', userId), where('status', '==', 'accepted'))
    )
    );
    
    const querySnapshot = await getDocs(q);
    const friends: Friend[] = [];
    const processedFriends = new Set<string>();
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const friendId = data.userId === userId ? data.friendId : data.userId;
      
      // Only add each friend once
      if (!processedFriends.has(friendId)) {
        processedFriends.add(friendId);
        
        // Get friend's user data
        const friendUserSnap = await getDoc(doc(db, 'users', friendId));
        if (friendUserSnap.exists()) {
          const friendUserData = friendUserSnap.data();
          friends.push({
            id: docSnapshot.id,
            userId: data.userId,
            friendId: data.friendId,
            friendEmail: data.friendEmail || friendUserData.email,
            friendName: data.friendName || friendUserData.displayName,
            status: data.status,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          });
        }
      }
    }
    
    return friends;
  }

  static async getPendingRequests(userId: string): Promise<Friend[]> {
    const q = query(
      collection(db, 'friends'),
      where('friendId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
    })) as Friend[];
  }

  static async acceptFriendRequest(requestId: string): Promise<void> {
    const requestRef = doc(db, 'friends', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (requestSnap.exists()) {
      const requestData = requestSnap.data();
      
      // Update the request to accepted
      await updateDoc(requestRef, { status: 'accepted' });

      const existing = await getDocs(
        query(collection(db, 'friends'),
        where('userId', '==', requestData.friendId),
        where('friendId', '==', requestData.userId))
      );

      if (existing.empty) {
        // Get the current user's data for the reverse friendship
        const currentUserSnap = await getDoc(doc(db, 'users', requestData.friendId));
        const currentUserData = currentUserSnap.data();
        
        await addDoc(collection(db, 'friends'), {
          userId: requestData.friendId,
          friendId: requestData.userId,
          friendEmail: currentUserData?.email,
          friendName: currentUserData?.displayName,
          status: 'accepted',
          createdAt: serverTimestamp()
        });
      }
    }
  }

  static async removeFriend(friendshipId: string): Promise<void> {
    const friendshipRef = doc(db, 'friends', friendshipId);
    const friendshipSnap = await getDoc(friendshipRef);
    
    if (friendshipSnap.exists()) {
      const friendshipData = friendshipSnap.data();
      
      // Delete the friendship record
      await deleteDoc(friendshipRef);
      
      // Also delete the reciprocal friendship if it exists
      const reciprocalQuery = query(
        collection(db, 'friends'),
        where('userId', '==', friendshipData.friendId),
        where('friendId', '==', friendshipData.userId)
      );
      
      const reciprocalSnapshot = await getDocs(reciprocalQuery);
      if (!reciprocalSnapshot.empty) {
        const reciprocalDoc = reciprocalSnapshot.docs[0];
        await deleteDoc(reciprocalDoc.ref);
      }
    }
  }

  static async cleanupDuplicateFriends(userId: string): Promise<void> {
    // Get all friends for this user (both directions)
    const friendsQuery = query(
      collection(db, 'friends'),
      or(
        where('userId', '==', userId),
        where('friendId', '==', userId)
      )
    );
    
    const friendsSnapshot = await getDocs(friendsQuery);
    const friendMap = new Map();
    const toDelete: string[] = [];
    
    // Find duplicates and mark older ones for deletion
    for (const docSnapshot of friendsSnapshot.docs) {
      const friendData = docSnapshot.data();
      const friendId = friendData.userId === userId ? friendData.friendId : friendData.userId;
      const key = userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
      
      if (friendMap.has(key)) {
        // Compare timestamps and keep the newer one
        const existing = friendMap.get(key);
        const currentTime = friendData.createdAt?.toDate?.() || new Date(0);
        const existingTime = existing.createdAt?.toDate?.() || new Date(0);
        
        if (currentTime > existingTime) {
          // Current is newer, delete the existing one
          toDelete.push(existing.id);
          friendMap.set(key, { ...friendData, id: docSnapshot.id });
        } else {
          // Existing is newer, delete the current one
          toDelete.push(docSnapshot.id);
        }
      } else {
        friendMap.set(key, { ...friendData, id: docSnapshot.id });
      }
    }
    
    // Delete duplicate entries
    for (const docId of toDelete) {
      await deleteDoc(doc(db, 'friends', docId));
    }
  }
}
