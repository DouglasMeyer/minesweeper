import * as firebase from 'firebase';
firebase.initializeApp({
  apiKey: "secret",
  authDomain: "minesweeper-3d1c3.firebaseapp.com",
  databaseURL: "https://minesweeper-3d1c3.firebaseio.com",
  projectId: "minesweeper-3d1c3",
  storageBucket: "minesweeper-3d1c3.appspot.com",
  messagingSenderId: "secret?"
});

export default firebase;
