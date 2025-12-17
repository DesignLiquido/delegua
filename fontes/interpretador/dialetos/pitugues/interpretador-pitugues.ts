import { AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    AcessoIntervaloVariavel,
    TuplaN,
    Atribuir,
    Literal,
    AtribuicaoPorIndice,
    AcessoIndiceVariavel
} from "../../../construtos";
import { Interpretador } from "../../interpretador";
import { ErroEmTempoDeExecucao } from '../../../excecoes';

import * as comum from './comum';

export class InterpretadorPitugues extends Interpretador {
    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(expressao: AcessoMetodoOuPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoMetodoOuPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoIntervaloVariavel(expressao: AcessoIntervaloVariavel): Promise<any> {
        return comum.visitarExpressaoAcessoIntervaloVariavel(this, expressao);
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> {
        return comum.visitarExpressaoTuplaN(this, expressao);
    }

    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        return super.visitarExpressaoDeAtribuicao(expressao);
    }

    override async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        const objeto = await this.avaliar(expressao.objeto);
        const objetoResolvido = this.resolverValor(objeto);

        if (objetoResolvido instanceof TuplaN || (objetoResolvido.tipo === 'tupla')) {
            throw new ErroEmTempoDeExecucao(
                (expressao.objeto as any).simbolo,
                'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.',
                expressao.linha
            );
        }

        return super.visitarExpressaoAtribuicaoPorIndice(expressao);
    }

    override async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        const objeto = await this.avaliar(expressao.entidadeChamada);
        const indice = await this.avaliar(expressao.indice);
        const valorIndice = this.resolverValor(indice);
        const objetoResolvido = this.resolverValor(objeto);

        if (objetoResolvido instanceof TuplaN) {
            if (!Number.isInteger(valorIndice)) {
                throw new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice deve ser inteiro.', expressao.linha);
            }

            if (valorIndice < 0 || valorIndice >= objetoResolvido.elementos.length) {
                 throw new ErroEmTempoDeExecucao(expressao.simboloFechamento, 'Índice fora do intervalo.', expressao.linha);
            }

            const elemento = objetoResolvido.elementos[valorIndice];
            if (elemento instanceof Literal) return elemento.valor;
            return this.avaliar(elemento);
        }

        return super.visitarExpressaoAcessoIndiceVariavel(expressao);
    }
}
