import { system } from '/system.js';
import { map } from '/map.js';
import { player } from '/player.js';
import { wall } from '/render/wall.js';
import { floorceiling } from '/render/floor.js';
import { enemies } from '/enemy.js';
import { sprites } from '/render/sprite.js'
import { otherplayers } from '/otherplayers.js';

const canvas = document.createElement("canvas");
canvas.setAttribute("width", system.SCREEN_WIDTH);
canvas.setAttribute("height", system.SCREEN_HEIGHT);
document.body.appendChild(canvas);

const context = canvas.getContext("2d", { alpha: false });

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

export { context, canvas };

class Renderer {
	constructor() {
		context.font = `48px serif`;
	}

	// offset for the debug ray we are inspecting
	DEBUG_OFFSET = 0;

	// Rendering variables
	ray;
	curRay;
	distance;
	wallHeight;
	halfWallHeight;

	// How far should light travel
	lightFallOffStretch = 350;

	// Calculations
	fixFishEye(distance, angle, playerAngle) {
		// fix the fix eye effect by turning ray distance into that which is perpendicular to the screen plane
		const diff = angle - playerAngle;
		return distance * Math.cos(diff);
	}

	inverseFixFishEye(distance, angle, playerAngle) {
		// reverse the fix fish eye process
		const diff = angle - playerAngle;
		return distance / Math.cos(diff);
	}

	adjustColour(colour, multiplier) {
		// multiply a colour for a new one
		let colourArray = colour.slice(4, colour.length - 1).split(`, `);
		colourArray.forEach((number, i) => {
			colourArray[i] = Math.floor(parseInt(number) * multiplier);
		})
		return `rgb(${colourArray[0]}, ${colourArray[1]}, ${colourArray[2]})`;
	}

	readTexture(texture, tx, ty) {
		// take the texture, tx and ty and convert that into the colour that it should have
		const yStep = texture.x;
		const pixelYPos = yStep * 3 * ty;
		const pixelXPos = 3 * tx;
		const red = texture.pixelData[pixelXPos + pixelYPos];
		const green = texture.pixelData[pixelXPos + pixelYPos + 1];
		const blue = texture.pixelData[pixelXPos + pixelYPos + 2];
		return `rgb(${red}, ${green}, ${blue})`
	}

	// Rendering Passes
	clearScreen() {
		context.clearRect(0, 0, system.SCREEN_WIDTH, system.SCREEN_HEIGHT);
	}

	renderScene(rays) {
		for (const [curRay, ray] of rays.entries()) {
			// Store necessary information for rendering the scene in the different rendering modules
			this.ray = ray;
			this.curRay = curRay;
			this.distance = renderer.fixFishEye(ray.distance, ray.angle, player.angle);
			this.wallHeight = ((map.CELL_SIZE * 5) / this.distance) * system.DISTANCE_TO_CAMERA + 2;
			this.halfWallHeight = renderer.wallHeight / 2;

			// Render Walls
			wall.renderWalls();

			// Render Floor + Ceiling
			floorceiling.renderFloorCeiling();
		}
		// Order sprites depending on distance from player and render them in new order
		let spriteArray = [];
		enemies.enemies.forEach((enemy) => {
			enemy.distanceFromPlayer = system.distance(player.x, player.y, enemy.x, enemy.y);
			// If the player is close enough to an enemy disconnect them from the game
			if (enemy.distanceFromPlayer <= map.CELL_SIZE) {
				window.location.assign("index.html");
			}
			spriteArray.push(enemy);
		})
		otherplayers.players.forEach((otherPlayer) => {
			otherPlayer.distanceFromPlayer = system.distance(player.x, player.y, otherPlayer.x, otherPlayer.y);
			spriteArray.push(otherPlayer);
		})
		spriteArray.sort((a, b) => b.distanceFromPlayer - a.distanceFromPlayer);
		spriteArray.forEach((sprite) => {
			sprites.renderSprite(sprite);
		})
	}

	renderPauseScreen() {
		// overlay a transparent grey
		context.fillStyle = 'rgba(192, 192, 192, 0.5)';
		context.fillRect(0, 0, system.SCREEN_WIDTH, system.SCREEN_HEIGHT);
	}

	renderStats(fps) {
		// show the fps
		context.fillStyle = "white";
		context.fillText(`${fps} FPS`, system.SCREEN_WIDTH - 250, 60);
	}
}

const renderer = new Renderer();

export { renderer };