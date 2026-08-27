import { Atribuir, Variavel } from '../../../construtos';
import { InterpretadorInterface } from '../../../interfaces';
import { InterpretadorBase } from '../../interpretador-base';
import { encadear } from '../../encadear';

export class InterpretadorCalango extends InterpretadorBase implements InterpretadorInterface {
    override visitarExpressaoDeAtribuicao(expressao: Atribuir): any {
        if (expressao.alvo.constructor === Variavel) {
            return encadear(this.avaliar(expressao.valor), (valor) => {
                const valorResolvido = this.resolverValorRecursivo(valor);
                const alvoVariavel = expressao.alvo as Variavel;

                const finalizarComIndice = (indice: any) => {
                    this.pilhaEscoposExecucao.atribuirVariavel(
                        alvoVariavel.simbolo,
                        valorResolvido,
                        indice
                    );
                    return valorResolvido;
                };

                if (expressao.indice) {
                    return encadear(this.avaliar(expressao.indice), (indice) =>
                        finalizarComIndice(indice)
                    );
                }

                return finalizarComIndice(null);
            });
        }
        return super.visitarExpressaoDeAtribuicao(expressao);
    }
}
