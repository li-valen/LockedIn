import { auth, GoogleAuthProvider } from './firebase';
import { signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

export async function signInWithGoogleViaChrome() {
  try {
    console.log('Starting Google sign-in process...');
    
    // First try Chrome Identity API
    try {
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome identity error:', chrome.runtime.lastError);
            reject(new Error(`Chrome Identity Error: OAuth2 request failed: Service responded with error: 'bad client id: {0}'`));
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
    } catch (chromeError) {
      console.warn('Chrome Identity API failed, trying popup method:', chromeError);
      
      // Fallback to popup method
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      
      console.log('Firebase popup sign-in successful:', {
        uid: result.user?.uid,
        email: result.user?.email,
        displayName: result.user?.displayName
      });
      
      return result;
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Chrome Identity Error')) {
        throw new Error('Failed to authenticate with Google. Please check your Chrome extension permissions.');
      } else if (error.message.includes('auth/invalid-credential')) {
        throw new Error('Invalid Google credentials. Please try signing in again.');
      } else if (error.message.includes('auth/network-request-failed')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('auth/popup-closed-by-user')) {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.message.includes('auth/popup-blocked')) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      } else if (error.message.includes('auth/internal-error')) {
        throw new Error('Firebase: Error (auth/internal-error).');
      } else if (error.message.includes('auth/operation-not-allowed')) {
        throw new Error('Google sign-in is not enabled. Please contact support.');
      } else if (error.message.includes('auth/too-many-requests')) {
        throw new Error('Too many sign-in attempts. Please try again later.');
      } else {
        throw new Error(`Sign-in failed: ${error.message}`);
      }
    }
    
    throw new Error('An unexpected error occurred during sign-in');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    
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

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

// Helper function to get current user
export function getCurrentUser() {
  return auth.currentUser;
}
