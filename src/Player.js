export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 40;
    this.vx = 0;
    this.vy = 0;
    this.speed = 300; // pixels per second
    this.jumpForce = -600;
    this.gravity = 1500;
    this.isGrounded = false;
    this.color = '#ff4757';
  }

  update(dt) {
    this.prevX = this.x;
    this.prevY = this.y;
    
    // Apply gravity
    this.vy += this.gravity * dt;

    // Move player
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // Auto move right for side-scrolling action (runner style)
    this.vx = this.speed;
  }

  jump() {
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
    }
  }

  draw(ctx, cameraX) {
    ctx.fillStyle = this.color;
    // We draw relative to camera
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    
    // Draw some details to make it look a bit better than just a square
    ctx.fillStyle = '#ffffff';
    // Eye
    ctx.fillRect(this.x - cameraX + 20, this.y + 10, 5, 5);
  }
}
