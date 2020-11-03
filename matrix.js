class Matrix {
  constructor(data) {
    this.data = data;
    this.row = data.length;
    this.col = data[0].length;
  }
  static random(row, col) {
    let data = [];
    for (let y = 0; y < row; y++) {
      data[y] = [];
      for (let x = 0; x < col; x++) {
        data[y][x] = Math.random() * 2 - 1;
      }
    }
    return new this(data);
  }

  static array(arr) {
    return new this([arr]);
  }

  static fill(row, col, number) {
    let data = [];
    for (let y = 0; y < row; y++) {
      data[y] = [];
      for (let x = 0; x < col; x++) {
        data[y][x] = number;
      }
    }
    return new this(data);
  }

  add(matrix) {
    if (this.row != matrix.row || this.col != matrix.col) {
      console.log("Couldn't add matrix.");
      console.log(`${this.col}, ${matrix.col}`);
      return null;
    }
    for (let y in this.data) {
      for (let x in this.data[y]) {
        this.data[y][x] += matrix.data[y][x];
      }
    }
  }

  static sum(m1, m2) {
    if (m1.row != m2.row || m1.col != m2.col) {
      console.log("Couldn't sum matrices.");
      return null;
    }
    let data = [];
    for (let y in m1.data) {
      data[y] = [];
      for (let x in m1.data[y]) {
        data[y][x] = m1.data[y][x] + m2.data[y][x];
      }
    }
    return new Matrix(data);
  }

  static sub(m1, m2) {
    if (m1.row != m2.row || m1.col != m2.col) {
      console.log("Couldn't sum matrices.");
      return null;
    }
    let data = [];
    for (let y in m1.data) {
      data[y] = [];
      for (let x in m1.data[y]) {
        data[y][x] = m1.data[y][x] - m2.data[y][x];
      }
    }
    return new Matrix(data);
  }

  static mult(m1, m2) {
    if (m1.col != m2.row) {
      console.error("Couldn't multiply matrices.");
      return null;
    }
    let product = [];
    for (let y = 0; y < m1.row; y++) {
      product[y] = [];
      for (let x = 0; x < m2.col; x++) {
        product[y][x] = 0;
        for (let i = 0; i < m1.col; i++) {
          product[y][x] += m1.data[y][i] * m2.data[i][x];
        }
      }
    }
    return new this(product);
  }

  mult(m) {
    if (m instanceof this) {
      if (this.col != m.row) {
        console.error("Couldn't multiply matrices.");
        return null;
      }
      for (let y = 0; y < this.row; y++) {
        product[y] = [];
        for (let x = 0; x < m.col; x++) {
          product[y][x] = 0;
          for (let i = 0; i < this.col; i++) {
            product[y][x] += this.data[y][i] * m.data[i][x];
          }
        }
      }
    } else {
      this.map(x => m * x);
    }
  }

  map(func) {
    for (let y in this.data) {
      for (let x in this.data[y]) {
        this.data[y][x] = func(this.data[y][x]);
      }
    }
  }

  static map(matrix, func) {
    let result = [];
    for (let y in matrix) {
      result[y] = [];
      for (let x in matrix[y]) result[y][x] = func(matrix[y][x]);
    }
  }

  static transpose(matrix) {
    let result = [];
    for (let i = 0; i < matrix.col; i++) {
      result.push([]);
    }
    for (let y in matrix) for (let x in matrix[y]) result[x][y] = matrix[y][x];
    return new this(result);
  }

  static copy(matrix) {
    let copy = [];
    for (let y in matrix.data) {
      copy[y] = [];
      for (let x in matrix.data[y]) copy[y][x] = matrix.data[y][x];
    }

    return new Matrix(copy);
  }

  mutate(n) {
    for (let y in this.data) {
      for (let x in this.data[y]) {
        this.data[y][x] += Math.random() * n - n / 2;
      }
    }
  }
}
//
// myMatrix.mult(3) // modifier myMatrix
// let myOtherMatrix = Matrix.mult(myMatrix, 3) // retourner une nouvelle matrice qui est le produit de param 0 et param 1
