import { Construto, Decorador } from '../construtos';
import { VisitanteComumInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Expressao extends Declaracao {
    paraTexto(): string {
        return `<declaração-expressão subExpressao=${this.expressao.paraTexto()} />`;
    }

    expressao: Construto;

    constructor(expressao: Construto, decoradores: Decorador[] = []) {
        super(expressao.linha, expressao.hashArquivo, decoradores);
        this.expressao = expressao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoDeExpressao(this);
    }
}
