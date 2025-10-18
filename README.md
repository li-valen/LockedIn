# 🔒 LockedIn Chrome Extension

A modern productivity tracking Chrome extension built with React, TypeScript, and Firebase. Track your work time, compete with friends, and achieve your daily goals with a beautiful, cyberpunk-inspired interface.

## ✨ Features

### 🎯 **Smart Time Tracking**
- **Automatic Detection** - Tracks time spent on your designated work websites
- **Real-time Monitoring** - Live updates every 2 seconds with no manual input
- **Idle Detection** - Pauses tracking when you're away from your computer
- **Daily Reset** - Automatically resets at midnight for fresh daily tracking

### 🏆 **Social Competition**
- **Friend System** - Add friends by email and accept/decline requests
- **Live Leaderboards** - Daily and weekly rankings with real-time updates
- **Profile Views** - Detailed friend profiles with stats and achievements
- **Achievement Streaks** - Build and maintain daily goal streaks

### ⚙️ **Customizable Goals**
- **Personal Daily Goals** - Set anywhere from 1-12 hours with an intuitive slider
- **Progress Visualization** - Beautiful circular progress rings and percentage indicators
- **Goal Achievement Tracking** - Monitor your success rate and streaks
- **Flexible Settings** - Easy goal adjustment in the Profile tab

### 🎨 **Modern Design**
- **Cyberpunk Aesthetic** - Dark theme with purple accents and neon glows
- **Smooth Animations** - Fade-ins, hover effects, and transition animations
- **Responsive UI** - Optimized for Chrome extension popup dimensions
- **Visual Feedback** - Animated backgrounds, corner accents, and status indicators

### 🔐 **Secure & Private**
- **Google OAuth** - Secure authentication with Firebase
- **Privacy First** - Only tracks websites you explicitly add
- **Data Control** - Full control over your information and friend connections
- **Encrypted Storage** - All data stored securely in Firebase Firestore

## 🚀 Quick Start

### Installation

1. **Open Chrome Extensions:**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode:**
   - Toggle "Developer mode" in top right corner

3. **Load Extension:**
   - Click "Load unpacked"
   - Select the `LockedIn/dist` folder

4. **Pin Extension:**
   - Click puzzle piece icon in Chrome toolbar
   - Pin "LockedIn" for easy access

### First Time Setup

1. **Sign In:**
   - Click the LockedIn extension icon
   - Click "Sign in with Google"
   - Authorize the extension

2. **Add Work Sites:**
   - Go to Settings → Sites tab
   - Add websites where you do productive work
   - Examples: github.com, figma.com, notion.so, linear.app

3. **Set Your Daily Goal:**
   - Go to Settings → Profile tab
   - Use the slider to set your daily hour goal (1-12 hours)
   - Click "Save Goal"

4. **Add Friends (Optional):**
   - Go to Settings → Friends tab
   - Add friends by email
   - Accept friend requests to see each other's progress

### Development

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🏗️ Project Structure

```
LockedIn/
├── 📦 dist/                    # Built extension (ready to install)
├── 🎯 src/                     # Source code
│   ├── popup/                  # React popup application
│   │   ├── components/         # React components
│   │   ├── App.tsx             # Main app component
│   │   ├── index.tsx           # Entry point
│   │   └── globals.css         # Global styles
│   ├── background/             # Service worker
│   ├── content/                # Content scripts
│   └── lib/                    # Utilities
│       ├── firebase.ts         # Firebase configuration
│       └── auth.ts             # Authentication utilities
├── 📋 public/                  # Public assets
│   └── manifest.json           # Extension manifest
├── 🎨 icons/                   # Extension icons
└── ⚙️ Configuration files      # Build & config
```

## 🔧 Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Firebase** for authentication and data
- **Chrome Extension Manifest V3**
- **Webpack** for bundling
- **Radix UI** components

## 🔐 Authentication

The extension uses Firebase Authentication with Google OAuth:

- Chrome Identity API for OAuth flow
- Firebase Auth for user management
- Secure token handling
- Real-time authentication state

## 📊 How It Works

### **Time Tracking Flow:**
1. **Site Detection** - Monitors your active browser tabs
2. **Work Site Matching** - Checks if current site is in your work sites list
3. **Time Accumulation** - Tracks time spent on productive websites
4. **Idle Detection** - Pauses tracking when you're away from computer
5. **Real-time Sync** - Updates Firebase with your progress every few minutes

### **Social Features:**
1. **Friend Management** - Send/accept friend requests by email
2. **Leaderboard Updates** - Real-time rankings based on daily/weekly work time
3. **Profile Sharing** - View detailed friend stats and achievements
4. **Goal Competition** - See who's achieving their daily goals

