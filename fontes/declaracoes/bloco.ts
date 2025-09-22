import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

// TODO: `Bloco` só deveria ser declaração quando representa um escopo órfão.
// Estudar transformar em construto e suas implicações.
export class Bloco extends Declaracao {
    declaracoes: Declaracao[];

    constructor(hashArquivo: number, linha: number, declaracoes: Declaracao[]) {
        super(linha, hashArquivo);
        this.declaracoes = declaracoes;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoBloco(this);
    }

    paraTexto(): string {
        let resultado = '<bloco>';
        for (const declaracao of this.declaracoes) {
            resultado += `${declaracao.paraTexto()}`;
        }

        resultado += '</bloco>';
        return resultado;
    }
}
