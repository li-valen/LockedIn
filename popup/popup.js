import { signInWithGoogleViaChrome } from "./utils/auth.js";
import { db, auth } from "./utils/firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithGoogleViaChrome } from "./utils/auth.js";

async function initFirebaseUser() {
  try {
    const result = await signInWithGoogleViaChrome();
    const user = result.user;
    console.log("Signed in as", user.displayName);

    // Save or update user in Firestore
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString(),
    }, { merge: true });

    // Show name somewhere in your popup UI
    const nameElem = document.querySelector(".user-name");
    if (nameElem) nameElem.textContent = user.displayName;
  } catch (err) {
    console.error("Firebase auth failed", err);
  }
}

// Run login automatically on popup open
initFirebaseUser();

if (typeof browser === "undefined") {
  var browser = chrome;
}

// App state
let currentPage = 'main';
let currentPeriod = 'daily';
let workHours = 6.5;
let targetHours = 8;

// DOM elements
const mainPopup = document.getElementById('main-popup');
const settingsPage = document.getElementById('settings-page');
const addFriendModal = document.getElementById('add-friend-modal');
const currentTimeElement = document.getElementById('current-time');
const progressRingMain = document.querySelector('.progress-ring-main');
const progressValue = document.querySelector('.progress-value');
const progressRemaining = document.querySelector('.progress-remaining');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  updateTime();
  updateProgress();
  
  // Update time every minute
  setInterval(updateTime, 60000);
});

function initializeApp() {
  // Set initial progress ring
  updateProgressRing();
  
  // Set up period toggle
  setupPeriodToggle();
  
  // Set up leaderboard data
  updateLeaderboard();
}

function setupEventListeners() {
  // Settings button
  document.getElementById('settings-btn').addEventListener('click', () => {
    navigateToPage('settings');
  });
  
  document.getElementById('settings-action-btn').addEventListener('click', () => {
    navigateToPage('settings');
  });
  
  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    navigateToPage('main');
  });
  
  // Add friend button
  document.getElementById('add-friend-btn').addEventListener('click', () => {
    showAddFriendModal();
  });
  
  // Modal buttons
  document.getElementById('cancel-friend-btn').addEventListener('click', () => {
    hideAddFriendModal();
  });
  
  document.getElementById('confirm-friend-btn').addEventListener('click', () => {
    addFriend();
  });
  
  // Period toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      setPeriod(period);
    });
  });
  
  // Close modal when clicking overlay
  addFriendModal.addEventListener('click', (e) => {
    if (e.target === addFriendModal) {
      hideAddFriendModal();
    }
  });
  
  // Handle Enter key in friend input
  const friendInput = document.querySelector('.form-input');
  friendInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addFriend();
    }
  });
}

function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  currentTimeElement.textContent = timeString;
}

function updateProgress() {
  const percentage = (workHours / targetHours) * 100;
  const remaining = targetHours - workHours;
  
  progressValue.textContent = workHours.toFixed(1);
  progressRemaining.textContent = `${remaining.toFixed(1)}h remaining to reach goal`;
  
  updateProgressRing();
}

function updateProgressRing() {
  const percentage = (workHours / targetHours) * 100;
  const radius = 72;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  if (progressRingMain) {
    progressRingMain.style.strokeDashoffset = offset;
  }
}

function setupPeriodToggle() {
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.period === currentPeriod) {
      btn.classList.add('active');
    }
  });
}

function setPeriod(period) {
  currentPeriod = period;
  setupPeriodToggle();
  updateLeaderboard();
}

function updateLeaderboard() {
  // This would typically fetch data from storage or API
  // For now, we'll just update the display based on period
  const leaderboardItems = document.querySelectorAll('.leaderboard-item');
  
  // Simulate different data for weekly vs daily
  if (currentPeriod === 'weekly') {
    // Update hours for weekly view
    const hoursElements = document.querySelectorAll('.user-hours');
    const weeklyHours = ['168h', '152h', '140h', '128h', '112h'];
    hoursElements.forEach((el, index) => {
      if (weeklyHours[index]) {
        el.textContent = weeklyHours[index] + ' worked';
      }
    });
  } else {
    // Reset to daily view
    const hoursElements = document.querySelectorAll('.user-hours');
    const dailyHours = ['42h', '38h', '35h', '32h', '28h'];
    hoursElements.forEach((el, index) => {
      if (dailyHours[index]) {
        el.textContent = dailyHours[index] + ' worked';
      }
    });
  }
}

function navigateToPage(page) {
  currentPage = page;
  
  if (page === 'main') {
    mainPopup.style.display = 'flex';
    settingsPage.style.display = 'none';
  } else if (page === 'settings') {
    mainPopup.style.display = 'none';
    settingsPage.style.display = 'flex';
    // TODO: Implement settings page
  }
}

function showAddFriendModal() {
  addFriendModal.style.display = 'flex';
  document.querySelector('.form-input').focus();
}

function hideAddFriendModal() {
  addFriendModal.style.display = 'none';
  document.querySelector('.form-input').value = '';
}

function addFriend() {
  const input = document.querySelector('.form-input');
  const email = input.value.trim();
  
  if (email) {
    // Here you would typically send the friend request
    console.log('Adding friend:', email);
    
    // Show success message (you could add a toast notification)
    alert(`Friend request sent to ${email}`);
    
    hideAddFriendModal();
  }
}

// Simulate work time updates
function simulateWorkTimeUpdate() {
  // This would typically be called by the background script
  // when work time is detected
  workHours += 0.1;
  updateProgress();
}

// Add some interactive animations
function addInteractiveEffects() {
  // Add hover effects to leaderboard items
  const leaderboardItems = document.querySelectorAll('.leaderboard-item');
  leaderboardItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(4px)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateX(0)';
    });
  });
  
  // Add click effects to action buttons
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'scale(0.95)';
    });
    
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'scale(1)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  });
}

// Initialize interactive effects
document.addEventListener('DOMContentLoaded', addInteractiveEffects);

// Export functions for potential use by background script
window.LockedInPopup = {
  updateWorkHours: (hours) => {
    workHours = hours;
    updateProgress();
  },
  navigateToPage,
  showAddFriendModal,
  hideAddFriendModal
};

const loginBtn = document.createElement("button");
loginBtn.textContent = "Sign in with Google";
loginBtn.className = "btn-primary";
loginBtn.style.position = "absolute";
loginBtn.style.bottom = "15px";
loginBtn.style.right = "15px";
document.body.appendChild(loginBtn);

loginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithGoogleViaChrome();
    const user = result.user;
    alert(`Welcome ${user.displayName}!`);
    loginBtn.remove();
  } catch (err) {
    console.error("Google Sign-in failed", err);
    alert("Failed to sign in. Check console for details.");
  }
});