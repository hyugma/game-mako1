export class Level {
  constructor() {
    this.platforms = [];
    this.pits = [];
    this.obstacles = [];
    this.goal = null;
    this.length = 4000;
    this.generateLevel();
  }

  generateLevel() {
    // Ground level starts at y = 350
    let currentX = 0;
    const groundY = 350;

    // Start platform
    this.platforms.push({ x: 0, y: groundY, width: 800, height: 100 });
    currentX = 800;

    // Generate random sections
    while (currentX < this.length - 800) {
      const type = Math.random();
      
      if (type < 0.3) {
        // Gap / Pit
        const gapWidth = 100 + Math.random() * 100;
        this.pits.push({ x: currentX, width: gapWidth });
        currentX += gapWidth;
        // Next platform
        const platWidth = 300 + Math.random() * 400;
        this.platforms.push({ x: currentX, y: groundY, width: platWidth, height: 100 });
        currentX += platWidth;
      } else if (type < 0.6) {
        // Obstacle
        const platWidth = 400;
        this.platforms.push({ x: currentX, y: groundY, width: platWidth, height: 100 });
        // Add obstacle in middle
        const obsWidth = 40;
        const obsHeight = 40 + Math.random() * 30;
        this.obstacles.push({ x: currentX + platWidth / 2, y: groundY - obsHeight, width: obsWidth, height: obsHeight });
        currentX += platWidth;
      } else {
        // Just platform with some height variation
        const platWidth = 400;
        const heightVar = Math.random() > 0.5 ? -40 : 0;
        this.platforms.push({ x: currentX, y: groundY + heightVar, width: platWidth, height: 100 - heightVar });
        currentX += platWidth;
      }
    }

    // Final stretch and Goal
    this.platforms.push({ x: currentX, y: groundY, width: 800, height: 100 });
    this.goal = { x: currentX + 600, y: groundY - 150, width: 50, height: 150 };
  }

  draw(ctx, cameraX) {
    // Draw pits (background color shows through, but we can draw a dark area)
    
    // Draw platforms
    ctx.fillStyle = '#2ed573'; // grass color
    this.platforms.forEach(p => {
      // Only draw if on screen
      if (p.x + p.width > cameraX && p.x < cameraX + 800) {
        ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
        // Dirt below grass
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(p.x - cameraX, p.y + 20, p.width, p.height - 20);
        ctx.fillStyle = '#2ed573'; // reset
      }
    });

    // Draw obstacles
    ctx.fillStyle = '#ff6b81';
    this.obstacles.forEach(o => {
      if (o.x + o.width > cameraX && o.x < cameraX + 800) {
        ctx.fillRect(o.x - cameraX, o.y, o.width, o.height);
        // Warning stripes or details
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(o.x - cameraX, o.y, o.width, 10);
        ctx.fillStyle = '#ff6b81'; // reset
      }
    });

    // Draw goal
    if (this.goal.x + this.goal.width > cameraX && this.goal.x < cameraX + 800) {
      // Flag pole
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(this.goal.x - cameraX, this.goal.y, 10, this.goal.height);
      // Flag
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.moveTo(this.goal.x - cameraX + 10, this.goal.y);
      ctx.lineTo(this.goal.x - cameraX + 50, this.goal.y + 20);
      ctx.lineTo(this.goal.x - cameraX + 10, this.goal.y + 40);
      ctx.fill();
    }
  }
}
