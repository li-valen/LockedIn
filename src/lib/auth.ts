import { auth, GoogleAuthProvider } from './firebase';
import { signInWithCredential } from 'firebase/auth';

export async function signInWithGoogleViaChrome() {
  try {
    console.log('Starting Google sign-in process...');
    
    // Use Chrome Identity API (required for Chrome extensions)
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          reject(new Error(`Chrome Identity Error: ${chrome.runtime.lastError.message}`));
        } else if (token) {
          console.log('Got token from Chrome Identity API:', token.substring(0, 20) + '...');
          resolve(token);
        } else {
          reject(new Error('No token received from Chrome Identity API'));
        }
      });
    });

    console.log('Token received, creating credential...');
    
    // Create Google credential from the token
    const credential = GoogleAuthProvider.credential(null, token);
    
    console.log('Credential created, signing in with Firebase...');
    
    // Sign in with Firebase
    const result = await signInWithCredential(auth, credential);
    
    console.log('Firebase sign-in successful:', {
      uid: result.user?.uid,
      email: result.user?.email,
      displayName: result.user?.displayName
    });
    
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Chrome Identity Error')) {
        throw new Error('Failed to authenticate with Google. Please check your Chrome extension permissions and ensure the OAuth client ID is correctly configured.');
      } else if (error.message.includes('auth/invalid-credential')) {
        throw new Error('Invalid Google credentials. Please try signing in again.');
      } else if (error.message.includes('auth/network-request-failed')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(`Sign-in failed: ${error.message}`);
      }
    }
    
    throw new Error('An unexpected error occurred during sign-in');
  }
}

export async function signOut() {
  try {
    await auth.signOut();
    
    // Also revoke Chrome identity token
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token });
      }
    });
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
