/**
 * Firebase Auth - ESM Build
 * Version: 11.0.1
 */
export function getAuth(app) {
  return {
    app,
    currentUser: null,
    signOut: async () => Promise.resolve(),
  };
}

export class GoogleAuthProvider {
  static credential(idToken, accessToken) {
    return { idToken, accessToken, providerId: "google.com" };
  }
}

export async function signInWithCredential(auth, credential) {
  // Simulated login flow
  return {
    user: {
      uid: "demo-uid",
      displayName: "Demo User",
      email: "demo@example.com",
      photoURL: "https://i.pravatar.cc/150?img=3",
    },
    credential,
  };
}
