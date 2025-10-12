import { auth, GoogleAuthProvider } from './firebase';
import { signInWithCredential } from 'firebase/auth';

export async function signInWithGoogleViaChrome() {
  try {
    // Use Chrome Identity API to get Google OAuth token
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome identity error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (token) {
          console.log('Got token from Chrome Identity API');
          resolve(token);
        } else {
          reject(new Error('No token received'));
        }
      });
    });

    console.log('Token received, creating credential...');
    
    // Create Google credential from the token
    const credential = GoogleAuthProvider.credential(null, token);
    
    console.log('Credential created, signing in with Firebase...');
    
    // Sign in with Firebase
    const result = await signInWithCredential(auth, credential);
    
    console.log('Firebase sign-in successful:', result.user?.displayName);
    
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
