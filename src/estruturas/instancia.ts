import { ErroEmTempoDeExecucao } from "../excecoes";

export class DeleguaInstancia {
    criarClasse: any;
    campos: any;

    constructor(criarClasse) {
        this.criarClasse = criarClasse;
        this.campos = {};
    }

    get(nome: any): any {
        if (this.campos.hasOwnProperty(nome.lexema)) {
            return this.campos[nome.lexema];
        }

        let metodo = this.criarClasse.encontrarMetodo(nome.lexema);
        if (metodo) return metodo.definirEscopo(this);

        throw new ErroEmTempoDeExecucao(nome, "Método indefinido não recuperado.");
    }

    set(nome: any, valor: any): void {
        this.campos[nome.lexema] = valor;
    }

    toString(): string {
        return "<Objeto " + this.criarClasse.nome + ">";
    }
}
