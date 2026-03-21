// ─── GRID HELPERS ─────────────────────────────────────────────
function isRowOdd(row) {
  return (row + gridParity) % 2 === 1;
}

function bubbleXY(col, row) {
  const offset = isRowOdd(row) ? R : 0;
  return {
    x: col * R * 2 + R + offset,
    y: row * R * 1.73 + R
  };
}

function initGrid(lvl) {
  grid = [];
  gridParity = 0;
  const rows = 4 + Math.min(lvl - 1, 6);
  const colorsAvail = Math.min(3 + Math.floor(lvl / 2), BUBBLE_COLORS.length);
  const colors = BUBBLE_COLORS.slice(0, colorsAvail);
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      if (Math.random() < 0.85) {
        grid[r][c] = colors[Math.floor(Math.random() * colors.length)];
      } else {
        grid[r][c] = null;
      }
    }
  }
}

function dropRow() {
  grid.unshift(new Array(COLS).fill(null));
  // Flip parity so existing rows keep their visual offset
  gridParity = (gridParity + 1) % 2;

  const colorsAvail = Math.min(3 + Math.floor(level / 2), BUBBLE_COLORS.length);
  const colors = BUBBLE_COLORS.slice(0, colorsAvail);
  const newRow = [];
  for (let c = 0; c < COLS; c++) {
    newRow[c] = Math.random() < 0.8 ? colors[Math.floor(Math.random() * colors.length)] : null;
  }
  grid[0] = newRow;
  // Trigger smooth slide-down animation
  gridAnimOffsetY = -R * 1.73;
}

function gridBottomY() {
  for (let r = grid.length - 1; r >= 0; r--) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) {
        return bubbleXY(c, r).y + R;
      }
    }
  }
  return 0;
}

function colorsInGrid() {
  const s = new Set();
  grid.forEach(row => row && row.forEach(c => c && s.add(c)));
  return [...s];
}

function randomColor() {
  const colors = colorsInGrid();
  if (colors.length === 0) return BUBBLE_COLORS[0];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ─── NEAREST GRID CELL ────────────────────────────────────────
function nearestCell(x, y) {
  let best = null, bestDist = Infinity;
  for (let r = 0; r < grid.length + 2; r++) {
    for (let c = 0; c < COLS; c++) {
      const pos = bubbleXY(c, r);
      const d = Math.hypot(pos.x - x, pos.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = { r, c };
      }
    }
  }
  return best;
}

// ─── FLOOD FILL / MATCH ───────────────────────────────────────
function getMatches(startR, startC) {
  const color = grid[startR] && grid[startR][startC];
  if (!color) return [];
  const visited = new Set();
  const queue = [[startR, startC]];
  const result = [];
  while (queue.length) {
    const [r, c] = queue.pop();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (r < 0 || r >= grid.length || c < 0 || c >= COLS) continue;
    if (grid[r]?.[c] !== color) continue;
    result.push([r, c]);
    const neighbors = getNeighbors(r, c);
    neighbors.forEach(n => queue.push(n));
  }
  return result;
}

function getNeighbors(r, c) {
  const odd = isRowOdd(r);
  return [
    [r-1, odd ? c : c-1], [r-1, odd ? c+1 : c],
    [r, c-1], [r, c+1],
    [r+1, odd ? c : c-1], [r+1, odd ? c+1 : c],
  ].filter(([nr, nc]) => nr >= 0 && nc >= 0 && nc < COLS);
}

function getFloating() {
  const connected = new Set();
  const queue = [];
  for (let c = 0; c < COLS; c++) {
    if (grid[0]?.[c]) {
      queue.push([0, c]);
      connected.add(`0,${c}`);
    }
  }
  while (queue.length) {
    const [r, c] = queue.pop();
    getNeighbors(r, c).forEach(([nr, nc]) => {
      const key = `${nr},${nc}`;
      if (!connected.has(key) && grid[nr]?.[nc]) {
        connected.add(key);
        queue.push([nr, nc]);
      }
    });
  }
  const floating = [];
  grid.forEach((row, r) => {
    row && row.forEach((col, c) => {
      if (col && !connected.has(`${r},${c}`)) floating.push([r, c]);
    });
  });
  return floating;
}

function isGridEmpty() {
  return grid.every(row => !row || row.every(c => !c));
}
