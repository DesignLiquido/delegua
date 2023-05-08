import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces'
import { Declaracao } from './declaracao';

export class Expressao extends Declaracao {
    expressao: Construto;

    constructor(expressao: Construto) {
        super(expressao.linha, expressao.hashArquivo);
        this.expressao = expressao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoDeExpressao(this);
    }
}
