import { SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Continua extends Declaracao {
    constructor(simbolo: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
    }

    aceitar(visitante: any): any {
        return visitante.visitarExpressaoContinua(this);
    }
}
