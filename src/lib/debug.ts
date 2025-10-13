import { auth, GoogleAuthProvider } from './firebase';

// Debug helper for Google sign-in testing
export function debugGoogleSignIn() {
  console.log('=== Google Sign-In Debug Info ===');
  console.log('Chrome Identity API available:', !!chrome.identity);
  console.log('Chrome runtime available:', !!chrome.runtime);
  console.log('Firebase auth available:', !!auth);
  console.log('Google Auth Provider available:', !!GoogleAuthProvider);
  
  // Test Chrome Identity API
  if (chrome.identity) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        console.log('Chrome Identity Error:', chrome.runtime.lastError.message);
      } else if (token) {
        console.log('Existing token found:', token.substring(0, 20) + '...');
      } else {
        console.log('No existing token found');
      }
    });
  }
  
  console.log('=== End Debug Info ===');
}
