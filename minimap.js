import { system } from '/system.js';
import { map } from '/map.js';
import { context } from '/renderer.js';
import { player } from '/player.js';
import { enemies } from '/enemy.js';
import { otherplayers } from '/otherplayers.js';

class Minimap {
	// beginning player/entity size to use 
	PLAYER_SIZE = 30;

	// render minimap
	render(rays) {
		this.renderWalls();
		this.renderRays(rays);
		this.renderEnemies();
		this.renderOtherPlayers();
		this.renderPlayer();
	}

	// display the walls
	renderWalls() {
		// size according to minimap scale
		const cellSize = system.MINIMAP_SCALE * map.CELL_SIZE;
		map.walls.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell) {
					context.fillStyle = "white";
					context.fillRect(
						x * cellSize,
						y * cellSize,
						cellSize,
						cellSize
					);
				}
			});
		});
	}

	// display the rays
	renderRays(rays) {
		context.strokeStyle = "rgb(255, 166, 0)";
		rays.forEach(ray => {
			context.beginPath();
			context.moveTo(player.x * system.MINIMAP_SCALE, player.y * system.MINIMAP_SCALE);
			context.lineTo(
				(player.x + Math.cos(ray.angle) * ray.distance) * system.MINIMAP_SCALE,
				(player.y + Math.sin(ray.angle) * ray.distance) * system.MINIMAP_SCALE
			);
			context.closePath();
			context.stroke();
		});
	}

	// display the player
	renderPlayer() {
		context.fillStyle = "blue";
		context.fillRect(
			system.MINIMAP_SCALE * (player.x - this.PLAYER_SIZE / 2),
			system.MINIMAP_SCALE * (player.y - this.PLAYER_SIZE / 2),
			this.PLAYER_SIZE * system.MINIMAP_SCALE,
			this.PLAYER_SIZE * system.MINIMAP_SCALE
		);

		// put a little line in front of the player to help with angle visibility
		const rayLength = this.PLAYER_SIZE * 2;
		context.strokeStyle = "blue";
		context.beginPath();
		context.moveTo(player.x * system.MINIMAP_SCALE, player.y * system.MINIMAP_SCALE);
		context.lineTo(
			(player.x + Math.cos(player.angle) * rayLength) * system.MINIMAP_SCALE,
			(player.y + Math.sin(player.angle) * rayLength) * system.MINIMAP_SCALE
		);
		context.closePath();
		context.stroke();
	}

	// display all currently present enemies
	renderEnemies() {
		context.fillStyle = "red";
		enemies.enemies.forEach((enemy) => {
			context.fillRect(
				system.MINIMAP_SCALE * (enemy.x - this.PLAYER_SIZE / 2),
				system.MINIMAP_SCALE * (enemy.y - this.PLAYER_SIZE / 2),
				this.PLAYER_SIZE * system.MINIMAP_SCALE,
				this.PLAYER_SIZE * system.MINIMAP_SCALE
			)
		})
	}

	// display all currently present other players
	renderOtherPlayers() {
		context.fillStyle = "green";
		otherplayers.players.forEach((otherPlayer) => {
			context.fillRect(
				system.MINIMAP_SCALE * (otherPlayer.x - this.PLAYER_SIZE / 2),
				system.MINIMAP_SCALE * (otherPlayer.y - this.PLAYER_SIZE / 2),
				this.PLAYER_SIZE * system.MINIMAP_SCALE,
				this.PLAYER_SIZE * system.MINIMAP_SCALE
			)
		})
	}
}

const minimap = new Minimap();

export { minimap };