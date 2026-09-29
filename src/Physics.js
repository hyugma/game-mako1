export function checkCollisions(player, level) {
  let isGrounded = false;
  
  // Floor collision (deadly pits - fell off screen)
  if (player.y > 600) {
    return { type: 'death' };
  }

  // Check platforms
  for (const plat of level.platforms) {
    if (rectIntersect(player, plat)) {
      // Simple resolution: if falling and was previously above platform
      if (player.vy >= 0 && (player.prevY !== undefined ? (player.prevY + player.height <= plat.y + 5) : true)) {
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

  // Check obstacles - use circular hitbox for onigiri (feels fairer)
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;
  const cr = (player.radius || player.width / 2) - 4; // slightly smaller for fairness

  for (const obs of level.obstacles) {
    // Circle vs rect collision
    const closestX = Math.max(obs.x, Math.min(cx, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(cy, obs.y + obs.height));
    const distX = cx - closestX;
    const distY = cy - closestY;
    if (distX * distX + distY * distY < cr * cr) {
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
