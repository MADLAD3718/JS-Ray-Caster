import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { firebaseConfig } from "./config.js";
import { Auth } from "./auth.js"

//get the database and initialize the firebase
class FireBaseSystem {
	constructor() {
		// Initialize Firebase
		this.app = initializeApp(firebaseConfig);
		this.db = getDatabase(this.app);
    this.auth = new Auth(this);
	}
}
let systemFB = new FireBaseSystem();
export { systemFB };