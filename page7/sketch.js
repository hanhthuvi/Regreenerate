// ==== GLOBAL VARIABLES ====
let bugSprites = []; // Stores loaded bug images
let bugObjects = []; // Stores all bug instances
let spawnShapeBursts = []; // Stores active shape bursts
let forestBackground; // Background image
let saveButton; // Save image button

let spawnShapeVertices = 25; // Number of points per shape burst
let spawnShapeColors = ["#004406"]; // Color options for shape bursts
let spawnShapeSpawnCount = 0; // Count of shape bursts created

let ambienceSound;
let soilBeatSound;
let lastSoilBeatTime = 0;
let soilBeatInterval = 0;
let bugCollideSound;
let bugCollisionCount = 0;
let bugMovementChirp;
let fungiGrowSound;
let leafMovingSound;
let wind2Sound;


// ==== PRELOAD IMAGES ====
function preload() {
  forestBackground = loadImage("assets/hanh.png"); // Load the background image

  for (let i = 1; i <= 8; i++) {
    let path = `bugs/bug ${i}.png`; // Create file path for each bug
    let img = loadImage(
      path,
      () => console.log(`Loaded ${path}`), // Log success
      () => console.error(`Failed to load ${path}`) // Log failure
    );
    bugSprites.push(img); // Store image in array
  }

  ambienceSound = loadSound("sounds/ambience.wav");
  soilBeatSound = loadSound("sounds/soil-beat.wav");
  bugCollideSound = loadSound("sounds/bug-collide.wav");
  bugMovementChirp = loadSound("sounds/bug-movement-chirp.wav");
  fungiGrowSound = loadSound("sounds/fungi-grow.wav");
  leafMovingSound = loadSound("sounds/leaf-moving.wav");
  wind2Sound = loadSound("sounds/wind2.wav");
  
}

// ==== SETUP FUNCTION ====
function setup() {
  createCanvas(windowWidth, windowHeight); // Create full-window canvas
  frameRate(30); // Set frame rate

  // Create shuffled indices to randomly assign bug images
  let indices = [...Array(bugSprites.length).keys()];
  shuffle(indices, true);

  for (let i = 0; i < 5; i++) {
    let idx = indices[i % indices.length];
    console.log(`Creating bug with image index: ${idx}`);
    bugObjects.push(new Bug(random(width), random(height), idx)); // Create bug
  }

  // Create and position Save Image button
  /*saveButton = createButton("Save Image");
  saveButton.position(20, 20);
  saveButton.mousePressed(saveCanvasImage); // Save canvas on click*/

  soilBeatInterval = random(10000, 15000);

  ambienceSound.setVolume(1.0);
  soilBeatSound.setVolume(0.6);
  bugCollideSound.setVolume(0.4);
  bugMovementChirp.setVolume(0.1);
  fungiGrowSound.setVolume(0.1);
  leafMovingSound.setVolume(0.4); 
  wind2Sound.setVolume(0.2);


}

// ==== DRAW LOOP ====
function draw() {
  background(223); // Light background

  if (forestBackground) {
    tint(255, 204); // Slight transparency
    image(forestBackground, 0, 0, width, height); // Draw background image
    noTint(); // Reset tint
  }

  // Draw and update all active shape bursts
  for (let i = spawnShapeBursts.length - 1; i >= 0; i--) {
    spawnShapeBursts[i].displayAndUpdate();
    if (spawnShapeBursts[i].isExpired()) {
      spawnShapeBursts.splice(i, 1); // Remove expired burst
    }
  }

  // Update and display all bugs
  for (let bug of bugObjects) {
    bug.moveAndBounce();
    bug.displayBug();
  }

  if (frameCount % 400 === 0 && leafMovingSound.isLoaded()) {
    leafMovingSound.play();
  }

  if (frameCount % 900 === 0 && wind2Sound.isLoaded()) { // every 30 seconds at 30fps
  wind2Sound.play();
}
  
  detectBugCollisions(); // Check for collisions between bugs

  if (millis() - lastSoilBeatTime > soilBeatInterval) {
    if (soilBeatSound && !soilBeatSound.isPlaying()) {
      soilBeatSound.setVolume(0.3);
      soilBeatSound.play();
      lastSoilBeatTime = millis();
      soilBeatInterval = random(10000, 15000);
    }
  }
}

// ==== ADD BUG ON CLICK ====
function mousePressed() {
  if (!ambienceSound.isPlaying()) {
    ambienceSound.setVolume(0.5);
    ambienceSound.loop();
  }

  if (bugObjects.length < 25) {
    // Limit number of bugs
    let randomIndex = int(random(bugSprites.length));
    console.log(`Adding bug on click with image index: ${randomIndex}`);
    bugObjects.push(new Bug(random(width), random(height), randomIndex));
  }
}

