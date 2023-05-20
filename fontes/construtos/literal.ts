import { VisitanteComumInterface } from '../interfaces'
import { Construto } from './construto';

export type ValorLiteral = number | string | number[] | string[] | any;

export class Literal implements Construto {
    linha: number;
    hashArquivo: number;

    valor: ValorLiteral;

    constructor(hashArquivo: number, linha: number, valor: ValorLiteral) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLiteral(this);
    }
}
