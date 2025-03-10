import { VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

export class AcessoPropriedade implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    nomePropriedade: string;
    tipoRetornoPropriedade: string;

    constructor(hashArquivo: number, objeto: Construto, nomePropriedade: string, tipoRetornoPropriedade: string = 'qualquer') {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nomePropriedade = nomePropriedade;
        this.tipoRetornoPropriedade = tipoRetornoPropriedade;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoPropriedade(this);
    }
}