import { map } from '/map.js';
import { pathfinding } from '/pathfinding.js';
import { system } from '/system.js';

class Enemies {
	// Enemy array
	enemies = [
		new Enemy(6.5, 7.5),
		new Enemy(24.5, 20.5),
		new Enemy(4.5, 21.5)
	];
	// Move enemy
	move(enemy) {
		if (enemy.continue) {
			// Get max speed with frametime
			const maxSpeed = 1 / 12 * system.frameTime;

			// If there is no path, create a new one at a random location
			if (enemy.path.length === 0) {
				this.getFinalCells(enemy);
				// Can currently find a goal of inside a wall
				enemy.path = JSON.parse(JSON.stringify(pathfinding.findPath(this.getCellPosition(enemy.x), this.getCellPosition(enemy.y), enemy.finalCellX, enemy.finalCellY)));
				// mark the current cell as visited
				enemy.path[this.getCellPosition(enemy.y)][this.getCellPosition(enemy.x)] = -3;
				// create a new cell goal
				this.updateCellWorldPos(enemy);
			}

			// once the enemy is within range of its target, teleport directly to the goal
			if (system.distance(enemy.x, enemy.y, enemy.goalCellWorldX, enemy.goalCellWorldY) < maxSpeed) {
				enemy.x = enemy.goalCellWorldX;
				enemy.y = enemy.goalCellWorldY;
				// mark this cell as visited
				enemy.path[this.getCellPosition(enemy.y)][this.getCellPosition(enemy.x)] = -3;
				// If this is the final goal, reset the path
				if (enemy.x === (enemy.finalCellX + 0.5) * map.CELL_SIZE && enemy.y === (enemy.finalCellY + 0.5) * map.CELL_SIZE) {
					enemy.path.length = 0;
				} else {
					this.updateCellWorldPos(enemy);
				}
			} else {
				// If the enemy is still travelling to the target, move in the direction of the target
				if ((enemy.x - enemy.goalCellWorldX) > 0) {
					enemy.x -= maxSpeed;
				} else if ((enemy.x - enemy.goalCellWorldX) < 0) {
					enemy.x += maxSpeed;
				}

				if ((enemy.y - enemy.goalCellWorldY) > 0) {
					enemy.y -= maxSpeed;
				} else if ((enemy.y - enemy.goalCellWorldY) < 0) {
					enemy.y += maxSpeed;
				}
			}
		}
	}

	// generate a random position to pathfind to that does not contain a wall
	getFinalCells(enemy) {
		let guessY;
		let guessX;
		do {
			guessY = Math.round(Math.random() * (map.walls.length - 1));
			guessX = Math.round(Math.random() * (map.walls[0].length - 1));
		} while (map.walls[guessY][guessX] > 0);
		enemy.finalCellY = guessY;
		enemy.finalCellX = guessX;
	}

	// turn world position value into cell position value
	getCellPosition(position) {
		return Math.floor(position / map.CELL_SIZE);
	}

	// update goal cell of enemy
	updateCellWorldPos(enemy) {
		// If the next cell in the path is up
		if (enemy.path[this.getCellPosition(enemy.y) + 1][this.getCellPosition(enemy.x)] === -2) {
			enemy.goalCellWorldX = (this.getCellPosition(enemy.x) + 0.5) * map.CELL_SIZE;
			enemy.goalCellWorldY = (this.getCellPosition(enemy.y) + 1 + 0.5) * map.CELL_SIZE;
		}

		// If the next cell in the path is down
		else if (enemy.path[this.getCellPosition(enemy.y) - 1][this.getCellPosition(enemy.x)] === -2) {
			enemy.goalCellWorldX = (this.getCellPosition(enemy.x) + 0.5) * map.CELL_SIZE;
			enemy.goalCellWorldY = (this.getCellPosition(enemy.y) - 1 + 0.5) * map.CELL_SIZE;
		}

		// If the next cell in the path is left
		else if (enemy.path[this.getCellPosition(enemy.y)][this.getCellPosition(enemy.x) - 1] === -2) {
			enemy.goalCellWorldX = (this.getCellPosition(enemy.x) - 1 + 0.5) * map.CELL_SIZE;
			enemy.goalCellWorldY = (this.getCellPosition(enemy.y) + 0.5) * map.CELL_SIZE;
		}

		// If the next cell in the path is right
		else if (enemy.path[this.getCellPosition(enemy.y)][this.getCellPosition(enemy.x) + 1] === -2) {
			enemy.goalCellWorldX = (this.getCellPosition(enemy.x) + 1 + 0.5) * map.CELL_SIZE;
			enemy.goalCellWorldY = (this.getCellPosition(enemy.y) + 0.5) * map.CELL_SIZE;
		}
	}

}

// Data to be stored on database and updated by Enemies class
class Enemy {
	x = 1.5;
	y = 1.5;
	continue = true;
	finalCellX = 2;
	finalCellY = 1;
	goalCellX = this.x;
	goalCellY = this.y;
	path = [];
	textureNum = 0;
	constructor(cellPositionX, cellPositionY) {
		this.x = map.CELL_SIZE * cellPositionX;
		this.y = map.CELL_SIZE * cellPositionY;
	}
}

const enemies = new Enemies();

export { enemies };