import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Bloco extends Declaracao {
    declaracoes: any[];

    constructor(hashArquivo: number, linha: number, declaracoes: any[]) {
        super(linha, hashArquivo);
        this.declaracoes = declaracoes;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoBloco(this));
    }
}
