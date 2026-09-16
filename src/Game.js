import { Player } from './Player.js';
import { Level } from './Level.js';
import { checkCollisions } from './Physics.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = 'MENU'; // MENU, PLAYING, GAMEOVER, WIN
    this.score = 0;
    this.cameraX = 0;
    
    // Bind UI elements
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.winScreen = document.getElementById('win-screen');
    this.scoreDisplay = document.getElementById('score-display');
    this.currentScore = document.getElementById('current-score');
    
    // Set up inputs
    this.setupInputs();
  }

  setupInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.handleAction();
      }
    });

    // Touch / Click
    const touchArea = document.getElementById('touch-controls');
    touchArea.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleAction();
    }, { passive: false });
    
    touchArea.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handleAction();
    });

    // UI Buttons
    document.getElementById('start-btn').addEventListener('click', () => this.start());
    document.getElementById('restart-btn').addEventListener('click', () => this.start());
    document.getElementById('next-btn').addEventListener('click', () => this.start());
  }

  handleAction() {
    if (this.state === 'PLAYING' && this.player) {
      this.player.jump();
    } else if (this.state === 'MENU' || this.state === 'GAMEOVER' || this.state === 'WIN') {
      this.start();
    }
  }

  start() {
    this.player = new Player(100, 200);
    this.level = new Level();
    this.state = 'PLAYING';
    this.score = 0;
    this.cameraX = 0;
    
    this.updateUI();
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    this.player.update(dt);
    
    // Camera follows player
    this.cameraX = this.player.x - 100;
    if (this.cameraX < 0) this.cameraX = 0;

    // Calculate Score (based on distance)
    this.score = Math.floor(this.player.x / 10);
    this.currentScore.textContent = this.score;

    // Check collisions
    const colResult = checkCollisions(this.player, this.level);
    if (colResult.type === 'death') {
      this.state = 'GAMEOVER';
      this.scoreDisplay.textContent = `Score: ${this.score}`;
      this.updateUI();
    } else if (colResult.type === 'win') {
      this.state = 'WIN';
      this.updateUI();
    }
  }

  draw() {
    // Clear background
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'PLAYING' || this.state === 'GAMEOVER' || this.state === 'WIN') {
      // Draw parallax background elements here if needed
      
      this.level.draw(this.ctx, this.cameraX);
      this.player.draw(this.ctx, this.cameraX);
    }
  }

  updateUI() {
    this.startScreen.classList.remove('active');
    this.gameOverScreen.classList.remove('active');
    this.winScreen.classList.remove('active');

    if (this.state === 'MENU') {
      this.startScreen.classList.add('active');
    } else if (this.state === 'GAMEOVER') {
      this.gameOverScreen.classList.add('active');
    } else if (this.state === 'WIN') {
      this.winScreen.classList.add('active');
    }
  }
}
