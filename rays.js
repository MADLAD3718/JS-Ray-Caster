import { player } from '/player.js';
import { map } from '/map.js';
import { system } from '/system.js';

class RayCast {
	// calculate the number of rays that will need to be cast 
	numberOfRays = Math.ceil(system.SCREEN_WIDTH * system.RESOLUTION_SCALE);

	// generate the rays
	getRays() {
		// calculate the initial angle of the first ray
		const initialAngle = player.angle - system.FOV / 2;
		// divide the number of rays into the FOV to get the angle difference between each ray
		const angleStep = system.FOV / this.numberOfRays;
		// return all rays
		return Array.from({ length: this.numberOfRays }, (_, i) => {
			const angle = initialAngle + i * angleStep;
			const ray = this.castRay(angle);
			return ray;
		});
	}

	// cast a ray at an angle
	castRay(angle) {
		// get the vertical and horizontal collision of the ray and return the data from the closer one
		const vCollision = this.getVCollision(angle);
		const hCollision = this.getHCollision(angle);

		return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
	}

	// get the vertical collision of the ray
	getVCollision(angle) {
		// check if we are facing right
		const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

		// get first X and Y accordingly
		const firstX = right
			? Math.floor(player.x / map.CELL_SIZE) * map.CELL_SIZE + map.CELL_SIZE
			: Math.floor(player.x / map.CELL_SIZE) * map.CELL_SIZE;

		const firstY = player.y + (firstX - player.x) * Math.tan(angle);

		// step that each ray will travel
		const xStep = right ? map.CELL_SIZE : -map.CELL_SIZE;
		const yStep = xStep * Math.tan(angle);

		// while we don't have an intersection keep moving, then return the collision data
		let cellObject = 0;
		let nextX = firstX;
		let nextY = firstY;
		while (cellObject === 0) {
			const cellX = right
				? Math.floor(nextX / map.CELL_SIZE)
				: Math.floor(nextX / map.CELL_SIZE) - 1;
			const cellY = Math.floor(nextY / map.CELL_SIZE);

			if (map.outOfBounds(cellX, cellY)) {
				break;
			}
			cellObject = map.walls[cellY][cellX];
			if (cellObject === 0) {
				nextX += xStep;
				nextY += yStep;
			}
		}
		return {
			angle,
			distance: system.distance(player.x, player.y, nextX, nextY),
			vertical: true,
			x: nextX,
			y: nextY
		};
	}

	getHCollision(angle) {
		// check if we are facing up
		const up = Math.abs(Math.floor(angle / Math.PI) % 2);
		
		// get first X and Y accordingly
		const firstY = up
			? Math.floor(player.y / map.CELL_SIZE) * map.CELL_SIZE
			: Math.floor(player.y / map.CELL_SIZE) * map.CELL_SIZE + map.CELL_SIZE;
		const firstX = player.x + (firstY - player.y) / Math.tan(angle);

		// step that each ray will travel
		const yStep = up ? -map.CELL_SIZE : map.CELL_SIZE;
		const xStep = yStep / Math.tan(angle);

		// while we don't have an intersection keep moving, then return the collision data
		let cellObject = 0;
		let nextX = firstX;
		let nextY = firstY;
		while (cellObject === 0) {
			const cellX = Math.floor(nextX / map.CELL_SIZE);
			const cellY = up
				? Math.floor(nextY / map.CELL_SIZE) - 1
				: Math.floor(nextY / map.CELL_SIZE);

			if (map.outOfBounds(cellX, cellY)) {
				break;
			}

			cellObject = map.walls[cellY][cellX];
			if (cellObject === 0) {
				nextX += xStep;
				nextY += yStep;
			}
		}
		return {
			angle,
			distance: system.distance(player.x, player.y, nextX, nextY),
			vertical: false,
			x: nextX,
			y: nextY
		};
	}
}

const raycast = new RayCast();

export { raycast };