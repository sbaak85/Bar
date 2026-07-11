(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gameStage = document.querySelector(".game-stage");

  const scoreValue = document.getElementById("scoreValue");
  const comboValue = document.getElementById("comboValue");
  const catchValue = document.getElementById("catchValue");
  const lifeValue = document.getElementById("lifeValue");
  const timeValue = document.getElementById("timeValue");
  const messagePanel = document.getElementById("messagePanel");
  const startButton = document.getElementById("startButton");
  const leftButton = document.getElementById("leftButton");
  const rightButton = document.getElementById("rightButton");
  const pauseButton = document.getElementById("pauseButton");
  const bgmButton = document.getElementById("bgmButton");
  const debugToggleButton = document.getElementById("debugToggleButton");
  const debugOptions = document.getElementById("debugOptions");
  const debugTrayCollision = document.getElementById("debugTrayCollision");
  const debugCatCollision = document.getElementById("debugCatCollision");
  const debugBottleCollision = document.getElementById("debugBottleCollision");
  const debugInfiniteMode = document.getElementById("debugInfiniteMode");
  const debugInputArea = document.getElementById("debugInputArea");
  const debugReverseDistance = document.getElementById("debugReverseDistance");
  const debugReverseDistanceApply = document.getElementById("debugReverseDistanceApply");
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

  const eventSounds = {
    coin: new Audio("Assets/SE/Coin.mp3"),
    applause: new Audio("Assets/SE/applause.mp3"),
    finalCountdown: new Audio("Assets/SE/3210.mp3"),
    cupOpen: new Audio("Assets/SE/杯打開.mp3"),
    cupClose: new Audio("Assets/SE/杯關閉.mp3"),
  };
  eventSounds.coin.volume = 0.9;
  eventSounds.applause.volume = 0.9;
  eventSounds.finalCountdown.volume = 0.9;
  eventSounds.cupOpen.volume = 0.9;
  eventSounds.cupClose.volume = 0.9;

  const voiceLoop = new Audio("Assets/SE/人聲.mp3");
  voiceLoop.loop = true;
  voiceLoop.volume = 0;

  const yumeParts = {
    body: loadImage("Assets/Yume/body.png"),
    rightHand: loadImage("Assets/Yume/right_hand.png"),
    leftHand: loadImage("Assets/Yume/left_hand.png"),
    rightFoot: loadImage("Assets/Yume/right_foot.png"),
    leftFoot: loadImage("Assets/Yume/left_foot.png"),
    tray: loadImage("Assets/Yume/Tray.png"),
  };

  const suzyImage = loadImage("Assets/Yume/Suzy.png");
  const suzySleepImage = loadImage("Assets/Yume/Suzy_sleep.png");
  const angerImage = loadImage("Assets/anger.png");
  const cat2Parts = {
    body: loadImage("Assets/Yume/Cat2.png"),
    tail: loadImage("Assets/Yume/Tail.png"),
    attack: loadImage("Assets/Yume/Cat_Attack.png"),
  };
  const bitmapFontImages = {
    gold: loadImage("Assets/Font/CHFont2.png"),
    copper: loadImage("Assets/Font/CHFont3.png"),
    green: loadImage("Assets/Font/CHFont4.png"),
    blue: loadImage("Assets/Font/CHFont5.png"),
    red: loadImage("Assets/Font/CHFont6.png"),
  };
  const bitmapFontMetrics = {
    lineHeight: 107,
    chars: {
      "0": { x: 2, y: 2, width: 100, height: 107, xadvance: 103 },
      "1": { x: 104, y: 2, width: 66, height: 107, xadvance: 69 },
      "2": { x: 172, y: 2, width: 90, height: 107, xadvance: 93 },
      "3": { x: 264, y: 2, width: 87, height: 107, xadvance: 90 },
      "4": { x: 353, y: 2, width: 96, height: 107, xadvance: 99 },
      "5": { x: 451, y: 2, width: 89, height: 107, xadvance: 92 },
      "6": { x: 542, y: 2, width: 96, height: 107, xadvance: 99 },
      "7": { x: 640, y: 2, width: 90, height: 107, xadvance: 93 },
      "8": { x: 732, y: 2, width: 91, height: 107, xadvance: 94 },
      "9": { x: 825, y: 2, width: 92, height: 107, xadvance: 95 },
      "+": { x: 919, y: 2, width: 101, height: 107, xadvance: 104 },
      "-": { x: 1022, y: 2, width: 104, height: 107, xadvance: 107 },
      "x": { x: 1128, y: 2, width: 102, height: 107, xadvance: 105 },
      "/": { x: 1232, y: 2, width: 74, height: 107, xadvance: 77 },
      "=": { x: 1308, y: 2, width: 102, height: 107, xadvance: 105 },
      ",": { x: 1412, y: 2, width: 41, height: 107, xadvance: 44 },
      ".": { x: 1455, y: 2, width: 39, height: 107, xadvance: 42 },
    },
  };

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
    width: 96.8,
    sleepScale: 1.177,
    awake: false,
    sleepTime: 0,
    bounceTime: 1,
    bounceDuration: 0.48,
    crop: { x: 232, y: 328, width: 735, height: 791 },
    sleepCrop: { x: 176, y: 598, width: 685, height: 346 },
  };

  const cat2Crops = {
    body: { x: 52, y: 45, width: 530, height: 918 },
    tail: { x: 22, y: 14, width: 222, height: 166 },
    attack: { x: 34, y: 58, width: 891, height: 944 },
  };

  const cat2 = {
    x: 628,
    baseY: 380,
    bodyWidth: 59.4,
    tailOffsetXRatio: 466 / 530,
    tailPivotYRatio: 766 / 918,
    tailWidthRatio: 173 / 530,
    tailAngle: 0,
    tailCooldown: 0.7,
    tailTime: 0,
    tailDuration: 0,
    tailAmplitude: 0,
    tailSwings: 2,
    attackTimer: 0,
    attackDuration: 0.2,
    reactTimer: 0,
    reactDuration: 0.16,
    attackPivotXRatio: 0.56,
    headCollision: { offsetX: -21.68, offsetYRatio: 0.09, widthPadding: 14, heightRatio: 0.36 },
    hitClock: 0,
    collisionHitTimes: [],
    angerTimer: 0,
    angerDuration: 0.72,
    angerWidth: 40,
    angerWindow: 3,
    angerHitThreshold: 3,
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
  const debugState = {
    trayCollision: false,
    catCollision: false,
    bottleCollision: false,
    infiniteMode: false,
    inputArea: false,
  };
  const dragControl = {
    active: false,
    pointerId: null,
    lastClientX: 0,
    direction: 0,
    reverseDistance: 0,
    reverseSwitchDistance: 22,
  };

  let score = 0;
  let combo = 0;
  let catchCount = 0;
  let missCount = 0;
  let lives = 3;
  let timeLeft = ROUND_SECONDS;
  let spawnTimer = 0;
  let finalCountdownSoundPlayed = false;
  let voiceFadeActive = false;
  let voiceFadeTime = 0;
  let lastTime = 0;
  let running = false;
  let paused = false;
  let gameOver = false;
  let idleAnimationActive = false;
  let idleLastTime = 0;
  let bgmEnabled = true;
  let countdownActive = false;
  let countdownTime = 0;
  let glasses = [];
  let splashes = [];
  let dustParticles = [];
  let catchSparkEffects = [];
  let catScratchEffects = [];

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
    dustTimer: 0,
  };

  const glassTypes = [
    { name: "10", image: loadImage("Assets/wine bottle/cropped/10.png"), aspect: 212 / 500, color: "#d89135", font: "copper", points: 10 },
    { name: "12", image: loadImage("Assets/wine bottle/cropped/12.png"), aspect: 217 / 500, color: "#d8a24e", font: "copper", points: 12 },
    { name: "15", image: loadImage("Assets/wine bottle/cropped/15.png"), aspect: 300 / 370, color: "#c05f4a", font: "green", points: 15 },
    { name: "18", image: loadImage("Assets/wine bottle/cropped/18.png"), aspect: 251 / 500, color: "#8e6b42", font: "blue", points: 18 },
    { name: "20", image: loadImage("Assets/wine bottle/cropped/20.png"), aspect: 232 / 500, color: "#7f8a5b", font: "red", points: 20 },
    { name: "25", image: loadImage("Assets/wine bottle/cropped/25.png"), aspect: 259 / 500, color: "#b0443f", font: "gold", points: 25 },
  ];

  const failMessages = [
    "秀智因為肚子太餓暴衝砸毀了你的店",
    "秀智跳上吧檯打翻了所有酒瓶",
    "秀智追著酒杯跑把店裡撞成一團亂",
    "秀智把托盤當貓窩壓垮了營業",
    "秀智突然撒嬌害你漏接了整排酒瓶",
  ];

  function resetGame() {
    score = 0;
    combo = 0;
    catchCount = 0;
    missCount = 0;
    lives = 3;
    timeLeft = ROUND_SECONDS;
    spawnTimer = 0;
    finalCountdownSoundPlayed = false;
    stopVoiceLoop();
    glasses = [];
    splashes = [];
    tray.x = WIDTH / 2;
    tray.direction = -1;
    tray.moving = false;
    tray.walkTime = 0;
    tray.handSway = 0;
    tray.dustTimer = 0;
    dustParticles = [];
    catchSparkEffects = [];
    catScratchEffects = [];
    cat2.attackTimer = 0;
    cat2.reactTimer = 0;
    cat2.collisionHitTimes = [];
    cat2.angerTimer = 0;
    cat2.hitClock = 0;
    suzy.awake = false;
    suzy.sleepTime = 0;
    suzy.bounceTime = suzy.bounceDuration;
    idleAnimationActive = false;
    gameOver = false;
    paused = false;
    running = true;
    countdownActive = true;
    countdownTime = 3;
    lastTime = performance.now();
    updateHud();
    messagePanel.classList.add("is-hidden");
    pauseButton.textContent = "暫停";
    playSound(eventSounds.cupOpen);
    startVoiceLoopFadeIn();
    bgm.currentTime = 0;
    playBgm();
    requestAnimationFrame(loop);
  }

  function playBgm() {
    if (!bgmEnabled) return;
    bgm.play().catch(() => {
      // Browsers may block audio until a direct user gesture is accepted.
    });
  }

  function updateBgmButton() {
    bgmButton.textContent = bgmEnabled ? "BGM OFF" : "BGM ON";
  }

  function getCanvasPoint(event) {
    const rect = gameStage.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function isInDragControlArea(event) {
    return getCanvasPoint(event).y >= HEIGHT - 230;
  }

  function getHoldDirection(event) {
    const point = getCanvasPoint(event);
    const deadZone = 18;
    if (point.x > tray.x + deadZone) return 1;
    if (point.x < tray.x - deadZone) return -1;
    return 0;
  }

  function updateDragDirection(deltaX) {
    if (Math.abs(deltaX) < 3) return dragControl.direction;

    const nextDirection = deltaX > 0 ? 1 : -1;
    if (dragControl.direction === 0 || dragControl.direction === nextDirection) {
      dragControl.direction = nextDirection;
      dragControl.reverseDistance = 0;
      return dragControl.direction;
    }

    dragControl.reverseDistance += Math.abs(deltaX);
    if (dragControl.reverseDistance >= dragControl.reverseSwitchDistance) {
      dragControl.direction = nextDirection;
      dragControl.reverseDistance = 0;
    }
    return dragControl.direction;
  }

  function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Browsers may block audio until a direct user gesture is accepted.
    });
  }

  function startVoiceLoopFadeIn() {
    voiceLoop.currentTime = 0;
    voiceLoop.volume = 0;
    voiceFadeTime = 0;
    voiceFadeActive = true;
    voiceLoop.play().catch(() => {
      // Browsers may block audio until a direct user gesture is accepted.
    });
  }

  function stopVoiceLoop() {
    voiceFadeActive = false;
    voiceFadeTime = 0;
    voiceLoop.pause();
    voiceLoop.currentTime = 0;
    voiceLoop.volume = 0;
  }

  function updateVoiceLoop(delta) {
    if (!voiceFadeActive) return;
    voiceFadeTime += delta;
    voiceLoop.volume = Math.min(0.5, (voiceFadeTime / 2) * 0.5);
    if (voiceFadeTime >= 2) {
      voiceLoop.volume = 0.5;
      voiceFadeActive = false;
    }
  }

  function playCatchSound() {
    const sound = catchSounds[Math.floor(Math.random() * catchSounds.length)];
    playSound(sound);
  }

  function playMissSound() {
    const sound = missSounds[Math.floor(Math.random() * missSounds.length)];
    playSound(sound);
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
    catchValue.textContent = String(catchCount);
    const visibleLives = Math.max(0, Math.min(3, lives));
    lifeValue.replaceChildren(
      ...Array.from({ length: visibleLives }, () => {
        const image = document.createElement("img");
        image.src = "Assets/Life.png";
        image.alt = "";
        return image;
      })
    );
    lifeValue.setAttribute("aria-label", `生命 ${visibleLives}`);
    timeValue.textContent = String(Math.max(0, Math.ceil(timeLeft)));
  }

  function showMessage(title, text, buttonText, mode = "") {
    messagePanel.querySelector("h1").textContent = title;
    const messageText = messagePanel.querySelector("p");
    if (mode === "fail") {
      const [reason, scoreText] = text.split("\n");
      messageText.innerHTML = `<span class="fail-reason">${reason}</span>${scoreText}`;
    } else {
      messageText.textContent = text;
    }
    startButton.textContent = buttonText;
    messagePanel.classList.remove("is-hidden");
  }

  function getFailMessage() {
    return failMessages[Math.floor(Math.random() * failMessages.length)];
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
      catHitCooldown: 0,
      type,
    });
    triggerSuzyBounce();
  }

  function resetGlassTrajectoryFromCat(glass) {
    const knockDirection = glass.x < cat2.x ? -1 : 1;
    const sidePush = knockDirection * (120 + Math.random() * 210);
    const randomDrift = -80 + Math.random() * 160;
    glass.startX = glass.x;
    glass.startY = glass.y;
    glass.targetX = Math.max(48, Math.min(WIDTH - 48, glass.x + sidePush + randomDrift));
    glass.fallDistance = HEIGHT + 76 - glass.startY;
    glass.arcHeight = 78 + Math.random() * 70;
    glass.duration = 0.96 + Math.random() * 0.38;
    glass.age = 0;
    glass.spin = -2.2 + Math.random() * 4.4;
    glass.catHitCooldown = 0.18;
  }

  function addCatchSparks(x, y) {
    const count = 9;
    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI * 0.88 + (Math.PI * 0.76 * i) / (count - 1) + (-0.12 + Math.random() * 0.24);
      const speed = 42 + Math.random() * 78;
      catchSparkEffects.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 18,
        length: 8 + Math.random() * 10,
        age: 0,
        life: 0.16 + Math.random() * 0.08,
      });
    }
  }

  function triggerSuzyBounce() {
    suzy.bounceTime = 0;
  }

  function addSplash(x, y, color, text, font = null) {
    splashes.push({
      x,
      y,
      color,
      text,
      font,
      age: 0,
      life: 0.7,
    });
  }

  function update(delta) {
    if (!running || paused) return;

    let direction = dragControl.direction;
    if (keys.has("ArrowLeft") || keys.has("a")) direction -= 1;
    if (keys.has("ArrowRight") || keys.has("d")) direction += 1;
    direction = Math.max(-1, Math.min(1, direction));
    tray.x += direction * tray.speed * delta;
    tray.x = Math.max(tray.width / 2 + 18, Math.min(WIDTH - tray.width / 2 - 18, tray.x));
    tray.moving = direction !== 0;
    if (tray.moving) {
      tray.direction = direction > 0 ? 1 : -1;
      tray.walkTime += delta * 9.5;
      tray.dustTimer -= delta;
      if (tray.dustTimer <= 0) {
        spawnRunDust();
        tray.dustTimer = 0.075;
      }
    } else {
      tray.walkTime = 0;
      tray.dustTimer = 0;
    }
    tray.handSway += ((tray.moving ? Math.sin(tray.walkTime) : 0) - tray.handSway) * Math.min(1, delta * 14);
    updateRunDust(delta);
    updateCatchSparks(delta);
    updateCat2(delta);
    updateVoiceLoop(delta);
    if (!suzy.awake) suzy.sleepTime += delta;

    if (countdownActive) {
      countdownTime -= delta;
      if (countdownTime <= 0) {
        countdownActive = false;
        countdownTime = 0;
        suzy.awake = true;
        suzy.sleepTime = 0;
        suzy.bounceTime = 0;
        lastTime = performance.now();
      }
      return;
    }

    timeLeft -= delta;
    if (!finalCountdownSoundPlayed && timeLeft <= 3) {
      finalCountdownSoundPlayed = true;
      playSound(eventSounds.finalCountdown);
    }
    if (timeLeft <= 0) {
      playSound(eventSounds.cupClose);
      if (catchCount >= 50) playSound(eventSounds.applause);
      endGame("時間到", `你拯救了 ${score} 元的酒瓶，共接住 ${catchCount} 個。`, "再玩一次");
      return;
    }

    spawnTimer -= delta;
    const baseSpawnEvery = Math.max(0.42, 1.08 - score / 900);
    const spawnEvery = timeLeft <= 10 ? baseSpawnEvery * 0.5 : baseSpawnEvery;
    if (spawnTimer <= 0) {
      spawnGlass();
      spawnTimer = spawnEvery;
    }

    for (let i = glasses.length - 1; i >= 0; i -= 1) {
      const glass = glasses[i];
      const previousX = glass.x;
      const previousY = glass.y;
      glass.age += delta;
      if (glass.catHitCooldown > 0) glass.catHitCooldown = Math.max(0, glass.catHitCooldown - delta);
      const t = glass.age / glass.duration;
      const horizontalEase = Math.min(t, 1);
      glass.x = glass.startX + (glass.targetX - glass.startX) * horizontalEase;
      glass.y = glass.startY - glass.arcHeight * Math.sin(Math.PI * Math.min(t, 1)) + glass.fallDistance * t * t;
      glass.rotation += glass.spin * delta;

      if (glass.y > previousY && glass.catHitCooldown <= 0 && doesGlassPathOverlapRect(glass, previousX, previousY, getCat2HeadCollision())) {
        triggerCat2Attack();
        resetGlassTrajectoryFromCat(glass);
        continue;
      }

      const trayCenterX = getTrayCenterX();
      const trayTop = tray.y - tray.height / 2;
      const caught =
        glass.y + glass.size / 2 >= trayTop &&
        glass.y < tray.y + 24 &&
        Math.abs(glass.x - trayCenterX) <= tray.width / 2 + glass.size * 0.18;

      if (caught) {
        combo += 1;
        catchCount += 1;
        const earnedPoints = glass.type.points + Math.min(combo * 2, 80);
        score += earnedPoints;
        playCatchSound();
        addCatchSparks(glass.x, trayTop + 2);
        addSplash(glass.x, trayTop - 10, glass.type.color, `+${earnedPoints}`, glass.type.font);
        glasses.splice(i, 1);
        continue;
      }

      if (glass.y > HEIGHT + 36) {
        missCount += 1;
        if (!debugState.infiniteMode) {
          lives -= 1;
          playSound(eventSounds.coin);
        }
        combo = 0;
        playMissSound();
        addSplash(glass.x, HEIGHT - 44, "#ffffff", "MISS");
        glasses.splice(i, 1);
        if (lives <= 0) {
          endGame("收攤", `${getFailMessage()}\n你拯救了 ${score} 元的酒瓶，共接住 ${catchCount} 個。`, "再玩一次", "fail");
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

  function endGame(title, text, buttonText, mode = "") {
    running = false;
    gameOver = true;
    countdownActive = false;
    bgm.pause();
    stopVoiceLoop();
    updateHud();
    showMessage(title, text, buttonText, mode);
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

  function drawBottleCollisionDebug(glass) {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(glass.x - glass.width / 2, glass.y - glass.size / 2, glass.width, glass.size);
    ctx.restore();
  }

  function drawSleepZzz(catHeight) {
    for (let i = 0; i < 2; i += 1) {
      const t = (suzy.sleepTime / 1.8 + i * 0.52) % 1;
      const fontSize = 12 + t * 18;
      const alpha = (1 - t) * 0.78;
      const x = suzy.x - 12 + t * 10 + i * 4;
      const y = suzy.y - catHeight - 7 - t * 34 - i * 7;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `800 ${fontSize}px Microsoft JhengHei, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(43, 24, 16, 0.75)";
      ctx.fillStyle = "#fff7dc";
      ctx.strokeText("ZZZ", x, y);
      ctx.fillText("ZZZ", x, y);
      ctx.restore();
    }
  }

  function drawSuzy() {
    const image = suzy.awake ? suzyImage : suzySleepImage;
    const crop = suzy.awake ? suzy.crop : suzy.sleepCrop;
    if (!image.complete || image.naturalWidth === 0) return;

    const t = suzy.awake ? Math.min(1, suzy.bounceTime / suzy.bounceDuration) : 1;
    const jump = t < 1 ? Math.sin(Math.PI * t) * 14 : 0;
    const squash = t < 1 ? Math.sin(Math.PI * t) * 0.045 : 0;
    const width = suzy.awake ? suzy.width : suzy.width * suzy.sleepScale;
    const height = width * (crop.height / crop.width);

    ctx.save();
    ctx.translate(suzy.x, suzy.y - jump);
    ctx.scale(1 + squash, 1 - squash * 0.65);
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      -width / 2,
      -height,
      width,
      height
    );
    ctx.restore();

    if (!suzy.awake) drawSleepZzz(height);
  }

  function startCat2TailSwing() {
    cat2.tailTime = 0;
    cat2.tailDuration = 0.42 + Math.random() * 0.34;
    cat2.tailAmplitude = 0.2 + Math.random() * 0.16;
    cat2.tailSwings = 2 + Math.floor(Math.random() * 2);
  }

  function getCat2Layout() {
    const bodyCrop = cat2Crops.body;
    const bodyWidth = cat2.bodyWidth;
    const bodyHeight = bodyWidth * (bodyCrop.height / bodyCrop.width);
    const bodyLeft = cat2.x - bodyWidth / 2;
    const bodyTop = cat2.baseY - bodyHeight;
    return { bodyCrop, bodyWidth, bodyHeight, bodyLeft, bodyTop };
  }

  function getCat2HeadCollision() {
    const layout = getCat2Layout();
    const collision = cat2.headCollision;
    return {
      x: layout.bodyLeft + collision.offsetX,
      y: layout.bodyTop + layout.bodyHeight * collision.offsetYRatio,
      width: layout.bodyWidth + collision.widthPadding,
      height: layout.bodyHeight * collision.heightRatio,
    };
  }

  function doesGlassOverlapRect(glass, rect) {
    return (
      glass.x + glass.width / 2 >= rect.x &&
      glass.x - glass.width / 2 <= rect.x + rect.width &&
      glass.y + glass.size / 2 >= rect.y &&
      glass.y - glass.size / 2 <= rect.y + rect.height
    );
  }

  function doesGlassPathOverlapRect(glass, previousX, previousY, rect) {
    const minX = Math.min(previousX - glass.width / 2, glass.x - glass.width / 2);
    const maxX = Math.max(previousX + glass.width / 2, glass.x + glass.width / 2);
    const minY = Math.min(previousY - glass.size / 2, glass.y - glass.size / 2);
    const maxY = Math.max(previousY + glass.size / 2, glass.y + glass.size / 2);
    return maxX >= rect.x && minX <= rect.x + rect.width && maxY >= rect.y && minY <= rect.y + rect.height;
  }

  function triggerCat2Attack() {
    const layout = getCat2Layout();
    cat2.attackTimer = cat2.attackDuration;
    cat2.reactTimer = cat2.reactDuration;
    cat2.collisionHitTimes = cat2.collisionHitTimes.filter((time) => cat2.hitClock - time <= cat2.angerWindow);
    cat2.collisionHitTimes.push(cat2.hitClock);
    if (cat2.collisionHitTimes.length >= cat2.angerHitThreshold) {
      cat2.angerTimer = cat2.angerDuration;
      cat2.collisionHitTimes = [];
    }
    catScratchEffects.push({
      x: layout.bodyLeft - layout.bodyWidth * 0.37 + (-5 + Math.random() * 10),
      y: layout.bodyTop + layout.bodyHeight * 0.02,
      age: 0,
      life: 0.2,
    });
  }

  function updateCat2(delta) {
    cat2.hitClock += delta;
    if (cat2.attackTimer > 0) cat2.attackTimer = Math.max(0, cat2.attackTimer - delta);
    if (cat2.reactTimer > 0) cat2.reactTimer = Math.max(0, cat2.reactTimer - delta);
    if (cat2.angerTimer > 0) cat2.angerTimer = Math.max(0, cat2.angerTimer - delta);

    for (let i = catScratchEffects.length - 1; i >= 0; i -= 1) {
      catScratchEffects[i].age += delta;
      if (catScratchEffects[i].age >= catScratchEffects[i].life) catScratchEffects.splice(i, 1);
    }

    if (cat2.tailDuration > 0) {
      cat2.tailTime += delta;
      const t = Math.min(1, cat2.tailTime / cat2.tailDuration);
      const envelope = Math.sin(Math.PI * t);
      cat2.tailAngle = Math.sin(t * Math.PI * 2 * cat2.tailSwings) * cat2.tailAmplitude * envelope;
      if (t >= 1) {
        cat2.tailDuration = 0;
        cat2.tailAngle = 0;
        cat2.tailCooldown = 0.55 + Math.random() * 1.45;
      }
      return;
    }

    cat2.tailCooldown -= delta;
    cat2.tailAngle += (0 - cat2.tailAngle) * Math.min(1, delta * 10);
    if (cat2.tailCooldown <= 0) startCat2TailSwing();
  }

  function drawCat2() {
    const bodyImage = cat2Parts.body;
    const tailImage = cat2Parts.tail;
    if (!bodyImage.complete || bodyImage.naturalWidth === 0) return;

    const layout = getCat2Layout();
    const bodyCrop = layout.bodyCrop;
    const tailCrop = cat2Crops.tail;
    const bodyWidth = layout.bodyWidth;
    const bodyHeight = layout.bodyHeight;
    const bodyLeft = layout.bodyLeft;
    const bodyTop = layout.bodyTop;

    if (cat2.attackTimer > 0 && cat2Parts.attack.complete && cat2Parts.attack.naturalWidth > 0) {
      const attackCrop = cat2Crops.attack;
      const attackHeight = bodyHeight;
      const attackWidth = attackHeight * (attackCrop.width / attackCrop.height);
      const reactT = cat2.reactDuration > 0 ? cat2.reactTimer / cat2.reactDuration : 0;
      const bounce = reactT > 0 ? Math.sin(Math.PI * reactT) * 5 : 0;
      const scale = 1 + (reactT > 0 ? Math.sin(Math.PI * reactT) * 0.06 : 0);
      const flicker = reactT > 0 && Math.floor(reactT * 8) % 2 === 0;

      ctx.save();
      ctx.globalAlpha = flicker ? 0.72 : 1;
      ctx.translate(cat2.x, cat2.baseY - bounce);
      ctx.scale(scale, scale);
      ctx.drawImage(
        cat2Parts.attack,
        attackCrop.x,
        attackCrop.y,
        attackCrop.width,
        attackCrop.height,
        -attackWidth * cat2.attackPivotXRatio,
        -attackHeight,
        attackWidth,
        attackHeight
      );
      ctx.restore();
      drawCatScratchEffects();
      drawCat2Anger();
      return;
    }

    const tailWidth = bodyWidth * cat2.tailWidthRatio;
    const tailHeight = tailWidth * (tailCrop.height / tailCrop.width);
    const tailPivotX = bodyLeft + bodyWidth * cat2.tailOffsetXRatio;
    const tailPivotY = bodyTop + bodyHeight * cat2.tailPivotYRatio;

    if (tailImage.complete && tailImage.naturalWidth > 0) {
      ctx.save();
      ctx.translate(tailPivotX, tailPivotY);
      ctx.rotate(cat2.tailAngle);
      ctx.drawImage(
        tailImage,
        tailCrop.x,
        tailCrop.y,
        tailCrop.width,
        tailCrop.height,
        0,
        -tailHeight / 2,
        tailWidth,
        tailHeight
      );
      ctx.restore();
    }

    ctx.drawImage(
      bodyImage,
      bodyCrop.x,
      bodyCrop.y,
      bodyCrop.width,
      bodyCrop.height,
      bodyLeft,
      bodyTop,
      bodyWidth,
      bodyHeight
    );
    drawCatScratchEffects();
    drawCat2Anger();
  }

  function drawCatScratchEffects() {
    catScratchEffects.forEach((scratch) => {
      const t = Math.min(1, scratch.age / scratch.life);
      const drawT = Math.min(1, t / 0.72);
      ctx.save();
      ctx.globalAlpha = 1 - t * 0.35;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < 3; i += 1) {
        const startX = scratch.x + i * 9;
        const startY = scratch.y + i * 3;
        const endX = startX + 8 * drawT;
        const endY = startY + 30 * drawT;

        ctx.strokeStyle = "rgba(130, 28, 18, 0.72)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(startX + 1, startY + 1);
        ctx.lineTo(endX + 1, endY + 1);
        ctx.stroke();

        ctx.strokeStyle = "#fff2c6";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawCat2Anger() {
    if (cat2.angerTimer <= 0 || !angerImage.complete || angerImage.naturalWidth === 0) return;

    const layout = getCat2Layout();
    const t = 1 - cat2.angerTimer / cat2.angerDuration;
    const grow = Math.min(1, t / 0.24);
    const scale = 0.35 + Math.sin(grow * Math.PI * 0.5) * 0.8;
    const fade = t > 0.35 ? Math.max(0, 1 - (t - 0.35) / 0.65) : 1;
    const width = cat2.angerWidth * scale;
    const height = width * (angerImage.naturalHeight / angerImage.naturalWidth);
    const x = layout.bodyLeft + layout.bodyWidth * 0.58;
    const y = layout.bodyTop + layout.bodyHeight * 0.15 - height * 0.62 - t * 10;

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.drawImage(angerImage, x - width / 2, y - height / 2, width, height);
    ctx.restore();
  }

  function drawCatCollisionDebug() {
    const rect = getCat2HeadCollision();
    ctx.save();
    ctx.strokeStyle = "#58ff6a";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }

  function getTrayCenterX() {
    return tray.x - tray.offsetX * tray.direction;
  }

  function getFootBaseY() {
    return HEIGHT - 48;
  }

  function spawnRunDust() {
    const facing = tray.direction;
    const footX = tray.x + (-facing * (26 + Math.random() * 14));
    const footY = getFootBaseY() + 12 + Math.random() * 8;
    const count = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i += 1) {
      dustParticles.push({
        x: footX + (-8 + Math.random() * 16),
        y: footY + (-3 + Math.random() * 5),
        vx: -facing * (18 + Math.random() * 26) + (-8 + Math.random() * 16),
        vy: -(10 + Math.random() * 18),
        radius: 2.2 + Math.random() * 3.6,
        age: 0,
        life: 0.32 + Math.random() * 0.28,
      });
    }
  }

  function updateRunDust(delta) {
    for (let i = dustParticles.length - 1; i >= 0; i -= 1) {
      const dust = dustParticles[i];
      dust.age += delta;
      dust.x += dust.vx * delta;
      dust.y += dust.vy * delta;
      dust.vx *= 0.985;
      dust.vy -= 8 * delta;
      if (dust.age >= dust.life) dustParticles.splice(i, 1);
    }
  }

  function updateCatchSparks(delta) {
    for (let i = catchSparkEffects.length - 1; i >= 0; i -= 1) {
      const spark = catchSparkEffects[i];
      spark.age += delta;
      spark.x += spark.vx * delta;
      spark.y += spark.vy * delta;
      spark.vx *= 0.93;
      spark.vy += 210 * delta;
      if (spark.age >= spark.life) catchSparkEffects.splice(i, 1);
    }
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

  function drawRunDust() {
    dustParticles.forEach((dust) => {
      const t = dust.age / dust.life;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.fillStyle = "rgba(202, 185, 154, 0.72)";
      ctx.beginPath();
      ctx.ellipse(
        dust.x,
        dust.y,
        dust.radius * (1 + t * 1.8),
        dust.radius * (0.62 + t * 0.4),
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });
  }

  function drawCatchSparks() {
    catchSparkEffects.forEach((spark) => {
      const t = spark.age / spark.life;
      const alpha = Math.max(0, 1 - t);
      const tailScale = Math.max(0.25, 1 - t * 0.65);
      const angle = Math.atan2(spark.vy, spark.vx);
      const endX = spark.x - Math.cos(angle) * spark.length * tailScale;
      const endY = spark.y - Math.sin(angle) * spark.length * tailScale;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255, 232, 162, 0.68)";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(spark.x, spark.y);
      ctx.lineTo(spark.x - Math.cos(angle) * spark.length * 0.42 * tailScale, spark.y - Math.sin(angle) * spark.length * 0.42 * tailScale);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(spark.x, spark.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    });
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
    if (splash.font) {
      drawBitmapText(splash.text, splash.x, splash.y - t * 42, splash.font, 0.34);
    } else {
      ctx.fillStyle = splash.color;
      ctx.font = "700 28px Microsoft JhengHei, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(splash.text, splash.x, splash.y - t * 42);
    }
    ctx.restore();
  }

  function drawBitmapText(text, centerX, baselineY, fontName, scale) {
    const image = bitmapFontImages[fontName];
    if (!image || !image.complete || image.naturalWidth === 0) return;

    let totalWidth = 0;
    for (const char of text) {
      const glyph = bitmapFontMetrics.chars[char];
      if (glyph) totalWidth += glyph.xadvance * scale;
    }

    let cursorX = centerX - totalWidth / 2;
    const topY = baselineY - bitmapFontMetrics.lineHeight * scale;
    for (const char of text) {
      const glyph = bitmapFontMetrics.chars[char];
      if (!glyph) continue;
      ctx.drawImage(
        image,
        glyph.x,
        glyph.y,
        glyph.width,
        glyph.height,
        cursorX,
        topY,
        glyph.width * scale,
        glyph.height * scale
      );
      cursorX += glyph.xadvance * scale;
    }
  }

  function drawInputAreaDebug() {
    const top = HEIGHT - 230;
    ctx.save();
    ctx.strokeStyle = "#44aaff";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 7]);
    ctx.strokeRect(0, top, WIDTH, HEIGHT - top);
    ctx.fillStyle = "rgba(68, 170, 255, 0.08)";
    ctx.fillRect(0, top, WIDTH, HEIGHT - top);

    ctx.strokeStyle = "#ffef5a";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(tray.x, top);
    ctx.lineTo(tray.x, HEIGHT);
    ctx.stroke();
    ctx.restore();
  }

  function drawCountdown() {
    if (!countdownActive) return;

    const value = Math.max(1, Math.ceil(countdownTime));
    const progress = countdownTime - Math.floor(countdownTime);
    const scale = 1 + (1 - progress) * 0.18;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#fff7dc";
    ctx.strokeStyle = "#2b1810";
    ctx.lineWidth = 8;
    ctx.font = "800 118px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(String(value), 0, 0);
    ctx.fillText(String(value), 0, 0);
    ctx.restore();
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(SCALE_X, 0, 0, SCALE_Y, 0, 0);

    drawBackground();
    drawSuzy();
    drawCat2();
    glasses.forEach(drawGlass);
    if (debugState.bottleCollision) glasses.forEach(drawBottleCollisionDebug);
    drawRunDust();
    drawTray();
    drawCatchSparks();
    if (debugState.trayCollision) drawCollisionDebug();
    if (debugState.catCollision) drawCatCollisionDebug();
    if (debugState.inputArea) drawInputAreaDebug();
    splashes.forEach(drawSplash);
    drawCountdown();

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

  function idleLoop(now) {
    if (!idleAnimationActive) return;
    if (running || suzy.awake) {
      idleAnimationActive = false;
      return;
    }

    const delta = Math.min(0.033, (now - idleLastTime) / 1000 || 0);
    idleLastTime = now;
    suzy.sleepTime += delta;
    updateCat2(delta);
    draw();
    requestAnimationFrame(idleLoop);
  }

  function startIdleAnimation() {
    if (idleAnimationActive) return;
    idleAnimationActive = true;
    idleLastTime = performance.now();
    requestAnimationFrame(idleLoop);
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
    if (paused) {
      bgm.pause();
      voiceLoop.pause();
    } else {
      playBgm();
      voiceLoop.play().catch(() => {
        // Browsers may block audio until a direct user gesture is accepted.
      });
    }
    lastTime = performance.now();
    if (!paused) requestAnimationFrame(loop);
    draw();
  });

  bgmButton.addEventListener("click", () => {
    bgmEnabled = !bgmEnabled;
    updateBgmButton();
    if (!bgmEnabled) {
      bgm.pause();
      return;
    }
    if (running && !paused && !gameOver) playBgm();
  });

  debugToggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    debugOptions.hidden = !debugOptions.hidden;
  });

  debugTrayCollision.addEventListener("change", () => {
    debugState.trayCollision = debugTrayCollision.checked;
    draw();
  });

  debugCatCollision.addEventListener("change", () => {
    debugState.catCollision = debugCatCollision.checked;
    draw();
  });

  debugBottleCollision.addEventListener("change", () => {
    debugState.bottleCollision = debugBottleCollision.checked;
    draw();
  });

  debugInfiniteMode.addEventListener("change", () => {
    debugState.infiniteMode = debugInfiniteMode.checked;
    draw();
  });

  debugInputArea.addEventListener("change", () => {
    debugState.inputArea = debugInputArea.checked;
    draw();
  });

  debugReverseDistanceApply.addEventListener("click", () => {
    const value = Number(debugReverseDistance.value);
    if (!Number.isFinite(value) || value < 0) {
      debugReverseDistance.value = String(dragControl.reverseSwitchDistance);
      return;
    }
    dragControl.reverseSwitchDistance = value;
    dragControl.reverseDistance = 0;
    debugReverseDistance.value = String(value);
  });

  setButtonKey(leftButton, "ArrowLeft");
  setButtonKey(rightButton, "ArrowRight");

  gameStage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".debug-panel, button, input, label")) return;
    if (!isInDragControlArea(event)) return;
    event.preventDefault();
    dragControl.active = true;
    dragControl.pointerId = event.pointerId;
    dragControl.lastClientX = event.clientX;
    dragControl.direction = getHoldDirection(event);
    dragControl.reverseDistance = 0;
    gameStage.setPointerCapture(event.pointerId);
  });

  gameStage.addEventListener("pointermove", (event) => {
    if (!dragControl.active || event.pointerId !== dragControl.pointerId) return;
    event.preventDefault();
    const deltaX = event.clientX - dragControl.lastClientX;
    if (Math.abs(deltaX) >= 3) {
      updateDragDirection(deltaX);
      dragControl.lastClientX = event.clientX;
    } else if (dragControl.direction === 0) {
      dragControl.direction = getHoldDirection(event);
    }
  });

  function stopDragControl(event) {
    if (event.pointerId !== dragControl.pointerId) return;
    dragControl.active = false;
    dragControl.pointerId = null;
    dragControl.direction = 0;
    dragControl.reverseDistance = 0;
    if (gameStage.hasPointerCapture(event.pointerId)) {
      gameStage.releasePointerCapture(event.pointerId);
    }
  }

  gameStage.addEventListener("pointerup", stopDragControl);
  gameStage.addEventListener("pointercancel", stopDragControl);
  gameStage.addEventListener("lostpointercapture", () => {
    dragControl.active = false;
    dragControl.pointerId = null;
    dragControl.direction = 0;
    dragControl.reverseDistance = 0;
  });

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

  updateBgmButton();
  debugReverseDistance.value = String(dragControl.reverseSwitchDistance);
  draw();
  startIdleAnimation();
  backgroundImage.addEventListener("load", draw);
})();
