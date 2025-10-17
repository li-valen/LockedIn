// Content script for LockedIn Chrome Extension
console.log('LockedIn content script loaded');

// Track page visibility to help with accurate time tracking
let wasVisible = !document.hidden;

// Listen for page visibility changes
document.addEventListener('visibilitychange', () => {
  const isVisible = !document.hidden;
  
  if (isVisible && !wasVisible) {
    // Page became visible
    console.log('Page became visible');
    chrome.runtime.sendMessage({ 
      action: 'pageVisible', 
      url: window.location.href 
    }).catch(() => {
      // Ignore errors if background script is not ready
    });
  } else if (!isVisible && wasVisible) {
    // Page became hidden
    console.log('Page became hidden');
    chrome.runtime.sendMessage({ 
      action: 'pageHidden' 
    }).catch(() => {
      // Ignore errors if background script is not ready
    });
  }
  
  wasVisible = isVisible;
});

// Also track user interactions to detect activity
let lastActivityTime = Date.now();

const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

activityEvents.forEach(event => {
  document.addEventListener(event, () => {
    const now = Date.now();
    // Only report activity if more than 30 seconds have passed since last report
    if (now - lastActivityTime > 30000) {
      lastActivityTime = now;
      chrome.runtime.sendMessage({ 
        action: 'userActivity',
        url: window.location.href 
      }).catch(() => {
        // Ignore errors if background script is not ready
      });
    }
  }, { passive: true });
});

// Report initial state when page loads
if (!document.hidden) {
  chrome.runtime.sendMessage({ 
    action: 'pageVisible', 
    url: window.location.href 
  }).catch(() => {
    // Ignore errors if background script is not ready
  });
}

