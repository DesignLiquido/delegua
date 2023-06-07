import { SimboloInterface, VisitanteComumInterface } from "../interfaces";
import { Declaracao } from "./declaracao";

export class PropriedadeClasse extends Declaracao {
    nome: SimboloInterface;
    tipo?: string;

    constructor(nome: SimboloInterface, tipo?: string) {
        super(Number(nome.linha), nome.hashArquivo);
        this.nome = nome;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Não utilizado por enquanto.'));
    }
}
