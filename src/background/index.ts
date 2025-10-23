// Background service worker for LockedIn Chrome Extension
console.log('LockedIn background service worker started');

interface WorkTrackerData {
  workSites: string[];
  currentWorkTime: number;
  isWorking: boolean;
  startTime: number;
  dailyWorkTime: number;
  lastResetDate: string;
  currentSessionId?: string;
  userId?: string;
}

class WorkTracker {
  private data: WorkTrackerData = {
    workSites: ['github.com', 'figma.com', 'notion.so', 'linear.app'],
    currentWorkTime: 0,
    isWorking: false,
    startTime: 0,
    dailyWorkTime: 0,
    lastResetDate: new Date().toDateString()
  };

  private isUserActive: boolean = true;
  private isSystemActive: boolean = true;
  private lastActivityTime: number = Date.now();
  private activityCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadData();
    this.setupEventListeners();
    this.startTracking();
    this.resetDailyIfNeeded();
  }

  private async loadData() {
    try {
      const result = await chrome.storage.local.get(['workTrackerData']);
      if (result.workTrackerData) {
        this.data = { ...this.data, ...result.workTrackerData };
      }
      await this.saveData();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  private async saveData() {
    try {
      await chrome.storage.local.set({ workTrackerData: this.data });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  private setupEventListeners() {
    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.checkWorkSite(tab.url);
      }
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab.url) {
          this.checkWorkSite(tab.url);
        }
      } catch (error) {
        console.error('Error getting tab:', error);
      }
    });

    // Listen for window focus changes
    chrome.windows.onFocusChanged.addListener(async (windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Chrome lost focus
        this.pauseTracking();
      } else {
        // Chrome gained focus - check if we're on a work site
        try {
          const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
          if (tab?.url) {
            this.checkWorkSite(tab.url);
          }
        } catch (error) {
          console.error('Error checking active tab:', error);
        }
      }
    });

    // Listen for idle state changes (detects sleep mode and user inactivity)
    chrome.idle.onStateChanged.addListener((state) => {
      console.log('Idle state changed:', state);
      if (state === 'active') {
        this.isUserActive = true;
        this.isSystemActive = true;
        this.lastActivityTime = Date.now();
        // Resume tracking if we're on a work site
        this.checkCurrentTab();
      } else if (state === 'locked') {
        // Only pause for locked state (system sleep), not idle
        this.isSystemActive = false;
        this.pauseTracking();
      } else if (state === 'idle') {
        // Don't pause for idle - just mark as inactive but keep tracking
        this.isUserActive = false;
        console.log('User marked as idle but continuing to track');
      }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('LockedIn extension installed');
      this.setupBadge();
      // Set idle detection to 60 seconds (1 minute of inactivity)
      chrome.idle.setDetectionInterval(60);
    });

    // Detect system suspend/resume by checking for large time gaps
    this.startSuspendDetection();
  }

  private async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        this.checkWorkSite(tab.url);
      }
    } catch (error) {
      console.error('Error checking current tab:', error);
    }
  }

  private checkWorkSite(url: string) {
    const isWorkSite = this.data.workSites.some(site => url.includes(site));
    
    console.log('Checking work site:', {
      url,
      isWorkSite,
      isWorking: this.data.isWorking,
      isUserActive: this.isUserActive,
      isSystemActive: this.isSystemActive,
      workSites: this.data.workSites
    });
    
    if (isWorkSite && !this.data.isWorking && this.isSystemActive) {
      console.log('Starting work - work site and system active');
      this.startWork();
    } else if ((!isWorkSite || !this.isSystemActive) && this.data.isWorking) {
      console.log('Stopping work - conditions not met:', {
        isWorkSite,
        isSystemActive: this.isSystemActive
      });
      this.stopWork();
    }
  }

  private pauseTracking() {
    if (this.data.isWorking) {
      console.log('Pausing tracking due to inactivity/sleep');
      this.stopWork();
    }
  }

  private startWork() {
    this.data.isWorking = true;
    this.data.startTime = Date.now();
    this.updateBadge('ON');
    console.log('Started working');
  }

  private stopWork() {
    if (this.data.isWorking) {
      const workDuration = Date.now() - this.data.startTime;
      this.data.currentWorkTime += workDuration;
      this.data.dailyWorkTime += workDuration;
      this.data.isWorking = false;
      this.updateBadge('OFF');
      this.saveData();
      // Sync to Firebase if user is logged in
      this.syncToFirebase();
      console.log('Stopped working. Duration:', workDuration);
    }
  }

  private updateBadge(text: string) {
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ 
      color: text === 'ON' ? '#10b981' : '#6b7280' 
    });
  }

  private setupBadge() {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
  }

  private startSuspendDetection() {
    // Check every 5 seconds for time gaps that indicate system suspend
    this.activityCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastCheck = now - this.lastActivityTime;
      
      // If more than 10 seconds have passed, system was likely suspended
      if (timeSinceLastCheck > 10000) {
        console.log('System suspend detected (time gap:', timeSinceLastCheck, 'ms)');
        this.isSystemActive = false;
        this.pauseTracking();
        // Mark system as active again now that we've resumed
        this.isSystemActive = true;
        this.checkCurrentTab();
      }
      
      this.lastActivityTime = now;
    }, 5000);
  }

  private startTracking() {
    // Update work time every 5 seconds for more responsive tracking
    setInterval(() => {
      if (this.data.isWorking && this.isSystemActive) {
        const workDuration = Date.now() - this.data.startTime;
        this.data.currentWorkTime += workDuration;
        this.data.dailyWorkTime += workDuration;
        this.data.startTime = Date.now();
        this.saveData();
        // Sync to Firebase if user is logged in
        this.syncToFirebase();
      } else if (this.data.isWorking && !this.isSystemActive) {
        // Stop tracking only if system becomes inactive (sleep/lock)
        this.pauseTracking();
      }
    }, 5000); // 5 seconds

    // Also sync every 30 seconds regardless of work status for real-time updates
    setInterval(() => {
      if (this.data.userId && this.data.dailyWorkTime > 0) {
        this.syncToFirebase();
      }
    }, 30000); // 30 seconds

    // Set idle detection interval (60 seconds of inactivity)
    chrome.idle.setDetectionInterval(60);
  }

  private resetDailyIfNeeded() {
    const today = new Date().toDateString();
    if (this.data.lastResetDate !== today) {
      this.data.dailyWorkTime = 0;
      this.data.lastResetDate = today;
      this.saveData();
      // Sync to Firebase if user is logged in
      this.syncToFirebase();
      
      // Reset streaks for users who haven't achieved their goal
      this.resetStreaksForInactiveUsers();
    }
  }

  private async resetStreaksForInactiveUsers() {
    try {
      // Import the Firebase service dynamically to avoid circular dependencies
      const { DailyStatsService } = await import('../services/firebase');
      await DailyStatsService.resetStreakForInactiveUsers();
      console.log('Daily streak reset completed');
    } catch (error) {
      console.error('Failed to reset streaks for inactive users:', error);
    }
  }

  private async syncToFirebase() {
    if (!this.data.userId) {
      return; // No user logged in
    }

    try {
      // Send message to popup to sync daily stats (only if popup is open)
      chrome.runtime.sendMessage({
        action: 'syncDailyStats',
        userId: this.data.userId,
        dailyWorkTime: this.data.dailyWorkTime
      }).catch(() => {
        // Ignore errors if popup is not open
        console.log('Popup not open, skipping sync message');
      });
    } catch (error) {
      console.error('Failed to sync to Firebase:', error);
    }
  }


  private async handleMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    try {
      switch (request.action) {
        case 'pageVisible':
          // Page became visible, check if it's a work site
          if (request.url) {
            this.checkWorkSite(request.url);
          }
          sendResponse({ success: true });
          break;
        
        case 'pageHidden':
          // Page became hidden, but don't pause if it's just the popup being opened
          // Only pause if the user actually navigated away or switched tabs
          if (request.reason === 'navigation' || request.reason === 'tab_switch') {
            this.pauseTracking();
          }
          sendResponse({ success: true });
          break;
        
        case 'userActivity':
          // User is active on the page
          this.isUserActive = true;
          this.lastActivityTime = Date.now();
          if (request.url) {
            this.checkWorkSite(request.url);
          }
          sendResponse({ success: true });
          break;
        
        case 'getWorkTime':
          sendResponse({ 
            workTime: this.data.currentWorkTime,
            dailyWorkTime: this.data.dailyWorkTime,
            isWorking: this.data.isWorking
          });
          break;
        
        case 'getWorkSites':
          sendResponse({ workSites: this.data.workSites });
          break;
        
        case 'addWorkSite':
          if (request.site && !this.data.workSites.includes(request.site)) {
            this.data.workSites.push(request.site);
            await this.saveData();
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'Site already exists or invalid' });
          }
          break;
        
        case 'removeWorkSite':
          this.data.workSites = this.data.workSites.filter(site => site !== request.site);
          await this.saveData();
          sendResponse({ success: true });
          break;
        
        case 'getStatus':
          sendResponse({
            isWorking: this.data.isWorking,
            workSites: this.data.workSites,
            dailyWorkTime: this.data.dailyWorkTime
          });
          break;
        
        case 'setUserId':
          this.data.userId = request.userId;
          await this.saveData();
          sendResponse({ success: true });
          break;
        
        case 'getUserId':
          sendResponse({ userId: this.data.userId });
          break;
        
        case 'syncToFirebase':
          this.syncToFirebase();
          sendResponse({ success: true });
          break;
        
        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: 'Internal error' });
    }
  }
}

// Initialize the work tracker
new WorkTracker();
