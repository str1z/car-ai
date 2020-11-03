const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
ctx.translate(canvas.width / 2, canvas.height / 2);

window.onresize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  ctx.translate(canvas.width / 2, canvas.height / 2);
};

document.body.append(canvas);

//move car with keyboard

let key = {};

window.onkeydown = e => {
  if (e.keyCode != 122 && e.keyCode != 123) e.preventDefault();
  key[e.keyCode] = true;
};
window.onkeyup = e => {
  key[e.keyCode] = false;
};

//track creation

let track = new Track();

window.mouse = new Vector(0, 0);
window.onmousemove = e => {
  window.mouse = new Vector(e.clientX - canvas.width / 2, e.clientY - canvas.height / 2);
};

//loop

function background() {
  ctx.fillStyle = "black";
  ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
}

function render() {
  requestAnimationFrame(render);

  background();
  track.update();

  track.render();
}

render();
