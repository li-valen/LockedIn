import { auth, GoogleAuthProvider, signInWithCredential } from "./firebase.js";

// Get Google token via Chrome identity API
export function chromeGetAccessToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError || new Error("No token"));
      } else {
        resolve(token);
      }
    });
  });
}

// Use that token to log in to Firebase
export async function signInWithGoogleViaChrome() {
  const token = await chromeGetAccessToken(true);
  const credential = GoogleAuthProvider.credential(null, token);
  return await signInWithCredential(auth, credential);
}
