const Callable = require("./callable");
const DeleguaInstancia = require("./instancia");

export class DeleguaClasse extends Callable {
    nome: any | null;
    superClasse: any;
    metodos: any;

    constructor(nome?: any, superClasse?: any, metodos?: any) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    encontrarMetodo(nome: any) {
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

    call(interpretador: any, argumentos: any) {
        let instancia = new DeleguaInstancia(this);

        let inicializador = this.encontrarMetodo("construtor");
        if (inicializador) {
            inicializador.bind(instancia).call(interpretador, argumentos);
        }

        return instancia;
    }
};
