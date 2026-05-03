import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { Declaracao } from './declaracao';

export class Escreva extends Declaracao {
    argumentos: ConstrutoInterface[];
    simboloEscreva?: SimboloInterface;

    constructor(linha: number, hashArquivo: number, argumentos: ConstrutoInterface[]) {
        super(linha, hashArquivo);
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoEscreva(this);
    }

    paraTexto(): string {
        return `<escreva argumentos=${this.argumentos.reduce((anterior, atual) => (anterior += atual.paraTexto()), '')} />`;
    }
}


