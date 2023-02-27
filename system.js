class System {
	// User facing settings
	TARGET_FPS = 30;
	SENSITIVITY = 0.075;
	RESOLUTION_SCALE = 1 / 12;
	FOV = 80;
	IS_PAUSED = false;
	RENDER_MINIMAP = false;
	MINIMAP_SCALE = 1 / 4;
	SHOW_STATS = false;
	SHOW_POSITIONAL_DEBUG = false;
	ENABLE_SHADING = true;

	// System facing settings
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	MIDDLE_HEIGHT = this.getMiddleHeight();
	PIXEL_SIZE = this.getPixelSize();
	TICK = this.getTick();
	FOV = this.toRadians(this.FOV);
	DISTANCE_TO_CAMERA = this.getDistanceToCamera();

	// Frametime calculations
	frameTime = 0;
	lastLoop = new Date;
	thisLoop;

	//the target frame time
	getTick() {
		return 1000 / this.TARGET_FPS;
	}

	//is the actual frame rate
	//also calculates the frame time
	getFPS() {
		const thisframeTime = (this.thisLoop = new Date) - this.lastLoop;
		this.frameTime += (thisframeTime - this.frameTime);
		const fps = (1000 / this.frameTime).toFixed(1);
		this.lastLoop = this.thisLoop;
		return fps;
	}

	//------------------Variable genration--------------------//
	getMiddleHeight() {
		return this.SCREEN_HEIGHT / 2;
	}

	getPixelSize() {
		return 1 / this.RESOLUTION_SCALE;
	}

	getDistanceToCamera() {
		return this.SCREEN_WIDTH / 8.6 / Math.tan(this.FOV / 2);
	}


	//------------------Game Mechanics------------------//
	toRadians(deg) {
		return (deg * Math.PI) / 180;
	}

	toDegrees(rad) {
		return (rad * 180) / Math.PI;
	}

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

}

const system = new System();

export { system };