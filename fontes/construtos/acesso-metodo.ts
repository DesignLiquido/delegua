import { VisitanteComumInterface } from "../interfaces";
import { Construto } from "./construto";

export class AcessoMetodo implements Construto {
    linha: number;
    hashArquivo: number;

    objeto: Construto;
    nomeMetodo: string;
    tipoRetornoMetodo: string = 'qualquer';

    constructor(hashArquivo: number, objeto: Construto, nomeMetodo: string, tipoRetornoMetodo: string = 'qualquer') {
        this.linha = objeto.linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nomeMetodo = nomeMetodo;
        this.tipoRetornoMetodo = tipoRetornoMetodo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoMetodo(this);
    }
}
