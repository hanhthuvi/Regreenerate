let roots = [];
let bgImage;
let stumpImage;
let rootGrowSound;
let ambientSound; 


const USER_HORIZ_SPREAD_BASE = 100;
const USER_SPREAD_RANDOM_FACTOR = 0.2;


let activeDrawingArea = {
  x: 0, y: 0, w: 0, h: 0, active: true
};
let proxyClickArea = {
  x: 0, y: 0, w: 0, h: 0, active: false
};

const STUMP_AREA_WIDTH_FACTOR = 0.45;
const STUMP_AREA_HEIGHT_FACTOR = 0.10;

// root spread
const HORIZ_SPEED = 10;
const SPREAD_MIN_GOAL_MULTIPLIER = 0.5;
const SPREAD_MAX_GOAL_MULTIPLIER = 1.5;

// zigzag
const ZIGZAG_STRENGTH = 1.5;
const ZIGZAG_VERTICAL_INTERVAL = 25;
const ZIGZAG_INTERVAL_RANDOMNESS = 0.3;

// outline
const ROOT_BASE_COLOR_FILL = [34, 136, 33];
const ROOT_OUTLINE_COLOR_INNER = [255, 255, 255];
const ROOT_EFFECTIVE_BORDER_THICKNESS = 2.5;
const ROOT_OUTLINE_INNER_ALPHA = 255;

// root radius
const MIN_ROOT_RADIUS = 15;
const MAX_ROOT_RADIUS = 20;


const MIN_RADIUS_DECREMENT = 0.05;
const MAX_RADIUS_DECREMENT = 0.07;

const MIN_ROOT_TRANSITION_DURATION_FRAMES = 30;
const MAX_ROOT_TRANSITION_DURATION_FRAMES = 200;


let STUMP_VISUAL_CENTER_X;
let STUMP_VISUAL_CENTER_Y;


function preload() {
  bgImage = loadImage('assets/tung.png');
  stumpImage = loadImage('assets/tree-stump.png');
  
  rootGrowSound = loadSound('tungsound/root_grow.wav');

  ambientSound = loadSound('tungsound/underground_forest_sound.mp3',
    () => {
      console.log("underground_forest_sound.wav loaded successfully.");
      if (ambientSound.isLoaded() && !ambientSound.isPlaying()) {
        ambientSound.loop();
        ambientSound.setVolume(1);
      }
    },
    (err) => console.error("Failed to load underground_forest_sound.wav:", err)
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  STUMP_VISUAL_CENTER_X = windowWidth / 1.9;
  STUMP_VISUAL_CENTER_Y = windowHeight / 7;

  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  } else {
    background(220);
    console.error("Background image failed to load.");
  }
  if (ambientSound && ambientSound.isLoaded() && !ambientSound.isPlaying()) {
    ambientSound.loop();
    ambientSound.setVolume(0.5);
  } else if (ambientSound && !ambientSound.isLoaded()) {
    ambientSound.onended(() => { 
        if(!ambientSound.isPlaying()){
            ambientSound.loop();
            ambientSound.setVolume(0.5);
        }
    });
  }


  if (!stumpImage || stumpImage.width === 0 || stumpImage.height === 0) {
    console.error("Stump image failed to load or has zero dimensions. Cannot define activeDrawingArea relative to it.");
    activeDrawingArea.active = false;
    proxyClickArea.active = false;
  } else {
    let stumpActualWidth = stumpImage.width;
    let stumpActualHeight = stumpImage.height;

    activeDrawingArea.w = stumpActualWidth * STUMP_AREA_WIDTH_FACTOR;
    activeDrawingArea.h = stumpActualHeight * STUMP_AREA_HEIGHT_FACTOR;
    activeDrawingArea.x = STUMP_VISUAL_CENTER_X - (activeDrawingArea.w / 1.6);
    let stumpBottomEdgeY = STUMP_VISUAL_CENTER_Y + (stumpActualHeight / 3);
    activeDrawingArea.y = stumpBottomEdgeY - activeDrawingArea.h;
    activeDrawingArea.active = true;

    if (activeDrawingArea.active && activeDrawingArea.y > 0) {
      proxyClickArea.x = activeDrawingArea.x;
      proxyClickArea.w = activeDrawingArea.w;
      proxyClickArea.y = 0;
      proxyClickArea.h = activeDrawingArea.y;
      proxyClickArea.active = true;
    } else {
      proxyClickArea.active = false;
      proxyClickArea.w = 0;
      proxyClickArea.h = 0;
    }
  }
}

function draw() {
  if (stumpImage && stumpImage.width > 0) {
    push();
    imageMode(CENTER);
    image(stumpImage, STUMP_VISUAL_CENTER_X, STUMP_VISUAL_CENTER_Y);
    pop();
  }

  if (activeDrawingArea.active) {
    push();
    noFill();
    stroke(0, 0, 0, 0);
    strokeWeight(2);
    rect(activeDrawingArea.x, activeDrawingArea.y, activeDrawingArea.w, activeDrawingArea.h);
    pop();
  }

  if (proxyClickArea.active) {
    push();
    fill(0, 0, 0, 0);
    noStroke();
    rect(proxyClickArea.x, proxyClickArea.y, proxyClickArea.w, proxyClickArea.h);
    pop();
  }

  for (let i = roots.length - 1; i >= 0; i--) {
    const root = roots[i];
    root.update();
    root.draw();
    if (root.isReadyForRemoval || root.y > height + root.startR * 2) {
      roots.splice(i, 1);
    }
  }
}

