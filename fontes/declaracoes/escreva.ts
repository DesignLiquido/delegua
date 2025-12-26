import { Construto } from '../construtos';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Escreva extends Declaracao {
    argumentos: Construto[];
    simboloEscreva?: SimboloInterface;

    constructor(linha: number, hashArquivo: number, argumentos: Construto[]) {
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
