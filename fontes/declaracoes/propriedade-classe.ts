import { SimboloInterface, VisitanteComumInterface } from "../interfaces";
import { Declaracao } from "./declaracao";

export class PropriedadeClasse extends Declaracao {
    nome: string;
    tipo?: string;

    constructor(simboloNome: SimboloInterface, tipo?: string) {
        super(Number(simboloNome.linha), simboloNome.hashArquivo);
        this.nome = simboloNome.lexema;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.reject(new Error('Não utilizado por enquanto.'));
    }
}
