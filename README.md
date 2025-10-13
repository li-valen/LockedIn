# 🔒 LockedIn Chrome Extension

A modern productivity tracking Chrome extension built with React, TypeScript, and Firebase.

## ✨ Features

- 🎯 **Work Time Tracking** - Automatic tracking on productive websites
- 🏆 **Leaderboard** - Competitive rankings with friends
- ⚙️ **Settings Management** - Configure sites, goals, and notifications
- 🔐 **Google Authentication** - Secure sign-in with Firebase
- 🎨 **Modern UI** - Dark theme with purple accents and animations
- 📊 **Progress Visualization** - Circular progress rings and achievement badges
- 🔄 **Real-time Updates** - Dynamic progress calculation and display

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

1. **Automatic Tracking** - Monitors active tabs and detects productive websites
2. **Real-time Updates** - Popup shows live work time and updates every 5 seconds
3. **Badge Indicators** - Toolbar badge shows "ON" when working, "OFF" when idle
4. **Settings Integration** - Add/remove work sites through the settings page
5. **Daily Reset** - Automatically resets daily work time at midnight

## 🎨 Design Features

- **Animated Grid Background** - Subtle purple grid pattern
- **Scanline Effect** - Moving scanline animation
- **Corner Accents** - Purple corner borders throughout UI
- **Glow Effects** - Multiple layers of purple glow
- **Smooth Transitions** - Fade-in animations and hover effects
- **Responsive Design** - Proper scaling for Chrome extension

## 🔧 Configuration

### Work Sites
Default productive websites:
- github.com
- figma.com
- notion.so
- linear.app

### Firebase Setup
The extension is configured with Firebase project:
- Project ID: `lockedin-544ce`
- Authentication enabled
- Firestore database ready

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for productivity enthusiasts