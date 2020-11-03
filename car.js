const FullRad = Math.PI * 2;

class Car {
  constructor(position, angle, onupdate) {
    this.position = position || new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.angle = angle || 0;
    this.speed = 0;
    this.size = 10;
    this.life = 25;
    this.hue = Math.random() * 360;
    this.viewAngle = FullRad / 6;
    this.amountRays = 3;
    this.viewDistance = 200;
    this.onupdate = onupdate || (() => {});

    this.nn = new NeuralNetwork([this.amountRays, 6]);
    // pre-calculation
    if (this.amountRays == 1) {
      this.eachAngle = 0;
      this.viewAngle = 0;
    } else this.eachAngle = this.viewAngle / (this.amountRays - 1);
    this.initScores();
  }

  initScores() {
    this.lap = 0;
    this.checkpoint = 0;
    this.distanceTravel = 0;
  }

  //here

  collideCheckpoint() {
    // console.log("oof");
    // console.log(this.trackCheckpoints);
    for (let i of this.track.checkpoints) {
      // console.log(i.id);
      if (this.collideLine(i)) {
        if (this.checkpoint + 1 == i.id) {
          this.checkpoint++;
        }
        if (this.checkpoint == this.track.checkpoints.length - 1 && i.id == 0) {
          this.lap++;
          this.checkpoint = 0;
        }
        //console.log(this.checkpoint);
      }
    }
  }

  trackDistance() {
    this.distanceTravel += this.speed;
  }

  ai() {
    let output = this.nn.feedForward(this.getRaysDistance()).data[0];
    //console.log(output);

    if (output[0] > 0.5) this.forward();
    if (output[1] > 0.5) this.backward();
    if (output[2] > 0.5) this.left();
    if (output[3] > 0.5) this.right();
    if (output[4] > 0.5) this.nitro();
    if (output[5] > 0.5) this.break();
  }

  render() {
    ctx.beginPath();
    ctx.strokeStyle = `hsl(${this.hue}, 100%, 75%)`;

    ctx.moveTo(this.P1.x, this.P1.y);
    ctx.lineTo(this.P2.x, this.P2.y);
    ctx.lineTo(this.P3.x, this.P3.y);
    ctx.lineTo(this.P4.x, this.P4.y);
    ctx.lineTo(this.P1.x, this.P1.y);
    ctx.stroke();

    this.renderRays();
  }

  playerRender() {
    ctx.beginPath();
    ctx.fillStyle = `white`;

    ctx.moveTo(this.P1.x, this.P1.y);
    ctx.lineTo(this.P2.x, this.P2.y);
    ctx.lineTo(this.P3.x, this.P3.y);
    ctx.lineTo(this.P4.x, this.P4.y);
    ctx.lineTo(this.P1.x, this.P1.y);
    ctx.fill();
  }

  renderRays() {
    for (let i of this.viewRays) {
      i.render();
    }
  }

  updateRays() {
    this.viewRays = [];

    for (let i = 0; i < this.amountRays; i++) {
      let angle = i * this.eachAngle;
      let closeP = Vector.createAtAngle(this.position, this.angle + angle - this.viewAngle / 2 - FullRad / 4, 0);
      let farP = Vector.createAtAngle(this.position, this.angle + angle - this.viewAngle / 2 - FullRad / 4, this.viewDistance);
      this.viewRays[i] = LinearF.toLine(closeP, farP);
    }
  }

  updatePs() {
    this.P1 = Vector.createAtAngle(this.position, FullRad / 6 + this.angle, this.size);
    this.P2 = Vector.createAtAngle(this.position, -FullRad / 6 + this.angle, this.size);
    this.P3 = Vector.createAtAngle(this.position, FullRad / 2 + FullRad / 6 + this.angle, this.size);
    this.P4 = Vector.createAtAngle(this.position, FullRad / 2 - FullRad / 6 + this.angle, this.size);
  }

  updateLs() {
    this.L1 = LinearF.toLine(this.P1, this.P2);
    this.L2 = LinearF.toLine(this.P2, this.P3);
    this.L3 = LinearF.toLine(this.P3, this.P4);
    this.L4 = LinearF.toLine(this.P4, this.P1);
  }

  collide(collection) {
    for (let i of collection) {
      if (this.L1.collide(i) || this.L2.collide(i) || this.L3.collide(i) || this.L4.collide(i)) return true;
    }
    return false;
  }

  collideLine(line) {
    return this.L1.collide(line) || this.L2.collide(line) || this.L3.collide(line) || this.L4.collide(line);
  }

