import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Enquanto extends Declaracao {
    condicao: Construto;
    corpo: any;

    constructor(condicao: Construto, corpo: any) {
        super(condicao.linha, condicao.hashArquivo);
        this.condicao = condicao;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoEnquanto(this);
    }
}
