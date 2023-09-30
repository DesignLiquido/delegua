import { VisitanteComumInterface } from '../interfaces';
import { Construto } from './construto';

export class Vetor implements Construto {
    linha: number;
    hashArquivo: number;

    valores: any[];

    constructor(hashArquivo: number, linha: number, valores: any[]) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.valores = valores;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoVetor(this);
    }
}
