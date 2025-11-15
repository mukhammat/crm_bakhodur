import admin from "firebase-admin";

const app = admin.initializeApp({
  credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!)
});

export const firebaseMessaging = app.messaging();