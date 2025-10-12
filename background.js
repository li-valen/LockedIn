// Cross-browser compatibility
if (typeof browser === "undefined") {
  var browser = chrome;
}

// LockedIn Background Script
let workSites = ['github.com', 'figma.com', 'notion.so', 'linear.app'];
let isTracking = false;
let currentWorkTime = 0;
let sessionStartTime = null;

// Initialize extension
browser.runtime.onInstalled.addListener(() => {
  console.log("LockedIn extension installed successfully!");
  
  // Initialize storage with default values
  browser.storage.local.set({
    workSites: workSites,
    isTracking: false,
    currentWorkTime: 0,
    dailyGoal: 8,
    friends: [],
    achievements: []
  });
});

// Listen for tab updates to track work time
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkWorkSite(tab.url);
  }
});

// Listen for tab activation
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      checkWorkSite(tab.url);
    }
  });
});

function checkWorkSite(url) {
  const domain = new URL(url).hostname;
  const isWorkSite = workSites.some(site => domain.includes(site));
  
  if (isWorkSite && !isTracking) {
    startTracking();
  } else if (!isWorkSite && isTracking) {
    stopTracking();
  }
}

function startTracking() {
  isTracking = true;
  sessionStartTime = Date.now();
  console.log('Started tracking work time');
  
  // Update badge
  browser.action.setBadgeText({ text: 'ON' });
  browser.action.setBadgeBackgroundColor({ color: '#10b981' });
}

function stopTracking() {
  if (isTracking && sessionStartTime) {
    const sessionTime = (Date.now() - sessionStartTime) / (1000 * 60 * 60); // Convert to hours
    currentWorkTime += sessionTime;
    
    // Save to storage
    browser.storage.local.set({ currentWorkTime });
    
    console.log(`Stopped tracking. Session: ${sessionTime.toFixed(2)}h, Total: ${currentWorkTime.toFixed(2)}h`);
  }
  
  isTracking = false;
  sessionStartTime = null;
  
  // Update badge
  browser.action.setBadgeText({ text: '' });
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getWorkTime') {
    sendResponse({ workTime: currentWorkTime, isTracking });
  } else if (request.action === 'updateWorkSites') {
    workSites = request.sites;
    browser.storage.local.set({ workSites });
    sendResponse({ success: true });
  } else if (request.action === 'addFriend') {
    // Handle friend addition
    browser.storage.local.get(['friends'], (result) => {
      const friends = result.friends || [];
      friends.push(request.friend);
      browser.storage.local.set({ friends });
      sendResponse({ success: true });
    });
  }
});

// Update work time every minute when tracking
setInterval(() => {
  if (isTracking && sessionStartTime) {
    const sessionTime = (Date.now() - sessionStartTime) / (1000 * 60 * 60);
    const totalTime = currentWorkTime + sessionTime;
    
    // Update storage
    browser.storage.local.set({ currentWorkTime: totalTime });
    
    // Notify popup if it's open
    browser.runtime.sendMessage({
      action: 'workTimeUpdate',
      workTime: totalTime
    }).catch(() => {
      // Popup might not be open, ignore error
    });
  }
}, 60000); // Update every minute

// Load saved data on startup
browser.storage.local.get(['workSites', 'currentWorkTime'], (result) => {
  if (result.workSites) {
    workSites = result.workSites;
  }
  if (result.currentWorkTime) {
    currentWorkTime = result.currentWorkTime;
  }
});
