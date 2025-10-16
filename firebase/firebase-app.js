// firebase/firebase-app.js
export function initializeApp(config) {
  if (!config || !config.projectId) {
    throw new Error("Firebase config missing or invalid.");
  }
  return { config, name: "[DEFAULT]" };
}
