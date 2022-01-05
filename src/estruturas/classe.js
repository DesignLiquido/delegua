const Callable = require("./callable.js");
const DeleguaInstancia = require("./instancia.js");

module.exports = class DeleguaClasse extends Callable {
    constructor(nome, superClasse, metodos) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    encontrarMetodo(nome) {
        if (this.metodos.hasOwnProperty(nome)) {
            return this.metodos[nome];
        }

        if (this.superClasse !== null) {
            return this.superClasse.encontrarMetodo(nome);
        }

        return undefined;
    }

    toString() {
        return `<classe ${this.nome}>`;
    }

    aridade() {
        let inicializador = this.encontrarMetodo("construtor");
        return inicializador ? inicializador.aridade() : 0;
    }

    call(interpretador, argumentos) {
        let instancia = new DeleguaInstancia(this);

        let inicializador = this.encontrarMetodo("construtor");
        if (inicializador) {
            inicializador.bind(instancia).call(interpretador, argumentos);
        }

        return instancia;
    }
};