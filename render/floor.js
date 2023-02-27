import { system } from '/system.js';
import { map } from '/map.js';
import { renderer, context } from '/renderer.js';
import { texture } from '/texture.js';
import { player } from '/player.js';
import { ceiling } from './ceiling.js'
import { raycast } from '/rays.js';

class Floor {
	// Store y and shade for ceiling rendering
	y;
	shade = 1;

	// Store pixDis, pixY, pixX for debug function
	pixelDist;
	pixelXPos;
	pixelYPos;

	renderFloorCeiling() {
		// Pixel Rendering System
		// modified wallHeight equation to solve for distance when the wall touches the bottom of the screen
		const modifier = ((map.CELL_SIZE * 5) / system.SCREEN_HEIGHT) * system.DISTANCE_TO_CAMERA;
		// Split rendering into individual pixels on the floor
		for (this.y = Math.floor(system.MIDDLE_HEIGHT + renderer.halfWallHeight); this.y < system.SCREEN_HEIGHT; this.y += system.PIXEL_SIZE) {
			// Calculate pixel distance based on height between bottom of screen and middle. Middle = infinity, Bottom = The actual intersection distance the pixel would have
			this.pixelDist = ((system.MIDDLE_HEIGHT) / (this.y - system.MIDDLE_HEIGHT)) * modifier;

			// fix fish eye (get hypoteneuse from horizontal distance)
			this.pixelDist = renderer.inverseFixFishEye(this.pixelDist, renderer.ray.angle, player.angle);

			// split horizontal pixel distance from player into x and y coordinates. These are the coordinates of the position on floor being rendered
			this.pixelXPos = this.pixelDist * Math.cos(renderer.ray.angle) + player.x;
			this.pixelYPos = this.pixelDist * Math.sin(renderer.ray.angle) + player.y;

			const floorTexture = texture.floors[map.getFloorCellValue(this.pixelXPos, this.pixelYPos)];
			// Determine x and y position to read from texture from pixel's world position
			const ty = Math.floor(this.pixelYPos % map.CELL_SIZE / (map.CELL_SIZE / floorTexture.y));
			const tx = Math.floor(this.pixelXPos % map.CELL_SIZE / (map.CELL_SIZE / floorTexture.x));
			const textureColour = renderer.readTexture(floorTexture, tx, ty);

			if (system.ENABLE_SHADING) {
				this.shade = Math.pow(renderer.lightFallOffStretch / (this.pixelDist + renderer.lightFallOffStretch), 2);
			}
			context.fillStyle = renderer.adjustColour(textureColour, this.shade);
			// Ray Debug
			if (system.SHOW_POSITIONAL_DEBUG) {
				this.renderFloorPositionalDebug();
			}
			context.fillRect(Math.round(renderer.curRay / system.RESOLUTION_SCALE), Math.round(this.y), Math.round(system.PIXEL_SIZE), Math.round(system.PIXEL_SIZE));

			// Render Ceiling
			ceiling.renderCeiling();
		}
	}

	renderFloorPositionalDebug() {
		// Change ray style to bright red until wall intersection point, log position
		const debugPoint = Math.floor(system.MIDDLE_HEIGHT + renderer.halfWallHeight);
		if (renderer.curRay === Math.floor(raycast.numberOfRays / 2 + renderer.DEBUG_OFFSET) && this.y === debugPoint) {
			console.log(`The calculated pixel distance is ${Math.round(this.pixelDist)}.\nThe actual pixel distance is ${Math.round(renderer.distance)}.`);
			// console.log(`The calculated position of the pixel is at (${Math.round(this.pixelXPos)}, ${Math.round(this.pixelYPos)}).\nThe actual position of the pixel is at (${Math.floor(renderer.ray.x)}, ${Math.floor(renderer.ray.y)}).`);
		}
		if (renderer.curRay === Math.floor(raycast.numberOfRays / 2 + renderer.DEBUG_OFFSET) && this.y >= debugPoint) {
			context.fillStyle = `rgb(255, 0, 0)`;
		}
	}
}

const floorceiling = new Floor();

export { floorceiling };