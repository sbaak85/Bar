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
  const backgroundImage = new Image();
  backgroundImage.src = "Assets/Background.png";

  const bgm = new Audio("Assets/SE/霓虹木酒館.mp3");
  bgm.loop = true;
  bgm.volume = 0.58;

  const catchSounds = [
    new Audio("Assets/SE/putting_a_cup1.mp3"),
    new Audio("Assets/SE/putting_a_cup2.mp3"),
    new Audio("Assets/SE/putting_a_glass1.mp3"),
  ];
  catchSounds.forEach((sound) => {
    sound.volume = 0.85;
  });

  const missSounds = [
    new Audio("Assets/SE/glass_rolling.mp3"),
    new Audio("Assets/SE/breaking_a_cup.mp3"),
    new Audio("Assets/SE/breaking_a_glass.mp3"),
  ];
  missSounds.forEach((sound) => {
    sound.volume = 0.88;
  });

  const yumeParts = {
    body: loadImage("Assets/Yume/body.png"),
    rightHand: loadImage("Assets/Yume/right_hand.png"),
    leftHand: loadImage("Assets/Yume/left_hand.png"),
    rightFoot: loadImage("Assets/Yume/right_foot.png"),
    leftFoot: loadImage("Assets/Yume/left_foot.png"),
    tray: loadImage("Assets/Yume/Tray.png"),
  };

  const suzyImage = loadImage("Assets/Yume/Suzy.png");

  const yumeCrops = {
    body: { x: 200, y: 182, width: 1577, height: 1599 },
    rightHand: { x: 14, y: 54, width: 335, height: 181 },
    leftHand: { x: 42, y: 58, width: 339, height: 91 },
    rightFoot: { x: 24, y: 44, width: 127, height: 193 },
    leftFoot: { x: 14, y: 42, width: 125, height: 163 },
    tray: { x: 224, y: 366, width: 1087, height: 381 },
  };

  const suzy = {
    x: 420,
    y: 326,
    width: 88,
    bounceTime: 1,
    bounceDuration: 0.48,
    crop: { x: 232, y: 328, width: 735, height: 791 },
  };

  const BASE_WIDTH = 960;
  const BASE_HEIGHT = 540;
  const WIDTH = BASE_WIDTH;
  const HEIGHT = BASE_HEIGHT;
  const SCALE_X = canvas.width / BASE_WIDTH;
  const SCALE_Y = canvas.height / BASE_HEIGHT;
  const SPAWN_LINE = {
    left: 418 * (BASE_WIDTH / canvas.width),
    right: 876 * (BASE_WIDTH / canvas.width),
    y: 260 * (BASE_HEIGHT / canvas.height),
  };
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
    y: HEIGHT - 162,
    width: 176,
    height: 28,
    offsetX: -68,
    speed: 620,
    direction: -1,
    moving: false,
    walkTime: 0,
    handSway: 0,
  };

  const glassTypes = [
    { name: "10", image: loadImage("Assets/wine bottle/cropped/10.png"), aspect: 212 / 500, color: "#d89135", points: 10 },
    { name: "12", image: loadImage("Assets/wine bottle/cropped/12.png"), aspect: 217 / 500, color: "#d8a24e", points: 12 },
    { name: "15", image: loadImage("Assets/wine bottle/cropped/15.png"), aspect: 300 / 370, color: "#c05f4a", points: 15 },
    { name: "18", image: loadImage("Assets/wine bottle/cropped/18.png"), aspect: 251 / 500, color: "#8e6b42", points: 18 },
    { name: "20", image: loadImage("Assets/wine bottle/cropped/20.png"), aspect: 232 / 500, color: "#7f8a5b", points: 20 },
    { name: "25", image: loadImage("Assets/wine bottle/cropped/25.png"), aspect: 259 / 500, color: "#b0443f", points: 25 },
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
    tray.direction = -1;
    tray.moving = false;
    tray.walkTime = 0;
    tray.handSway = 0;
    gameOver = false;
    paused = false;
    running = true;
    lastTime = performance.now();
    updateHud();
    messagePanel.classList.add("is-hidden");
    pauseButton.textContent = "暫停";
    bgm.currentTime = 0;
    playBgm();
    requestAnimationFrame(loop);
  }

  function playBgm() {
    bgm.play().catch(() => {
      // Browsers may block audio until a direct user gesture is accepted.
    });
  }

  function playCatchSound() {
    const sound = catchSounds[Math.floor(Math.random() * catchSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Short effects follow the same browser gesture rules as BGM.
    });
  }

  function playMissSound() {
    const sound = missSounds[Math.floor(Math.random() * missSounds.length)];
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Short effects follow the same browser gesture rules as BGM.
    });
  }

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", draw);
    return image;
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
    const size = 58 + Math.random() * 18;
    const startX = SPAWN_LINE.left + Math.random() * (SPAWN_LINE.right - SPAWN_LINE.left);
    const targetX = Math.max(54, Math.min(WIDTH - 54, startX + (-280 + Math.random() * 560)));
    const fallDistance = HEIGHT + 70 - SPAWN_LINE.y;
    const duration = Math.max(1.02, 1.62 - Math.min(score / 1800, 0.45) + (-0.14 + Math.random() * 0.22));
    glasses.push({
      x: startX,
      y: SPAWN_LINE.y,
      startX,
      startY: SPAWN_LINE.y,
      targetX,
      fallDistance,
      arcHeight: 82 + Math.random() * 58,
      age: 0,
      duration,
      size,
      width: size * type.aspect,
      rotation: -0.3 + Math.random() * 0.6,
      spin: -1.2 + Math.random() * 2.4,
      type,
    });
    triggerSuzyBounce();
  }

  function triggerSuzyBounce() {
    suzy.bounceTime = 0;
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
    tray.moving = direction !== 0;
    if (tray.moving) {
      tray.direction = direction > 0 ? 1 : -1;
      tray.walkTime += delta * 9.5;
    } else {
      tray.walkTime = 0;
    }
    tray.handSway += ((tray.moving ? Math.sin(tray.walkTime) : 0) - tray.handSway) * Math.min(1, delta * 14);

    spawnTimer -= delta;
    const baseSpawnEvery = Math.max(0.42, 1.08 - score / 900);
    const spawnEvery = timeLeft <= 10 ? baseSpawnEvery * 0.5 : baseSpawnEvery;
    if (spawnTimer <= 0) {
      spawnGlass();
      spawnTimer = spawnEvery;
    }

    for (let i = glasses.length - 1; i >= 0; i -= 1) {
      const glass = glasses[i];
      glass.age += delta;
      const t = glass.age / glass.duration;
      const horizontalEase = Math.min(t, 1);
      glass.x = glass.startX + (glass.targetX - glass.startX) * horizontalEase;
      glass.y = glass.startY - glass.arcHeight * Math.sin(Math.PI * Math.min(t, 1)) + glass.fallDistance * t * t;
      glass.rotation += glass.spin * delta;

      const trayCenterX = getTrayCenterX();
      const trayTop = tray.y - tray.height / 2;
      const caught =
        glass.y + glass.size / 2 >= trayTop &&
        glass.y < tray.y + 24 &&
        Math.abs(glass.x - trayCenterX) <= tray.width / 2 + glass.size * 0.18;

      if (caught) {
        combo += 1;
        score += glass.type.points + Math.min(combo * 2, 80);
        playCatchSound();
        addSplash(glass.x, trayTop - 10, glass.type.color, `+${glass.type.points}`);
        glasses.splice(i, 1);
        continue;
      }

      if (glass.y > HEIGHT + 36) {
        lives -= 1;
        combo = 0;
        playMissSound();
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

    if (suzy.bounceTime < suzy.bounceDuration) {
      suzy.bounceTime += delta;
    }

    updateHud();
  }

  function endGame(title, text, buttonText) {
    running = false;
    gameOver = true;
    bgm.pause();
    updateHud();
    showMessage(title, text, buttonText);
  }

  function drawBackground() {
    if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
      const imageRatio = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
      const stageRatio = WIDTH / HEIGHT;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = backgroundImage.naturalWidth;
      let sourceHeight = backgroundImage.naturalHeight;

      if (imageRatio > stageRatio) {
        sourceWidth = backgroundImage.naturalHeight * stageRatio;
        sourceX = (backgroundImage.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = backgroundImage.naturalWidth / stageRatio;
        sourceY = (backgroundImage.naturalHeight - sourceHeight) / 2;
      }

      ctx.drawImage(
        backgroundImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        WIDTH,
        HEIGHT
      );
      return;
    }

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

    if (glass.type.image.complete && glass.type.image.naturalWidth > 0) {
      ctx.drawImage(
        glass.type.image,
        -glass.width / 2,
        -glass.size / 2,
        glass.width,
        glass.size
      );
    } else {
      ctx.fillStyle = glass.type.color;
      ctx.fillRect(-glass.width / 2, -glass.size / 2, glass.width, glass.size);
    }

    ctx.restore();
  }

  function drawSuzy() {
    if (!suzyImage.complete || suzyImage.naturalWidth === 0) return;

    const t = Math.min(1, suzy.bounceTime / suzy.bounceDuration);
    const jump = t < 1 ? Math.sin(Math.PI * t) * 14 : 0;
    const squash = t < 1 ? Math.sin(Math.PI * t) * 0.045 : 0;
    const height = suzy.width * (suzy.crop.height / suzy.crop.width);

    ctx.save();
    ctx.translate(suzy.x, suzy.y - jump);
    ctx.scale(1 + squash, 1 - squash * 0.65);
    ctx.drawImage(
      suzyImage,
      suzy.crop.x,
      suzy.crop.y,
      suzy.crop.width,
      suzy.crop.height,
      -suzy.width / 2,
      -height,
      suzy.width,
      height
    );
    ctx.restore();
  }

  function getTrayCenterX() {
    return tray.x - tray.offsetX * tray.direction;
  }

  function drawYumePart(partName, x, y, width, rotation, pivotX = 0.5, pivotY = 0.5) {
    const image = yumeParts[partName];
    const crop = yumeCrops[partName];
    if (!image.complete || image.naturalWidth === 0) return;

    const height = width * (crop.height / crop.width);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      -width * pivotX,
      -height * pivotY,
      width,
      height
    );
    ctx.restore();
  }

  function drawTray() {
    const facing = tray.direction;
    const walk = tray.moving ? Math.sin(tray.walkTime) : 0;
    const bodyWidth = 162;
    const bodyHeight = bodyWidth * (yumeCrops.body.height / yumeCrops.body.width);
    const bodyCenterY = HEIGHT - 131;
    const footY = HEIGHT - 48;
    const bodyTop = bodyCenterY - bodyHeight / 2;
    const trayX = tray.x + tray.offsetX;
    const trayY = tray.y + tray.handSway * 1.2;
    const trayWidth = tray.width;

    ctx.save();
    ctx.translate(tray.x, 0);
    ctx.scale(-facing, 1);
    ctx.translate(-tray.x, 0);

    drawYumePart("rightFoot", tray.x - 31, footY, 20, walk * 0.92, 0.5, 0.15);
    drawYumePart("leftFoot", tray.x + 31, footY, 20, -walk * 0.92, 0.5, 0.15);

    drawYumePart("rightHand", tray.x - 108, bodyTop + 65, 57, 0.25 + tray.handSway * 0.035, 0.08, 0.3);
    drawYumePart("leftHand", tray.x + 108, bodyTop + 101, 45, -0.2 - tray.handSway * 0.26, 0.9, 0.35);
    drawYumePart("body", tray.x, bodyCenterY, bodyWidth, 0);

    drawYumePart("tray", trayX, trayY, trayWidth, tray.handSway * 0.018, 0.5, 0.5);

    ctx.restore();

    if (!yumeParts.tray.complete || yumeParts.tray.naturalWidth === 0) {
      const fallbackTrayX = getTrayCenterX();
      ctx.fillStyle = "#f2c56f";
      ctx.fillRect(fallbackTrayX - tray.width / 2, tray.y - tray.height / 2, tray.width, tray.height);
    }
  }

  function drawCollisionDebug() {
    const trayCenterX = getTrayCenterX();
    const trayTop = tray.y - tray.height / 2;
    const trayBottom = tray.y + 24;
    ctx.save();
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(
      trayCenterX - tray.width / 2,
      trayTop,
      tray.width,
      trayBottom - trayTop
    );
    ctx.restore();
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(SCALE_X, 0, 0, SCALE_Y, 0, 0);

    drawBackground();
    drawSuzy();
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
    if (paused) bgm.pause();
    else playBgm();
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
  backgroundImage.addEventListener("load", draw);
})();
