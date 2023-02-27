import { system } from '/system.js';
import { renderer } from '/renderer.js';
import { player } from '/player.js';
import { raycast } from '/rays.js';
import { minimap } from '/minimap.js';
import { input } from '/input.js';
import { systemFB } from "./firebase/system.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

class Main {
	constructor() {
		// set the game run interval
		setInterval(this.gameLoop, system.TICK);
		// initialize input listeners
		input.initialize();
		// check for authentication
		onAuthStateChanged(systemFB.auth.auth, (user) => {
			if (user) {
				// setup player connections with database
				player.setupDisconnect();
				player.updatePosition();
				// ...
			} else {
				this.user = null;
				// User is signed out
				// ...
			}
		});
	}
	gameLoop() {
		// get FPS as well as generate frametime
		const FPS = system.getFPS();
		renderer.clearScreen();
		// move the player according to current input
		player.movePlayer();
		// generate rays and render scene accordingly
		const rays = raycast.getRays();
		renderer.renderScene(rays);

		// update the enemy positions and data
		player.updateEnemies();

		// optional rendering passes:
		if (system.RENDER_MINIMAP) {
			minimap.render(rays);
		}

		if (system.IS_PAUSED) {
			renderer.renderPauseScreen();
		}

		if (system.SHOW_STATS) {
			renderer.renderStats(FPS);
		}
	}
}
new Main();