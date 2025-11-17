import { VisitanteDeleguaInterface } from '../interfaces';
import { Construto } from './construto';

export class Elvis implements Construto {
    linha: number;
    hashArquivo: number;

    esquerda: Construto;
    direita: Construto;

    constructor(hashArquivo: number, esquerda: Construto, direita: Construto) {
        this.linha = esquerda.linha;
        this.hashArquivo = hashArquivo;

        this.esquerda = esquerda;
        this.direita = direita;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoElvis(this);
    }

    paraTexto(): string {
        return (
            `<elvis esquerda=${this.esquerda.paraTexto()} ` +
            `direita=${this.direita.paraTexto()} ` +
            `/>`
        );
    }
}
