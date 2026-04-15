//Firebase keys
const firebaseConfig = {
  apiKey: "AIzaSyBdEMZSEXIeDwZbhqVw9JyaXovhahu9xNY",
  authDomain: "cloud-software-developme-241bf.firebaseapp.com",
  databaseURL: "https://cloud-software-developme-241bf-default-rtdb.firebaseio.com",
  projectId: "cloud-software-developme-241bf",
  storageBucket: "cloud-software-developme-241bf.firebasestorage.app",
  messagingSenderId: "368586441228",
  appId: "1:368586441228:web:8dd10ac20f5a887a0fa429",
};


firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();