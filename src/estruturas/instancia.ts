import { ErroEmTempoDeExecucao } from "../erro";

export class DeleguaInstancia {
    criarClasse: any;
    campos: any;

    constructor(criarClasse) {
        this.criarClasse = criarClasse;
        this.campos = {};
    }

    get(nome: any) {
        if (this.campos.hasOwnProperty(nome.lexeme)) {
            return this.campos[nome.lexeme];
        }

        let metodo = this.criarClasse.encontrarMetodo(nome.lexeme);
        if (metodo) return metodo.bind(this);

        throw new ErroEmTempoDeExecucao(nome, "Método indefinido não recuperado.");
    }

    set(nome: any, valor: any) {
        this.campos[nome.lexeme] = valor;
    }

    toString() {
        return "<Objeto " + this.criarClasse.nome + ">";
    }
};
