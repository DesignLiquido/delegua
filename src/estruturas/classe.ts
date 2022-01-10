import { Callable } from "./callable";
import { DeleguaInstancia } from "./instancia";

export class DeleguaClasse extends Callable {
    nome: any;
    superClasse: any;
    metodos: any;

    constructor(nome?: any, superClasse?: any, metodos?: any) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    encontrarMetodo(nome: any): any {
        if (this.metodos.hasOwnProperty(nome)) {
            return this.metodos[nome];
        }

        if (this.superClasse !== null) {
            return this.superClasse.encontrarMetodo(nome);
        }

        return undefined;
    }

    toString(): string {
        return `<classe ${this.nome}>`;
    }

    aridade(): any {
        let inicializador = this.encontrarMetodo("construtor");
        return inicializador ? inicializador.aridade() : 0;
    }

    chamar(interpretador: any, argumentos: any): any {
        let instancia = new DeleguaInstancia(this);

        let inicializador = this.encontrarMetodo("construtor");
        if (inicializador) {
            inicializador.bind(instancia).call(interpretador, argumentos);
        }

        return instancia;
    }
}
