// Define default size
const DEFAULT_SIZE = 4096;
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
// Get custom size from URL parameters or default to DEFAULT_SIZE
const customSize = getParameter("res", DEFAULT_SIZE);
// Get window dimensions
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
// Set canvas size to minimum of window dimensions
const canvasSize = Math.min(WIDTH, HEIGHT);
// Calculate resolution and scaling
const res = canvasSize / customSize;
const scaling = canvasSize / DEFAULT_SIZE;

// Feature toggles
const frame = fxrand() < 0.15;
const colors = fxrand() < 0.05;

// Editable parameters
const alpha = 0.4;
const times = 4;
const border = 0.2;
const maxFrames = 128;
const amount = 1024;

// Initialize field variable
let field;

// Setup function
window.setup = function() {
  print("Undulated by MathBird");
  print("https://twitter.com/MathBird_");
  colorMode(HSB, 1);
  pixelDensity(1 / res);
  createCanvas(canvasSize, canvasSize);
  setColors();
  noStroke();
  field = new Field();
}

// Draw function
window.draw = function() {
  if (((frameCount % maxFrames) == 0) || (frameCount == 1)) {
    field.points = [];
    field.initializePoints(amount);
  }
  field.update();

  if (frameCount > maxFrames * times) {
    noLoop();
    fxpreview();
  }
}

// Custom functions

// Generate random float between 0 and 1
function fxrand() {
  return Math.random();
}

// Get URL parameter or default to base
function getParameter(param, base) {
  return urlParams.get(param) ? Number(urlParams.get(param)) : base;
}

// Generate array of random numbers within given range
function getRandomArray(min, max, amount) {
  let arr = [];
  for (let i = 0; i < amount; i++) {
    arr.push(min + fxrand() * (max - min));
  }
  return arr;
}

// Draw a circle at the specified coordinates with the specified size
function customCircle(x, y, s) {
  circle(canvasSize * (border + x * (1 - 2 * border)), canvasSize * (border + y * (1 - 2 * border)), 4 * s);
}

// Set colors for the background and fill
function setColors() {
  let hue = fxrand();
  let fMax = 0.1;
  let f = colors ? fMax * (fxrand() + 1) / 2 : 1 - fMax * (fxrand() + 1) / 2;

  background(hue, 1 - f, f);
  fill((hue + f) % 1, 1 - f, 1 - f, alpha);
}

// Custom classes

class Field {
  constructor() {
    this.points = [];
    this.m = Math.round(8 + fxrand() * 4);
    this.a = getRandomArray(-this.m, this.m, 32);
    this.b = getRandomArray(-this.m, this.m, 32);
    this.c = getRandomArray(-this.m, this.m, 32);
  }

  update() {
    this.points.forEach(point => point.update());
  }

  initializePoints(n) {
    for (let i = 0; i < n; i++) {
          let x = fxrand() * 2 - 1;
      let y = fxrand() * 2 - 1;
      this.points.push(new Particle(x, y, this, true));
      this.points.push(new Particle(x, y, this, false));
    }
  }
}

class Particle {
  constructor(x, y, parent, forward) {
    this.point = new V2(x, y);
    this.forward = forward;
    this.parent = parent;
    this.step = 0.01 / this.parent.m;
    this.step *= forward ? 1 : -1;
  }

  update() {
    let point = this.movePoint();
    if (frame) {
      this.point = fxrand() < 0.5 ? point : new V2(Math.min(Math.max(-1, point.x), 1), Math.min(Math.max(-1, point.y), 1));
    } else {
      this.point = new V2(Math.min(Math.max(-1, point.x), 1), Math.min(Math.max(-1, point.y), 1));
    }

    this.point.plot(1);
  }

  movePoint() {
    let dx = this.getDelta(0);
    let dy = this.getDelta(1);

    return this.point.translate(dx * this.step, dy * this.step);
  }

  getDelta(i) {
    let value = 0;
    let n = 8;
    let x = this.point.x;
    let y = this.point.y;
    // calculation based on given formula
    value += this.parent.a[0 + n * i] * Math.sin(x * this.parent.b[0 + n * i] + this.parent.c[0 + n * i]);
    value += this.parent.a[1 + n * i] * Math.sin(y * this.parent.b[1 + n * i] + this.parent.c[1 + n * i]);
    value += this.parent.a[2 + n * i] * Math.cos(x * this.parent.b[2 + n * i] + this.parent.c[2 + n * i]);
    value += this.parent.a[3 + n * i] * Math.cos(y * this.parent.b[3 + n * i] + this.parent.c[3 + n * i]);
    value += this.parent.a[4 + n * i] * x + this.parent.b[4 + n * i] * Math.pow(x,2) + this.parent.c[4 + n * i] * Math.pow(x,3);
    value += this.parent.a[5 + n * i] * y + this.parent.b[5 + n * i] * Math.pow(y,2) + this.parent.c[5 + n * i] * Math.pow(y,3);
    value += this.parent.a[6 + n * i] * x * y + this.parent.b[6 + n * i] * Math.pow(x,2) * y + this.parent.c[6 + n * i] * x * Math.pow(y,2);
    value += this.parent.a[7 + n * i] * Math.pow(x,2) * Math.pow(y,2) + this.parent.b[7 + n * i] * Math.pow(x,2) * Math.pow(y,3) + this.parent.c[7 + n * i] * Math.pow(x,3) * Math.pow(y,2);
    return value;
  }
}

class V2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

    // Draw a point at the current coordinates scaled by the given factor
  plot(s) {
    customCircle((1 + this.x) / 2, (1 + this.y) / 2, s * scaling);
  }

  // Translate the current point by the given deltas
  translate(dx, dy) {
    return new V2(this.x + dx, this.y + dy);
  }

  // Calculate the distance between the current point and another point
  distance(v1) {
    return Math.sqrt(Math.pow((this.x - v1.x), 2) + Math.pow((this.y - v1.y), 2));
  }
}


