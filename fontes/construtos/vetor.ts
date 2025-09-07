import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Vetor implements Construto {
    linha: number;
    hashArquivo: number;
    tamanho: number;
    tipo?: string;

    valores: Construto[];

    constructor(
        hashArquivo: number,
        linha: number,
        valores: Construto[],
        tamanho?: number,
        tipo?: string
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.tipo = tipo;

        this.valores = valores;
        if (tamanho) {
            this.tamanho = tamanho;
        } else {
            this.tamanho = this.valores.length;
        }
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoVetor(this);
    }

    paraTexto(): string {
        return `<vetor tipo=${this.tipo} valores=${this.valores.reduce((anterior, atual) => anterior += atual.paraTexto(), "")} />`;
    }
}
