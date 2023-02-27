import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

//create authorization for the player, and gives the player a random ID
class Auth {
  constructor(system) {
    this.system = system;
    this.auth = getAuth(this.system.app);
    signInAnonymously(this.auth)
      .then(() => {
        // Signed in..
      })
      .catch((error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
        // ...
      });
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.playerId = user.uid;
        // ...
      } else {
        this.user = null;
        // User is signed out
        // ...
      }
    });
  }
}

export {Auth}