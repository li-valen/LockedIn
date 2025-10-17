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

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('LockedIn extension installed');
      this.setupBadge();
    });
  }

  private checkWorkSite(url: string) {
    const isWorkSite = this.data.workSites.some(site => url.includes(site));
    
    if (isWorkSite && !this.data.isWorking) {
      this.startWork();
    } else if (!isWorkSite && this.data.isWorking) {
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

  private startTracking() {
    // Update work time every minute
    setInterval(() => {
      if (this.data.isWorking) {
        const workDuration = Date.now() - this.data.startTime;
        this.data.currentWorkTime += workDuration;
        this.data.dailyWorkTime += workDuration;
        this.data.startTime = Date.now();
        this.saveData();
        // Sync to Firebase if user is logged in
        this.syncToFirebase();
      }
    }, 60000); // 1 minute
  }

  private resetDailyIfNeeded() {
    const today = new Date().toDateString();
    if (this.data.lastResetDate !== today) {
      this.data.dailyWorkTime = 0;
      this.data.lastResetDate = today;
      this.saveData();
      // Sync to Firebase if user is logged in
      this.syncToFirebase();
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
