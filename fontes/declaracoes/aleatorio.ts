import { VisitanteComumInterface } from "../interfaces";
import { Bloco } from "./bloco";
import { Declaracao } from "./declaracao";

export class Aleatorio extends Declaracao {
    corpo: Bloco;

    constructor(linha: number, hashArquivo: number, corpo: Bloco){
        super(linha, hashArquivo);

        this.corpo = corpo
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoAleatorio(this);
    }
}