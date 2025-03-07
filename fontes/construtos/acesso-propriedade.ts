import { VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

export class AcessoPropriedade implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    nomePropriedade: string;
    tipoRetornoPropriedade: string;

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoPropriedade(this);
    }
}