import { ConstrutoInterface, VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class EscrevaMesmaLinha extends Declaracao {
    argumentos: ConstrutoInterface[];

    constructor(linha: number, hashArquivo: number, argumentos: ConstrutoInterface[]) {
        super(linha, hashArquivo);
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoEscrevaMesmaLinha(this);
    }

    paraTexto(): string {
        return `<escreva-mesma-linha argumentos=${this.argumentos.reduce((anterior, atual) => (anterior += atual.paraTexto()), '')} />`;
    }
}
