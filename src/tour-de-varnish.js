AngleUtils = {
	/**
	 * Full revolution.
	 */
	REV: Math.PI * 2,

	/**
	 * [-PI..PI)
	 */
	mod: function(angle) {
		// most likely 0..1 iteration each
		while (angle >=  Math.PI) angle -= this.REV;
		while (angle <  -Math.PI) angle += this.REV;
		return angle;
	}
}

/**
 * A stop watch...
 */
StopWatch = function(threshold) {
	var start = new Date().getTime();

	this.elapsed = function() {
		return (new Date().getTime() - start) > threshold;
	};
}

/**
 * This object keeps track of the planet's state and operations.
 *
 * It's basically a sphere, with a texture. It can rotate both manually or
 * automatically (also clumsily). It can travel from a destination to
 * another and will draw its path on the map.
 *
 * Once you start traveling around the world, this is serious shit, you just
 * don't back paddle. That is the lame excuse explaining why traveling has
 * been implemented only one way.
 */
Earth = function(scene) {
	var sphere = new THREE.Object3D();
	var journey = [];
	var travel;
	var canvas = document.createElement('canvas');

	sphere.position.z = -500;
	scene.add(sphere);

	canvas.width = 1024;
	canvas.height = 512;

	var context = canvas.getContext('2d');
	context.drawImage($('#world_map')[0], 0, 0);

	var texture = new THREE.Texture(canvas);
	var geometry = new THREE.SphereGeometry(200, 20, 20);
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		overdraw: true
	});
	var mesh = new THREE.Mesh(geometry, material);
	sphere.add(mesh);

	var preparePaths = function() {
		var current = journey.length - 1;
		if (current == 0) {
			return [];
		}

		var paths = [];
		var source = journey[current - 1];
		var target = journey[current];
		for (var s in source.steps) {
			var start = source.steps[s];
			for (var e in target.steps) {
				var end = target.steps[e];
				if (target.bx) {
					paths.push([
						new THREE.Vector2(start.cx-1024, start.cy),
						new THREE.Vector2(end.cx, end.cy)
					]);
					paths.push([
						new THREE.Vector2(start.cx, start.cy),
						new THREE.Vector2(end.cx+1024, end.cy)
					]);
				}
				else {
					paths.push([
						new THREE.Vector2(start.cx, start.cy),
						new THREE.Vector2(end.cx, end.cy)
					]);
				}
			}
		}
		return paths;
	};

	var drawPaths = function(alpha) {
		if (travel.paths.length == 0) {
			return;
		}

		var context = canvas.getContext('2d');
		context.strokeStyle = 'red';
		context.lineWidth = 4;

		for (var i=0; i < travel.paths.length; i++) {
			var start = travel.paths[i][0];
			var goal  = travel.paths[i][1];
			var current = start.clone().lerp(goal, alpha);
			context.beginPath();
			context.moveTo(start.x, start.y);
			context.lineTo(current.x, current.y);
			context.stroke();
		}
	};

	var drawSteps = function() {
		var context = canvas.getContext('2d');
		context.strokeStyle = 'red';
		context.fillStyle = 'red';
		var target = journey[journey.length - 1];
		for (var s in target.steps) {
			var step = target.steps[s];
			context.beginPath();
			context.arc(step.cx, step.cy, 4, 0, AngleUtils.REV);
			context.stroke();
			context.fill();
		}
	};

	this.travelTo = function(destination) {
		destination.rx = AngleUtils.mod(destination.rx);
		destination.ry = AngleUtils.mod(destination.ry);
		journey.push(destination);

		travel = {
			time: new Date().getTime(),
			start: sphere.quaternion.clone(),
			goal: new THREE.Quaternion().setFromEuler(
				new THREE.Euler(destination.rx, destination.ry)
			).normalize(),
			paths: preparePaths()
		}
	};

	this.walk = function(duration) {
		var elapsed = new Date().getTime() - travel.time;
		var alpha = Math.min(1, elapsed/duration);
		var current = new THREE.Quaternion();

		THREE.Quaternion.slerp(travel.start, travel.goal, current, alpha);

		sphere.setRotationFromQuaternion(current);
		texture.needsUpdate = true;
		drawPaths(alpha);

		if (elapsed >= duration) {
			drawSteps();
		}

		// give a 200ms delay for the stage to catch up
		return elapsed > (duration + 200);
	};

	this.setRotation = function(rotation) {
		texture.needsUpdate = true;
		sphere.rotation.x = rotation.x;
		sphere.rotation.y = rotation.y;
	};

	this.rotate = function(rotation) {
		texture.needsUpdate = true;
		sphere.rotation.x += rotation.x;
		sphere.rotation.y += rotation.y;
	};

	this.splash = function() {
		var targetCanvas = $('canvas')[0];
		var context = targetCanvas.getContext('2d');
		context.drawImage(canvas, 0, 0, targetCanvas.width, targetCanvas.height);
	};

	this.printRotation = function() {
		return "Rotation:\nx=" + sphere.rotation.x + "\ny=" + sphere.rotation.y;
	};
};

