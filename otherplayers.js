import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { systemFB } from "/firebase/system.js";
import { map } from '/map.js';
import { player } from '/player.js';

class OtherPlayers {
	// store the other players in an array
	players = [];

	// setup the other player interaction with the database
	setupPlayerInteraction() {
		let previousLength = 1;
		onValue(ref(systemFB.db, `/players`), (child) => {
			// Only runs if the amount of players changed
			if (Object.keys(child.val()).length !== previousLength) {
				// Unsub from all previously created onValue listeners
				this.players.forEach((player) => {
					player.removePosListener();
				});
				// Recreate enemies array
				this.players.length = 0;
				Object.keys(child.val()).forEach((id) => {
					if (id !== systemFB.auth.playerId) {
						this.players.push(new otherPlayer(id))
					}
				})
				// Add onValue listeners for all currently present enemies
				this.players.forEach((player) => {
					player.updatePos();
				})
				// If the amount of players decreased
				if (Object.keys(child.val()).length < previousLength) {
					// console.log(`Somebody left`)
					// For every remaining player in the lobby
					let lowestOrder = 1000;
					// find the lowest order number
					Object.keys(child.val()).forEach((id) => {
						if (child.val()[id].order < lowestOrder) {
							lowestOrder = child.val()[id].order;
						}
					})
					// Find out if the current player should decrease their order
					if (lowestOrder <= player.order && player.order !== 0) {
						player.order--;
					}
					// This reorders all players when someone leaves to get enemy position hosting working at all times and have it be seamless across player leaves and joins
				}
			}

			// Update previousLength for next value change
			previousLength = Object.keys(child.val()).length;
		});
	}

}

class otherPlayer {
	x = map.CELL_SIZE * 2.5;
	y = map.CELL_SIZE * 2.5;
	textureNum = 1;
	constructor(id) {
		this.playerId = id;
	}

	// Setup event listener for other player
	updatePos() {
		this.removePosListener = onValue(ref(systemFB.db, `players/${this.playerId}/position`), (snapshot) => {
			if (snapshot.val()) {
				// console.log(snapshot.val());
				const { x, y } = snapshot.val();
				this.x = x;
				this.y = y;
			}
		})
	}
}

const otherplayers = new OtherPlayers();

export { otherplayers };