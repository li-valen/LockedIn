// firebase/firebase-firestore.js

export function getFirestore(app) {
  return { app, data: {} };
}

export function doc(db, ...pathSegments) {
  return { db, path: pathSegments.join("/") };
}

export async function setDoc(docRef, data, options = {}) {
  console.log("📦 Firestore write:", docRef.path, data);
  return Promise.resolve();
}

export async function getDoc(docRef) {
  console.log("🔍 Firestore read:", docRef.path);
  return { exists: () => false, data: () => null };
}
