import { VisitanteComumInterface } from '../interfaces';
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { Construto } from './construto';

export type ValorLiteral = boolean | null | number | string | number[] | string[] | Construto;

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
        let valor = this.valor;
        if (this.valor.hasOwnProperty('paraTextoSaida')) {
            valor = (this.valor as any).paraTextoSaida();
        }

        return `<literal valor=${this.valor} tipo=${this.tipo} />`;
    }

    paraTextoSaida(): string {
        if (this.tipo === 'texto') {
            return `"${this.valor}"`;
        }
        
        return `${this.valor}`;
    }
}
