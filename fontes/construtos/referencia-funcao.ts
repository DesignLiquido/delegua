import { SimboloInterface, VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

export class ReferenciaFuncao implements Construto {
    linha: number;
    hashArquivo: number;
    simboloFuncao: SimboloInterface;
    tipo: string;
    idFuncao: string;

    constructor(hashArquivo: number, linha: number, simboloFuncao: SimboloInterface, tipo: string, idfuncao: string) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.simboloFuncao = simboloFuncao;
        this.tipo = tipo;
        this.idFuncao = idfuncao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return visitante.visitarExpressaoReferenciaFuncao(this);
    }
}