function handleAllClicks() {
  let rootX, rootY;
  let createTheRoot = false;

  if (getAudioContext().state !== 'running') {
    getAudioContext().resume().then(() => {
      console.log("Audio context resumed by user interaction.");
      if (ambientSound && ambientSound.isLoaded() && !ambientSound.isPlaying()) {
        ambientSound.loop();
        ambientSound.setVolume(0.5);
      }
    });
  }

  if (activeDrawingArea.active &&
      mouseX >= activeDrawingArea.x && mouseX <= activeDrawingArea.x + activeDrawingArea.w &&
      mouseY >= activeDrawingArea.y && mouseY <= activeDrawingArea.y + activeDrawingArea.h) {
    rootX = mouseX;
    rootY = mouseY;
    createTheRoot = true;
  } else if (proxyClickArea.active &&
           mouseX >= proxyClickArea.x && mouseX <= proxyClickArea.x + proxyClickArea.w &&
           mouseY >= proxyClickArea.y && mouseY <= proxyClickArea.y + proxyClickArea.h) {
    rootX = mouseX;
    rootY = activeDrawingArea.y + activeDrawingArea.h / 2;
    createTheRoot = true;
  }

  if (createTheRoot) {
    roots.push(new Root(rootX, rootY, random(MIN_ROOT_RADIUS, MAX_ROOT_RADIUS), activeDrawingArea.x, activeDrawingArea.w));
    if (rootGrowSound && rootGrowSound.isLoaded()) {
      rootGrowSound.play();
    }
  }
}

function mouseReleased() {
  handleAllClicks();
}


class Root {
  constructor(x, y, r, areaStartX, areaTotalWidth) {
    this.originX = x;
    this.x = x;
    this.y = y;
    this.originY = y;

    this.r = r;
    this.startR = r;
    this.maxSpeed = map(r, MIN_ROOT_RADIUS, MAX_ROOT_RADIUS, 3, 6);

    const xInArea = this.originX - areaStartX;
    const middleOfArea = areaTotalWidth / 2;
    const distFromAreaCenter = xInArea - middleOfArea;
    this.dir = areaTotalWidth > 0 ? distFromAreaCenter / (areaTotalWidth / 2) : 0;
    this.baseHorizSpeed = HORIZ_SPEED * random(0.8, 1.2);

    const absDir = abs(this.dir);
    let goalMultiplier = map(absDir, 0, 1, SPREAD_MIN_GOAL_MULTIPLIER, SPREAD_MAX_GOAL_MULTIPLIER);

    let baseSpread = USER_HORIZ_SPREAD_BASE;
    let randomMinSpread = baseSpread * (1 - USER_SPREAD_RANDOM_FACTOR);
    let randomMaxSpread = baseSpread * (1 + USER_SPREAD_RANDOM_FACTOR);

    this.horizGoal = random(randomMinSpread, randomMaxSpread) * goalMultiplier;
    this.horizGoal = max(this.horizGoal, 1.0);
    this.horizGoal = min(this.horizGoal, width * 0.45);

    this.diagDrift = random(1, 2.5);

    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(2000);
    this.noiseSpeed = 0.05;
    this.horizontalCurveAmount = random(1.5, 3);
    this.verticalCurveAmount = random(0.5, 1.5);

    this.phase = 'spreading';
    this.transitionProgress = 0;
    this.transitionDuration = random(MIN_ROOT_TRANSITION_DURATION_FRAMES, MAX_ROOT_TRANSITION_DURATION_FRAMES);
    if (this.transitionDuration < 1) {
        this.transitionDuration = 1;
    }

    this.zigzagDirection = random([-1, 1]);
    this.zigzagVerticalTravelSinceLastTurn = 0;
    this.currentZigzagVerticalInterval = ZIGZAG_VERTICAL_INTERVAL * (1 + random(-ZIGZAG_INTERVAL_RANDOMNESS, ZIGZAG_INTERVAL_RANDOMNESS));
    if (this.currentZigzagVerticalInterval <= 0) this.currentZigzagVerticalInterval = ZIGZAG_VERTICAL_INTERVAL;

    this.pathPoints = [];
    this.isFillDrawingComplete = false;
    this.isReadyForRemoval = false;

    let initialAlpha = map(this.r, this.startR, 0, 255, 0);
    this.pathPoints.push({
      x: this.x,
      y: this.y,
      r_fill: this.r,
      alpha_fill: initialAlpha
    });
  }

