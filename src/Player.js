import { skinManager } from './OnigiriSkins.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22; // collision radius
    this.width = 44;  // bounding box for collision compatibility
    this.height = 44;
    this.vx = 0;
    this.vy = 0;
    this.speed = 280;
    this.direction = 1; // 1 for right, -1 for left
    this.jumpForce = -620;
    this.gravity = 1500;
    this.isGrounded = false;
    this.rotation = 0;        // current rotation angle (radians)
    this.angularVel = 0;      // rotation speed
    this.squash = 1;          // squash/stretch factor
    this.squashVel = 0;
    this.wasGrounded = false;
    this.trailParticles = [];
    this.jumpParticles = [];

    // Sprite rendering size (how big the image draws)
    this.spriteSize = 56;
  }

  update(dt) {
    // 前フレームで実際に移動した距離（衝突判定による押し戻しを考慮）
    const actualDx = this.x - (this.prevX !== undefined ? this.prevX : this.x);

    this.prevX = this.x;
    this.prevY = this.y;

    // Apply gravity
    this.vy += this.gravity * dt;

    // Move player
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Auto move based on direction
    this.vx = this.speed * this.direction;

    // Rolling rotation: only when grounded and actually moving
    if (this.isGrounded && Math.abs(actualDx) > 0.1) {
      // Rotation tied to actual horizontal movement
      this.angularVel = actualDx / (this.radius * dt) / this.radius;
      this.rotation += actualDx / this.radius;
    } else {
      // In air or stuck against wall: no rotation
      this.angularVel = 0;
    }

    // Squash/stretch spring animation
    const springK = 25;
    const damping = 8;
    this.squashVel += (-this.squash + 1) * springK * dt;
    this.squashVel *= (1 - damping * dt);
    this.squash += this.squashVel * dt;

    // Landing detection: trigger squash
    if (this.isGrounded && !this.wasGrounded) {
      this.squash = 0.7;
      this.squashVel = 4;
      // Landing particles
      for (let i = 0; i < 6; i++) {
        this.jumpParticles.push({
          x: this.x + this.radius,
          y: this.y + this.height,
          vx: (Math.random() - 0.5) * 150,
          vy: -Math.random() * 80 - 20,
          life: 0.4 + Math.random() * 0.3,
          maxLife: 0.4 + Math.random() * 0.3,
          size: 3 + Math.random() * 3,
        });
      }
    }
    this.wasGrounded = this.isGrounded;

    // Trail particles when grounded
    if (this.isGrounded && Math.random() < 0.3) {
      this.trailParticles.push({
        x: this.x + this.radius,
        y: this.y + this.height - 2,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.3 + Math.random() * 0.2,
        size: 2 + Math.random() * 2,
      });
    }

    // Update particles
    this.trailParticles.forEach(p => {
      p.life -= dt;
    });
    this.trailParticles = this.trailParticles.filter(p => p.life > 0);

    this.jumpParticles.forEach(p => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
    });
    this.jumpParticles = this.jumpParticles.filter(p => p.life > 0);
  }

  jump() {
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      // Stretch on jump
      this.squash = 1.3;
      this.squashVel = -3;
      // Jump particles
      for (let i = 0; i < 5; i++) {
        this.jumpParticles.push({
          x: this.x + this.radius,
          y: this.y + this.height,
          vx: (Math.random() - 0.5) * 120,
          vy: Math.random() * 40 + 10,
          life: 0.3 + Math.random() * 0.2,
          maxLife: 0.3 + Math.random() * 0.2,
          size: 3 + Math.random() * 3,
        });
      }
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX + this.radius;
    const screenY = this.y + this.height / 2;

    // Draw trail particles (behind onigiri)
    this.trailParticles.forEach(p => {
      const alpha = p.life / p.maxLife * 0.4;
      ctx.fillStyle = `rgba(200, 180, 140, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw jump/land particles
    this.jumpParticles.forEach(p => {
      const alpha = p.life / p.maxLife * 0.6;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });

    // --- Shadow on ground ---
    if (this.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(screenX, this.y + this.height + 2, this.radius * 0.8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shadow gets smaller/lighter as player goes higher
      const shadowDist = Math.min((this.y + this.height) / 350, 1);
      const shadowAlpha = 0.1 * shadowDist;
      const shadowWidth = this.radius * 0.5 * shadowDist;
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(screenX, 352, shadowWidth, 3 * shadowDist, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Draw the onigiri sprite ---
    ctx.save();
    ctx.translate(screenX, screenY);

    // Apply squash/stretch (1/squash for width to keep volume)
    const sx = 1 / this.squash;
    const sy = this.squash;
    ctx.scale(sx, sy);

    // Apply rotation
    ctx.rotate(this.rotation);

    const spriteImg = skinManager.getCurrentImage();

    if (spriteImg) {
      // Draw sprite image centered
      const half = this.spriteSize / 2;
      ctx.drawImage(spriteImg, -half, -half, this.spriteSize, this.spriteSize);
    } else {
      // Fallback: draw a simple onigiri shape if image not loaded
      this._drawFallbackOnigiri(ctx);
    }

    ctx.restore();
  }

  /**
   * フォールバック描画: 画像未ロード時のシンプルなおにぎり描画
   */
  _drawFallbackOnigiri(ctx) {
    const r = this.radius + 2;
    const topY = -r * 1.1;
    const botY = r * 0.7;
    const halfW = r * 0.95;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.quadraticCurveTo(halfW * 1.2, topY * 0.1, halfW, botY);
    ctx.quadraticCurveTo(0, botY * 1.3, -halfW, botY);
    ctx.quadraticCurveTo(-halfW * 1.2, topY * 0.1, 0, topY);
    ctx.closePath();

    const riceGrad = ctx.createLinearGradient(0, topY, 0, botY);
    riceGrad.addColorStop(0, '#FEFEFE');
    riceGrad.addColorStop(0.5, '#F5F0E8');
    riceGrad.addColorStop(1, '#EDE5D8');
    ctx.fillStyle = riceGrad;
    ctx.fill();
    ctx.strokeStyle = '#D5CFC2';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Face
    const eyeY = topY * 0.15;
    const eyeSpacing = r * 0.3;
    ctx.fillStyle = '#3D2B1F';
    ctx.beginPath();
    ctx.arc(-eyeSpacing, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeSpacing, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const mouthY = eyeY + r * 0.25;
    ctx.strokeStyle = '#3D2B1F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, mouthY - 2, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}
