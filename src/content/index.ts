// Content script for LockedIn Chrome Extension
console.log('LockedIn content script loaded');

// Helper function to safely send messages to background script
function safeSendMessage(message: any) {
  try {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(message).catch((error) => {
        // Ignore errors if background script is not ready or context is invalidated
        if (error.message && error.message.includes('Extension context invalidated')) {
          console.log('Extension context invalidated, stopping content script');
          return;
        }
        console.log('Message send failed:', error.message);
      });
    }
  } catch (error) {
    console.log('Runtime not available:', error);
  }
}

// Track page visibility to help with accurate time tracking
let wasVisible = !document.hidden;
let hiddenStartTime = 0;

// Listen for page visibility changes
document.addEventListener('visibilitychange', () => {
  const isVisible = !document.hidden;
  
  if (isVisible && !wasVisible) {
    // Page became visible
    console.log('Page became visible');
    safeSendMessage({ 
      action: 'pageVisible', 
      url: window.location.href 
    });
  } else if (!isVisible && wasVisible) {
    // Page became hidden - check if it's just a brief popup opening
    console.log('Page became hidden');
    hiddenStartTime = Date.now();
    
    // Set a timeout to check if the page is still hidden after a short delay
    // If it's just the popup opening, the page should become visible again quickly
    setTimeout(() => {
      if (document.hidden) {
        // Page is still hidden after delay, likely a real navigation or tab switch
        safeSendMessage({ 
          action: 'pageHidden',
          reason: 'navigation'
        });
      } else {
        // Page became visible again quickly, likely just popup opening
        console.log('Page hidden briefly (likely popup opening)');
      }
    }, 1000); // 1 second delay
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
      safeSendMessage({ 
        action: 'userActivity',
        url: window.location.href 
      });
    }
  }, { passive: true });
});

// Report initial state when page loads
if (!document.hidden) {
  safeSendMessage({ 
    action: 'pageVisible', 
    url: window.location.href 
  });
}

