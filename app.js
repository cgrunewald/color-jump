const AlarmManager = require('./lib/utils/AlarmManager');
const Game = require('./lib/game/Game');

// Need to include this to initialize the Keyboard
const KeyboardInput = require('./lib/controls/KeyboardInput');

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const game = new Game(renderer);

window.addEventListener('resize', function(w) {
  renderer.setSize( window.innerWidth, window.innerHeight );

	game.setScreenSize(window.innerWidth, window.innerHeight);
});

jQuery(document).ready(function () {
  game.onDocumentReady();
});

var startTime = 0;
var delta = 0;
function animate(time) {
  requestAnimationFrame(animate);

	delta = (time - startTime) / 1000.0;
	startTime = time;
	if (delta > 0.0) {
		AlarmManager.update(delta);
		game.update(delta);
	}

	game.render();
}

startTime = performance.now();
requestAnimationFrame(animate);
