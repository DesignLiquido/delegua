import { Construto } from '../construtos';
import { InterpretadorInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Expressao extends Declaracao {
    expressao: Construto;

    constructor(expressao: Construto) {
        super(expressao.linha, expressao.hashArquivo);
        this.expressao = expressao;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarDeclaracaoDeExpressao(this);
    }
}
