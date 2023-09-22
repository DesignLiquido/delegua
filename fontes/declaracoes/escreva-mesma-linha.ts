import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class EscrevaMesmaLinha extends Declaracao {
    argumentos: Construto[];

    constructor(linha: number, hashArquivo: number, argumentos: Construto[]) {
        super(linha, hashArquivo);
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoEscrevaMesmaLinha(this);
    }
}
