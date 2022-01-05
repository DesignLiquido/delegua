const ErroEmTempoDeExecucao = require("./erro.js").ErroEmTempoDeExecucao;

module.exports = class Environment {
    constructor(enclosing) {
        this.enclosing = enclosing || null;
        this.valores = {};
    }

    definirVariavel(nomeVariavel, valor) {
        this.valores[nomeVariavel] = valor;
    }

    atribuirVariavelEm(distancia, nome, valor) {
        this.ancestor(distancia).valores[nome.lexeme] = valor;
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

        throw new ErroEmTempoDeExecucao(nome, "Variável não definida '" + nome.lexeme + "'.");
    }

    ancestor(distancia) {
        let ambiente = this;
        for (let i = 0; i < distancia; i++) {
            ambiente = ambiente.enclosing;
        }

        return ambiente;
    }

    obterVariavelEm(distancia, nome) {
        return this.ancestor(distancia).valores[nome];
    }

    obterVariavel(simbolo) {
        if (this.valores[simbolo.lexeme] !== undefined) {
            return this.valores[simbolo.lexeme];
        }

        if (this.enclosing !== null) return this.enclosing.obterVariavel(simbolo);

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexeme + "'.");
    }
};