  update() {
    if (this.isFillDrawingComplete) {
      return;
    }

    let hCurve = map(noise(this.noiseOffsetX), 0, 1, -this.horizontalCurveAmount, this.horizontalCurveAmount);
    let vCurve = map(noise(this.noiseOffsetY), 0, 1, -this.verticalCurveAmount, this.verticalCurveAmount);
    this.noiseOffsetX += this.noiseSpeed;
    this.noiseOffsetY += this.noiseSpeed;

    let fallingSpeedComponent = map(this.r, this.startR, 0, this.maxSpeed, 0);
    let dx_base = 0;
    let dy_base = 0;

    if (this.phase === 'spreading') {
      dx_base = this.dir * this.baseHorizSpeed + hCurve;
      dy_base = this.diagDrift + vCurve;
      if (this.y + dy_base < this.originY) {
        dy_base = this.originY - this.y;
      }
      if (abs((this.x + dx_base) - this.originX) >= this.horizGoal) {
        this.phase = 'transitioning';
        this.transitionProgress = 0;
      }
    } else if (this.phase === 'transitioning') {
      if (this.transitionDuration > 0) {
        this.transitionProgress += 1 / this.transitionDuration;
      } else {
        this.transitionProgress = 1;
      }
      this.transitionProgress = min(this.transitionProgress, 1);
      let spreadFactor = 1 - this.transitionProgress;
      let fallFactor = this.transitionProgress;
      dx_base = (this.dir * this.baseHorizSpeed * spreadFactor) + hCurve;
      dy_base = ((this.diagDrift + vCurve) * spreadFactor) + (fallingSpeedComponent * fallFactor);
      if (this.y + dy_base < this.originY) {
        dy_base = this.originY - this.y;
      }
      if (this.transitionProgress >= 1) {
        this.phase = 'falling';
      }
    } else if (this.phase === 'falling') {
      dx_base = hCurve;
      dy_base = fallingSpeedComponent + vCurve;
    }

    let dx_zigzag = 0;
    if (ZIGZAG_STRENGTH > 0 && this.currentZigzagVerticalInterval > 0) {
      if (dy_base > 0) {
        this.zigzagVerticalTravelSinceLastTurn += dy_base;
      }
      if (this.zigzagVerticalTravelSinceLastTurn >= this.currentZigzagVerticalInterval) {
        this.zigzagDirection *= -1;
        this.zigzagVerticalTravelSinceLastTurn = 0;
        this.currentZigzagVerticalInterval = ZIGZAG_VERTICAL_INTERVAL * (1 + random(-ZIGZAG_INTERVAL_RANDOMNESS, ZIGZAG_INTERVAL_RANDOMNESS));
        if (this.currentZigzagVerticalInterval <= 0) this.currentZigzagVerticalInterval = ZIGZAG_VERTICAL_INTERVAL;
      }
      dx_zigzag = this.zigzagDirection * ZIGZAG_STRENGTH;
    }

    this.x += dx_base + dx_zigzag;
    this.y += dy_base;
    this.r -= random(MIN_RADIUS_DECREMENT, MAX_RADIUS_DECREMENT);

    if (this.r <= 0) {
      this.r = 0;
      this.isFillDrawingComplete = true;
    }

    if (!this.isFillDrawingComplete) {
        let offScreenBuffer = this.startR;
        let isOffCanvas = this.y > height + offScreenBuffer ||
                          this.x < 0 - offScreenBuffer    ||
                          this.x > width + offScreenBuffer;
        if (isOffCanvas) {
            this.isFillDrawingComplete = true;
        }
    }

    let effectiveRadiusForPath = this.r;
    let currentAlpha = map(effectiveRadiusForPath, this.startR, 0, 255, 0);
    this.pathPoints.push({
      x: this.x,
      y: this.y,
      r_fill: effectiveRadiusForPath,
      alpha_fill: currentAlpha
    });
  }

  draw() {
    noStroke();

    if (!this.isFillDrawingComplete) {
      if (this.pathPoints.length > 0) {
        const lastPoint = this.pathPoints[this.pathPoints.length - 1];
        if (lastPoint.r_fill > 0) {
          fill(ROOT_BASE_COLOR_FILL[0], ROOT_BASE_COLOR_FILL[1], ROOT_BASE_COLOR_FILL[2], lastPoint.alpha_fill);
          circle(lastPoint.x, lastPoint.y, lastPoint.r_fill * 2);
        }
      }
    } else {
      for (const pt of this.pathPoints) {
        if (pt.r_fill > 0) {
          fill(ROOT_BASE_COLOR_FILL[0], ROOT_BASE_COLOR_FILL[1], ROOT_BASE_COLOR_FILL[2], pt.alpha_fill);
          circle(pt.x, pt.y, pt.r_fill * 2);
        }
      }

      for (const pt of this.pathPoints) {
        let outlineInnerRadius = pt.r_fill - ROOT_EFFECTIVE_BORDER_THICKNESS;
        outlineInnerRadius = max(0, outlineInnerRadius);

        if (outlineInnerRadius > 0) {
          fill(ROOT_OUTLINE_COLOR_INNER[0], ROOT_OUTLINE_COLOR_INNER[1], ROOT_OUTLINE_COLOR_INNER[2], ROOT_OUTLINE_INNER_ALPHA);
          circle(pt.x, pt.y, outlineInnerRadius * 2);
        }
      }
      this.isReadyForRemoval = true;
    }
  }
}