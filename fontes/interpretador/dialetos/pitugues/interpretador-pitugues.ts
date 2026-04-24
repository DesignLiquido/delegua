import {
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
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
import { EspacoMemoria } from '../../espaco-memoria';

import * as comum from './comum';
import { Classe, Declaracao, ParaCada, Retorna } from '../../../declaracoes';
import { inferirTipoVariavel } from '../../../inferenciador';
import { ContinuarQuebra, Quebra, SustarQuebra, RetornoQuebra } from '../../../quebras';
import { PilhaEscoposExecucaoPitugues } from './pilha-escopos-execucao-pitugues';
import * as bibliotecaGlobalPitugues from '../../../bibliotecas/dialetos/pitugues/biblioteca-global';
import { DescritorTipoClasse, FuncaoPadrao } from '../../estruturas';

export class InterpretadorPitugues extends Interpretador {
    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        // Substituir a pilha compartilhada de Delégua pela implementação específica
        // de Pituguês, que aplica a semântica de escopo local-first (estilo Python).
        const pilhaPitugues = new PilhaEscoposExecucaoPitugues();
        for (const escopo of this.pilhaEscoposExecucao.pilha) {
            pilhaPitugues.empilhar(escopo);
        }
        this.pilhaEscoposExecucao = pilhaPitugues;
        this.lancarErroPorDivisaoPorZero = true;
        this.requerDeclaracaoPropriedades = false;
    }

    protected override pontoInicializacaoBibliotecasGlobais() {
        for (const [nome, valor] of Object.entries(bibliotecaGlobalPitugues)) {
            if (typeof valor === 'function') {
                this.pilhaEscoposExecucao.definirVariavel(
                    nome,
                    new FuncaoPadrao(valor.length, valor)
                );
            }
        }
    }

    /**
     * Sobrescreve `executarBloco` para marcar escopos de chamadas de função com
     * `tipo: 'funcao'`. Quando `ambiente` é fornecido, a chamada vem de
     * `DeleguaFuncao.chamar`, que repassa o espaço de memória dos parâmetros.
     * Isso permite que `PilhaEscoposExecucaoPitugues` identifique fronteiras de
     * função e aplique a semântica LEGB corretamente.
     */
    override async executarBloco(
        declaracoes: Declaracao[],
        ambiente?: EspacoMemoria
    ): Promise<any> {
        if (ambiente !== undefined && ambiente !== null) {
            const escopoFuncao = {
                declaracoes,
                declaracaoAtual: 0,
                espacoMemoria: ambiente,
                finalizado: false,
                tipo: 'funcao' as const,
                emLacoRepeticao: false,
            };
            this.pilhaEscoposExecucao.empilhar(escopoFuncao);
            const retorno = await this.executarUltimoEscopo();
            if (retorno instanceof ErroEmTempoDeExecucao) {
                return Promise.reject(retorno);
            }
            return retorno;
        }
        return super.executarBloco(declaracoes, ambiente);
    }

    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto, true);

        if (objeto instanceof DescritorTipoClasse) {
            return await objeto.obterEstatico(expressao.nomeMetodo, this);
        }

        return comum.visitarExpressaoAcessoMetodo(this, expressao);
    }

    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto, true);

        if (objeto instanceof DescritorTipoClasse) {
            return await objeto.obterEstatico(expressao.simbolo.lexema, this);
        }

        return comum.visitarExpressaoAcessoMetodoOuPropriedade(this, expressao);
    }

    override async visitarExpressaoAcessoPropriedade(
        expressao: any
    ): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto, true);

        if (objeto instanceof DescritorTipoClasse) {
            return await objeto.obterEstatico(expressao.simbolo.lexema, this);
        }

        return super.visitarExpressaoAcessoPropriedade(expressao);
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
                // Verifica se a variável existe em algum escopo.
                // Se não existir, obterValorVariavel lança uma exceção.
                this.pilhaEscoposExecucao.obterValorVariavel(alvoVariavel.simbolo);
            } catch (e) {
                // Variável completamente nova: declaração implícita no escopo atual.
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
        // Variável já existe em algum escopo. O método atribuirVariavel de
        // PilhaEscoposExecucaoPitugues decide onde escrever: se estivermos dentro
        // de uma função e a variável só existir no escopo global, ela é criada
        // localmente na função (semântica LEGB do Python).
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
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            declaracao.posicaoAtual < listaParaIterar.length
        ) {
            try {
                const elementoAtual = listaParaIterar[declaracao.posicaoAtual];

                this.definirVariaveisIteracao(declaracao.variavelIteracao, elementoAtual);

                retornoExecucao = await this.executar(declaracao.corpo);

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra)
                    return null;
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra)
                    retornoExecucao = null;

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

    override async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor !== null && declaracao.valor !== undefined) {
            valor = await this.avaliar(declaracao.valor);
        }

        const retornoQuebra = new RetornoQuebra(valor, declaracao.tipo);

        if (retornoQuebra.valor) {
            const valorResolvido = this.resolverValor(retornoQuebra.valor);
            const construtorRetorno = valorResolvido?.constructor?.name?.replaceAll('_', '') ?? '';
            if (['DeleguaFuncao', 'ReferenciaMontao'].includes(construtorRetorno))
                retornoQuebra.preservarEscopo = true;
        }

        return retornoQuebra;
    }

    override async visitarDeclaracaoClasse(
        declaracao: Classe
    ): Promise<DescritorTipoClasse> {
        const descritor = await super.visitarDeclaracaoClasse(declaracao);
        descritor.sombrearPropriedadesDeClasse = true;

        for (const propriedade of declaracao.propriedades) {
            if (propriedade.estatico) {
                const propriedadeNome = propriedade.nome.lexema;
                const propriedadeValor = await this.avaliar(
                    propriedade.valorInicial
                );

                descritor.membrosEstaticos[propriedadeNome] = propriedadeValor;
            }
        }

        return descritor;
    }

    override async visitarExpressaoDefinirValor(expressao: any): Promise<any> {
        const variavelObjeto = await this.avaliar(expressao.objeto);
        const objeto = this.resolverValor(variavelObjeto, true);

        if (objeto instanceof DescritorTipoClasse) {
            const valor = await this.avaliar(expressao.valor);
            await objeto.definirEstatico(expressao.nome.lexema, valor, this);

            return valor;
        }

        return super.visitarExpressaoDefinirValor(expressao);
    }
}
