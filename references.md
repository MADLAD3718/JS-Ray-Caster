**References**
* https://youtu.be/5nSFArCgCXA
* https://youtu.be/gYRrGTC7GtA
* https://youtu.be/PC1RaETIx3Y
* https://youtu.be/w0Bm4IA-Ii8
* https://lodev.org/cgtutor/raycasting2.html
* https://lodev.org/cgtutor/raycasting3.html
* https://www.allegro.cc/forums/thread/355015
* https://cloud.google.com/firestore/docs/solutions/presence
* https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

**Pathfinding enemy momvement algorithm pseudocode**

	if (there is no current path) {
		goal = pathfinder.findPath(randomgoal)
	}

	move in direction of next cell:
		if (currentX - goalCellX > 0) {
			currentX -= maxSpeed;
		} else {
			currentX += maxSpeed;
		}

		if (currentY - goalCellY > 0) {
			currentY -= maxSpeed;
		} else {
			currentY += maxSpeed;
		}

	// If current distance is close to the goal cell X
	if (system.distance(curX, curY, goalCellX, goalCellY) < maxSpeed * 2) {
		this position = goal cell position
		if (this position === final cell) {
			goal = false;
		} else {
			next cell goal = next cell in path
		}
	}