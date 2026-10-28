// Firebase (ES module via CDN, bach i5dem f HTML 3adi bla bundler)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDta_n8vbm54PAszztz1OkicnmykC2R0GM",
  authDomain: "anarchy-86ae0.firebaseapp.com",
  projectId: "anarchy-86ae0",
  storageBucket: "anarchy-86ae0.firebasestorage.app",
  messagingSenderId: "871406851286",
  appId: "1:871406851286:web:e1a13604b462499f92e577",
  measurementId: "G-QR5KFJEQFW"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
