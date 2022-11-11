import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';

export class Dicionario implements Construto {
    linha: number;
    hashArquivo?: number;

    chaves: any;
    valores: any;

    constructor(hashArquivo: number, linha: number, chaves: any, valores: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.chaves = chaves;
        this.valores = valores;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoDicionario(this));
    }
}
