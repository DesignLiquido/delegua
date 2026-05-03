import { VisitanteComumInterface } from '../interfaces';
import { TipoInferencia } from '../inferenciador';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export type ValorLiteral = boolean | null | number | string | number[] | string[] | ConstrutoInterface;

export class Literal implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;
    valor: ValorLiteral;
    tipo: TipoInferencia;
    delimitadorTexto?: "'" | '"';

    constructor(
        hashArquivo: number,
        linha: number,
        valor: ValorLiteral,
        tipo: TipoInferencia = 'qualquer',
        delimitadorTexto?: "'" | '"'
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.valor = valor;
        this.tipo = tipo;
        this.delimitadorTexto = delimitadorTexto;
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
