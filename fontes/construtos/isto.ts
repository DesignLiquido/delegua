import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';

export class Isto implements Construto {
    linha: number;
    hashArquivo?: number;

    palavraChave: any;

    constructor(hashArquivo: number, linha: number, palavraChave?: any) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.palavraChave = palavraChave;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoIsto(this));
    }
}
