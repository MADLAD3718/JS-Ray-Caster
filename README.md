# JS-Ray-Caster
This project is a JavaScript and HTML based Ray Caster supporting multiplayer and enemy AI. It was created as a final high school computer science project along with two of my classmates. The original goals for the project were to create a collabourative multiplayer stealth game, accessible through the browser. Unfortunately time did not permit the entire vision to be realized, but quite a lot was achieved in the four weeks allotted to the project.

## Rendering:
The rendering engine I designed for the game is a ray caster, based on [several tutorials and websites](./references.md) outlining ray casting methods. The entire game scene exists on a 2D map, where one ray is cast per pixel column and [traverses through the map](./rays.js#L24) until it intersects with a wall. The height of that wall is then determined through dividing the full height by the ray's intersection distance. 

The pixels above and below the wall are classified as the ceiling and floor. To derive the distance from an arbitrary pixel on the floor to camera, [the height of the center of the screen is divided by the relative difference from the pixel's y coordinate to the screen center](./render/floor.js#L26). Approaching the screen's center returns a value that approaches infinity, while pixel heights further away from the center return smaller values. This method works due to the constricted nature of the camera's zenith angle. The distance value is then split into x and y values and added to the camera's position in order to acquire the pixel's world space coordinates, which are then used for texture mapping. These world space coordinates are also resused for the ceiling.

Sprites (such as other players and enemies) utilize a [custom screen projection algorithm](./render/sprite.js#L9) I created to render. A right angle triangle is constructed utilizing the relative sprite position and view direction. Its opposite side length is then compared to the opposide side length of a right angle triangle formed with the view direction and half horizontal FOV angle, to derive percentage that the sprite is horizontally positioned on from the center of the screen to the edge. This value is then multiplied by half of the screen resolution width to determine the horizontal screen space position of the sprite texture.

## Pathfinding:
The second group member was tasked with researching methods of giving enemies autonomous behaviour, which I helped integrate into the game. They settled on an implementation of the A* pathfinding algorithm, which is currently used to [provide enemies with a path to a random position on the map](./enemy.js#L13). When an enemy has no target position, a new path will be constructed and stored for it. Over each subsequent frame the enemy will move towards the center of the next cell in its path, updating its movement direction for each new cell in the path. Once the enemy reaches its target position, it creates a new path and restarts the process.

## Multiplayer:
The third group member was tasked with work on online multiplayer support, where I contributed to the [dynamic server host/queue system](./otherplayers.js#L11). Whenever a player opens the game, a listener is created for changes to game's database (hosted with Google Firebase). If they are the first player to join, they are given an order of 0, where subsequent players are incremented in order value. Players with order 0 are considered the host, as they will be uploading enemy pathfinding data to the database. Players with an order greater than 0 instead stream enemy positions and pathfinding information from the database. Upon leaving the game, [the player's database node is deleted](./player.js#L103). The rest of the online players find the new lowest player order and decrement their order if it is greater than the lowest, effectively [reordering the remaining list of players](./otherplayers.js#L32).

## Retrospect:
Despite possessing no knowledge of linear algebra at the time, I managed to achieve the design goals I had set for the project. Texture mapping was fully supported on the walls, floor and ceiling, and dynamic image sprites could be used to render players and enemies. At the time, this was the most ambitious project I decided to take on is likely one of the fundamental reasons why I still continue to pursue computer graphics.

## Controls:
- Click on the window to engage mouse lock, press Escape to disengage.
- Change view direction: Mouse
- Change position: WASD

Link to game: [https://culminating-ics4u-3.ics4u-02.repl.co/](https://culminating-ics4u-3.ics4u-02.repl.co/)
