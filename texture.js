/* Texture format is as follows:
 * texture.y is the y resolution of the texture
 * texture.x is the x resolution of the texture
 * if pixelX is the x number of the pixel to be rendered, and pixelY is the y number of the pixel to be rendered:
 * red = texture.pixelData[pixelX * 3 + pixelY * 3 * texture.y]
 * green = texture.pixelData[pixelX * 3 + pixelY * 3 * texture.y + 1]
 * blue = texture.pixelData[pixelX * 3 + pixelY * 3 * texture.y + 2]
 * each pixel is stored as three consecutive integers between 0 and 255
 * you can export this file type in GIMP by exporting as *name*.ppm in ASCII format
 * open ppm image in Notepad++, remove first 4 lines and replace all newlines ($) with a comma
 * copy the resulting list and paste it in the object as pixelData
 * if you've created a texture in a different format but don't know how to convert it to our format I can do it for you, just send it to me
*/


// Import Textures
import { industrial_wall } from '/textures/industrial_wall.js';
import { checker_floor } from '/textures/checker_floor.js';
import { office_ceiling_tile } from '/textures/office_ceiling_tile.js';
import { office_ceiling_tile_broken } from '/textures/office_ceiling_tile_broken.js';
import { office_ceiling_half_broken } from '/textures/office_ceiling_half_broken.js'
import { industrial_wall_with_poster } from '/textures/industrial_wall_with_poster.js';
import { player } from '/textures/player.js';
import { enemy } from '/textures/enemy.js';

const texture = {
	// Engine can handle any res of texture as long as it stays a perfect rectangle
	walls: [
		industrial_wall,
		industrial_wall_with_poster
	],

	floors: [
		checker_floor,
		office_ceiling_tile_broken
	],

	ceiling: [
		office_ceiling_tile,
		office_ceiling_tile_broken,
		office_ceiling_half_broken
	],

	sprite: [
		enemy,
		player
	]
}

export { texture };