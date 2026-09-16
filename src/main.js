import { Game } from './Game.js';

// Setup Canvas and Game
const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

// Game Loop Variables
let lastTime = 0;

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Cap delta time to prevent physics explosions on lag
  if (dt > 0.1) dt = 0.1;

  game.update(dt);
  game.draw();

  requestAnimationFrame(gameLoop);
}

// Start Loop
requestAnimationFrame(gameLoop);
