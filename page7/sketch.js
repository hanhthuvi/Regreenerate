let bugSprites = [],
  bugObjects = [],
  spawnShapeBursts = [],
  forestBackground,
  saveButton;

let spawnShapeVertices = 25;
let spawnShapeColors = ["#004406"];
let spawnShapeSpawnCount = 0;

function preload() {
  forestBackground = loadImage("assets/hanh.png");

  for (let i = 1; i <= 8; i++) {
    let path = `bugs/bug ${i}.png`;
    let img = loadImage(
      path,
      () => console.log(`Loaded ${path}`),
      () => console.error(`Failed to load ${path}`)
    );
    bugSprites.push(img);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

  let indices = [...Array(bugSprites.length).keys()];
  shuffle(indices, true);

  for (let i = 0; i < 5; i++) {
    let idx = indices[i % indices.length];
    console.log(`Creating bug with image index: ${idx}`);
    bugObjects.push(new Bug(random(width), random(height), idx));
  }
/*
  saveButton = createButton("Save Image");
  saveButton.position(20, 20);
  saveButton.mousePressed(saveCanvasImage);*/
}

function draw() {
  background(223);

  if (forestBackground) {
    tint(255, 204);
    image(forestBackground, 0, 0, width, height);
    noTint();
  }

  for (let i = spawnShapeBursts.length - 1; i >= 0; i--) {
    spawnShapeBursts[i].displayAndUpdate();
    if (spawnShapeBursts[i].isExpired()) {
      spawnShapeBursts.splice(i, 1);
    }
  }

  for (let bug of bugObjects) {
    bug.moveAndBounce();
    bug.displayBug();
  }

  detectBugCollisions();
}

function mousePressed() {
  if (bugObjects.length < 25) {
    let randomIndex = int(random(bugSprites.length));
    console.log(`Adding bug on click with image index: ${randomIndex}`);
    bugObjects.push(new Bug(random(width), random(height), randomIndex));
  }
}

function detectBugCollisions() {
  for (let i = 0; i < bugObjects.length; i++) {
    let bugA = bugObjects[i];
    for (let j = i + 1; j < bugObjects.length; j++) {
      let bugB = bugObjects[j];
      let dx = bugB.x - bugA.x;
      let dy = bugB.y - bugA.y;
      let distanceSq = dx * dx + dy * dy;
      let minDist = (bugA.getSize() + bugB.getSize()) / 2;
      let pairId = `${i}-${j}`;

      if (distanceSq < minDist * minDist) {
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

function saveCanvasImage() {
  saveCanvas("Restore the Soil", "png");
}

class Bug {
  constructor(x, y, imageIndex = null) {
    this.x = x;
    this.y = y;
    this.xSpeed = random(-3, 3);
    this.ySpeed = random(-3, 3);
    this.imageIndex =
      imageIndex !== null ? imageIndex : int(random(bugSprites.length));
    this.sprite = bugSprites[this.imageIndex];

    // Scale to 1/5 of original
    this.scaleFactor = 0.13;
    this.width = this.sprite.width * this.scaleFactor;
    this.height = this.sprite.height * this.scaleFactor;

    this.angle = atan2(this.ySpeed, this.xSpeed) + HALF_PI;
    this.recentlyCollided = new Set();
  }

  moveAndBounce() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.xSpeed || this.ySpeed) {
      this.angle = atan2(this.ySpeed, this.xSpeed) + HALF_PI;
    }

    if (this.x < 0 || this.x > width) this.xSpeed *= -1;
    if (this.y < 0 || this.y > height) this.ySpeed *= -1;
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
    let force = f.copy();
    force.div(this.mass);
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

class SpawnShape {
  constructor(originX, originY) {
    this.particles = [];
    this.pos = createVector(originX, originY);
    this.vel = createVector();
    this.color = color(random(spawnShapeColors));
    this.lifeSpan = 180;
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
      let newParticle = new Particle();
      let angle = radians((360 / spawnShapeVertices) * i + random(-5, 5));
      let direction = p5.Vector.fromAngle(angle);
      direction.mult(random(1.0, 1.5));
      newParticle.setVelocity(direction.x, direction.y);
      this.particles.push(newParticle);
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
