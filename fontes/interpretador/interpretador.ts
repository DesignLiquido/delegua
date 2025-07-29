import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    ArgumentoReferenciaFuncao,
    Atribuir,
    Construto,
    Dicionario,
    Literal,
    ReferenciaFuncao,
    TipoDe,
    Variavel,
    Vetor,
} from '../construtos';
import {
    DeleguaFuncao,
    DeleguaModulo,
    DescritorTipoClasse,
    MetodoPrimitiva,
    ObjetoDeleguaClasse,
    ReferenciaMontao,
} from './estruturas';
import { RetornoInterpretador, SimboloInterface, VariavelInterface } from '../interfaces';
import { InterpretadorBase } from './interpretador-base';
import { inferirTipoVariavel } from '../inferenciador';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { Declaracao, FuncaoDeclaracao, Retorna } from '../declaracoes';
import { Quebra, RetornoQuebra } from '../quebras';
import { Montao } from './montao';

import primitivasDicionario from '../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../bibliotecas/primitivas-numero';
import primitivasTexto from '../bibliotecas/primitivas-texto';
import primitivasVetor from '../bibliotecas/primitivas-vetor';

import tipoDeDadosPrimitivos from '../tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../tipos-de-dados/delegua';

/**
 * O interpretador de Delégua.
 */
