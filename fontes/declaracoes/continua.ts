import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Continua extends Declaracao {
    constructor(simbolo: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoContinua(this));
    }
}
