import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Sustar extends Declaracao {
    constructor(simbolo: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoSustar(this));
    }
}
