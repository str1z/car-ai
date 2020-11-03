class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  scale(x) {
    this.x *= x;
    this.y *= x;
  }

  rotate(radian, center = new Vector(0, 0)) {
    let newX = radius * Math.cos(this.getAngle(center) + radian) + center.x;
    let newY = radius * Math.sin(this.getAngle(center) + radian) + center.y;
    return { x: newX, y: newY };
  }

  static createAtAngle(origin, radian, radius) {
    let X = radius * Math.cos(radian) + origin.x;
    let Y = radius * Math.sin(radian) + origin.y;
    return new Vector(X, Y);
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  static angle(vector, origin = new this(0, 0)) {
    if (vector.x > origin.x) {
      return Math.atan((origin.y - vector.y) / (origin.x - vector.x));
    } else {
      return Math.atan((origin.y - vector.y) / (origin.x - vector.x)) + Math.PI;
    }
  }

  static middle(v1, v2) {
    return new Vector((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
  }

  static sum(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  static dif(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  static distance(v1, v2 = new this(0, 0)) {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  }

  static scale(vector, x) {
    return new Vector(vector.x * x, vector.y * x);
  }
}

class LinearF {
  constructor(slope, interY, domain, v1, v2) {
    this.slope = slope; // a
    this.interY = interY; //ordonne a lorigine : b
    this.domain = domain;
    this.fromX = domain[0];
    this.toX = domain[1];
    this.v1 = v1;
    this.v2 = v2;
    this.length = Vector.distance(v1, v2);
  }

  y(x) {
    return this.slope * x + this.interY;
  }

  static findY(line, x) {
    return line.slope * x + line.interY;
  }

  static intercept(l1, l2) {
    if (l1.fromX < l2.toX && l2.fromX < l1.toX) {
      let x = (l2.interY - l1.interY) / (l1.slope - l2.slope);
      if (x < l1.toX && x < l2.toX && x > l1.fromX && x > l2.fromX) {
        return new Vector(x, l1.y(x));
      }
    }
    return l1.v2;
  }

  intercept(line) {
    if (this.fromX < line.toX && line.fromX < this.toX) {
      let x = (line.interY - this.interY) / (this.slope - line.slope);
      if (x < this.toX && x < line.toX && x > this.fromX && x > line.fromX) {
        return new Vector(x, this.y(x));
      }
    }
    return this.v2;
  }

  collide(line) {
    if (this.fromX < line.toX && line.fromX < this.toX) {
      let x = (line.interY - this.interY) / (this.slope - line.slope);
      if (x < this.toX && x < line.toX && x > this.fromX && x > line.fromX) {
        return true;
      }
    }
    return false;
  }

  static collide(l1, l2) {
    if (l1.fromX < l2.toX && l2.fromX < l1.toX) {
      let x = (l2.interY - l1.interY) / (l1.slope - l2.slope);
      if (x < l1.toX && x < l2.toX && x > l1.fromX && x > l2.fromX) {
        return true;
      }
    }
    return false;
  }

  collide2(line) {
    let denominator = (this.v2.x - this.v1.x) * (line.v2.y - line.v1.y) - (this.v2.y - this.v1.y) * (line.v2.x - line.v1.x);
    let numerator1 = (this.v1.y - line.v1.y) * (line.v2.x - line.v1.x) - (this.v1.x - line.v1.x) * (line.v2.y - line.v1.y);
    let numerator2 = (this.v1.y - line.v1.y) * (this.v2.x - this.v1.x) - (this.v1.x - line.v1.x) * (this.v2.y - this.v1.y);

    if (denominator == 0) return numerator1 == 0 && numerator2 == 0;

    let r = numerator1 / denominator;
    let s = numerator2 / denominator;

    return r >= 0 && r <= 1 && s >= 0 && s <= 1;
  }

  static collide2(l1, l2) {
    let denominator = (l1.v2.x - l1.v1.x) * (l2.v2.y - l2.v1.y) - (l1.v2.y - l1.v1.y) * (l2.v2.x - l2.v1.x);
    let numerator1 = (l1.v1.y - l2.v1.y) * (l2.v2.x - l2.v1.x) - (l1.v1.x - l2.v1.x) * (l2.v2.y - l2.v1.y);
    let numerator2 = (l1.v1.y - l2.v1.y) * (l1.v2.x - l1.v1.x) - (l1.v1.x - l2.v1.x) * (l1.v2.y - l1.v1.y);

    if (denominator == 0) return numerator1 == 0 && numerator2 == 0;

    let r = numerator1 / denominator;
    let s = numerator2 / denominator;

    return r >= 0 && r <= 1 && s >= 0 && s <= 1;
  }

  render() {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(this.v1.x, this.v1.y);
    ctx.lineTo(this.v2.x, this.v2.y);
    ctx.stroke();
  }

  static toLine(v1, v2) {
    let domain = [Math.min(v1.x, v2.x), Math.max(v1.x, v2.x)];
    let slope = (v2.y - v1.y) / (v2.x - v1.x);
    let interY = v1.y - slope * v1.x;
    return new LinearF(slope, interY, domain, v1, v2);
  }
}
