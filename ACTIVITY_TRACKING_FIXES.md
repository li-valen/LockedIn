# Activity Tracking Fixes

## Problem
The extension was logging hours even when the laptop was in sleep mode or when the user was inactive, leading to inaccurate time tracking.

## Solution
Implemented comprehensive activity detection to ensure hours are only logged when the user is actively working on the site.

## Changes Made

### 1. Background Script (`src/background/index.ts`)

#### Added Activity State Tracking
- `isUserActive`: Tracks whether the user is actively using the system
- `isSystemActive`: Tracks whether the system is awake (not suspended/sleeping)
- `lastActivityTime`: Timestamp for detecting system suspend/resume
- `activityCheckInterval`: Timer for suspend detection

#### Implemented Multiple Detection Mechanisms

**A. Idle State Detection**
- Uses Chrome's `idle` API to detect when the user is inactive
- Set to detect idle state after 60 seconds of no keyboard/mouse activity
- Automatically pauses tracking when user goes idle
- Resumes tracking when user becomes active again

**B. System Suspend/Sleep Detection**
- Monitors time gaps between checks (every 5 seconds)
- If more than 10 seconds have passed between checks, system was likely suspended
- Automatically stops tracking when suspend is detected
- Resumes checking when system wakes up

**C. Window Focus Detection**
- Listens for Chrome window focus changes
- Pauses tracking when Chrome loses focus
- Resumes tracking (if on a work site) when Chrome regains focus

**D. Enhanced Work Site Checking**
- Now requires both `isUserActive` AND `isSystemActive` to be true before starting tracking
- Automatically stops tracking if either condition becomes false

#### Modified Tracking Logic
- The 5-second interval now checks both activity states before logging time
- If user becomes inactive during tracking, it automatically pauses
- All conditions must be met to resume tracking:
  1. User must be on a configured work site
  2. User must be active (not idle)
  3. System must be active (not suspended)

### 2. Content Script (`src/content/index.ts`)

#### Added Page Visibility Tracking
- Detects when the tab becomes hidden or visible using the Page Visibility API
- Sends messages to background script when page visibility changes
- Automatically pauses tracking when tab is hidden
- Resumes tracking when tab becomes visible (if on a work site)

#### Added User Activity Detection
- Monitors mouse, keyboard, scroll, and touch events
- Reports activity to background script every 30 seconds (throttled)
- Helps confirm user is actively engaged with the page

#### Messages Sent to Background Script
- `pageVisible`: When tab becomes visible
- `pageHidden`: When tab becomes hidden
- `userActivity`: When user interacts with the page

### 3. Manifest Updates (`public/manifest.json`)

#### Added Required Permissions
- Added `"idle"` permission for Chrome's idle detection API

#### Added Content Scripts Configuration
- Configured content script to inject into all URLs (`<all_urls>`)
- Set to run at `document_end` for proper page initialization

## How It Works Together

1. **System Sleep/Suspend**
   - When laptop goes to sleep, the time check interval detects the large time gap
   - Tracking is immediately paused
   - When system wakes up, it checks if user is on a work site before resuming

2. **User Idle Detection**
   - Chrome monitors keyboard and mouse activity
   - After 60 seconds of no activity, Chrome marks user as idle
   - Tracking automatically pauses
   - Resumes when user moves mouse or presses a key

3. **Tab/Window Changes**
   - If user switches to a different tab, content script detects visibility change
   - If user switches to a different application, window focus detection catches it
   - Tracking pauses in both cases
   - Resumes only when user returns to a work site tab

4. **Active Engagement**
   - Content script monitors user interactions on the page
   - Reports activity to confirm user is actively working
   - Combined with other checks for accurate tracking

## Testing Recommendations

1. **Sleep Mode Test**
   - Open a work site tab
   - Verify tracking starts (badge shows "ON")
   - Put laptop to sleep for 5+ minutes
   - Wake up laptop
   - Check that work time didn't increase during sleep

2. **Idle Test**
   - Open a work site tab
   - Don't touch mouse/keyboard for 60+ seconds
   - Verify tracking stops (badge shows "OFF")
   - Move mouse
   - Verify tracking resumes (badge shows "ON")

3. **Tab Switch Test**
   - Open a work site tab
   - Switch to a different tab (non-work site)
   - Verify tracking stops
   - Switch back to work site tab
   - Verify tracking resumes

4. **Window Focus Test**
   - Open a work site tab
   - Switch to a different application
   - Verify tracking stops
   - Switch back to Chrome
   - Verify tracking resumes

## Benefits

- **Accurate time tracking**: Only logs hours when user is actually working
- **No sleep mode inflation**: Hours don't accumulate while laptop is asleep
- **Respects user activity**: Pauses when user is idle or away
- **Tab awareness**: Only tracks when work site tab is visible and active
- **Automatic resume**: Seamlessly resumes tracking when user returns to work

## Configuration

- **Idle threshold**: 60 seconds (can be adjusted in background script)
- **Suspend detection threshold**: 10 seconds time gap
- **Activity report throttle**: 30 seconds (in content script)
- **Tracking update interval**: 5 seconds

