(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const scoreValue = document.getElementById("scoreValue");
  const comboValue = document.getElementById("comboValue");
  const lifeValue = document.getElementById("lifeValue");
  const timeValue = document.getElementById("timeValue");
  const messagePanel = document.getElementById("messagePanel");
  const startButton = document.getElementById("startButton");
  const leftButton = document.getElementById("leftButton");
  const rightButton = document.getElementById("rightButton");
  const pauseButton = document.getElementById("pauseButton");

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const ROUND_SECONDS = 60;
  const keys = new Set();

  let score = 0;
  let combo = 0;
  let lives = 3;
  let timeLeft = ROUND_SECONDS;
  let spawnTimer = 0;
  let lastTime = 0;
  let running = false;
  let paused = false;
  let gameOver = false;
  let glasses = [];
  let splashes = [];

  const tray = {
    x: WIDTH / 2,
    y: HEIGHT - 72,
    width: 172,
    height: 26,
    speed: 620,
    lean: 0,
  };

  const glassTypes = [
    { name: "beer", color: "#f3bd43", rim: "#fff1b8", points: 10 },
    { name: "wine", color: "#a82045", rim: "#ffd6df", points: 15 },
    { name: "mint", color: "#44b7a6", rim: "#d2fff5", points: 20 },
  ];

  function resetGame() {
    score = 0;
    combo = 0;
    lives = 3;
    timeLeft = ROUND_SECONDS;
    spawnTimer = 0;
    glasses = [];
    splashes = [];
    tray.x = WIDTH / 2;
    tray.lean = 0;
    gameOver = false;
    paused = false;
    running = true;
    lastTime = performance.now();
    updateHud();
    messagePanel.classList.add("is-hidden");
    pauseButton.textContent = "暫停";
    requestAnimationFrame(loop);
  }

  function updateHud() {
    scoreValue.textContent = String(score);
    comboValue.textContent = String(combo);
    lifeValue.textContent = String(lives);
    timeValue.textContent = String(Math.max(0, Math.ceil(timeLeft)));
  }

  function showMessage(title, text, buttonText) {
    messagePanel.querySelector("h1").textContent = title;
    messagePanel.querySelector("p").textContent = text;
    startButton.textContent = buttonText;
    messagePanel.classList.remove("is-hidden");
  }

  function spawnGlass() {
    const type = glassTypes[Math.floor(Math.random() * glassTypes.length)];
    const size = 34 + Math.random() * 16;
    glasses.push({
      x: 80 + Math.random() * (WIDTH - 160),
      y: 112,
      vx: -60 + Math.random() * 120,
      vy: 125 + Math.random() * 80 + Math.min(score / 18, 120),
      size,
      rotation: -0.3 + Math.random() * 0.6,
      spin: -1.2 + Math.random() * 2.4,
      type,
    });
  }

  function addSplash(x, y, color, text) {
    splashes.push({
      x,
      y,
      color,
      text,
      age: 0,
      life: 0.7,
    });
  }

  function update(delta) {
    if (!running || paused) return;

    timeLeft -= delta;
    if (timeLeft <= 0) {
      endGame("時間到", `你接到了 ${score} 分的酒杯。`, "再玩一次");
      return;
    }

    let direction = 0;
    if (keys.has("ArrowLeft") || keys.has("a")) direction -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) direction += 1;
    tray.x += direction * tray.speed * delta;
    tray.x = Math.max(tray.width / 2 + 18, Math.min(WIDTH - tray.width / 2 - 18, tray.x));
    tray.lean += (direction * 0.16 - tray.lean) * Math.min(1, delta * 12);

    spawnTimer -= delta;
    const spawnEvery = Math.max(0.42, 1.08 - score / 900);
    if (spawnTimer <= 0) {
      spawnGlass();
      spawnTimer = spawnEvery;
    }

    for (let i = glasses.length - 1; i >= 0; i -= 1) {
      const glass = glasses[i];
      glass.x += glass.vx * delta;
      glass.y += glass.vy * delta;
      glass.rotation += glass.spin * delta;

      if (glass.x < 36 || glass.x > WIDTH - 36) {
        glass.vx *= -0.85;
        glass.x = Math.max(36, Math.min(WIDTH - 36, glass.x));
      }

      const trayTop = tray.y - tray.height / 2;
      const caught =
        glass.y + glass.size / 2 >= trayTop &&
        glass.y < tray.y + 24 &&
        Math.abs(glass.x - tray.x) <= tray.width / 2 + glass.size * 0.25;

      if (caught) {
        combo += 1;
        score += glass.type.points + Math.min(combo * 2, 80);
        addSplash(glass.x, trayTop - 10, glass.type.color, `+${glass.type.points}`);
        glasses.splice(i, 1);
        continue;
      }

      if (glass.y > HEIGHT + 36) {
        lives -= 1;
        combo = 0;
        addSplash(glass.x, HEIGHT - 44, "#ffffff", "MISS");
        glasses.splice(i, 1);
        if (lives <= 0) {
          endGame("收攤", `你接到了 ${score} 分的酒杯。`, "再玩一次");
          return;
        }
      }
    }

    for (let i = splashes.length - 1; i >= 0; i -= 1) {
      splashes[i].age += delta;
      if (splashes[i].age >= splashes[i].life) splashes.splice(i, 1);
    }

    updateHud();
  }

  function endGame(title, text, buttonText) {
    running = false;
    gameOver = true;
    updateHud();
    showMessage(title, text, buttonText);
  }

  function drawBackground() {
    const barGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    barGradient.addColorStop(0, "#261313");
    barGradient.addColorStop(0.56, "#381817");
    barGradient.addColorStop(1, "#15100d");
    ctx.fillStyle = barGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#1b0b0a";
    ctx.fillRect(0, 0, WIDTH, 112);
    ctx.fillStyle = "#d79b45";
    ctx.fillRect(0, 108, WIDTH, 10);

    for (let i = 0; i < 9; i += 1) {
      const x = 72 + i * 104;
      drawBottle(x, 42, i);
    }

    ctx.fillStyle = "#6b2c22";
    ctx.fillRect(0, HEIGHT - 74, WIDTH, 74);
    ctx.fillStyle = "#9a5635";
    ctx.fillRect(0, HEIGHT - 86, WIDTH, 20);
    ctx.fillStyle = "rgba(255, 232, 164, 0.18)";
    for (let x = 0; x < WIDTH; x += 54) {
      ctx.fillRect(x, HEIGHT - 80, 26, 5);
    }
  }

  function drawBottle(x, y, index) {
    const colors = ["#226f67", "#8f2242", "#d89135", "#3e5f91"];
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(-13, 22, 26, 54);
    ctx.fillRect(-7, 2, 14, 24);
    ctx.fillStyle = "#fff0bd";
    ctx.fillRect(-10, 42, 20, 16);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(3, 12, 4, 58);
    ctx.restore();
  }

  function drawGlass(glass) {
    ctx.save();
    ctx.translate(glass.x, glass.y);
    ctx.rotate(glass.rotation);

    const w = glass.size * 0.72;
    const h = glass.size;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.strokeStyle = glass.type.rim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w * 0.36, h / 2);
    ctx.lineTo(-w * 0.36, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = glass.type.color;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(-w * 0.38, -h * 0.02);
    ctx.lineTo(w * 0.38, -h * 0.02);
    ctx.lineTo(w * 0.26, h * 0.36);
    ctx.lineTo(-w * 0.26, h * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function drawTray() {
    ctx.save();
    ctx.translate(tray.x, tray.y);
    ctx.rotate(tray.lean);
    ctx.fillStyle = "#2b1810";
    ctx.fillRect(-tray.width / 2, -tray.height / 2 + 9, tray.width, tray.height);
    ctx.fillStyle = "#f2c56f";
    ctx.fillRect(-tray.width / 2, -tray.height / 2, tray.width, 15);
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fillRect(-tray.width / 2 + 16, -tray.height / 2 + 4, tray.width - 32, 3);
    ctx.restore();

    ctx.fillStyle = "#fff7dc";
    ctx.fillRect(tray.x - 18, tray.y + 24, 36, 54);
  }

  function drawSplash(splash) {
    const t = splash.age / splash.life;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = splash.color;
    ctx.font = "700 28px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(splash.text, splash.x, splash.y - t * 42);
    ctx.restore();
  }

  function draw() {
    drawBackground();
    glasses.forEach(drawGlass);
    drawTray();
    splashes.forEach(drawSplash);

    if (paused && running) {
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#fff7dc";
      ctx.font = "700 54px Microsoft JhengHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("暫停", WIDTH / 2, HEIGHT / 2);
    }
  }

  function loop(now) {
    if (!running) {
      draw();
      return;
    }

    const delta = Math.min(0.033, (now - lastTime) / 1000 || 0);
    lastTime = now;
    update(delta);
    draw();
    if (running) requestAnimationFrame(loop);
  }

  function setButtonKey(button, key) {
    const press = (event) => {
      event.preventDefault();
      keys.add(key);
    };
    const release = (event) => {
      event.preventDefault();
      keys.delete(key);
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
  }

  startButton.addEventListener("click", resetGame);
  pauseButton.addEventListener("click", () => {
    if (!running || gameOver) return;
    paused = !paused;
    pauseButton.textContent = paused ? "繼續" : "暫停";
    lastTime = performance.now();
    if (!paused) requestAnimationFrame(loop);
    draw();
  });

  setButtonKey(leftButton, "ArrowLeft");
  setButtonKey(rightButton, "ArrowRight");

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "a", "d", " "].includes(key)) {
      event.preventDefault();
    }
    if (key === " ") {
      if (!running || gameOver) resetGame();
      else pauseButton.click();
      return;
    }
    keys.add(key === "arrowleft" || key === "arrowright" ? event.key : key);
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    keys.delete(key === "arrowleft" || key === "arrowright" ? event.key : key);
  });

  draw();
})();
