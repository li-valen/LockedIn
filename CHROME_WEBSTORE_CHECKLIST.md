# Chrome Web Store Submission Checklist

## 📋 Pre-Submission Requirements

### ✅ Completed
- [x] Manifest V3 compliant
- [x] Privacy Policy created (`PRIVACY_POLICY.md`)
- [x] Version number updated to 1.0.0
- [x] Build process working (`npm run build`)
- [x] All icons present (16x16, 48x48, 128x128)

### ⚠️ Action Required

#### 1. **Privacy Policy Hosting** (REQUIRED)
- [ ] Host `PRIVACY_POLICY.md` on a public URL
  - Options:
    - GitHub Pages (recommended, free)
    - Your website
    - Google Sites
  - **You'll need this URL for the Chrome Web Store listing**

#### 2. **OAuth Client ID Setup** (CRITICAL)
- [ ] Verify OAuth consent screen in Google Cloud Console
  - Go to: https://console.cloud.google.com/apis/credentials
  - Make sure "Publishing status" is set to "In production" (not "Testing")
  - Add authorized JavaScript origins
  - Add redirect URIs
- [ ] Verify OAuth Client ID in Chrome Web Store Developer Dashboard
  - After creating the listing, you may need to update the OAuth client ID
  - See: https://developer.chrome.com/docs/webstore/using_webstore_api/

#### 3. **Store Listing Assets** (REQUIRED)

##### Screenshots (At least 1, max 5)
**Required Size: 1280x800 or 640x400**
- [ ] Screenshot 1: Main popup with time tracking
- [ ] Screenshot 2: Leaderboard view
- [ ] Screenshot 3: Settings page
- [ ] Screenshot 4: Daily goal setting
- [ ] Screenshot 5: Friend management

**How to create:**
1. Open extension popup
2. Use Chrome DevTools → Device Toolbar
3. Set custom size: 640x400
4. Take screenshots using Snipping Tool or similar

##### Promotional Images (Optional but Recommended)
- [ ] Small promotional tile: 440x280
- [ ] Marquee promotional tile: 1400x560

##### Store Icon
- [ ] 128x128 icon (already have ✓)

#### 4. **Store Listing Text**

##### Short Description (132 characters max)
```
Track your productivity with beautiful UI, compete with friends, and achieve your daily goals!
```

##### Detailed Description (Prepared for you)
```
🔒 LockedIn - Your Productivity Companion

Transform how you track and improve your work productivity with LockedIn, a beautifully designed Chrome extension that makes productivity tracking engaging and social.

✨ KEY FEATURES

🎯 Automatic Time Tracking
• Track time spent on your productive websites
• Real-time monitoring with no manual input needed
• Smart detection of active vs. idle time
• Daily progress visualization with circular progress rings

🏆 Social Leaderboards
• Compete with friends on daily and weekly boards
• See real-time productivity rankings
• View detailed friend profiles and stats
• Build accountability through friendly competition

⚙️ Customizable Goals
• Set personalized daily hour goals (1-12 hours)
• Adjust targets with an intuitive slider
• Track progress with percentage indicators
• Achieve streaks to stay motivated

👥 Friend System
• Add friends by email
• Accept/decline friend requests
• View friend productivity profiles
• Weekly stats and achievements

🎨 Beautiful Design
• Modern dark theme with purple accents
• Smooth animations and transitions
• Cyberpunk-inspired UI elements
• Responsive and intuitive interface

🔐 Secure & Private
• Google OAuth authentication
• Firebase-powered backend
• Your data stays encrypted and private
• Full control over your information

📊 Detailed Analytics
• Daily and weekly work time statistics
• Goal achievement tracking
• Streak monitoring
• Progress over time

HOW IT WORKS

1. Sign in with your Google account
2. Add websites you consider "work sites"
3. LockedIn automatically tracks time on those sites
4. View your progress, compete with friends, and achieve your goals!

PERFECT FOR

• Students tracking study hours
• Developers monitoring coding time
• Freelancers tracking billable hours
• Remote workers staying accountable
• Anyone wanting to improve productivity

PRIVACY & SECURITY

LockedIn takes your privacy seriously. We only track websites you explicitly add, and your data is never sold or shared with third parties. All information is stored securely in Firebase with industry-standard encryption.

See our full Privacy Policy: [YOUR_PRIVACY_POLICY_URL]

GET STARTED

1. Install LockedIn
2. Click the extension icon
3. Sign in with Google
4. Add your work websites in Settings
5. Start tracking your productivity!

Join thousands of users improving their productivity with LockedIn today! 🚀
```

