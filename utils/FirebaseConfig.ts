import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"



  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBshvb4fAg5IvC04M6EAlTF47r_PH6XPoo",
  authDomain: "spotify-9138a.firebaseapp.com",
  projectId: "spotify-9138a",
  storageBucket: "spotify-9138a.firebasestorage.app",
  messagingSenderId: "571867034037",
  appId: "1:571867034037:web:27c78f304717c29b8269fc",
  measurementId: "G-G67F7V7MXZ"
};

  const app = initializeApp(firebaseConfig);
  export const firebaseAuth = getAuth(app)