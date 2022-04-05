import { ErroEmTempoDeExecucao } from "../excecoes";
import { SimboloInterface } from "../interfaces";

export class DeleguaInstancia {
    criarClasse: any;
    campos: any;

    constructor(criarClasse: any) {
        this.criarClasse = criarClasse;
        this.campos = {};
    }

    get(simbolo: SimboloInterface): any {
        if (this.campos.hasOwnProperty(simbolo.lexema)) {
            return this.campos[simbolo.lexema];
        }

        let metodo = this.criarClasse.encontrarMetodo(simbolo.lexema);
        if (metodo) return metodo.definirEscopo(this);

        throw new ErroEmTempoDeExecucao(simbolo, "Método indefinido não recuperado.");
    }

    set(simbolo: SimboloInterface, valor: any): void {
        this.campos[simbolo.lexema] = valor;
    }

    toString(): string {
        return "<Objeto " + this.criarClasse.nome + ">";
    }
}
