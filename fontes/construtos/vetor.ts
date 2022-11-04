import { Construto } from './construto';

export class Vetor implements Construto {
    linha: number;
    hashArquivo?: number;

    valores: any[];

    constructor(hashArquivo: number, linha: number, valores: any[]) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.valores = valores;
    }

    aceitar(visitante: any) {
        return visitante.visitarExpressaoVetor(this);
    }
}
