import { player } from '/player.js';
import { canvas } from '/renderer.js';
import { system } from '/system.js';

class InputListener {
	// Store currently pressed keys and the number of keys pressed in either perpendicular direction (this is later used for diagonal movement detection)
	inputKeys = {
		w: false,
		a: false,
		s: false,
		d: false,
		pAD: 0,
		pWS: 0
	}

	// Setup event listeners
	initialize() {
		// pointer lock
		canvas.onclick = function() {
			if (!system.IS_PAUSED) {
				canvas.requestPointerLock();
			}
		}
		document.addEventListener('pointerlockchange', () => {
			if (document.pointerLockElement !== canvas && document.mozPointerLockElement !== canvas) {
				system.IS_PAUSED = true;
			}
		});
		// WASD + escape functionality
		document.addEventListener("keydown", (event) => {
			this.keyDown(event.key);
			if (event.key === "Escape") {
				system.IS_PAUSED = !system.IS_PAUSED;
			}
		});

		document.addEventListener("keyup", (event) => {
			this.keyUp(event.key);
		});

		document.addEventListener("mousemove", (e) => {
			if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas && !system.IS_PAUSED) {
				player.angle += system.toRadians(e.movementX * system.SENSITIVITY)
			}
		});
	}

	// Write to keys when pressed or released
	keyDown(key) {
		if (key === "w" || key === "a" || key === "s" || key === "d") {
			this.inputKeys[key] = true;
			this.updateInputKeys();
		}
	}

	keyUp(key) {
		if (key === "w" || key === "a" || key === "s" || key === "d") {
			this.inputKeys[key] = false;
			this.updateInputKeys();
		}
	}

	// Update number of keys pressed in each perpendicular direction
	updateInputKeys() {
		this.inputKeys.pWS = 0;
		this.inputKeys.pAD = 0;
		if (this.inputKeys["w"]) {
			this.inputKeys.pWS++;
		}
		if (this.inputKeys["a"]) {
			this.inputKeys.pAD++;
		}
		if (this.inputKeys["s"]) {
			this.inputKeys.pWS++;
		}
		if (this.inputKeys["d"]) {
			this.inputKeys.pAD++;
		}
	}
}

const input = new InputListener();

export { input };