import { auth, GoogleAuthProvider } from './firebase';
import { signInWithCredential } from 'firebase/auth';

export async function signInWithGoogleViaChrome() {
  try {
    // Use Chrome Identity API to get Google OAuth token
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (token) {
          resolve(token);
        } else {
          reject(new Error('No token received'));
        }
      });
    });

    // Create Google credential from the token
    const credential = GoogleAuthProvider.credential(null, token);
    
    // Sign in with Firebase
    const result = await signInWithCredential(auth, credential);
    
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
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
