let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
document.body.append(canvas);

canvas.width = innerWidth;
canvas.height = innerHeight;

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
  }

  // ** = ^
  //**(1/2) */
  // Math.sqrt(x)

  distance(vector) {
    return Math.sqrt((vector.x - this.x) ** 2 + (vector.y - this.y) ** 2);
  }
}

class Safezone {
  constructor() {
    this.position = new Vector(Math.random() * canvas.width, (Math.random() * canvas.height) / 2);
    this.radius = 75;
    this.color = "white";
  }

  render() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.ellipse(this.position.x, this.position.y, this.radius, this.radius, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

let safezone = new Safezone();

class Ball {
  constructor() {
    this.position = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
    this.velocity = new Vector(0, 0);
    this.pendingVelX = 0;
    this.radius = 10;
    this.nn = new NeuralNetwork([4, 4, 4]);
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    this.score = 0;
  }

  render() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.ellipse(this.position.x, this.position.y, this.radius, this.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x + this.pendingVelX * 3, this.position.y);
    ctx.stroke();
  }

  update() {
    this.forces();
    this.position.add(this.velocity);
    if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.x > canvas.width) this.position.x = 0;
    if (this.position.y + this.radius > canvas.height) {
      this.position.y = canvas.height - this.radius;
      this.velocity.y *= -0.9;
      this.velocity.x += this.pendingVelX;
      this.pendingVelX = 0;
    }
    this.pendingVelX *= 0.99;
    this.isWin();
    this.intel();
  }

  intel() {
    let input = [
      this.position.x / canvas.width,
      this.position.y / canvas.height,
      safezone.position.x / canvas.width,
      safezone.position.y / canvas.height
    ];
    let output = this.nn.feedForward(input);
    let array = output.data[0];
    if (array[0] > 0.5) this.flap();
    if (array[1] > 0.5) this.dive();
    if (array[2] > 0.5) this.left();
    if (array[3] > 0.5) this.right();
  }

  forces() {
    this.velocity.y += 0.1;
    this.velocity.x *= 1;
  }

  flap() {
    //this.velocity.y = -3;
  }

  right() {
    this.pendingVelX += 0.3;
    //this.velocity.x = 0.5;
  }

  left() {
    this.pendingVelX -= 0.3;
    //this.velocity.x = 0.5;
  }

  dive() {
    this.velocity.y += 0.5;
  }

  isWin() {
    if (this.position.distance(safezone.position) < safezone.radius) {
      this.score++;
    }
  }

  morph(bird, rate) {
    this.nn.becomeAndMutate(bird.nn, rate);
    this.score = 0;
    this.position = new Vector(Math.random() * canvas.width, canvas.height - (canvas.height * Math.random()) / 2);
    this.velocity = new Vector(0, 0);
    this.pendingVelX = 0;
    this.color = bird.color;
  }
}

let billy = new Ball();
billy.radius = 20;
billy.intel = () => {};

let collection = [];
for (let i = 0; i < 100; i++) {
  collection.push(new Ball());
}

let key = {};

window.onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
};

window.onkeydown = e => {
  if (e.keyCode != 122 && e.keyCode != 123) e.preventDefault();
  key[e.keyCode] = true;
};
window.onkeyup = e => {
  key[e.keyCode] = false;
};

let score = 0;
let speed = 1;

function render() {
  if (key[87]) billy.flap();
  if (key[65]) billy.left();
  if (key[83]) billy.dive();
  if (key[68]) billy.right();
  requestAnimationFrame(render);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  safezone.render();
  for (let i of collection) {
    for (let j = 0; j < speed; j++) i.update();
    i.render();
  }
  billy.update();
  billy.render();

  //win();
}
render();

let rate = 0.6;

setInterval(() => {
  let sorted = collection.sort((a, b) => b.score - a.score);

  if (true) {
    for (let i = 1; i < sorted.length; i++) sorted[i].morph(sorted[0], rate);
  }
  safezone.position = new Vector(Math.random() * canvas.width, (Math.random() * canvas.height) / 2);
}, 5000);

// function win() {
//   ctx.fillText(score, 20, 20);
//   if (billy.position.distance(safezone.position) <= safezone.radius) {
//     score += 1;
//     console.log("You won!");
//     safezone.position = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
//   }
// }

function lose() {
  if (billy.position.distance(Pipes.position) <= Ball.radius) {
    console.log("You deded.");
  }
}
