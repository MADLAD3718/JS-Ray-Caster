//import game functions
import { map } from '/map.js';
import { input } from '/input.js';
import { system } from '/system.js';
import { update, ref, onValue, onDisconnect, get, remove } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { systemFB } from "/firebase/system.js";
import { enemies } from '/enemy.js';
import { otherplayers } from '/otherplayers.js';

class Player {
	x = map.CELL_SIZE * 2.5;
	y = map.CELL_SIZE * 2.5;
	connected = false;
	order;
	angle = 0;
	speed = 0;
	sideSpeed = 0;

	// methods required to move the player
	movePlayer() {
		this.getSpeeds();
		this.move();
	}

	// get the directional speed the player will be travelling in according to input
	getSpeeds() {
		// multiply speed by frametime to ensure consistent percieved speed over low framerates
		const maxSpeed = 2 / 12 * system.frameTime;
		// reset speed, then add maxspeed in the direction of movement
		this.speed = 0;
		this.sideSpeed = 0;
		if (!system.IS_PAUSED && this.connected) {
			if (input.inputKeys["w"]) {
				this.speed += maxSpeed;
			}
			if (input.inputKeys["s"]) {
				this.speed -= maxSpeed;
			}
			if (input.inputKeys["a"]) {
				this.sideSpeed -= maxSpeed;
			}
			if (input.inputKeys["d"]) {
				this.sideSpeed += maxSpeed;
			}
			// If diagonal type input, turn final speed into main speed through reversing the hypotenuse on the two speed vectors. This makes sure no matter the input direction the player will always travel at the same max speed.
			if (input.inputKeys.pWS === 1 && input.inputKeys.pAD === 1) {
				this.speed /= Math.SQRT2;
				this.sideSpeed /= Math.SQRT2;
			}
      //sends the movement data to the firebase db only when the player moves
			if (this.speed !== 0 || this.sideSpeed !== 0) {
				update(ref(systemFB.db, `players/${systemFB.auth.playerId}/position`), { x: this.x, y: this.y });
			}
		}
	}
  
	updatePosition() {
		// Read current player position from database in case their id is being written to in two different tabs
		onValue(ref(systemFB.db, `players/${systemFB.auth.playerId}/position`), (snapshot) => {
			if (snapshot.val()) {
				const { x, y } = snapshot.val();
				this.x = x;
				this.y = y;
			}
		})
	}
	
  //calculates when the player collides with a wall and calculates how the player would move against the wall
	move() {
		const nextX = (this.x + Math.cos(this.angle) * this.speed) + Math.cos(this.angle + system.toRadians(90)) * this.sideSpeed;
		if (!this.checkXCollision(nextX)) {
			this.x = nextX;
		}

		const nextY = (this.y + Math.sin(this.angle) * this.speed) + Math.sin(this.angle + system.toRadians(90)) * this.sideSpeed;
		if (!this.checkYCollision(nextY)) {
			this.y = nextY;
		}
	}

	checkXCollision(x) {
		// Find cell that the x position occupies, check if there is a wall
		const right = Math.abs(Math.floor(((this.angle) - Math.PI / 2) / Math.PI) % 2);
		const wallXCheck = right ? Math.ceil(x / map.CELL_SIZE) - 1 : Math.ceil(x / map.CELL_SIZE) - 1;
		if (map.walls[Math.floor(this.y / map.CELL_SIZE)][wallXCheck] === 0) {
			return false;
		} else {
			return true;
		}
	}

	checkYCollision(y) {
		// Find cell that the y position occupies, check if there is a wall
		const up = Math.abs(Math.floor((this.angle) / Math.PI) % 2);
		const wallYCheck = up ? Math.ceil(y / map.CELL_SIZE) - 1 : Math.floor(y / map.CELL_SIZE);
		if (map.walls[wallYCheck][Math.floor(this.x / map.CELL_SIZE)] === 0) {
			return false;
		} else {
			return true;
		}
	}

	setupDisconnect() {
		// Create a reference to this user's database node
		const userDatabaseRef = ref(systemFB.db, `players/${systemFB.auth.playerId}`);
		// When the player changes connection status
		onValue(ref(systemFB.db, '.info/connected'), (snapshot) => {
			if (snapshot.val() === false) {
				return;
			};
			// on disconnect remove player node on database
			onDisconnect(userDatabaseRef).remove().then(() => {
				// onDisconnect function is called immediately so re-implement the data on the database
				update(ref(systemFB.db, `players/${systemFB.auth.playerId}/position`), { x: map.CELL_SIZE * 2.5, y: map.CELL_SIZE * 2.5 });
				// Get the order this player should be in
				this.initializeDB();
				// setup other players database interaction
				otherplayers.setupPlayerInteraction();
			});
		});
	}

	// initialize player interaction with the database
	initializeDB() {
		// get the amount of players in the lobby, and set this player's order accordingly
		get(ref(systemFB.db, '/players')).then((snapshot) => {
			const currentPlayers = Object.keys(snapshot.val()).length;
			this.order = currentPlayers - 1;
			// console.log(`Your order number is ${this.order}`)
			update(ref(systemFB.db, `players/${systemFB.auth.playerId}/position`), { x: this.x, y: this.y });
			update(ref(systemFB.db, `players/${systemFB.auth.playerId}`), { order: this.order });
			// mark them as connected for enemy updating
			this.connected = true;
		})
	}

	updateEnemies() {
		if (this.connected) {
			// If this order is 0, update the enemy positions on the database
			if (this.order === 0) {
				// Move all enemies
				enemies.enemies.forEach((enemy) => {
					enemies.move(enemy);
					// enemy.move();
				})
				update(ref(systemFB.db, '/enemies'), { enemies: enemies.enemies })
			} else {
				// if this order is not 0, read the enemy positions from the database
				get(ref(systemFB.db, '/enemies')).then((snapshot) => {
					enemies.enemies = snapshot.val().enemies;
				})
			}
			// update this player's order on the database every loop for other players to read
			update(ref(systemFB.db, `players/${systemFB.auth.playerId}`), { order: this.order });
		}
	}
}

const player = new Player();

export { player };