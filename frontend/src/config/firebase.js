import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC17VNmi9z1-26KeCMgB4j9Ts6Ys06nzqE",
  authDomain: "urbansync-81c2f.firebaseapp.com",
  projectId: "urbansync-81c2f",
  storageBucket: "urbansync-81c2f.firebasestorage.app",
  messagingSenderId: "582011900851",
  appId: "1:582011900851:web:19621ef90428d23b1b71c6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.settings.appVerificationDisabledForTesting = true;
export default app;
