# Privacy Policy for LockedIn

**Last Updated:** October 18, 2025

## Overview
LockedIn ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension.

## Information We Collect

### 1. Personal Information
- **Google Account Information**: When you sign in, we collect:
  - Email address
  - Display name
  - Profile picture (if available)
  - Google User ID

### 2. Usage Data
- **Work Time Tracking**: Time spent on websites you designate as "work sites"
- **Website URLs**: Only for sites you've added to your work sites list
- **Daily Statistics**: Aggregated work time and productivity metrics
- **Achievement Data**: Streaks, goals achieved, and leaderboard rankings

### 3. Social Features
- **Friend Connections**: Email addresses of users you add as friends
- **Leaderboard Data**: Your productivity stats shared with friends

## How We Use Your Information

We use the collected information to:
- Authenticate your identity via Google OAuth
- Track and display your productivity metrics
- Calculate daily goals and achievement streaks
- Enable social features (leaderboards, friend comparisons)
- Sync your data across devices
- Improve the extension's functionality

## Data Storage

- All data is stored securely in **Firebase Firestore** (Google Cloud Platform)
- Data is encrypted in transit and at rest
- We implement industry-standard security measures
- Your data is associated with your Google User ID

## Data Sharing

We **DO NOT**:
- Sell your personal information to third parties
- Share your data with advertisers
- Use your data for purposes other than stated above

We **ONLY** share:
- Your productivity stats with friends you've explicitly added
- Aggregated, anonymized data for leaderboards (only with your friends)

## Third-Party Services

We use the following third-party services:
- **Google OAuth** - For authentication
- **Firebase Authentication** - For user management  
- **Firebase Firestore** - For data storage
- **Google Cloud Platform** - For hosting services

These services have their own privacy policies:
- [Google Privacy Policy](https://policies.google.com/privacy)
- [Firebase Privacy Policy](https://firebase.google.com/support/privacy)

## Your Rights

You have the right to:
- **Access** your data at any time through the extension
- **Delete** your account and all associated data
- **Export** your data (contact us)
- **Revoke** Google sign-in permissions at any time
- **Remove** friends and control who sees your data

## Data Retention

- Active accounts: Data retained as long as you use the extension
- Inactive accounts: Data retained for 90 days of inactivity
- Deleted accounts: All data permanently deleted within 30 days

## Children's Privacy

LockedIn is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.

## Changes to Privacy Policy

We may update this Privacy Policy periodically. Changes will be posted here with an updated "Last Updated" date. Continued use of the extension after changes constitutes acceptance.

## Contact Us

If you have questions about this Privacy Policy or your data:
- **Email**: [YOUR_EMAIL@example.com]
- **GitHub**: [YOUR_GITHUB_PROFILE]

## Permissions Justification

### Why We Need Each Permission:

- **tabs**: To detect which websites you're actively using for work time tracking
- **storage**: To save your settings and work sites list locally
- **activeTab**: To identify the current website for tracking
- **identity**: For Google OAuth authentication
- **idle**: To detect when you're away from your computer
- **host_permissions (https://*/*)**: To track work time on any website you designate

## Data Security

We implement security measures including:
- Secure HTTPS connections
- Firebase security rules
- Token-based authentication
- Regular security audits
- No storage of sensitive credentials

## Your Consent

By using LockedIn, you consent to this Privacy Policy and agree to its terms.

---

**LockedIn Extension** - Track productivity, achieve more.

