export function checkCollisions(player, level) {
  let isGrounded = false;
  
  // Floor collision (deadly pits)
  if (player.y > 600) {
    return { type: 'death' };
  }

  // Check platforms
  for (const plat of level.platforms) {
    if (rectIntersect(player, plat)) {
      // Simple resolution: if falling and was previously above platform
      if (player.vy >= 0 && (player.prevY !== undefined ? (player.prevY + player.height <= plat.y + 0.1) : true)) {
        player.y = plat.y - player.height;
        player.vy = 0;
        isGrounded = true;
      } else {
        // Hitting side of platform
        if (player.x + player.width > plat.x && player.x < plat.x) {
          player.x = plat.x - player.width;
        }
      }
    }
  }

  player.isGrounded = isGrounded;

  // Check obstacles
  for (const obs of level.obstacles) {
    // Make hitbox slightly smaller for obstacles to feel fair
    const shrink = 5;
    const pRect = { x: player.x + shrink, y: player.y + shrink, width: player.width - shrink*2, height: player.height - shrink*2 };
    if (rectIntersect(pRect, obs)) {
      return { type: 'death' };
    }
  }

  // Check goal
  if (rectIntersect(player, level.goal)) {
    return { type: 'win' };
  }

  return { type: 'none' };
}

function rectIntersect(r1, r2) {
  return !(r2.x >= r1.x + r1.width || 
           r2.x + r2.width <= r1.x || 
           r2.y >= r1.y + r1.height || 
           r2.y + r2.height <= r1.y);
}
