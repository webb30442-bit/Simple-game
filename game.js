(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlay-text");
  const startBtn = document.getElementById("start-btn");

  const GRID_SIZE = 20;
  const CELL = canvas.width / GRID_SIZE;
  const BASE_SPEED_MS = 130;
  const MIN_SPEED_MS = 60;

  const BEST_KEY = "snake-best-score";

  let snake, direction, nextDirection, food, score, best, running, loopId, speed;

  function loadBest() {
    const stored = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(stored) ? stored : 0;
  }

  function saveBest(value) {
    localStorage.setItem(BEST_KEY, String(value));
  }

  function randomCell() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  function placeFood() {
    let cell;
    do {
      cell = randomCell();
    } while (snake.some((seg) => seg.x === cell.x && seg.y === cell.y));
    food = cell;
  }

  function resetGame() {
    snake = [
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    speed = BASE_SPEED_MS;
    scoreEl.textContent = "0";
    placeFood();
    draw();
  }

  function gameOver() {
    running = false;
    clearInterval(loopId);
    if (score > best) {
      best = score;
      saveBest(best);
      bestEl.textContent = String(best);
    }
    overlayText.textContent = `Game over! Score: ${score}. Press Start to try again.`;
    startBtn.textContent = "Restart";
    overlay.classList.remove("hidden");
  }

  function startGame() {
    resetGame();
    running = true;
    overlay.classList.add("hidden");
    clearInterval(loopId);
    loopId = setInterval(tick, speed);
  }

  function changeDirection(dx, dy) {
    if (!running) return;
    // prevent reversing directly into itself
    if (dx === -direction.x && dy === -direction.y) return;
    nextDirection = { x: dx, y: dy };
  }

  function tick() {
    direction = nextDirection;
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    const hitWall =
      head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
    const hitSelf = snake.some((seg) => seg.x === head.x && seg.y === head.y);

    if (hitWall || hitSelf) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score);
      placeFood();
      if (speed > MIN_SPEED_MS) {
        speed -= 3;
        clearInterval(loopId);
        loopId = setInterval(tick, speed);
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    ctx.fillStyle = "#f87171";
    roundedCell(food.x, food.y, 0.5);

    // snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#6ef0a0" : "#4ade80";
      roundedCell(seg.x, seg.y, 0.15);
    });
  }

  function roundedCell(gx, gy, inset) {
    const pad = inset * 2;
    const x = gx * CELL + pad;
    const y = gy * CELL + pad;
    const size = CELL - pad * 2;
    const r = Math.max(2, size * 0.25);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + size, y, x + size, y + size, r);
    ctx.arcTo(x + size, y + size, x, y + size, r);
    ctx.arcTo(x, y + size, x, y, r);
    ctx.arcTo(x, y, x + size, y, r);
    ctx.closePath();
    ctx.fill();
  }

  // keyboard controls
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        e.preventDefault();
        if (!running) startGame();
        changeDirection(0, -1);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        e.preventDefault();
        if (!running) startGame();
        changeDirection(0, 1);
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        e.preventDefault();
        if (!running) startGame();
        changeDirection(-1, 0);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        e.preventDefault();
        if (!running) startGame();
        changeDirection(1, 0);
        break;
    }
  });

  // on-screen controls
  document.getElementById("up").addEventListener("click", () => {
    if (!running) startGame();
    changeDirection(0, -1);
  });
  document.getElementById("down").addEventListener("click", () => {
    if (!running) startGame();
    changeDirection(0, 1);
  });
  document.getElementById("left").addEventListener("click", () => {
    if (!running) startGame();
    changeDirection(-1, 0);
  });
  document.getElementById("right").addEventListener("click", () => {
    if (!running) startGame();
    changeDirection(1, 0);
  });

  // swipe controls
  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  });
  canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (!running) startGame();
      changeDirection(dx > 0 ? 1 : -1, 0);
    } else {
      if (!running) startGame();
      changeDirection(0, dy > 0 ? 1 : -1);
    }
    touchStart = null;
  });

  startBtn.addEventListener("click", startGame);

  best = loadBest();
  bestEl.textContent = String(best);
  running = false;
  resetGame();
})();
