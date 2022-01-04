const RuntimeError = require("./errors.js").RuntimeError;

module.exports = class Environment {
    constructor(enclosing) {
        this.enclosing = enclosing || null;
        this.valores = {};
    }

    definirVariavel(nomeVariavel, valor) {
        this.valores[nomeVariavel] = valor;
    }

    atribuirVariavelEm(distancia, name, valor) {
        this.ancestor(distancia).values[name.lexeme] = valor;
    }

    atribuirVariavel(nome, valor) {
        if (this.valores[nome.lexeme] !== undefined) {
            this.valores[nome.lexeme] = valor;
            return;
        }

        if (this.enclosing != null) {
            this.enclosing.atribuirVariavel(nome, valor);
            return;
        }

        throw new RuntimeError(nome, "Variável não definida '" + nome.lexeme + "'.");
    }

    ancestor(distancia) {
        let ambiente = this;
        for (let i = 0; i < distancia; i++) {
            ambiente = environment.enclosing;
        }

        return ambiente;
    }

    obterVariavelEm(distancia, nome) {
        return this.ancestor(distancia).values[nome];
    }

    obterVariavel(simbolo) {
        if (this.valores[simbolo.lexeme] !== undefined) {
            return this.valores[simbolo.lexeme];
        }

        if (this.enclosing !== null) return this.enclosing.obterVariavel(simbolo);

        throw new RuntimeError(simbolo, "Variável não definida '" + simbolo.lexeme + "'.");
    }
};