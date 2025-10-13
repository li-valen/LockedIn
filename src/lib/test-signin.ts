import { auth, GoogleAuthProvider } from './firebase';

// Test Google sign-in functionality
export function testGoogleSignIn() {
  console.log('=== Testing Google Sign-In ===');
  
  // Test 1: Check Chrome APIs
  console.log('✓ Chrome Identity API:', !!chrome.identity);
  console.log('✓ Chrome Runtime API:', !!chrome.runtime);
  
  // Test 2: Check Firebase
  console.log('✓ Firebase Auth:', !!auth);
  console.log('✓ Google Auth Provider:', !!GoogleAuthProvider);
  
  // Test 3: Check manifest permissions
  if (chrome.runtime && chrome.runtime.getManifest) {
    const manifest = chrome.runtime.getManifest();
    console.log('✓ OAuth2 configured:', !!manifest.oauth2);
    console.log('✓ Identity permission:', manifest.permissions?.includes('identity'));
    console.log('✓ Client ID:', manifest.oauth2?.client_id);
  }
  
  // Test 4: Try to get existing token
  if (chrome.identity) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        console.log('⚠ No existing token:', chrome.runtime.lastError.message);
      } else if (token) {
        console.log('✓ Existing token found:', token.substring(0, 20) + '...');
      } else {
        console.log('⚠ No token response');
      }
    });
  }
  
  console.log('=== Test Complete ===');
}
