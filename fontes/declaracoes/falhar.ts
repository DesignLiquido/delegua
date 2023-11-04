import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Falhar extends Declaracao {
    simbolo: SimboloInterface;
    explicacao: any;

    constructor(simbolo: SimboloInterface, explicacao: any) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.explicacao = explicacao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoFalhar(this));
    }
}
