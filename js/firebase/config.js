const firebaseConfig = {
   apiKey: "AIzaSyC_AZYYrRo4Du87ohOhjK8Ke_UM8nq5Mdk",
  authDomain: "jumblejump-prod.firebaseapp.com",
  projectId: "jumblejump-prod",
  storageBucket: "jumblejump-prod.firebasestorage.app",
  messagingSenderId: "25185167776",
  appId: "1:25185167776:web:ee0f3e2ee89758f76c1cc5",
  measurementId: "G-WWWQHS7WD3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();