  update() {
    this.updatePs();
    this.updateLs();
    this.updateRays();
    this.loopPosition();
    this.updateVelocity();
    this.handleCollision();
    this.move();
    this.speed *= 0.99;

    this.ai();
    this.collideCheckpoint();
    this.trackDistance();
    this.onupdate(this);
    this.explode();
  }

  right() {
    this.angle -= 0.01 * this.speed;
  }

  left() {
    this.angle += 0.01 * this.speed;
  }

  forward() {
    this.speed += 0.1;
  }

  nitro() {
    this.speed *= 1.01;

    this.effectPos = Vector.createAtAngle(this.position, this.angle + FullRad / 4, this.speed + this.size);
    ctx.fillStyle = `white`;
    ctx.fillRect(
      this.effectPos.x + Math.random() * 20 - 10,
      this.effectPos.y + Math.random() * 20 - 10,
      10 + Math.random() * 20 - 10,
      10 + Math.random() * 20 - 10
    );
  }

  break() {
    this.speed *= 0.9;
  }

  backward() {
    this.speed -= 0.1;
  }

  explode() {
    if (Math.abs(this.speed) < 2) this.fireEffect();
    if (this.life < 0) {
      this.boomEffect();
      let index = this.track.cars.indexOf(this);
      this.track.eliminated.push(this);
      this.track.cars.splice(index, 1);
    }
    if (this.collide(this.track.collisions)) {
      this.boomEffect();
      let index = this.track.cars.indexOf(this);
      this.track.eliminated.push(this);
      this.track.cars.splice(index, 1);
    }
  }

  handleCollision() {
    //future points
    let fP1 = Vector.createAtAngle(Vector.sum(this.position, Vector.scale(this.velocity, 2)), FullRad / 6 + this.angle, this.size);
    let fP2 = Vector.createAtAngle(Vector.sum(this.position, Vector.scale(this.velocity, 2)), -FullRad / 6 + this.angle, this.size);
    let fP3 = Vector.createAtAngle(Vector.sum(this.position, Vector.scale(this.velocity, 2)), FullRad / 2 + FullRad / 6 + this.angle, this.size);
    let fP4 = Vector.createAtAngle(Vector.sum(this.position, Vector.scale(this.velocity, 2)), FullRad / 2 - FullRad / 6 + this.angle, this.size);

    //future collision lines

    let fL1 = LinearF.toLine(fP1, fP2);
    let fL2 = LinearF.toLine(fP2, fP3);
    let fL3 = LinearF.toLine(fP3, fP4);
    let fL4 = LinearF.toLine(fP4, fP1);

    //collision

    for (let i of this.track.collisions) {
      if (fL1.collide(i) || fL2.collide(i) || fL3.collide(i) || fL4.collide(i)) {
        this.speed = 0;
        this.velocity = new Vector(0, 0);

        this.fireEffect();
      }
    }
  }

  fireEffect() {
    this.life--;
    ctx.fillStyle = `hsl(${this.hue + Math.random() * 50 - 25}, 100%, 50%)`;
    ctx.fillRect(
      this.position.x + Math.random() * 20 - 10,
      this.position.y + Math.random() * 20 - 10,
      10 + Math.random() * 20 - 10,
      10 + Math.random() * 20 - 10
    );
  }

  boomEffect() {
    ctx.fillStyle = `hsl(${this.hue + Math.random() * 50 - 25}, 100%, 50%)`;

    ctx.fillRect(
      this.position.x + Math.random() * 100 - 50,
      this.position.y + Math.random() * 100 - 50,
      10 + Math.random() * 200 - 100,
      10 + Math.random() * 200 - 100
    );
  }

  getRaysDistance() {
    let distances = [];
    for (let i of this.viewRays) {
      let closest = 1;
      for (let line of this.track.collisions) {
        closest = Math.min(closest, Vector.distance(i.intercept(line), this.position) / this.viewDistance);
      }
      distances.push(closest);
    }
    return distances;
  }

  loopPosition() {
    if (this.position.x < -canvas.width / 2) this.position.x = canvas.width / 2;
    if (this.position.x > canvas.width / 2) this.position.x = -canvas.width / 2;
    if (this.position.y < -canvas.height / 2) this.position.y = canvas.height / 2;
    if (this.position.y > canvas.height / 2) this.position.y = -canvas.height / 2;
  }

  updateVelocity() {
    this.velocity = Vector.createAtAngle(new Vector(0, 0), this.angle - FullRad / 4, this.speed);
  }

  move() {
    this.position.add(this.velocity);
  }
}
