import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Quebrar extends Declaracao {
    constructor(simbolo: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoQuebrar(this));
    }

    paraTexto(): string {
        return `<quebrar />`;
    }
}
