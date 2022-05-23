import { Chamavel } from "./chamavel";
import { DeleguaFuncao } from "./funcao";
import { DeleguaInstancia } from "./instancia";

export class DeleguaClasse extends Chamavel {
    nome: any;
    superClasse: any;
    metodos: any;

    constructor(nome?: any, superClasse?: any, metodos?: any) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos;
    }

    encontrarMetodo(nome: string): DeleguaFuncao {
        if (this.metodos.hasOwnProperty(nome)) {
            return this.metodos[nome];
        }

        if (this.superClasse !== null) {
            return this.superClasse.encontrarMetodo(nome);
        }

        return undefined;
    }

    paraTexto(): string {
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
            inicializador.definirEscopo(instancia).chamar(interpretador, argumentos);
        }

        return instancia;
    }
}
