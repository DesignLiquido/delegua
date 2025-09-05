import { VisitanteComumInterface } from '../interfaces';
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { Construto } from './construto';

export type ValorLiteral = number | string | number[] | string[] | any;

export class Literal implements Construto {
    linha: number;
    hashArquivo: number;
    valor: ValorLiteral;
    tipo: TipoDadosElementar;

    constructor(
        hashArquivo: number,
        linha: number,
        valor: ValorLiteral,
        tipo: TipoDadosElementar = 'qualquer'
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoLiteral(this);
    }

    paraTexto(): string {
        return `<literal valor=${this.valor} tipo=${this.tipo} />`; 
    }
}