export class Interpretador extends InterpretadorBase {
    montao: Montao;

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);
        this.montao = new Montao();
    }

    protected resolverReferenciaMontao(referenciaMontao: ReferenciaMontao) {
        const valorMontao = this.montao.obterReferencia(
            this.hashArquivoDeclaracaoAtual,
            this.linhaDeclaracaoAtual,
            referenciaMontao.endereco
        );

        return valorMontao;
    }

    protected resolverValor(objeto: any) {
        if (objeto === null || objeto === undefined) {
            return objeto;
        }

        if (objeto instanceof ReferenciaMontao) {
            return this.resolverReferenciaMontao(objeto);
        }

        if (objeto.hasOwnProperty('valor')) {
            if (objeto.valor instanceof ReferenciaMontao) {
                return this.resolverReferenciaMontao(objeto.valor);
            }

            return objeto.valor;
        }

        return objeto;
    }

    override async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = this.resolverValor(resultadoAvaliacao);
            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto.trimEnd();
    }

    override visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        const funcao = new DeleguaFuncao(declaracao.simbolo.lexema, declaracao.funcao);
        // TODO: Depreciar essa abordagem a favor do uso por referências.
        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, funcao);
        this.pilhaEscoposExecucao.registrarReferenciaFuncao(declaracao.id, funcao);
    }

    override async visitarExpressaoAcessoIndiceVariavel(
        expressao: AcessoIndiceVariavel
    ): Promise<any> {
        const promises = await Promise.all([
            this.avaliar(expressao.entidadeChamada),
            this.avaliar(expressao.indice),
        ]);

        const variavelObjeto: VariavelInterface = promises[0];
        const indice = promises[1];

        const objeto = this.resolverValor(variavelObjeto);
        let valorIndice = this.resolverValor(indice);

        if (Array.isArray(objeto)) {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                while (valorIndice < 0) {
                    valorIndice += objeto.length;
                }
            }

            if (valorIndice >= objeto.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice do vetor fora do intervalo.',
                        expressao.linha
                    )
                );
            }

            return objeto[valorIndice];
        }

        if (objeto instanceof Vetor) {
            return objeto.valores[valorIndice];
        }

        if (
            objeto.constructor === Object ||
            objeto instanceof ObjetoDeleguaClasse ||
            objeto instanceof DeleguaFuncao ||
            objeto instanceof DescritorTipoClasse ||
            objeto instanceof DeleguaModulo
        ) {
            if (objeto[valorIndice] === 0) return 0;
            return objeto[valorIndice] || null;
        }

        if (typeof objeto === tipoDeDadosPrimitivos.TEXTO) {
            if (!Number.isInteger(valorIndice)) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Somente inteiros podem ser usados para indexar um vetor.',
                        expressao.linha
                    )
                );
            }

            if (valorIndice < 0 && objeto.length !== 0) {
                while (valorIndice < 0) {
                    valorIndice += objeto.length;
                }
            }

            if (valorIndice >= objeto.length) {
                return Promise.reject(
                    new ErroEmTempoDeExecucao(
                        expressao.simboloFechamento,
                        'Índice fora do tamanho.',
                        expressao.linha
                    )
                );
            }

            return objeto.charAt(valorIndice);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: this.hashArquivoDeclaracaoAtual,
                    linha: this.linhaDeclaracaoAtual,
                } as SimboloInterface,
                'Somente listas, dicionários, classes e objetos podem ter seus valores indexados.',
                expressao.linha
            )
        );
    }

    override async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<any> {
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor.name === 'RetornoQuebra') {
            variavelObjeto = variavelObjeto.valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        if (objeto.constructor.name === 'ObjetoDeleguaClasse') {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomeMetodo) || null;
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.nomeMetodo in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.nomeMetodo].implementacao;
                return new MetodoPrimitiva(objeto, metodoDePrimitivaDicionario);
            }

            return objeto[expressao.nomeMetodo] || null;
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.nomeMetodo];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.nomeMetodo] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.nomeMetodo];
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.nomeMetodo] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                const metodoDePrimitivaNumero: Function =
                    primitivasNumero[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaNumero);
                }
                break;
            case tipoDeDadosDelegua.TEXTO:
                const metodoDePrimitivaTexto: Function =
                    primitivasTexto[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
                }
                break;
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.nomeMetodo].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                {
                    hashArquivo: this.hashArquivoDeclaracaoAtual,
                    linha: this.linhaDeclaracaoAtual,
                } as SimboloInterface,
                `Método para objeto ou primitiva não encontrado: ${expressao.nomeMetodo}.`,
                expressao.linha
            )
        );
    }

    /**
     * Casos que ocorrem aqui:
     *
     * - Quando o método ou propriedade é ou 'qualquer', ou vetor
     *   de 'qualquer' ('qualquer[]'), e uma primitiva é usada.
     * - Quando o objeto é uma classe definida em código.
     * @param {AcessoMetodoOuPropriedade} expressao A expressão de acesso a método ou propriedade.
     * @returns A primitiva encontrada.
     */
    override async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<any> {
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor.name === 'RetornoQuebra') {
            variavelObjeto = variavelObjeto.valor;
        }

        const objeto = this.resolverValor(variavelObjeto);

        if (objeto.constructor.name === 'ObjetoDeleguaClasse') {
            return (objeto as ObjetoDeleguaClasse).obter(expressao.simbolo);
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.simbolo.lexema in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.simbolo.lexema].implementacao;
                return new MetodoPrimitiva(objeto, metodoDePrimitivaDicionario);
            }

            return objeto[expressao.simbolo.lexema] || null;
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.simbolo.lexema] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        // Como internamente um dicionário de Delégua é simplesmente um objeto de
        // JavaScript, as primitivas de dicionário, especificamente, são tratadas
        // mais acima.
        switch (tipoObjeto) {
            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                const metodoDePrimitivaNumero: Function =
                    primitivasNumero[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaNumero) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaNumero);
                }
                break;
            case tipoDeDadosDelegua.TEXTO:
                const metodoDePrimitivaTexto: Function =
                    primitivasTexto[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaTexto) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaTexto);
                }
                break;
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_INTEIRO:
            case tipoDeDadosDelegua.VETOR_LOGICO:
            case tipoDeDadosDelegua.VETOR_LÓGICO:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_QUALQUER:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                const metodoDePrimitivaVetor: Function =
                    primitivasVetor[expressao.simbolo.lexema].implementacao;
                if (metodoDePrimitivaVetor) {
                    return new MetodoPrimitiva(objeto, metodoDePrimitivaVetor);
                }
                break;
        }

        // Último caso válido: objeto de uma classe JavaScript que possua a propriedade.
        // Exemplos: classes de LinConEs, como `RetornoComando, ou bibliotecas globais com objetos próprios`.
        if (
            objeto.hasOwnProperty(expressao.simbolo.lexema) ||
            typeof objeto[expressao.simbolo.lexema] !== 'undefined'
        ) {
            return objeto[expressao.simbolo.lexema];
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Método ou propriedade para objeto ou primitiva não encontrado: ${expressao.simbolo.lexema}.`,
                expressao.linha
            )
        );
    }

    override async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<any> {
        let variavelObjeto: VariavelInterface = await this.avaliar(expressao.objeto);

        // Este caso acontece quando há encadeamento de métodos.
        // Por exemplo, `objeto1.metodo1().metodo2()`.
        // Como `RetornoQuebra` também possui `valor`, precisamos extrair o
        // valor dele primeiro.
        if (variavelObjeto.constructor.name === 'RetornoQuebra') {
            variavelObjeto = variavelObjeto.valor;
        }

        const objeto = variavelObjeto.hasOwnProperty('valor')
            ? variavelObjeto.valor
            : variavelObjeto;

        // Outro caso que `instanceof` simplesmente não funciona para casos em Liquido,
        // então testamos também o nome do construtor.
        if (
            objeto instanceof ObjetoDeleguaClasse ||
            objeto.constructor.name === 'ObjetoDeleguaClasse'
        ) {
            return (objeto as ObjetoDeleguaClasse).obterMetodo(expressao.nomePropriedade) || null;
        }

        // Objeto simples do JavaScript, ou dicionário de Delégua.
        if (objeto.constructor === Object) {
            if (expressao.nomePropriedade in primitivasDicionario) {
                const metodoDePrimitivaDicionario: Function =
                    primitivasDicionario[expressao.nomePropriedade].implementacao;
                return new MetodoPrimitiva(objeto, metodoDePrimitivaDicionario);
            }

            return objeto[expressao.nomePropriedade] || null;
        }

        // Casos em que o objeto possui algum outro tipo que não o de objeto simples.
        // Normalmente executam quando uma biblioteca é importada, e estamos tentando
        // obter alguma propriedade ou método desse objeto.

        // Caso 1: Função tradicional do JavaScript.
        if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.FUNCAO) {
            return objeto[expressao.nomePropriedade];
        }

        // Caso 2: Objeto tradicional do JavaScript.
        if (typeof objeto[expressao.nomePropriedade] === tipoDeDadosPrimitivos.OBJETO) {
            return objeto[expressao.nomePropriedade];
        }

        // A partir daqui, presume-se que o objeto é uma das estruturas
        // de Delégua.
        if (objeto instanceof DeleguaModulo) {
            return objeto.componentes[expressao.nomePropriedade] || null;
        }

        let tipoObjeto = variavelObjeto.tipo;
        if (tipoObjeto === null || tipoObjeto === undefined) {
            tipoObjeto = inferirTipoVariavel(variavelObjeto as any);
        }

        return Promise.reject(
            new ErroEmTempoDeExecucao(
                null,
                `Propriedade para objeto ou primitiva não encontrado: ${expressao.nomePropriedade}.`,
                expressao.linha
            )
        );
    }

    override async visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<any> {
        const deleguaFuncao = this.pilhaEscoposExecucao.obterVariavelPorNome(
            expressao.simboloFuncao.lexema
        );
        return deleguaFuncao;
    }

    /**
     * Execução de uma expressão de atribuição.
     * @param expressao A expressão.
     * @returns O valor atribuído.
     */
    override async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<any> {
        const valor = await this.avaliar(expressao.valor);
        const valorResolvido = this.resolverValor(valor);
        let indice: any = null;

        if (expressao.indice) {
            indice = await this.avaliar(expressao.indice);
        }

        switch (expressao.alvo.constructor.name) {
            case 'Variavel':
                const alvoVariavel = expressao.alvo as Variavel;
                const variavelResolvida = this.pilhaEscoposExecucao.obterValorVariavel(
                    alvoVariavel.simbolo
                );
                if (variavelResolvida.valor instanceof ReferenciaMontao) {
                    const referenciaMontao = this.montao.obterReferencia(
                        this.hashArquivoDeclaracaoAtual,
                        this.linhaDeclaracaoAtual,
                        variavelResolvida.valor.endereco
                    );

                    referenciaMontao[indice] = valorResolvido;
                } else {
                    this.pilhaEscoposExecucao.atribuirVariavel(
                        alvoVariavel.simbolo,
                        valorResolvido,
                        indice
                    );
                }

                break;
            case 'AcessoMetodoOuPropriedade':
                // Nunca será método aqui: apenas propriedade.
                const alvoPropriedade = expressao.alvo as AcessoMetodoOuPropriedade;
                const variavelObjeto = await this.avaliar(alvoPropriedade.objeto);
                const objeto = this.resolverValor(variavelObjeto);

                const valor = await this.avaliar(expressao.valor);
                if (objeto.constructor.name === 'ObjetoDeleguaClasse') {
                    const objetoDeleguaClasse = objeto as ObjetoDeleguaClasse;
                    objetoDeleguaClasse.definir(alvoPropriedade.simbolo, valor);
                }
                break;
            default:
                throw new ErroEmTempoDeExecucao(
                    null,
                    `Atribuição com caso faltante: ${expressao.alvo.constructor.name}.`
                );
        }

        return valorResolvido;
    }

    /**
     * Dicionários em Delégua são passados por referência, portanto, são
     * armazenados no montão.
     */
    override async visitarExpressaoDicionario(expressao: Dicionario): Promise<any> {
        const dicionario = {};
        for (let i = 0; i < expressao.chaves.length; i++) {
            const promises = await Promise.all([
                this.avaliar(expressao.chaves[i]),
                this.avaliar(expressao.valores[i]),
            ]);

            if (typeof promises[0] === 'boolean') {
                const chaveLogico = promises[0] === true ? 'verdadeiro' : 'falso';
                dicionario[chaveLogico] = promises[1];
                continue;
            }

            dicionario[promises[0]] = promises[1].hasOwnProperty('valor')
                ? promises[1].valor
                : promises[1];
        }

        const enderecoDicionarioMontao = this.montao.adicionarReferencia(dicionario);
        this.pilhaEscoposExecucao.registrarReferenciaMontao(enderecoDicionarioMontao);
        return new ReferenciaMontao(enderecoDicionarioMontao);
    }

    override async visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<any> {
        const deleguaFuncao = this.pilhaEscoposExecucao.obterReferenciaFuncao(expressao.idFuncao);
        return deleguaFuncao;
    }

    override async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor !== null && declaracao.valor !== undefined) {
            valor = await this.avaliar(declaracao.valor);
        }

        const retornoQuebra = new RetornoQuebra(valor);

        // Se o retorno for uma função anônima, o escopo precisa ser preservado.
        // Como quebras matam o topo da pilha de escopos, precisamos dizer
        // para a finalização para copiar as variáveis para o escopo de baixo.
        if (retornoQuebra.valor) {
            const construtorRetorno = retornoQuebra.valor.constructor.name.replaceAll('_', '');
            if (construtorRetorno === 'DeleguaFuncao') {
                retornoQuebra.preservarEscopo = true;
            }
        }

        return retornoQuebra;
    }

    override async visitarExpressaoTipoDe(expressao: TipoDe): Promise<string> {
        let valorTipoDe = expressao.valor;

        switch (valorTipoDe.constructor.name) {
            case 'AcessoIndiceVariavel':
            case 'Agrupamento':
            case 'Binario':
            case 'Chamada':
            case 'Dicionario':
            case 'Unario':
                valorTipoDe = await this.avaliar(valorTipoDe);
                if (valorTipoDe instanceof ReferenciaMontao) {
                    valorTipoDe = this.montao.obterReferencia(
                        this.hashArquivoDeclaracaoAtual,
                        this.linhaDeclaracaoAtual,
                        valorTipoDe.endereco
                    );
                }

                return valorTipoDe.tipo || inferirTipoVariavel(valorTipoDe);
            case 'AcessoMetodo':
                const acessoMetodo = valorTipoDe as AcessoMetodo;
                return `método<${acessoMetodo.tipoRetornoMetodo}>`;
            case 'AcessoPropriedade':
                const acessoPropriedade = valorTipoDe as AcessoPropriedade;
                return acessoPropriedade.tipoRetornoPropriedade;
            case 'AcessoMetodoOuPropriedade':
                // TODO: Deve ser removido mais futuramente.
                // Apenas `AcessoMetodo` e `AcessoPropriedade` devem funcionar aqui.
                throw new ErroEmTempoDeExecucao(expressao.simbolo, 'Não deveria cair aqui.');
            case 'Escreva':
                return 'função<vazio>';
            case 'Leia':
                return 'função<texto>';
            case 'Literal':
                const tipoLiteral = valorTipoDe as Literal;
                return tipoLiteral.tipo;
            case 'TipoDe':
                const alvoTipoDe = await this.avaliar(valorTipoDe);
                return `tipo de<${alvoTipoDe}>`;
            case 'Variavel':
                return valorTipoDe.tipo;
            case 'Vetor':
                return inferirTipoVariavel((valorTipoDe as Vetor)?.valores);
            default:
                return inferirTipoVariavel(valorTipoDe);
        }
    }

    /**
     * Executa o último escopo empilhado no topo na pilha de escopos do interpretador.
     * Esse método pega exceções, mas apenas as devolve.
     *
     * O tratamento das exceções é feito de acordo com o bloco chamador.
     * Por exemplo, em `tente ... pegue ... finalmente`, a exceção é capturada e tratada.
     * Em outros blocos, pode ser desejável ter o erro em tela.
     * @param manterAmbiente Se verdadeiro, ambiente do topo da pilha de escopo é copiado para o ambiente imediatamente abaixo.
     * @returns O resultado da execução do escopo, se houver.
     */
    override async executarUltimoEscopo(manterAmbiente = false): Promise<any> {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        let retornoExecucao: any;
        try {
            for (
                ;
                !(retornoExecucao instanceof Quebra) &&
                ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
                this.linhaDeclaracaoAtual = declaracaoAtual.linha;
                this.hashArquivoDeclaracaoAtual = declaracaoAtual.hashArquivo;
                retornoExecucao = await this.executar(declaracaoAtual);
            }

            return retornoExecucao;
        } catch (erro: any) {
            const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            if (!this.emDeclaracaoTente) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracaoAtual.linha,
                    hashArquivo: declaracaoAtual.hashArquivo,
                });
            } else {
                return Promise.reject(erro);
            }
        } finally {
            const escopoFinalizado = this.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();

            this.montao.excluirReferencias(...escopoFinalizado.espacoMemoria.enderecosMontao);

            if (manterAmbiente || (retornoExecucao && retornoExecucao.preservarEscopo === true)) {
                escopoAnterior.espacoMemoria.valores = Object.assign(
                    escopoAnterior.espacoMemoria.valores,
                    ultimoEscopo.espacoMemoria.valores
                );
            }
        }
    }

    /**
     * Método que efetivamente inicia o processo de interpretação.
     * @param declaracoes Um vetor de declarações gerado pelo Avaliador Sintático.
     * @param manterAmbiente Se ambiente de execução (variáveis, classes, etc.) deve ser mantido. Normalmente usado
     *                       pelo modo REPL (LAIR).
     * @returns Um objeto com o resultado da interpretação.
     */
    override async interpretar(
        declaracoes: Declaracao[],
        manterAmbiente?: boolean
    ): Promise<RetornoInterpretador> {
        this.montao = new Montao();
        return super.interpretar(declaracoes, manterAmbiente);
    }
}
