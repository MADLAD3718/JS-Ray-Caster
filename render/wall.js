import { system } from '/system.js';
import { map } from '/map.js';
import { renderer, context } from '/renderer.js';
import { texture } from '/texture.js';

class Wall {
	shade = 1;

	renderWalls() {
		// Texel rendering system
		// Calculate portion of wall that is off screen on both top and bottom
		let textureOffset = 0;
		if (renderer.wallHeight > system.SCREEN_HEIGHT) { textureOffset = Math.ceil((renderer.wallHeight - system.SCREEN_HEIGHT) / 2) + 1; }

		// exponential lighting falloff
		if (system.ENABLE_SHADING) {
			this.shade = Math.pow(renderer.lightFallOffStretch / (renderer.ray.distance + renderer.lightFallOffStretch), 2);
		}
		const wallTexture = texture.walls[map.getWallCellValue(renderer.ray.x, renderer.ray.y, renderer.ray.angle, renderer.ray.vertical) - 1];

		// draw individual pixels per vertical portion of wall		
		for (let y = 0; y < wallTexture.y; y++) {
			// Current horizontal pixel to pull colour from on wall
			let x;
			// if facing left invert texture horizontally
			if (renderer.ray.vertical) {
				x = Math.floor(renderer.ray.y % map.CELL_SIZE / (map.CELL_SIZE / wallTexture.x));
				if (!Math.abs(Math.floor((renderer.ray.angle - Math.PI / 2) / Math.PI) % 2)) {
					x = wallTexture.x - 1 - x;
				}
			} else {
				x = Math.floor(renderer.ray.x % map.CELL_SIZE / (map.CELL_SIZE / wallTexture.x));
				if (!Math.abs(Math.floor(renderer.ray.angle / Math.PI) % 2)) {
					x = wallTexture.x - 1 - x;
				}
			}
			// Span of height on wall representing one pixel
			const heightStep = renderer.wallHeight / wallTexture.y;
			// Current render offset to add to the wall portion that is being rendered
			const heightOffset = y * heightStep;
			// Start at the top of the wall, add current render offset
			const yStartPos = system.MIDDLE_HEIGHT - renderer.halfWallHeight + heightOffset;
			// End on start + heightStep, add textureOffset to account for off screen pixels that caused clipping
			const yEndPos = heightStep + textureOffset + 2;
			// Read texture colour from texture at pixel position
			const textureColour = renderer.readTexture(wallTexture, x, y);
			// Add shading for final rect colour
			context.fillStyle = renderer.ray.vertical ? renderer.adjustColour(textureColour, this.shade) : renderer.adjustColour(textureColour, this.shade * 0.95);
			// Render onto portion of wall // Start X: renderer.ray X, Start Y: Top of Wall Rect + offsets, End X: 1 pixel to the right, End Y: start height + offset
			context.fillRect(Math.round(renderer.curRay / system.RESOLUTION_SCALE), Math.round(yStartPos), Math.round(system.PIXEL_SIZE), Math.round(yEndPos));
		}
	}
}

const wall = new Wall();

export { wall };