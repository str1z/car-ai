class Track {
  constructor(cars, width) {
    canvas.onclick = () => {
      if (!this.completed) {
        track.inner.push(Track.inner);
        track.outer.push(Track.outer);
      }
    };
    this.width = width || 120;
    this.cars = cars || [];
    this.inner = [];
    this.outer = [];
    this.collisions = [];
    this.checkpoints = [];
    this.eliminated = [];
    this.debugArr = [];
    for (let i of this.cars) {
      i.track = this;
    }
  }

  evolve() {
    if (this.cars.length == 0 && this.started) {
      this.eliminated.sort((a, b) => {
        if (a.lap < b.lap) return 1;
        else if (b.checkpoint != a.checkpoint) return b.checkpoint - a.checkpoint;
        else return b.distanceTravel - a.distanceTravel;
      });

      this.push(100, this.eliminated[0]);

      this.eliminated = [];
    }
  }

  push(amount, cloneFrom) {
    let angle = Vector.angle(this.inner[0], this.outer[0]);
    let position = Vector.middle(this.inner[0], this.outer[0]);

    for (let i = 0; i < amount; i++) {
      let car = new Car(position.copy(), angle);
      car.track = this;

      if (cloneFrom) car.nn.becomeAndMutate(cloneFrom.nn, 0.5);

      this.cars.push(car);
    }
  }

  debugCar() {
    let car = new Car(Vector.middle(this.inner[0], this.outer[0]), Vector.angle(this.inner[0], this.outer[0]), obj => {
      if (key[87]) obj.forward();
      if (key[68]) obj.left();
      if (key[83]) obj.backward();
      if (key[65]) obj.right();
      if (key[32]) obj.nitro();
      if (key[16]) obj.break();
      let distances = obj.getRaysDistance();
      // 3 rays => [num, num, num]
      // if (distances[0] < 0.4) obj.left();
      // if (distances[1] > 0.9) obj.nitro();
      // if (distances[1] < 0.3) obj.break();
      // if (distances[1] > 0.5) obj.forward();
      // if (distances[1] < 0.1) obj.backward();
      // if (distances[2] < 0.4) obj.right();
    });
    car.fireEffect = () => {};
    car.track = this;
    //car.life = 100000;
    car.ai = () => {};
    car.nn = null;
    car.render = car.playerRender;
    this.debugArr.push(car);
  }

  update() {
    if (key[13] && !this.completed) {
      this.genCollision();
      this.genCheckpoint();
      this.completed = true;
      //this.push(200);
      this.started = true;
      this.debugCar();
    }
    this.evolve();
    this.updateCars();
    if (key[27]) {
      this.eliminated.push(...this.cars);
      this.cars = [];
    }
  }

  genCollision() {
    for (let i = 0; i < this.inner.length - 1; i++) {
      this.collisions.push(LinearF.toLine(this.inner[i], this.inner[i + 1]));
    }
    this.collisions.push(LinearF.toLine(this.inner[this.inner.length - 1], this.inner[0]));

    for (let i = 0; i < this.outer.length - 1; i++) {
      this.collisions.push(LinearF.toLine(this.outer[i], this.outer[i + 1]));
    }
    this.collisions.push(LinearF.toLine(this.outer[this.outer.length - 1], this.outer[0]));
  }

  genCheckpoint() {
    this.checkpoints = [];
    for (let i in this.inner) {
      let line = LinearF.toLine(this.inner[i], this.outer[i]);
      line.id = i;
      this.checkpoints.push(line);
    }
  }

  renderCheckpoint() {
    for (let i in this.inner) {
      ctx.beginPath();
      ctx.strokeStyle = "rgb(30,30,30)";
      ctx.moveTo(this.inner[i].x, this.inner[i].y);
      ctx.lineTo(this.outer[i].x, this.outer[i].y);
      ctx.stroke();
    }
  }

  renderInner() {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(this.inner[0].x, this.inner[0].y);
    for (let i = 1; i < this.inner.length; i++) {
      ctx.lineTo(this.inner[i].x, this.inner[i].y);
    }
    ctx.lineTo(this.inner[0].x, this.inner[0].y);
    ctx.stroke();
  }

  renderCars() {
    for (let i of this.cars) i.render();
    for (let i of this.debugArr) i.render();
  }

  updateCars() {
    for (let i of this.cars) i.update();
    for (let i of this.debugArr) i.update();
  }

  renderLap() {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(this.inner[0].x, this.inner[0].y);
    ctx.lineTo(this.outer[0].x, this.outer[0].y);
    ctx.stroke();
  }

  renderOuter() {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(this.outer[0].x, this.outer[0].y);
    for (let i = 1; i < this.outer.length; i++) {
      ctx.lineTo(this.outer[i].x, this.outer[i].y);
    }
    ctx.lineTo(this.outer[0].x, this.outer[0].y);
    ctx.stroke();
  }

  render() {
    if (this.inner[0]) {
      this.renderCheckpoint();
      this.renderInner();
      this.renderOuter();
      this.renderLap();
    }
    this.renderCars();
    if (!this.completed) this.preview();
  }

  preview() {
    let halfWidth = this.width / 2;
    if (this.inner[0]) {
      let lastInner = this.inner[this.inner.length - 1];
      let lastOuter = this.outer[this.outer.length - 1];
      let middle = Vector.middle(lastInner, lastOuter);

      let p1 = Vector.createAtAngle(window.mouse, Vector.angle(window.mouse, middle) + FullRad / 4, -halfWidth);
      let p2 = Vector.createAtAngle(window.mouse, Vector.angle(window.mouse, middle) + FullRad / 4, halfWidth);
      if (Vector.distance(p1, lastInner) > Vector.distance(p2, lastInner)) {
        Track.inner = p2;
        Track.outer = p1;
      } else {
        Track.inner = p1;
        Track.outer = p2;
      }
    } else {
      let radius = Vector.distance(window.mouse);
      Track.inner = Vector.createAtAngle(new Vector(0, 0), Vector.angle(window.mouse), radius - halfWidth);
      Track.outer = Vector.createAtAngle(new Vector(0, 0), Vector.angle(window.mouse), radius + halfWidth);
    }
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(Track.inner.x, Track.inner.y);
    ctx.lineTo(Track.outer.x, Track.outer.y);
    ctx.stroke();
  }
}
