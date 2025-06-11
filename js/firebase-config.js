// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIJ5xVWDHHuhLGKV-OFYlLXBvjrKtI7ic",
  authDomain: "hydrofish-e00a3.firebaseapp.com",
  databaseURL: "https://hydrofish-e00a3-default-rtdb.firebaseio.com",
  projectId: "hydrofish-e00a3",
  storageBucket: "hydrofish-e00a3.appspot.com",
  messagingSenderId: "807908907470",
  appId: "1:807908907470:web:4eb24dbeedf15b5855f39f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

export { database, firestore };
