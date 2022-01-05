const ErroEmTempoDeExecucao = require("../erro.js").ErroEmTempoDeExecucao;

module.exports = class DeleguaInstancia {
    constructor(criarClasse) {
        this.criarClasse = criarClasse;
        this.campos = {};
    }

    get(nome) {
        if (this.campos.hasOwnProperty(nome.lexeme)) {
            return this.campos[nome.lexeme];
        }

        let metodo = this.criarClasse.encontrarMetodo(nome.lexeme);
        if (metodo) return metodo.bind(this);

        throw new ErroEmTempoDeExecucao(nome, "Método indefinido não recuperado.");
    }

    set(nome, valor) {
        this.campos[nome.lexeme] = valor;
    }

    toString() {
        return "<Objeto " + this.criarClasse.nome + ">";
    }
};
