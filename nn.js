function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

class NeuralNetwork {
  constructor(form) {
    //form = [2,3,34,4,3]
    this.form = form;
    this.bias_layers = [];
    this.weight_layers = []; // array de matrice (class Matrix)
    for (let i = 0; i < this.form.length - 1; i++) {
      // i prend tous les index de form except le dernier, donc 0, 1, 2, 3
      // tu aura besoin de faire i + 1, pour regarder ce qui vient au prochain
      this.weight_layers[i] = Matrix.random(this.form[i], this.form[i + 1]);
      this.bias_layers[i] = Matrix.random(1, this.form[i + 1]);
    }
  }

  feedForward(input) {
    if (!(input instanceof Matrix)) input = Matrix.array(input);
    for (let i in this.weight_layers) {
      input = Matrix.mult(input, this.weight_layers[i]);
      input.add(this.bias_layers[i]);

      input.map(sigmoid);
    }
    return input;
  }

  becomeAndMutate(nn, rate) {
    for (let i in this.weight_layers) {
      this.weight_layers[i] = Matrix.copy(nn.weight_layers[i]);
      this.weight_layers[i].mutate(rate);
      this.bias_layers[i] = Matrix.copy(nn.bias_layers[i]);
      this.bias_layers[i].mutate(rate);
    }
  }
}
