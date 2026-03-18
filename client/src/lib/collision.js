// AABB helpers — all rects are { x, y, w, h }

export function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function aabbIntersect(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  if (ox <= 0 || oy <= 0) return null;
  return {
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y),
    w: ox,
    h: oy,
  };
}

// Returns { dx, dy, side } to push `moving` out of `stat`
export function resolveAABB(moving, stat) {
  const ix = aabbIntersect(moving, stat);
  if (!ix) return null;

  let dx = 0, dy = 0, side;

  if (ix.w < ix.h) {
    // Resolve horizontally
    if (moving.x + moving.w / 2 < stat.x + stat.w / 2) {
      dx = -ix.w;
      side = 'right';
    } else {
      dx = ix.w;
      side = 'left';
    }
  } else {
    // Resolve vertically
    if (moving.y + moving.h / 2 < stat.y + stat.h / 2) {
      dy = -ix.h;
      side = 'bottom';
    } else {
      dy = ix.h;
      side = 'top';
    }
  }

  return { dx, dy, side };
}

// Circle collision — circles are { x, y, r } (x,y = center)
export function circleOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist2 = dx * dx + dy * dy;
  const rSum = a.r + b.r;
  return dist2 < rSum * rSum;
}

export function circleAABBOverlap(circle, rect) {
  const nearX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const nearY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - nearX;
  const dy = circle.y - nearY;
  return (dx * dx + dy * dy) < circle.r * circle.r;
}

// Continuous collision detection (CCD) sweep — returns time of impact [0,1] or null
export function sweepAABB(moving, velocity, stat, dt) {
  const vx = velocity.x * dt;
  const vy = velocity.y * dt;

  if (vx === 0 && vy === 0) return aabbOverlap(moving, stat) ? 0 : null;

  // Minkowski sum of stat expanded by moving size
  const expanded = {
    x: stat.x - moving.w,
    y: stat.y - moving.h,
    w: stat.w + moving.w,
    h: stat.h + moving.h,
  };

  // Ray from moving origin along velocity
  const ox = moving.x;
  const oy = moving.y;

  let tmin = 0;
  let tmax = 1;

  if (vx !== 0) {
    const t1 = (expanded.x - ox) / vx;
    const t2 = (expanded.x + expanded.w - ox) / vx;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));
  } else {
    if (ox < expanded.x || ox > expanded.x + expanded.w) return null;
  }

  if (vy !== 0) {
    const t1 = (expanded.y - oy) / vy;
    const t2 = (expanded.y + expanded.h - oy) / vy;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));
  } else {
    if (oy < expanded.y || oy > expanded.y + expanded.h) return null;
  }

  if (tmax < tmin) return null;
  if (tmin < 0 || tmin > 1) return null;

  return tmin;
}
