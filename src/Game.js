import { Player } from './Player.js';
import { Level } from './Level.js';
import { checkCollisions } from './Physics.js';
import { skinManager } from './OnigiriSkins.js';

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
    this.touchControls = document.getElementById('touch-controls');
    
    // Set up inputs
    this.setupInputs();
    
    // Preload all skin images
    skinManager.preloadAll().then(() => {
      console.log('All onigiri skins loaded!');
    }).catch(err => {
      console.warn('Some skins failed to load:', err);
    });

    // Setup skin selector
    this.setupSkinSelector();
  }

  setupInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (this.state === 'PLAYING' && this.player) {
          this.player.jump();
        } else if (this.state !== 'PLAYING') {
          // Allow starting game with space from menus
          this.start();
        }
      }
      
      if (this.state === 'PLAYING' && this.player) {
        if (e.code === 'ArrowLeft') {
          this.player.direction = -1;
        } else if (e.code === 'ArrowRight') {
          this.player.direction = 1;
        }
      }
    });

    // Touch / Click (only trigger during gameplay)
    const touchArea = document.getElementById('touch-controls');
    
    const handleTouchOrMouse = (e) => {
      if (this.state === 'PLAYING' && this.player) {
        e.preventDefault();
        const rect = touchArea.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // 画面の上半分はジャンプ
        if (clientY < rect.height / 2) {
          this.player.jump();
        } else {
          // 下半分の左右で方向転換
          if (clientX < rect.width / 2) {
            this.player.direction = -1;
          } else {
            this.player.direction = 1;
          }
        }
      }
    };

    touchArea.addEventListener('touchstart', handleTouchOrMouse, { passive: false });
    touchArea.addEventListener('mousedown', handleTouchOrMouse);

    // UI Buttons
    document.getElementById('start-btn').addEventListener('click', () => this.start());
    document.getElementById('restart-btn').addEventListener('click', () => this.backToMenu());
    document.getElementById('next-btn').addEventListener('click', () => this.backToMenu());
  }

  setupSkinSelector() {
    const container = document.getElementById('skin-selector');
    if (!container) return;

    // Prevent clicks/taps on the skin selector area from triggering game actions
    const wrapper = document.getElementById('skin-selector-wrapper');
    ['mousedown', 'touchstart', 'pointerdown', 'click'].forEach(evt => {
      wrapper.addEventListener(evt, (e) => {
        e.stopPropagation();
      }, { passive: false });
    });

    const skins = skinManager.getAllSkins();
    
    skins.forEach(skin => {
      const btn = document.createElement('button');
      btn.className = 'skin-btn';
      btn.dataset.skinId = skin.id;
      if (skin.id === skinManager.currentSkinId) {
        btn.classList.add('selected');
      }

      const img = document.createElement('img');
      img.src = skin.imagePath;
      img.alt = skin.name;
      img.draggable = false;

      const label = document.createElement('span');
      label.textContent = skin.name;

      btn.appendChild(img);
      btn.appendChild(label);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        skinManager.setSkin(skin.id);
        // Update selection UI
        container.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });

      // Block all pointer events from bubbling to touch-controls
      ['mousedown', 'touchstart', 'pointerdown'].forEach(evt => {
        btn.addEventListener(evt, (e) => {
          e.stopPropagation();
        }, { passive: false });
      });

      container.appendChild(btn);
    });
  }

  backToMenu() {
    this.state = 'MENU';
    this.updateUI();
  }

  start() {
    this.player = new Player(100, 306);
    this.level = new Level();
    this.state = 'PLAYING';
    this.score = 0;
    this.cameraX = 0;
    
    this.updateUI();
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    this.player.update(dt);
    
    // Camera follows player smoothly based on direction
    const screenWidth = this.canvas.width;
    const margin = 80; // おにぎりを画面の端からどれくらい離すか (150 -> 80に変更して画面端に寄せる)

    let targetCameraX;
    if (this.player.direction === 1) {
      // 右に進んでいるときは左寄りに配置
      targetCameraX = this.player.x - margin;
    } else {
      // 左に進んでいるときは右寄りに配置
      targetCameraX = this.player.x - (screenWidth - margin) + this.player.width;
    }

    // カメラを滑らかにゆっくり追従させる
    this.cameraX += (targetCameraX - this.cameraX) * 1.5 * dt;

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

    // touch-controls は PLAYING 中のみ有効化（他の状態ではUIボタンを触れるように）
    if (this.state === 'PLAYING') {
      this.touchControls.style.pointerEvents = 'auto';
    } else {
      this.touchControls.style.pointerEvents = 'none';
    }

    if (this.state === 'MENU') {
      this.startScreen.classList.add('active');
    } else if (this.state === 'GAMEOVER') {
      this.gameOverScreen.classList.add('active');
    } else if (this.state === 'WIN') {
      this.winScreen.classList.add('active');
    }
  }
}