/**
 * This action makes the earth rotate on its Y axis.
 */
Globe = function(context) {
	var transition = '';

	context.earth.setRotation({x: -0.2, y: 0});

	this.animate = function() {
		// TODO time-based speed
		context.earth.rotate({x: 0, y: 0.04});
		return transition;
	};

	this.handler = function(keyboardEvent) {
		if (keyboardEvent.type != 'keyup') {
			return;
		}
		if (keyboardEvent.keyCode == 33) {
			transition = 'prev';
		}
		if (keyboardEvent.keyCode == 34) {
			transition = 'next';
		}
	};
}

/**
 * This action travels from the current position to the next destination.
 *
 * It has to buy new shoes at each destination, because you know, so much
 * walking tends to be bad for your shoes.
 */
EarthWalker = function(context) {
	var hasShoes = false;
	var stopWatch;
	var destination;
	var duration;

	this.begin = function(args) {
		destination = context.destinations[args.destination];
		stopWatch = new StopWatch(args.wait);
		duration = args.duration;
	}

	this.animate = function() {
		if ( ! stopWatch.elapsed() ) {
			context.earth.walk(0); // lazy way to trigger a redraw
			return '';
		}
		else if( ! hasShoes) {
			context.earth.travelTo(destination);
			hasShoes = true;
		}

		return context.earth.walk(duration) ? 'next' : '';
	};
}

/**
 * This action renders the earth as a flat map.
 *
 * It's a trap, you can't leave this action.
 */
Monad = function(context) {
	this.animate = function() {
		context.earth.splash();
		return '';
	};

	this.noRender = true;
}

/**
 * This action can take over the world, TONIGHT!
 *
 * With a special device operated by Pinky, the Brain can rotate the earth at
 * will and even print its rotation angles. I find this handy to find good
 * angles for the destinations.
 */
TheBrain = function(context) {
	// left top right bottom FTW
	var l = 0, t = 0, r = 0, b = 0;

	var isKeyPressed = function(type) {
		return (type == "keydown") ? 1 : 0;
	};

	this.animate = function() {
		// TODO time-based speed
		context.earth.rotate({
			x: 0.02 * (b - t),
			y: 0.02 * (r - l)
		});
		return '';
	};

	this.handler = function(keyboardEvent) {
		var type = keyboardEvent.type;
		switch (keyboardEvent.keyCode) {
			case 37: l = isKeyPressed(type); break;
			case 38: t = isKeyPressed(type); break;
			case 39: r = isKeyPressed(type); break;
			case 40: b = isKeyPressed(type); break;
		}
		if (type == "keyup" && keyboardEvent.keyCode == 32) {
			console.log( context.earth.printRotation() );
		}
	};
}

/**
 * This action travels to parallel 2D worlds.
 *
 * It basically makes the SVG element and the rightful slide visible.
 */