### **Goal Achievement:**
1. **Progress Tracking** - Visual progress bars and percentage indicators
2. **Streak Building** - Maintain consecutive days of goal achievement
3. **Flexible Goals** - Adjust daily targets anytime in settings
4. **Achievement Badges** - Visual indicators for milestones and streaks

## 🎨 Design Features

- **Animated Grid Background** - Subtle purple grid pattern
- **Scanline Effect** - Moving scanline animation
- **Corner Accents** - Purple corner borders throughout UI
- **Glow Effects** - Multiple layers of purple glow
- **Smooth Transitions** - Fade-in animations and hover effects
- **Responsive Design** - Proper scaling for Chrome extension

## 🔧 Configuration

### **Work Sites Management**
Add/remove websites where you do productive work:
- **Development:** github.com, gitlab.com, stackoverflow.com
- **Design:** figma.com, adobe.com, sketch.com
- **Productivity:** notion.so, trello.com, asana.com
- **Communication:** slack.com, discord.com, teams.microsoft.com
- **Learning:** coursera.org, udemy.com, youtube.com

### **Daily Goal Settings**
- **Range:** 1-12 hours (adjustable in 0.5-hour increments)
- **Default:** 3 hours (changed from original 8 hours)
- **Location:** Settings → Profile tab → Daily Goal section
- **Real-time:** Updates across all extension components immediately

### **Firebase Configuration**
- **Project ID:** `lockedin-544ce`
- **Authentication:** Google OAuth with Firebase Auth
- **Database:** Firestore for real-time data sync
- **Security:** Firebase security rules protect user data
- **Hosting:** Firebase Hosting for privacy policy and assets

### **OAuth Setup**
- **Client ID:** `880132322779-p5pgt751sahinojhroa0h8c2.apps.googleusercontent.com`
- **Scopes:** email, profile, openid
- **Consent Screen:** Published for production use
- **Permissions:** Chrome Identity API for seamless authentication

## 🚀 Chrome Web Store Deployment

### **Ready for Beta Launch!**

The extension is **production-ready** and prepared for Chrome Web Store submission:

#### **✅ Completed:**
- ✅ All features implemented and tested
- ✅ Manifest V3 compliant
- ✅ Privacy policy created (`PRIVACY_POLICY.md`)
- ✅ OAuth consent screen published
- ✅ Build process automated (`npm run build`)
- ✅ Version 1.0.0 ready

#### **📦 Package for Submission:**
```bash
# Windows
prepare-webstore.bat

# Manual
npm run build
# Then ZIP the dist/ folder contents
```

#### **🎯 Submission Checklist:**
1. **Host Privacy Policy** - Upload `PRIVACY_POLICY.md` to GitHub Pages or your website
2. **Create Screenshots** - Take 3-5 screenshots (640x400 or 1280x800)
3. **Submit to Chrome Web Store** - Upload ZIP and fill out listing
4. **Review Process** - Typically 1-3 business days

#### **📋 Store Listing Assets Needed:**
- **Screenshots:** Main popup, leaderboard, settings, daily goal slider
- **Privacy Policy URL:** Publicly accessible link
- **Description:** Prepared marketing copy available
- **Category:** Productivity
- **Pricing:** Free

### **🔗 Quick Links:**
- **Chrome Web Store Developer Dashboard:** https://chrome.google.com/webstore/devconsole
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **Firebase Console:** https://console.firebase.google.com/project/lockedin-544ce

---

## 🛠️ Technical Details

### **Architecture:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Firebase (Auth + Firestore)
- **Build:** Webpack 5 with hot reloading
- **UI Components:** Radix UI + Lucide React icons
- **State Management:** React hooks + Firebase real-time listeners

### **Performance:**
- **Bundle Size:** ~601 KiB (popup), ~6 KiB (background), ~1 KiB (content)
- **Load Time:** <2 seconds for popup initialization
- **Memory Usage:** Minimal background processing
- **Network:** Efficient Firebase real-time sync

### **Security:**
- **Authentication:** Google OAuth 2.0 with Firebase Auth
- **Data Encryption:** Firebase security rules + HTTPS
- **Privacy:** No data collection beyond stated purposes
- **Permissions:** Minimal required permissions with clear justification

---

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (`npm run type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Development Setup:**
```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Clean build directory
npm run clean
```

---

## 🎉 Acknowledgments

- **Firebase** for authentication and real-time database
- **Google Chrome** for the extension platform
- **React** and **TypeScript** for the development experience
- **Tailwind CSS** for beautiful styling
- **Lucide React** for consistent iconography

---

**Built with ❤️ for productivity enthusiasts**

*Transform your work habits, compete with friends, and achieve your goals with LockedIn!* 🚀