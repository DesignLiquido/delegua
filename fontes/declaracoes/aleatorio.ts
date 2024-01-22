import { VisitanteComumInterface } from "../interfaces";
import { Declaracao } from "./declaracao";
import { Bloco } from "./bloco";

export class Aleatorio extends Declaracao {
    corpo: Bloco;
    argumentos: { min: number, max: number } | null

    constructor(linha: number, hashArquivo: number, corpo: Bloco, argumentos: { min: number, max: number } | null) {
        super(linha, hashArquivo);

        this.corpo = corpo
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoAleatorio(this);
    }
}