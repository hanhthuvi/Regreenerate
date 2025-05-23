let roots = [];
let bgImage;
let stumpImage;

// --- User-Controllable Horizontal Spread ---
const USER_HORIZ_SPREAD_BASE = 100;
const USER_SPREAD_RANDOM_FACTOR = 0.2;

// --- Area Definition ---
let activeDrawingArea = {
  x: 0, y: 0, w: 0, h: 0, active: true
};
let proxyClickArea = { // NEW: For the area above activeDrawingArea
  x: 0, y: 0, w: 0, h: 0, active: false
};

const STUMP_AREA_WIDTH_FACTOR = 0.45;
const STUMP_AREA_HEIGHT_FACTOR = 0.10;

// --- Root Growth Parameters ---
const HORIZ_SPEED = 10;
const SPREAD_MIN_GOAL_MULTIPLIER = 0.5;
const SPREAD_MAX_GOAL_MULTIPLIER = 1.5;

// --- Zigzag Control Parameters ---
const ZIGZAG_STRENGTH = 1.5;
const ZIGZAG_VERTICAL_INTERVAL = 25;
const ZIGZAG_INTERVAL_RANDOMNESS = 0.3;

// --- Outline Effect Parameters ---
const ROOT_BASE_COLOR_FILL = [34, 136, 33];
const ROOT_OUTLINE_COLOR_INNER = [255, 255, 255];
const ROOT_EFFECTIVE_BORDER_THICKNESS = 2.5;
const ROOT_OUTLINE_INNER_ALPHA = 255;

// --- Root Creation Parameters ---
const MIN_ROOT_RADIUS = 15;
const MAX_ROOT_RADIUS = 20;

// --- Root Growth Parameters ---
const MIN_RADIUS_DECREMENT = 0.05;
const MAX_RADIUS_DECREMENT = 0.07;

// --- Root Phase Parameters ---
const MIN_ROOT_TRANSITION_DURATION_FRAMES = 30;
const MAX_ROOT_TRANSITION_DURATION_FRAMES = 200;

// Define these at the global scope so setup and draw can use the same reference
let STUMP_VISUAL_CENTER_X;
let STUMP_VISUAL_CENTER_Y;


function preload() {
  bgImage = loadImage('assets/tung.png');
  stumpImage = loadImage('assets/tree-stump.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Define consistent stump visual center coordinates
  STUMP_VISUAL_CENTER_X = windowWidth / 1.9; // Consistent stump X
  STUMP_VISUAL_CENTER_Y = windowHeight / 7;  // Consistent stump Y


  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  } else {
    background(220);
    console.error("Background image failed to load.");
  }

  if (!stumpImage || stumpImage.width === 0 || stumpImage.height === 0) {
    console.error("Stump image failed to load or has zero dimensions. Cannot define activeDrawingArea relative to it.");
    activeDrawingArea.active = false;
    proxyClickArea.active = false;
  } else {
    let stumpActualWidth = stumpImage.width;
    let stumpActualHeight = stumpImage.height;

    // Calculate activeDrawingArea (relative to stump)
    activeDrawingArea.w = stumpActualWidth * STUMP_AREA_WIDTH_FACTOR;
    activeDrawingArea.h = stumpActualHeight * STUMP_AREA_HEIGHT_FACTOR;
    activeDrawingArea.x = STUMP_VISUAL_CENTER_X - (activeDrawingArea.w / 1.6);
    let stumpBottomEdgeY = STUMP_VISUAL_CENTER_Y + (stumpActualHeight / 3);
    activeDrawingArea.y = stumpBottomEdgeY - activeDrawingArea.h;
    activeDrawingArea.active = true;

    // Calculate proxyClickArea (above activeDrawingArea)
    if (activeDrawingArea.active && activeDrawingArea.y > 0) { // Must be space above
      proxyClickArea.x = activeDrawingArea.x;
      proxyClickArea.w = activeDrawingArea.w;
      proxyClickArea.y = 0; // From top of canvas
      proxyClickArea.h = activeDrawingArea.y; // Height is up to the top of activeDrawingArea
      proxyClickArea.active = true;
    } else {
      proxyClickArea.active = false; // No space above or main area inactive
      proxyClickArea.w = 0;
      proxyClickArea.h = 0;
    }
  }
}

function draw() {
  // 1. Draw stump image
  if (stumpImage && stumpImage.width > 0) {
    push();
    imageMode(CENTER);
    image(stumpImage, STUMP_VISUAL_CENTER_X, STUMP_VISUAL_CENTER_Y); // Use consistent coordinates
    pop();
  }

  // 2. Draw active drawing area indicator
  if (activeDrawingArea.active) {
    push();
    noFill();
    stroke(0, 0, 0, 0); // Visible black stroke
    strokeWeight(2);
    rect(activeDrawingArea.x, activeDrawingArea.y, activeDrawingArea.w, activeDrawingArea.h);
    pop();
  }

  // 2b. Draw proxy click area indicator (optional, for debugging)
  if (proxyClickArea.active) {
    push();
    fill(0, 0, 0, 0); // Semi-transparent green
    noStroke();
    rect(proxyClickArea.x, proxyClickArea.y, proxyClickArea.w, proxyClickArea.h);
    pop();
  }

  // 3. Update and Draw roots
  for (let i = roots.length - 1; i >= 0; i--) {
    const root = roots[i];
    root.update();
    root.draw();
    if (root.isReadyForRemoval || root.y > height + root.startR * 2) {
      roots.splice(i, 1);
    }
  }
}

// NEW: Centralized click handling
function handleAllClicks() {
  let rootX, rootY;
  let createTheRoot = false;

  // Check 1: Original activeDrawingArea
  if (activeDrawingArea.active &&
      mouseX >= activeDrawingArea.x && mouseX <= activeDrawingArea.x + activeDrawingArea.w &&
      mouseY >= activeDrawingArea.y && mouseY <= activeDrawingArea.y + activeDrawingArea.h) {
    
    rootX = mouseX;
    rootY = mouseY; // Use actual click Y
    createTheRoot = true;
  } 
  // Check 2: ProxyClickArea (only if not clicked in the main area)
  else if (proxyClickArea.active &&
           mouseX >= proxyClickArea.x && mouseX <= proxyClickArea.x + proxyClickArea.w &&
           mouseY >= proxyClickArea.y && mouseY <= proxyClickArea.y + proxyClickArea.h) {
    
    rootX = mouseX; // Use actual click X from proxy area
    // Remap Y to be within the original activeDrawingArea.
    // use the vertical center of the original activeDrawingArea.
    rootY = activeDrawingArea.y + activeDrawingArea.h / 2; 
    createTheRoot = true;
  }

  if (createTheRoot) {
    roots.push(new Root(rootX, rootY, random(MIN_ROOT_RADIUS, MAX_ROOT_RADIUS), activeDrawingArea.x, activeDrawingArea.w));
  }
}

function mouseReleased() {
  handleAllClicks(); // MODIFIED: Call the new handler
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