// ==== CHECK FOR BUG COLLISIONS ====
function detectBugCollisions() {
  for (let i = 0; i < bugObjects.length; i++) {
    let bugA = bugObjects[i];
    for (let j = i + 1; j < bugObjects.length; j++) {
      let bugB = bugObjects[j];
      let dx = bugB.x - bugA.x;
      let dy = bugB.y - bugA.y;
      let distanceSq = dx * dx + dy * dy;
      let minDist = (bugA.getSize() + bugB.getSize()) / 2;
      let pairId = `${i}-${j}`; // Unique ID for this bug pair

      if (distanceSq < minDist * minDist) {
        // If overlapping
        if (
          !bugA.recentlyCollided.has(pairId) &&
          spawnShapeBursts.length < 30
        ) {
          let dir = createVector(dx, dy).normalize();
          let edgeX = bugA.x + dir.x * (bugA.width / 2) + random(-10, 10);
          let edgeY = bugA.y + dir.y * (bugA.height / 2) + random(-10, 10);

          let newSpawnShape = new SpawnShape(edgeX, edgeY);
          newSpawnShape.createParticles();
          spawnShapeBursts.push(newSpawnShape);

          spawnShapeSpawnCount++;

          if (fungiGrowSound && fungiGrowSound.isLoaded()) {
            fungiGrowSound.play();
          }

          bugCollisionCount++; // Count this collision

          // Play sound every 5 collisions
          if (bugCollisionCount % 3 === 0) {
            if (bugCollideSound && bugCollideSound.isLoaded()) {
              bugCollideSound.play();
            }
          }

          bugA.recentlyCollided.add(pairId);
          bugB.recentlyCollided.add(pairId);
        }
      } else {
        bugA.recentlyCollided.delete(pairId);
        bugB.recentlyCollided.delete(pairId);
      }
    }
  }
}

// ==== SAVE CANVAS FUNCTION ====
function saveCanvasImage() {
  saveCanvas("Restore the Soil", "png");
}

// ==== BUG CLASS ====
class Bug {
  constructor(x, y, imageIndex = null) {
    this.x = x;
    this.y = y;
    this.xSpeed = random(-3, 3);
    this.ySpeed = random(-3, 3);
    this.imageIndex =
      imageIndex !== null ? imageIndex : int(random(bugSprites.length));
    this.sprite = bugSprites[this.imageIndex];

    this.scaleFactor = 0.13;
    this.width = this.sprite.width * this.scaleFactor;
    this.height = this.sprite.height * this.scaleFactor;

    this.angle = atan2(this.ySpeed, this.xSpeed) + HALF_PI;
    this.recentlyCollided = new Set(); // Track recent collisions
  }

  moveAndBounce() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.xSpeed || this.ySpeed) {
      this.angle = atan2(this.ySpeed, this.xSpeed) + HALF_PI;
    }

    let hitWall = false;

    if (this.x < 0 || this.x > width) {
      this.xSpeed *= -1;
      hitWall = true;
    }
    if (this.y < 0 || this.y > height) {
      this.ySpeed *= -1;
      hitWall = true;
    }

    if (hitWall && bugMovementChirp && bugMovementChirp.isLoaded()) {
      bugMovementChirp.play();
    }
  }

  displayBug() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(this.sprite, 0, 0, this.width, this.height);
    pop();
  }

  getSize() {
    return (this.width + this.height) / 2;
  }
}

// ==== PARTICLE CLASS ====
class Particle {
  constructor() {
    this.pos = createVector(0, 0);
    this.vel = createVector();
    this.acc = createVector();
    this.rad = 10;
    this.mass = this.rad;
    this.isDone = false;
  }

  setVelocity(x, y) {
    this.vel = createVector(x, y);
    return this;
  }

  applyForce(f) {
    let force = f.copy().div(this.mass);
    this.acc.add(force);
  }

  updateParticle() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  displayParticle() {
    push();
    translate(this.pos.x, this.pos.y);
    noStroke();
    fill(255, 100);
    ellipse(0, 0, 2, 2);
    pop();
  }
}

// ==== SPAWNSHAPE CLASS ====
class SpawnShape {
  constructor(originX, originY) {
    this.particles = [];
    this.pos = createVector(originX, originY);
    this.vel = createVector();
    this.color = color(random(spawnShapeColors));
    this.lifeSpan = 180; // Lifetime in frames
    this.startFrame = frameCount;
    this.strokeW = random(1, 3);
  }

  displayAndUpdate() {
    this.moveBurst();
    this.displayBurst();
    this.limitParticles();
  }

  isExpired() {
    return frameCount - this.startFrame > this.lifeSpan;
  }

  createParticles() {
    for (let i = 0; i < spawnShapeVertices; i++) {
      let p = new Particle();
      let angle = radians((360 / spawnShapeVertices) * i + random(-5, 5));
      let dir = p5.Vector.fromAngle(angle).mult(random(1.0, 1.5));
      p.setVelocity(dir.x, dir.y);
      this.particles.push(p);
    }
  }

  moveBurst() {
    this.pos.add(this.vel);
  }

  displayBurst() {
    push();
    translate(this.pos.x, this.pos.y);

    let alpha = map(frameCount - this.startFrame, 0, this.lifeSpan, 255, 0);
    let strokeCol = color(this.color.levels);
    let fillCol = color(this.color.levels);
    strokeCol.setAlpha(alpha);
    fillCol.setAlpha(alpha * 0.4);

    noStroke();
    fill(fillCol);
    beginShape();
    for (let p of this.particles) {
      p.updateParticle();
      p.displayParticle();
      let f = p.pos.copy().normalize().mult(random(-0.01, 0.01));
      p.applyForce(f);
      curveVertex(p.pos.x, p.pos.y);
    }
    endShape(CLOSE);
    pop();
  }

  limitParticles() {
    while (this.particles.length > 500) {
      this.particles.splice(0, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].isDone) {
        this.particles.splice(i, 1);
      }
    }
  }
}
