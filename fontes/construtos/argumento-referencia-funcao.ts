import { SimboloInterface, VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

/**
 * Este construto é emitido pelo Avaliador Sintático, e indica para as 
 * próximas etapas que este elemento é uma referência de função, mas 
 * que não pode ser resolvido em tempo de avaliação sintática.
 */
export class ArgumentoReferenciaFuncao implements Construto {
    linha: number;
    hashArquivo: number;
    simboloFuncao: SimboloInterface;
    idFuncao: string | null;

    constructor(hashArquivo: number, linha: number, simboloFuncao: SimboloInterface) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.simboloFuncao = simboloFuncao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarExpressaoArgumentoReferenciaFuncao(this);
    }
}
