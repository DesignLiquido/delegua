import {
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    AcessoIntervaloVariavel,
    TuplaN,
    Literal,
    AtribuicaoPorIndice,
    AcessoIndiceVariavel,
    TipoDe,
    Dupla,
    Variavel,
    Atribuir,
} from '../../../construtos';
import { Interpretador } from '../../interpretador';
import { ErroEmTempoDeExecucao } from '../../../excecoes';

import * as comum from './comum';
import { ParaCada, Retorna } from '../../../declaracoes';
import { inferirTipoVariavel } from '../../../inferenciador';
import { ContinuarQuebra, Quebra, SustarQuebra, RetornoQuebra } from '../../../quebras';

export class InterpretadorPitugues extends Interpretador {
    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.lancarErroPorDivisaoPorZero = true;
    }

    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        return comum.visitarExpressaoAcessoMetodoOuPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        return comum.visitarExpressaoAcessoPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoIntervaloVariavel(
        expressao: AcessoIntervaloVariavel
    ): Promise<any> {
        return comum.visitarExpressaoAcessoIntervaloVariavel(this, expressao);
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<any> {
        return comum.visitarExpressaoTuplaN(this, expressao);
    }

    override async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        if (expressao.alvo.constructor === Variavel) {
            const alvoVariavel = expressao.alvo as Variavel;
            try {
                this.pilhaEscoposExecucao.obterValorVariavel(alvoVariavel.simbolo);
            } catch (e) {
                // Em Pituguês, a variável não precisa ser declarada antes da atribuição.
                let valor = await this.avaliar(expressao.valor);
                if (valor && valor.hasOwnProperty('valorRetornado')) {
                    valor = valor.valorRetornado;
                }
                const valorResolvido = this.resolverValor(valor);
                this.pilhaEscoposExecucao.definirVariavel(
                    alvoVariavel.simbolo.lexema,
                    valorResolvido
                );
                return valorResolvido;
            }
        }
        return super.visitarExpressaoDeAtribuicao(expressao);
    }

    override async visitarExpressaoAtribuicaoPorIndice(
        expressao: AtribuicaoPorIndice
    ): Promise<any> {
        const objeto = await this.avaliar(expressao.objeto);
        const objetoResolvido = this.resolverValor(objeto);

        if (objetoResolvido instanceof TuplaN || objetoResolvido.tipo === 'tupla') {
            throw new ErroEmTempoDeExecucao(
                (expressao.objeto as any).simbolo,
                'Não é possível modificar uma tupla. As tuplas são estruturas de dados imutáveis.',
                expressao.linha
            );
        }

        return super.visitarExpressaoAtribuicaoPorIndice(expressao);
    }

    override async visitarExpressaoAcessoIndiceVariavel(
        expressao: AcessoIndiceVariavel
    ): Promise<any> {
        const objeto = await this.avaliar(expressao.entidadeChamada);
        const indice = await this.avaliar(expressao.indice);
        let valorIndice = this.resolverValor(indice);
        const objetoResolvido = this.resolverValor(objeto);

        if (objetoResolvido instanceof TuplaN) {
            if (!Number.isInteger(valorIndice)) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice deve ser inteiro.',
                    expressao.linha
                );
            }

            if (valorIndice < 0 && objetoResolvido.elementos.length !== 0) {
                valorIndice += objetoResolvido.elementos.length;
            }

            if (valorIndice < 0 || valorIndice >= objetoResolvido.elementos.length) {
                throw new ErroEmTempoDeExecucao(
                    expressao.simboloFechamento,
                    'Índice fora do intervalo.',
                    expressao.linha
                );
            }

            const elemento = objetoResolvido.elementos[valorIndice];
            if (elemento instanceof Literal) return elemento.valor;
            return this.avaliar(elemento);
        }

        return super.visitarExpressaoAcessoIndiceVariavel(expressao);
    }

    override async visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> {
        const resultado = await super.visitarExpressaoTipoDe(expressao);

        if (typeof resultado === 'string') return resultado.replace('tipo de', 'tipo');

        return resultado;
    }

    /**
     * Normaliza o valor resolvido para um array iterável.
     * Converte dicionários em listas de Duplas e strings em listas de caracteres.
     */
    private prepararListaParaIteracao(valor: any, declaracao: ParaCada): any[] {
        let valorFinal = this.resolverValor(valor);

        const ehDicionario = declaracao.vetorOuDicionario.tipo === 'dicionário';
        const ehObjetoPuro =
            valorFinal && typeof valorFinal === 'object' && !Array.isArray(valorFinal);

        if (ehDicionario || ehObjetoPuro) {
            return Object.entries(valorFinal).map(
                ([chave, valor]) =>
                    new Dupla(
                        new Literal(declaracao.hashArquivo, declaracao.linha, chave, 'texto'),
                        new Literal(
                            declaracao.hashArquivo,
                            declaracao.linha,
                            valor as any,
                            inferirTipoVariavel(valor) as any
                        )
                    )
            );
        }

        if (typeof valorFinal === 'string') return valorFinal.split('');

        if (!Array.isArray(valorFinal)) {
            throw new Error("O objeto provido para 'para cada' não é iterável.");
        }

        return valorFinal;
    }

    /**
     * Resolve a lógica de atribuição das variáveis no escopo.
     * Suporta variáveis simples ou pares (Dupla).
     */
    private definirVariaveisIteracao(variavel: Variavel | Dupla, elemento: any): void {
        if (variavel instanceof Variavel) {
            this.pilhaEscoposExecucao.definirVariavel(
                variavel.simbolo.lexema,
                this.resolverValor(elemento)
            );

            return;
        }

        if (variavel instanceof Dupla) {
            const var1 = variavel.primeiro as Variavel;
            const var2 = variavel.segundo as Variavel;

            let v1: any, v2: any;

            if (elemento instanceof Dupla) {
                v1 = this.resolverValor(elemento.primeiro);
                v2 = this.resolverValor(elemento.segundo);
            } else {
                v1 = elemento[0];
                v2 = elemento[1];
            }

            this.pilhaEscoposExecucao.definirVariavel(var1.simbolo.lexema, v1);

            this.pilhaEscoposExecucao.definirVariavel(var2.simbolo.lexema, v2);
        }
    }

    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        let retornoExecucao: any;
        declaracao.posicaoAtual = 0;

        const valorResolvido = await this.avaliar(declaracao.vetorOuDicionario);
        let listaParaIterar: any[];
        try {
            listaParaIterar = this.prepararListaParaIteracao(valorResolvido, declaracao);
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
            return Promise.reject(erro);
        }

        while (
            !(retornoExecucao instanceof Quebra) &&
            declaracao.posicaoAtual < listaParaIterar.length
        ) {
            try {
                const elementoAtual = listaParaIterar[declaracao.posicaoAtual];

                this.definirVariaveisIteracao(declaracao.variavelIteracao, elementoAtual);

                retornoExecucao = await this.executar(declaracao.corpo);

                if (retornoExecucao instanceof SustarQuebra) return null;
                if (retornoExecucao instanceof ContinuarQuebra) retornoExecucao = null;

                declaracao.posicaoAtual++;
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }
        }

        return retornoExecucao;
    }

    override async visitarExpressaoRetornar(
        declaracao: Retorna
    ): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor !== null && declaracao.valor !== undefined) {
            valor = await this.avaliar(declaracao.valor);
        }

        const retornoQuebra = new RetornoQuebra(valor, declaracao.tipo);

        if (retornoQuebra.valor) {
            const valorResolvido = this.resolverValor(retornoQuebra.valor);
            const construtorRetorno = valorResolvido?.constructor?.name?.replaceAll('_', '') ?? '';
            if (['DeleguaFuncao', 'ReferenciaMontao'].includes(construtorRetorno)) retornoQuebra.preservarEscopo = true;
        }

        return retornoQuebra;
    }
}
