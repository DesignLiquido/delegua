const Callable = require("./callable.js");
const DeleguaInstancia = require("./instancia.js");

module.exports = class DeleguaClasse extends Callable {
    constructor(nome, superClasse, metodos) {
        super();
        this.name = nome;
        this.superclass = superClasse;
        this.methods = metodos;
    }

    findMethod(nome) {
        if (this.methods.hasOwnProperty(nome)) {
            return this.methods[nome];
        }

        if (this.superclass !== null) {
            return this.superclass.findMethod(nome);
        }

        return undefined;
    }

    toString() {
        return `<classe ${this.nome}>`;
    }

    arity() {
        let inicializar = this.findMethod("construtor");
        return inicializar ? inicializar.arity() : 0;
    }

    call(interpretador, argumentos) {
        let instancia = new DeleguaInstancia(this);

        let inicializar = this.findMethod("construtor");
        if (inicializar) {
            inicializar.bind(instancia).call(interpretador, argumentos);
        }

        return instancia;
    }
};