import { Atribuir, Variavel } from '../../../construtos';
import { InterpretadorInterface } from '../../../interfaces';
import { InterpretadorBase } from '../../interpretador-base';

export class InterpretadorCalango extends InterpretadorBase implements InterpretadorInterface {
    override async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        if (expressao.alvo.constructor === Variavel) {
            const valor = await this.avaliar(expressao.valor);
            const valorResolvido = this.resolverValorRecursivo(valor);
            let indice: any = null;
            if (expressao.indice) {
                indice = await this.avaliar(expressao.indice);
            }
            const alvoVariavel = expressao.alvo as Variavel;
            this.pilhaEscoposExecucao.atribuirVariavel(alvoVariavel.simbolo, valorResolvido, indice);
            return valorResolvido;
        }
        return super.visitarExpressaoDeAtribuicao(expressao);
    }
}