#### 5. **Developer Account** (One-time $5 fee)
- [ ] Create Chrome Web Store Developer account
  - Go to: https://chrome.google.com/webstore/devconsole
  - Pay $5 one-time registration fee
  - Verify email

#### 6. **Category Selection**
Recommended category: **Productivity**

#### 7. **Language**
- [ ] English (United States)

#### 8. **Pricing**
- [ ] Free

#### 9. **Permissions Justification**
When asked why you need each permission, use:

**tabs**: "Required to detect which websites the user is actively browsing for accurate work time tracking on user-designated productive websites."

**storage**: "Used to save user preferences, work site configurations, and settings locally for faster access and offline functionality."

**activeTab**: "Needed to identify the currently active tab to track real-time productivity on user-selected work websites."

**scripting**: "Required to inject content scripts that enable real-time activity detection and work time tracking functionality."

**identity**: "Used for secure Google OAuth authentication to provide a seamless and secure sign-in experience."

**idle**: "Detects when the user is away from the computer to pause work time tracking and ensure accurate productivity measurements."

**host_permissions (https://*/*)**: "Allows tracking work time on any website that the user explicitly adds to their work sites list. Only monitors sites the user chooses to track."

#### 10. **Testing**
Before submission:
- [ ] Test installation from scratch
- [ ] Test all features:
  - [ ] Google sign-in
  - [ ] Time tracking
  - [ ] Adding work sites
  - [ ] Friend system
  - [ ] Daily goal setting
  - [ ] Leaderboards
  - [ ] Profile viewing
- [ ] Test on a fresh Chrome profile
- [ ] Check for console errors
- [ ] Verify all UI elements display correctly

## 🚀 Submission Steps

1. **Build the extension**
   ```bash
   npm run build
   ```

2. **Create ZIP file**
   - Zip the entire `dist` folder contents (not the folder itself)
   - Should include: manifest.json, popup.html, all .js files, icons folder

3. **Go to Chrome Web Store Developer Dashboard**
   - https://chrome.google.com/webstore/devconsole

4. **Click "New Item"**

5. **Upload ZIP file**

6. **Fill out store listing**
   - Use the prepared descriptions above
   - Upload screenshots
   - Add privacy policy URL
   - Set category to Productivity

7. **Submit for Review**
   - Review time: Usually 1-3 days for first submission
   - May take longer if additional review is needed

## ⚠️ Common Rejection Reasons to Avoid

- [ ] Missing privacy policy URL
- [ ] Screenshots don't show actual extension functionality
- [ ] Insufficient permissions justification
- [ ] OAuth not properly configured
- [ ] Extension doesn't work as described
- [ ] Icons are low quality or placeholder images

## 📧 Support Email
Make sure to provide a support email in the listing:
- [ ] Add your support email for user inquiries

## 🔄 Post-Submission

After submission:
- Monitor the Developer Dashboard for review status
- Respond promptly to any review feedback
- Be prepared to make changes if requested
- Once approved, your extension will be live!

## 📝 Notes

- **Review time**: Typically 1-3 business days
- **Beta testing**: You can publish as "Unlisted" first to test with a small group
- **Updates**: Future updates also go through review (usually faster)
- **Analytics**: Enable Google Analytics for Web Store to track installs

## 🎉 Success!

Once approved, share your extension:
- Share the Chrome Web Store link
- Add badges to your README
- Promote on social media
- Collect user feedback

---

**Current Status**: Ready for screenshot creation and privacy policy hosting!

