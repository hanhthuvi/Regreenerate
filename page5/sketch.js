let circles = [];
let boxes = [];
let pressStartTime = 0;
let bgImage, overlayImage, circleImage;
let overlayBuffer;
let eraseAnimations = [];
let maxSize;
let popupImages = [];

function preload() {
  bgImage = loadImage(
    'Lyassets/greenbg.png',
    () => console.log("✅ greenbg.png loaded"),
    () => console.error("❌ Failed to load: Lyassets/greenbg.png")
  );

  overlayImage = loadImage(
    'Lyassets/ly-background-1920-1080.png',
    () => console.log("✅ overlay loaded"),
    () => console.error("❌ Failed to load: Lyassets/ly-background-1920-1080.png")
  );

  circleImage = loadImage(
    'Lyassets/seedicon.png',
    () => console.log("✅ seedicon.png loaded"),
    () => console.error("❌ Failed to load: Lyassets/seedicon.png")
  );

  for (let i = 1; i <= 9; i++) {
    let path = `Lyassets/popup${i}.png`;
    popupImages.push(loadImage(
      path,
      () => console.log(`✅ Loaded ${path}`),
      () => console.error(`❌ Failed to load: ${path}`)
    ));
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  maxSize = dist(0, 0, width, height);
  randomizeCircles(10);  // Initial circles
  overlayBuffer = createGraphics(width, height);
overlayBuffer.tint(255, 180); 
  overlayBuffer.image(overlayImage, 0, 0, width, height);
  overlayBuffer.noTint();}

function draw() {
  background(255);
  if (bgImage) image(bgImage, 0, 0, width, height);

  overlayBuffer.erase();
  eraseAnimations.forEach(eraser => {
    eraser.currentSize = lerp(eraser.currentSize, eraser.targetSize, 0.1);
    let r = eraser.currentSize / 2;
    let points = 200;
    let amp = r * 0.15;
    let freq = 10;

    overlayBuffer.beginShape();
    for (let i = 0; i <= points; i++) {
      let angle = map(i, 0, points, 0, TWO_PI);
      let wave = sin(angle * freq + frameCount * 0.05) * amp;
      let radius = r + wave;
      let px = eraser.x + cos(angle) * radius;
      let py = eraser.y + sin(angle) * radius;
      overlayBuffer.vertex(px, py);
    }
    overlayBuffer.endShape(CLOSE);
  });
  overlayBuffer.noErase();
  image(overlayBuffer, 0, 0);

  circles.forEach(c => {
    let d = dist(mouseX, mouseY, c.x, c.y);
    let targetScale = d < c.baseSize / 2 ? 1.15 : 1;
    c.scale = lerp(c.scale, targetScale, 0.1);
    let displaySize = c.baseSize * c.scale;

    push();
    translate(c.x, c.y);
    imageMode(CENTER);
    drawingContext.shadowBlur = d < c.baseSize / 2 ? 20 : 0;
    drawingContext.shadowColor = 'rgba(40, 136, 33, 10)';
    image(c.img, 0, 0, displaySize, displaySize);
    drawingContext.shadowBlur = 2;
    pop();
  });

  boxes.forEach((box, i) => {
   let t = (frameCount - box.frameStart) / box.duration;
t = constrain(t, 0, 1);

// EaseOutElastic function
function easeOutElastic(t) {
  const c4 = (2 * PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : pow(2, -10 * t) * sin((t * 10 - 0.75) * c4) + 1;
}

box.scale = easeOutElastic(t) * box.maxScale;

    box.alpha = lerp(box.alpha, 255, 0.1);

    let dx = box.x - mouseX;
    let dy = box.y - mouseY;
    let distToMouse = dist(mouseX, mouseY, box.x, box.y);
    if (distToMouse < 100) {
      let pushFactor = 2;
      box.x += (dx / distToMouse) * pushFactor;
      box.y += (dy / distToMouse) * pushFactor;
    }

    let wiggle = sin(frameCount * 0.01 + i) * 0.05;
    let rotation = box.baseRotation + wiggle;
    let offsetX = sin(frameCount * 0.1 + i);
    let offsetY = cos(frameCount * 0.1 + i);

    push();
    translate(box.x + offsetX, box.y + offsetY);
    rotate(rotation);
    scale(box.scale);
    tint(255, box.alpha);
    imageMode(CENTER);
    image(box.img, 0, 0, box.displaySize.w, box.displaySize.h);
    pop();
  });
}

function mousePressed() {
  pressStartTime = millis();
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < c.size / 2) {
      let pressDuration = millis() - pressStartTime;
      let speed = map(pressDuration, 0, 1000, 0.2, 0.05);
      let img = random(popupImages);
     let w = 150;
let h = w / (img.width / img.height);


      boxes.push({
  x: c.x,
  y: c.y,
  size: c.size,
  scale: 0,
  maxScale: 1,
  alpha: 0,
  img: img,
  baseRotation: random(-PI / 4, PI / 4),
  displaySize: { w, h },
  frameStart: frameCount,
  duration: 60  // total frames for the bloom effect (~1 sec)
});


      eraseAnimations.push({
        x: c.x,
        y: c.y,
        currentSize: 0,
        targetSize: maxSize * 0.6,
        speed: 0.05
      });

      circles.splice(i, 1);
      return;
    }
  }
}

function mouseReleased() {
  pressStartTime = 0;
}

function randomizeCircles(num) {
  let margin = 60;
  let tries = 0;
  let maxTries = 1000;
  let added = 0;

  while (added < num && tries < maxTries) {
    let size = random(60, 100);
    let x = random(margin, width - margin);
    let y = random(margin, height - margin);

    let overlaps = circles.some(c => dist(x, y, c.x, c.y) < (size + c.size) / 2 + 20);
    if (!overlaps) {
      circles.push({ x, y, size, baseSize: size, scale: 1, img: circleImage });
      added++;
    }
    tries++;
  }

  if (tries >= maxTries) {
    console.warn("Max attempts reached. Not all circles placed.");
  }
}

function keyPressed() {
  if (key === 'w' || key === 'W') {
    randomizeCircles(3); // Add 3 new circles when W is pressed (change number if you want)
  }
}
