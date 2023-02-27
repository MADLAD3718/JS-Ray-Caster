import { renderer, context } from '/renderer.js';
import { player } from '/player.js';
import { raycast } from '/rays.js';
import { system } from '/system.js';
import { map } from '/map.js';
import { texture } from '/texture.js';

class Sprite {
	renderSprite(sprite) {
		// Find relative x and y distance from player
		const relX = sprite.x - player.x;
		const relY = sprite.y - player.y;

		// Find the angle of a line cast from the player to the sprite
		const lineAngle = Math.atan2(relY, relX);

		// Find the difference between the player's angle and the angle of the line that points from the player to the sprite
		let angleDiff = player.angle - lineAngle;

		// Keep it in range of -180 to 180 degrees, accounting for the player's angle being able to exceed the range
		while (angleDiff >= Math.PI) {
			angleDiff -= 2 * Math.PI;
		}
		while (angleDiff <= -Math.PI) {
			angleDiff += 2 * Math.PI;
		}

		// Find the magnitude of the line cast from the player to the sprite
		const distanceFromPlayer = system.distance(player.x, player.y, sprite.x, sprite.y)

		// Relative distance from sprite to the normal line of the player's angle
		const relativeSpan = distanceFromPlayer * Math.sin(angleDiff);

		// Distance of the line that is normal to the screen parallel distance
		const screenNormalDist = distanceFromPlayer * Math.cos(angleDiff);

		// Compute the distance of a line parallel to the screen when it intersects with the sprite
		const screenParallelDistance = screenNormalDist * Math.tan(system.FOV / 2);

		// Percentage of screenParallelDistance line that the relativeSpan occupies
		const percentage = relativeSpan / screenParallelDistance;

		// Adjustment to account for render warping found in walls, only necessary since rays are not equally spaced apart
		const adjustedPercent = (percentage - Math.cos(Math.PI * (percentage + 1) / 2)) / 2;
		const finalPercentage = (percentage + adjustedPercent) / 2;

		// Compute screen X through adding the percentage of screen width that the sprite is at to the middle of the screen
		const screenX = system.SCREEN_WIDTH / 2 - system.SCREEN_WIDTH / 2 * finalPercentage;

		// Determine sprite texture
		const spriteTexture = texture.sprite[sprite.textureNum];
		// console.log(`The sprite:`)
		// console.log(sprite)

		const spriteWorldWidth = map.CELL_SIZE * 0.75;
		const spriteScreenWidth = ((spriteWorldWidth * 5) / distanceFromPlayer) * system.DISTANCE_TO_CAMERA;
		// For every horizntal column of the texture
		for (let tx = 0; tx < spriteTexture.x; tx++) {
			// For some reason I am not taking the sprite width into account when determining the in-world position of a column of pixels. This is a certified idiot moment
			const positionOffset = (tx - (spriteTexture.x - 1) / 2) / (spriteTexture.x - 1);
			const positionOffsetX = -positionOffset * spriteWorldWidth * Math.sin(player.angle);
			const positionOffsetY = positionOffset * spriteWorldWidth * Math.cos(player.angle);

			const offsetPositionX = sprite.x + positionOffsetX;
			const offsetPositionY = sprite.y + positionOffsetY;

			// Find the magnitude of the line cast from the player to the offset position of the sprite column
			const columnDistanceFromPlayer = system.distance(player.x, player.y, offsetPositionX, offsetPositionY)

			// find relative positions of every column of pixels
			const columnRelativeX = offsetPositionX - player.x;
			const columnRelativeY = offsetPositionY - player.y;
			const columnLineAngle = Math.atan2(columnRelativeY, columnRelativeX) - (Math.PI / 1440); // 0.125 degrees

			// const columnWallDist = renderer.fixFishEye(raycast.castRay(columnLineAngle).distance, columnLineAngle, player.angle);
			const columnWallDist = raycast.castRay(columnLineAngle).distance;

			// Find the difference between the player's angle and the angle of the line that points from the player to the sprite
			let columnAngleDiff = player.angle - columnLineAngle;

			// Keep it in range of -180 to 180 degrees, accounting for the player's angle being able to exceed the range
			while (columnAngleDiff >= Math.PI) {
				columnAngleDiff -= 2 * Math.PI;
			}
			while (columnAngleDiff <= -Math.PI) {
				columnAngleDiff += 2 * Math.PI;
			}

			// Only render the sprite if it is inside the view of the player
			if (Math.abs(columnAngleDiff) < system.FOV / 1.8) {
				// Divide sprite into segments that are pixel sized
				const pixelStepX = spriteScreenWidth / spriteTexture.x;

				const pixelStartX = tx * pixelStepX + screenX - spriteScreenWidth / 2;

				// Only render the line if the sprite is not behind a wall
				if (columnDistanceFromPlayer < columnWallDist) {
					// Sprite is sized depending on distance from player
					const spriteHeight = spriteScreenWidth / spriteTexture.x * spriteTexture.y;
					// For every vertical row in each column of the texture
					for (let ty = 0; ty < spriteTexture.y; ty++) {
						const pixelStepY = spriteHeight / spriteTexture.y;

						const pixelStartY = ty * pixelStepY + system.MIDDLE_HEIGHT - spriteHeight / 2;


						const textureColour = renderer.readTexture(spriteTexture, tx, ty);

						if (textureColour !== `rgb(0, 0, 0)`) {
							// Shading, defaults to none
							const shade = system.ENABLE_SHADING ? Math.pow(renderer.lightFallOffStretch / (distanceFromPlayer + renderer.lightFallOffStretch), 2) : 1;
							context.fillStyle = renderer.adjustColour(textureColour, shade);
							context.fillRect(Math.round(pixelStartX), Math.round(pixelStartY), Math.round(pixelStepX + 1), Math.round(pixelStepY + 1));
						}
					}
				}
			}
		}
	}
}

const sprites = new Sprite();

export { sprites };