Slider = function(context, transition) {
	var index = -1;
	var slideList;

	// XXX $(slide).addClass('active') didn't work for me...
	var activate = function(slide) {
		var classes = $(slide).attr('class');
		$(slide).attr('class', classes + ' active');
	};

	// XXX $(slide).removeClass('active') didn't work for me...
	var deactivate = function(slide) {
		var classes = $(slide).attr('class');
		if (classes) {
			$(slide).attr('class', classes.replace(' active', ''));
		}
	};

	var showNextSlide = function() {
		if (index >= 0 && index < slideList.length) {
			deactivate('g.active');
			activate('#' + slideList[index]);
		}
		else {
			$('#slides').attr('class', '');
		}
	};

	this.begin = function(args) {
		slideList = args;
		switch (transition) {
			case 'next': index = 0; break;
			case 'prev': index = slideList.length - 1; break;
		}
		showNextSlide();
		$('#slides').attr('class', 'active');
	}

	this.animate = function() {
		switch (index) {
			case -1: return 'prev';
			case slideList.length: return 'next';
			default: return '';
		}
	};

	this.handler = function(keyboardEvent) {
		if (keyboardEvent.type != 'keyup') {
			return;
		}
		if (keyboardEvent.keyCode == 33) {
			index--;
			showNextSlide();
		}
		if (keyboardEvent.keyCode == 34) {
			index++;
			showNextSlide();
		}
	};

	this.noRender = true;
}

/**
 * This action basically waits until it gets bored. Is that even useful ?
 */
Waiter = function(context) {
	var bored = '';

	this.animate = function() {
		return bored;
	};

	this.handler = function(keyboardEvent) {
		if (keyboardEvent.type != 'keyup') {
			return;
		}
		if (keyboardEvent.keyCode == 33) {
			bored = 'prev';
		}
		if (keyboardEvent.keyCode == 34) {
			bored = 'next';
		}
	};
}

/**
 * This object eats data and produces a presentation in return.
 *
 * The presentation is data-driven and relies on three items:
 * - destinations
 *   It consists in named places, their 2D coordinates on the map and their
 *   rotation angles on earth's X and Y axes.
 * - a route
 *   The route contains a list of steps to follow. Those steps are represented
 *   as programmatic actions.
 * - slides
 *   The slides are really just an SVG file that is inserted in the page's DOM.
 *
 * Actions are expected to provide behaviour at each step, and can receive
 * parameters from the route. The route can basically pass anything
 * serializable as JSON, the rest is available from the context. They also need
 * to declare an `animate' function which will return 'next' to indicate
 * whether it is time to pick the next action. It can also have a `handler'
 * method that will be registered for the keyup and keydown events.  The
 * presence of a `noRender' field set to true will inform the stage that no 3D
 * rendering is needed.
 */
Stage = function(context) {
	var camera, scene, renderer;
	var action, current;

	camera = new THREE.PerspectiveCamera(60, 4.0/3.0, 1, 2000);
	scene = new THREE.Scene();
	renderer = new THREE.CanvasRenderer();

	current = -1;
	context.earth = new Earth(scene);

	$('body').append(renderer.domElement);

	var pickIndex = function(transition) {
		var index;
		switch (transition) {
			case 'next': index = current + 1; break;
			case 'prev': index = current - 1; break;
			default: throw new Error("unknown transition: " + transition);
		}
		return Math.max(0, Math.min(index, context.route.length - 1));
	}

	var pickAction = function(transition) {
		var newAction = null;
		var index = pickIndex(transition);
		if (current != index) {
			var clazz = context.route[index].clazz;
			var args  = context.route[index].args;
			newAction = eval('new ' + clazz + '(context, transition)');
			current = index;
		}

		if (action && typeof action.handler == 'function') {
			$(window).off('keydown keyup', action.handler);
		}

		action = newAction;

		if (action && typeof action.handler == 'function') {
			$(window).on('keydown keyup', action.handler);
		}

		if (action && typeof action.begin == 'function') {
			action.begin(args);
		}
	};

	var animate = function() {
		transition = action.animate();
		if (transition) {
			pickAction(transition);
		}
		requestAnimationFrame(animate);
		if (!action.noRender) {
			renderer.render(scene, camera);
		}
	};

	this.resize = function() {
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	this.begin = function() {
		this.resize();
		pickAction('next');
		animate();
	}
}

function endJourney() {
	return "On arrête le voyage ???";
}
