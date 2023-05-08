import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Retorna extends Declaracao {
    simboloChave: SimboloInterface;
    valor: any;

    constructor(simboloChave: SimboloInterface, valor: any) {
        super(Number(simboloChave.linha), simboloChave.hashArquivo);
        this.simboloChave = simboloChave;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoRetornar(this);
    }
}
