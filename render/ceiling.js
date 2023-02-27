import { system } from '/system.js';
import { floorceiling } from './floor.js';
import { renderer, context } from '/renderer.js';
import { texture } from '/texture.js'
import { map } from '/map.js';

class Ceiling {
	renderCeiling() {
		// Render teh ceiling according to the positional data gotten from the floor
		const ceilingTexture = texture.ceiling[map.getCeilingCellValue(floorceiling.pixelXPos, floorceiling.pixelYPos)];
		// convert position of intersection into texture x and y
		const ty = Math.floor(floorceiling.pixelYPos % map.CELL_SIZE / (map.CELL_SIZE / ceilingTexture.y));
		const tx = Math.floor(floorceiling.pixelXPos % map.CELL_SIZE / (map.CELL_SIZE / ceilingTexture.x));
		const textureColour = renderer.readTexture(ceilingTexture, tx, ty);
		context.fillStyle = renderer.adjustColour(textureColour, floorceiling.shade);
		context.fillRect(Math.round(renderer.curRay / system.RESOLUTION_SCALE), Math.round(system.SCREEN_HEIGHT - floorceiling.y - system.PIXEL_SIZE), Math.round(system.PIXEL_SIZE), Math.round(system.PIXEL_SIZE));
	}
}

const ceiling = new Ceiling();

export { ceiling };