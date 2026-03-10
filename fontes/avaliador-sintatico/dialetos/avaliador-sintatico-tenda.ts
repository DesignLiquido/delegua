import hrtime from 'browser-process-hrtime';

import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Super,
    Tupla,
    Unario,
    Variavel,
    Vetor,
} from '../../construtos';
import { ParametroInterface, SimboloInterface } from '../../interfaces';

import { ErroAvaliadorSintatico } from './../erro-avaliador-sintatico';

import {
    Deceto,
    Dupla,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    SeletorTuplas,
    Septeto,
    Sexteto,
    Trio,
} from '../../construtos/tuplas';
import {
    Bloco,
    Comentario,
    Continua,
    Declaracao,
    Enquanto,
    Escreva,
    Expressao,
    FuncaoDeclaracao,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    Var,
} from '../../declaracoes';
import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { inferirTipoVariavel, TipoInferencia } from '../../inferenciador';
import { PilhaEscopos } from './../pilha-escopos';
import { InformacaoEscopo } from './../informacao-escopo';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import { Simbolo } from '../../lexador/simbolo';

import tipoDeDadosDelegua from '../../tipos-de-dados/delegua';
import tiposDeSimbolos from '../../tipos-de-simbolos/tenda';

import primitivasDicionario from '../../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../../bibliotecas/primitivas-numero';
import primitivasTexto from '../../bibliotecas/primitivas-texto';
import primitivasVetor from '../../bibliotecas/primitivas-vetor';

// Será usado para forçar tipagem em construtos e em algumas funções internas.
type TipoDeSimboloDelegua = (typeof tiposDeSimbolos)[keyof typeof tiposDeSimbolos];

/**
 * Este avaliador sintático emite todos os símbolos de Tenda. No entanto, nem todo
 * símbolo emitido aqui pode ser interpretado por este núcleo, já que Tenda tem
 * Rust como base, e várias de suas funções requerem interface com um sistema operacional.
 * Outros pacotes do ecossistema de Delégua, como `delegua-node` poderão lidar com
 * todas as funcionalidades de Tenda.
 */
export class AvaliadorSintaticoTenda extends AvaliadorSintaticoBase {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    tiposDefinidosEmCodigo: { [key: string]: Declaracao };
    pilhaEscopos: PilhaEscopos;
    tiposDeFerramentasExternas: { [key: string]: { [key: string]: string } };
    primitivasConhecidas: { [key: string]: InformacaoElementoSintatico };

    hashArquivo: number;
    atual: number;
    blocos: number;
    performance: boolean;
    superclasseAtual: string | undefined;

    constructor(performance = false) {
        super();
        this.hashArquivo = 0;
        this.atual = 0;
        this.blocos = 0;
        this.erros = [];
        this.performance = performance;
        this.tiposDefinidosEmCodigo = {};
        this.tiposDeFerramentasExternas = {};
        this.primitivasConhecidas = {};

        for (const [nomePrimitivaDicionario, dadosPrimitiva] of Object.entries(
            primitivasDicionario
        )) {
            this.primitivasConhecidas[nomePrimitivaDicionario] = new InformacaoElementoSintatico(
                nomePrimitivaDicionario,
                'dicionário',
                true,
                dadosPrimitiva.argumentos
            );
        }

        for (const [nomePrimitivaNumero, dadosPrimitiva] of Object.entries(primitivasNumero)) {
            this.primitivasConhecidas[nomePrimitivaNumero] = new InformacaoElementoSintatico(
                nomePrimitivaNumero,
                'número',
                true,
                dadosPrimitiva.argumentos
            );
        }

        for (const [nomePrimitivaTexto, dadosPrimitiva] of Object.entries(primitivasTexto)) {
            this.primitivasConhecidas[nomePrimitivaTexto] = new InformacaoElementoSintatico(
                nomePrimitivaTexto,
                'texto',
                true,
                dadosPrimitiva.argumentos
            );
        }

        for (const [nomePrimitivaVetor, dadosPrimitiva] of Object.entries(primitivasVetor)) {
            this.primitivasConhecidas[nomePrimitivaVetor] = new InformacaoElementoSintatico(
                nomePrimitivaVetor,
                'vetor',
                true,
                dadosPrimitiva.argumentos
            );
        }

        // TODO: Por enquanto não há necessidade de validar argumentos aqui, mas isso pode mudar no futuro.
        this.primitivasConhecidas['inteiro'] = new InformacaoElementoSintatico(
            'inteiro',
            'inteiro'
        );
        this.primitivasConhecidas['numero'] = new InformacaoElementoSintatico('numero', 'número');
        this.primitivasConhecidas['número'] = new InformacaoElementoSintatico('número', 'número');
        this.primitivasConhecidas['texto'] = new InformacaoElementoSintatico('texto', 'texto');

        this.pilhaEscopos = new PilhaEscopos();
    }

    protected verificarDefinicaoTipoAtual(): string {
        const tipos = [...Object.values(tipoDeDadosDelegua)];

        if (this.simbolos[this.atual].lexema in this.tiposDefinidosEmCodigo) {
            return this.simbolos[this.atual].lexema;
        }

        const lexemaElementar = this.simbolos[this.atual].lexema.toLowerCase();
        const tipoElementarResolvido = tipos.find((tipo) => tipo === lexemaElementar);
        if (!tipoElementarResolvido) {
            throw this.erro(
                this.simbolos[this.atual],
                `Tipo de dados desconhecido: '${this.simbolos[this.atual].lexema}'.`
            );
        }

        if (this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            const tiposVetores = [
                'inteiro[]',
                'numero[]',
                'número[]',
                'qualquer[]',
                'real[]',
                'texto[]',
            ];
            this.avancarEDevolverAnterior();

            if (!this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_DIREITO)) {
                throw this.erro(
                    this.simbolos[this.atual],
                    `Esperado símbolo de fechamento do vetor: ']'. Atual: ${this.simbolos[this.atual].lexema}`
                );
            }

            const tipoVetor = tiposVetores.find((tipo) => tipo === `${lexemaElementar}[]`);
            this.avancarEDevolverAnterior();
            return tipoVetor as TipoInferencia;
        }

        return tipoElementarResolvido as TipoInferencia;
    }

    protected async obterChaveDicionario(): Promise<Construto> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                return await this.primario();
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;
                if (simboloIdentificador.lexema in this.tiposDefinidosEmCodigo) {
                    tipoOperando = simboloIdentificador.lexema;
                } else {
                    tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                        simboloIdentificador.lexema
                    );
                }

                if (!['numero', 'número', 'texto', 'lógico'].includes(tipoOperando)) {
                    throw this.erro(
                        simboloIdentificador,
                        `Tipo ${tipoOperando} de identificador ${simboloIdentificador.lexema} não é válido como chave de dicionário.`
                    );
                }

                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                    return this.construtoTupla();
                }

                throw this.erro(
                    this.simbolos[this.atual],
                    `Esperado parêntese esquerdo após colchete esquerdo para definição de chave de dicionário. Atual: ${this.simbolos[this.atual].tipo}.`
                );
            default:
                throw this.erro(
                    this.simbolos[this.atual],
                    `Símbolo ${this.simbolos[this.atual].tipo} inesperado ou inválido como chave de dicionário.`
                );
        }
    }

    protected async construtoDicionario(
        simboloChaveEsquerda: SimboloInterface
    ): Promise<Dicionario> {
        this.avancarEDevolverAnterior();
        const chaves = [];
        const valores = [];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
            return new Dicionario(this.hashArquivo, Number(simboloChaveEsquerda.linha), [], []);
        }

        while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
            const chave = await this.obterChaveDicionario();
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
            const valor = await this.atribuir();

            chaves.push(chave);
            valores.push(valor);

            if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                this.consumir(
                    tiposDeSimbolos.VIRGULA,
                    'Esperado vírgula antes da próxima expressão.'
                );
            }
        }

        return new Dicionario(
            this.hashArquivo,
            Number(simboloChaveEsquerda.linha),
            chaves,
            valores
        );
    }

    protected async construtoTupla(): Promise<Tupla> {
        const expressao = await this.expressao();
        const argumentos = [expressao];
        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.VIRGULA) {
            this.avancarEDevolverAnterior();
            argumentos.push(await this.expressao());
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
        this.consumir(tiposDeSimbolos.COLCHETE_DIREITO, "Esperado ']' após a expressão.");
        return new SeletorTuplas(...argumentos) as Tupla;
    }

    override async primario(): Promise<Construto> {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                return await this.construtoDicionario(simboloAtual);

            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                valores = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(
                        this.hashArquivo,
                        Number(simboloAtual.linha),
                        [],
                        'qualquer[]'
                    );
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                        return await this.construtoTupla();
                    }

                    const valor = await this.atribuir();
                    valores.push(valor);
                    if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.COLCHETE_DIREITO) {
                        this.consumir(
                            tiposDeSimbolos.VIRGULA,
                            'Esperado vírgula antes da próxima expressão.'
                        );
                    }
                }

                const tipoVetor = inferirTipoVariavel(valores);
                return new Vetor(
                    this.hashArquivo,
                    Number(simboloAtual.linha),
                    valores,
                    tipoVetor
                );

            case tiposDeSimbolos.EXPRESSAO_REGULAR:
                let valor: string = '';
                let linhaAtual = this.simbolos[this.atual].linha;
                let eParExpressaoRegular =
                    this.simbolos.filter(
                        (l) =>
                            l.linha === linhaAtual && l.tipo === tiposDeSimbolos.EXPRESSAO_REGULAR
                    ).length %
                        2 ===
                    0;
                if (eParExpressaoRegular) {
                    this.avancarEDevolverAnterior();
                    while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.EXPRESSAO_REGULAR)) {
                        valor += this.simbolos[this.atual].lexema || '';
                        this.avancarEDevolverAnterior();
                    }
                    this.avancarEDevolverAnterior();
                    return new ExpressaoRegular(this.hashArquivo, simboloAtual, valor);
                }

            case tiposDeSimbolos.FALSO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), false, 'lógico');

            case tiposDeSimbolos.FUNÇÃO:
                const simboloFuncao = this.avancarEDevolverAnterior();
                // Avançamos o parêntese esquerdo aqui, porque `corpoDaFuncao`
                // espera que esse parêntese esquerdo já foi consumido.
                this.consumir(
                    tiposDeSimbolos.PARENTESE_ESQUERDO,
                    "Esperado parêntese esquerdo após palavra reservada 'função'."
                );
                const corpoDaFuncao = await this.corpoDaFuncao(simboloFuncao.lexema as any);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;

            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;
                if (simboloIdentificador.lexema in this.tiposDefinidosEmCodigo) {
                    tipoOperando = simboloIdentificador.lexema;
                } else {
                    tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                        simboloIdentificador.lexema
                    );
                }

                // Se o próximo símbolo é um incremento ou um decremento,
                // aqui deve retornar um unário correspondente.
                // Caso contrário, apenas retornar um construto de variável.
                if (
                    this.simbolos[this.atual] &&
                    [tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(
                        this.simbolos[this.atual].tipo
                    )
                ) {
                    const simboloIncrementoDecremento: SimboloInterface =
                        this.avancarEDevolverAnterior();
                    return new Unario(
                        this.hashArquivo,
                        simboloIncrementoDecremento,
                        new Variavel(
                            this.hashArquivo,
                            simboloIdentificador,
                            tipoOperando || 'qualquer'
                        ),
                        'DEPOIS'
                    );
                }

                return new Variavel(
                    this.hashArquivo,
                    simboloIdentificador,
                    tipoOperando || 'qualquer'
                );

            case tiposDeSimbolos.LEIA:
                return this.expressaoLeia();

            case tiposDeSimbolos.NADA:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), null, 'nulo');

            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.NÚMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloNumeroTexto: SimboloInterface = this.avancarEDevolverAnterior();
                const tipoInferido = inferirTipoVariavel(simboloNumeroTexto.literal);
                return new Literal(
                    this.hashArquivo,
                    Number(simboloNumeroTexto.linha),
                    simboloNumeroTexto.literal,
                    tipoInferido as TipoInferencia
                );

            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = await this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.SUPER:
                const simboloSuper = this.avancarEDevolverAnterior();
                if (!this.superclasseAtual) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        "'Super' usado fora de declaração de classe com herança."
                    );
                }

                return new Super(this.hashArquivo, simboloSuper, this.superclasseAtual);

            case tiposDeSimbolos.VERDADEIRO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), true, 'lógico');
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    override async chamar(): Promise<Construto> {
        let expressao = await this.primario();

        while (true) {
            let tipoPrimitiva: string = undefined;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = await this.finalizarChamada(expressao, tipoPrimitiva);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome de método ou propriedade após '.'."
                );

                tipoPrimitiva = expressao.tipo;
                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = await this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(
                    this.hashArquivo,
                    expressao,
                    indice,
                    simboloFechamento
                );
            } else {
                break;
            }
        }

        return expressao;
    }

    /**
     * `AcessoMetodoOuPropriedade` é um construto intermediário em Delégua, e deve ser resolvido como outro
     * construto antes de qualquer outra próxima etapa. Algumas validações adicionais também ocorrem aqui.
     * @param {AcessoMetodoOuPropriedade} entidadeChamadaResolvida O construto original.
     * @returns {Construto} O construto resolvido como um tipo mais específico.
     * @see finalizarChamada
     */
    protected resolverEntidadeChamadaAcessoMetodoOuPropriedade(
        entidadeChamadaResolvida: AcessoMetodoOuPropriedade
    ): Construto {
        const construtoTipado: AcessoMetodoOuPropriedade = entidadeChamadaResolvida;
        switch (entidadeChamadaResolvida.tipo) {
            case tipoDeDadosDelegua.DICIONARIO:
            case tipoDeDadosDelegua.DICIONÁRIO:
                if (!(construtoTipado.simbolo.lexema in primitivasDicionario)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de dicionário.`
                    );
                }

                const primitivaDicionarioSelecionada =
                    primitivasDicionario[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaDicionarioSelecionada.tipoRetorno
                );

            case tipoDeDadosDelegua.INTEIRO:
            case tipoDeDadosDelegua.NUMERO:
            case tipoDeDadosDelegua.NÚMERO:
                if (!(construtoTipado.simbolo.lexema in primitivasNumero)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de número.`
                    );
                }

                const primitivaNumeroSelecionada = primitivasNumero[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaNumeroSelecionada.tipoRetorno
                );

            case tipoDeDadosDelegua.MODULO:
            case tipoDeDadosDelegua.MÓDULO:
                if (construtoTipado.simbolo.lexema in this.tiposDefinidosEmCodigo) {
                    // Construtor de classe.
                    return new Variavel(
                        construtoTipado.hashArquivo,
                        construtoTipado.simbolo,
                        construtoTipado.objeto.tipo
                    );
                }

                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema
                );

            case tipoDeDadosDelegua.TEXTO:
                if (!(construtoTipado.simbolo.lexema in primitivasTexto)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de texto.`
                    );
                }

                const primitivaTextoSelecionada = primitivasTexto[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaTextoSelecionada.tipoRetorno
                );
            case tipoDeDadosDelegua.VETOR:
            case tipoDeDadosDelegua.VETOR_NUMERO:
            case tipoDeDadosDelegua.VETOR_NÚMERO:
            case tipoDeDadosDelegua.VETOR_TEXTO:
                if (!(construtoTipado.simbolo.lexema in primitivasVetor)) {
                    throw this.erro(
                        construtoTipado.simbolo,
                        `${construtoTipado.simbolo.lexema} não é uma primitiva de vetor.`
                    );
                }

                const primitivaVetorSelecionada = primitivasVetor[construtoTipado.simbolo.lexema];
                return new AcessoMetodo(
                    construtoTipado.hashArquivo,
                    construtoTipado.objeto,
                    construtoTipado.simbolo.lexema,
                    primitivaVetorSelecionada.tipoRetorno
                );
        }

        return entidadeChamadaResolvida;
    }

    protected validarArgumentosEntidadeChamada(
        argumentosEntidadeChamada: InformacaoElementoSintatico[],
        argumentosUtilizados: Construto[]
    ): string[] {
        if (argumentosEntidadeChamada.length === 0) {
            return [];
        }

        const possiveisErros = [];
        for (const [indice, argumentoEntidadeChamada] of argumentosEntidadeChamada.entries()) {
            const argumentoUtilizado = argumentosUtilizados[indice];
            if (argumentoUtilizado.tipo === null || argumentoUtilizado.tipo === undefined) {
                continue;
            }

            const argumentoEntidadeChamadaVetor = argumentoEntidadeChamada.tipo.endsWith('[]');
            const argumentoUtilizadoVetor = argumentoUtilizado.tipo.endsWith('[]');

            if (argumentoEntidadeChamadaVetor !== argumentoUtilizadoVetor) {
                possiveisErros.push(
                    `Argumento: ${argumentoEntidadeChamada.nome}. Tipo esperado: ${argumentoEntidadeChamada.tipo}; Tipo utilizado: ${argumentoUtilizado.tipo}`
                );
                continue;
            }

            const argumentoEntidadeChamadaQualquer =
                argumentoEntidadeChamada.tipo.startsWith('qualquer');
            if (argumentoEntidadeChamadaQualquer) {
                continue;
            }

            if (argumentoUtilizado.tipo !== argumentoEntidadeChamada.tipo) {
                possiveisErros.push(
                    `Argumento: ${argumentoEntidadeChamada.nome}. Tipo esperado: ${argumentoEntidadeChamada.tipo}; Tipo utilizado: ${argumentoUtilizado.tipo}`
                );
            }
        }

        return possiveisErros;
    }

    /**
     * Diversas verificações de resolução de entidade chamada, como resolver chamada da pilha ou usar referência, argumentos, etc.
     * @param entidadeChamada O construto da entidade chamada.
     * @param argumentos Os argumentos utilizados na chamada.
     * @param tipoPrimitiva Se for uma primitiva, o tipo dela. Senão, `undefined`.
     * @returns A entidade chamada resolvida, se as validações passarem.
     */
    protected resolverEntidadeChamada(
        entidadeChamada: Construto,
        argumentos: Construto[],
        tipoPrimitiva: string | undefined = undefined
    ): Construto {
        if (entidadeChamada.constructor === Variavel) {
            const entidadeChamadaResolvidaVariavel = entidadeChamada as Variavel;

            if (tipoPrimitiva === undefined) {
                // Provavelmente uma chamada a alguma função da biblioteca global.
                const informacoesPossivelFuncaoBibliotecaGlobal =
                    this.pilhaEscopos.obterBibliotecaGlobal(
                        entidadeChamadaResolvidaVariavel.simbolo.lexema
                    );
                if (informacoesPossivelFuncaoBibliotecaGlobal !== undefined) {
                    const erros = this.validarArgumentosEntidadeChamada(
                        informacoesPossivelFuncaoBibliotecaGlobal.subElementos as InformacaoElementoSintatico[],
                        argumentos
                    );
                    if (erros.length > 0) {
                        throw new ErroAvaliadorSintatico(
                            entidadeChamadaResolvidaVariavel.simbolo,
                            `Erros ao resolver argumentos de chamada a ${entidadeChamadaResolvidaVariavel.simbolo.lexema}: \n${erros.reduce((mensagem, erro) => (mensagem += `${erro}\n`), '')}`
                        );
                    }

                    return entidadeChamadaResolvidaVariavel;
                }
            }

            if (
                tipoPrimitiva !== undefined &&
                this.primitivasConhecidas.hasOwnProperty(
                    entidadeChamadaResolvidaVariavel.simbolo.lexema
                )
            ) {
                var informacoesPrimitiva =
                    this.primitivasConhecidas[entidadeChamadaResolvidaVariavel.simbolo.lexema];
                const erros = this.validarArgumentosEntidadeChamada(
                    informacoesPrimitiva.subElementos as InformacaoElementoSintatico[],
                    argumentos
                );
                if (erros.length > 0) {
                    throw new ErroAvaliadorSintatico(
                        entidadeChamadaResolvidaVariavel.simbolo,
                        `Erros ao resolver argumentos de chamada a ${entidadeChamadaResolvidaVariavel.simbolo.lexema}: \n${erros.reduce((mensagem, erro) => (mensagem += `${erro}\n`), '')}`
                    );
                }

                return entidadeChamadaResolvidaVariavel;
            }

            if (entidadeChamadaResolvidaVariavel.simbolo.lexema in this.tiposDefinidosEmCodigo) {
                return entidadeChamadaResolvidaVariavel;
            }

            const possivelReferencia = this.pilhaEscopos.obterReferenciaFuncao(
                entidadeChamadaResolvidaVariavel.simbolo.lexema
            );

            if (possivelReferencia !== null) {
                return new ReferenciaFuncao(
                    (entidadeChamada as Construto).hashArquivo,
                    (entidadeChamada as Construto).linha,
                    entidadeChamadaResolvidaVariavel.simbolo,
                    entidadeChamadaResolvidaVariavel.tipo,
                    possivelReferencia.id
                );
            }

            return new ArgumentoReferenciaFuncao(
                (entidadeChamada as Construto).hashArquivo,
                (entidadeChamada as Construto).linha,
                entidadeChamadaResolvidaVariavel.simbolo
            );
        }

        if (entidadeChamada.constructor === AcessoMetodoOuPropriedade) {
            return this.resolverEntidadeChamadaAcessoMetodoOuPropriedade(
                entidadeChamada as AcessoMetodoOuPropriedade
            );
        }

        return entidadeChamada;
    }

    protected async declaracaoDeFuncao(
        identificador: SimboloInterface<string>
    ): Promise<FuncaoDeclaracao> {
        // Se houver chamadas recursivas à função, precisamos definir um tipo
        // para ela. Vai ser atualizado após avaliação do corpo da função.
        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, 'qualquer')
        );

        const corpoDaFuncao = await this.corpoDaFuncao('implícita');
        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, corpoDaFuncao.tipo)
        );
        const funcaoDeclaracao = new FuncaoDeclaracao(
            identificador,
            corpoDaFuncao,
            corpoDaFuncao.tipo
        );
        this.pilhaEscopos.registrarReferenciaFuncao(identificador.lexema, funcaoDeclaracao);
        return funcaoDeclaracao;
    }

    override async finalizarChamada(
        entidadeChamada: Construto,
        tipoPrimitiva: string | undefined = undefined
    ): Promise<Chamada> {
        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                // `apply()` em JavaScript aceita até 255 parâmetros.
                if (argumentos.length >= 255) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Não pode haver mais de 255 argumentos.'
                    );
                }
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        // Toda chamada precisa saber de antemão qual o tipo resolvido.
        const entidadeChamadaResolvida = this.resolverEntidadeChamada(
            entidadeChamada,
            argumentos,
            tipoPrimitiva
        );

        // TODO: Criar forma de validar tipos dos argumentos da entidade chamada.
        const construtoChamada = new Chamada(
            this.hashArquivo,
            entidadeChamadaResolvida,
            argumentos
        );
        construtoChamada.tipo = 'qualquer';
        return construtoChamada;
    }

    override async unario(): Promise<Construto> {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NÃO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT,
                tiposDeSimbolos.INCREMENTAR,
                tiposDeSimbolos.DECREMENTAR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.unario();
            return new Unario(this.hashArquivo, operador, direito, 'ANTES');
        }

        return await this.chamar();
    }

    override async multiplicar(): Promise<Construto> {
        let expressao = await this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MODULO,
                tiposDeSimbolos.MULTIPLICACAO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.exponenciacao();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    /**
     * Se símbolo de operação é `+`, `-`, `+=` ou `-=`, monta objeto `Binario` para
     * ser avaliado pelo Interpretador.
     * @returns Um Construto, normalmente um `Binario`, ou `Unario` se houver alguma operação unária para ser avaliada.
     */
    override async adicaoOuSubtracao(): Promise<Construto> {
        let expressao = await this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)
        ) {
            const operador = this.simbolos[this.atual - 1];

            const direito = await this.multiplicar();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async bitShift(): Promise<Construto> {
        let expressao = await this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.adicaoOuSubtracao();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async bitE(): Promise<Construto> {
        let expressao = await this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.bitShift();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async bitOu(): Promise<Construto> {
        let expressao = await this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.bitE();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async comparar(): Promise<Construto> {
        let expressao = await this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.bitOu();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async comparacaoIgualdade(): Promise<Construto> {
        let expressao = await this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NÃO, tiposDeSimbolos.É)) {
            const operador = this.simbolos[this.atual - 1];
            if (operador.tipo === tiposDeSimbolos.NÃO) {
                this.consumir(tiposDeSimbolos.É, `Esperado 'é' após 'não'.`);
                operador.tipo = tiposDeSimbolos.DIFERENTE;
                operador.lexema = 'não é';
                operador.literal = 'não é';
            }

            const direito = await this.comparar();
            expressao = new Binario<TipoDeSimboloDelegua>(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    override async em(): Promise<Construto> {
        let expressao = await this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TEM)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    override async e(): Promise<Construto> {
        let expressao = await this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoPorIndice`.
     */
    override async atribuir(): Promise<Construto> {
        const expressao = await this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simbolos[this.atual - 1];
            const valor = await this.atribuir();

            switch (expressao.constructor) {
                case Variavel:
                    return new Atribuir(this.hashArquivo, expressao, valor);
                case AcessoMetodoOuPropriedade:
                    const expressaoAcessoMetodoOuPropriedade =
                        expressao as AcessoMetodoOuPropriedade;
                    return new DefinirValor(
                        this.hashArquivo,
                        igual.linha,
                        expressaoAcessoMetodoOuPropriedade.objeto,
                        expressaoAcessoMetodoOuPropriedade.simbolo,
                        valor
                    );
                case AcessoIndiceVariavel:
                    const expressaoAcessoIndiceVariavel = expressao as AcessoIndiceVariavel;
                    return new AtribuicaoPorIndice(
                        this.hashArquivo,
                        expressaoAcessoIndiceVariavel.linha,
                        expressaoAcessoIndiceVariavel.entidadeChamada,
                        expressaoAcessoIndiceVariavel.indice,
                        valor
                    );
            }

            throw this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    /**
     * Declaração para comando `leia`, para ler dados de entrada do usuário.
     * @returns Um objeto da classe `Leia`.
     */
    override async expressaoLeia(): Promise<Leia> {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos argumentos em instrução `leia`."
        );

        const argumentos: Construto[] = [];

        if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_DIREITO) {
            do {
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os argumentos em instrução `leia`."
        );

        return new Leia(simboloLeia, argumentos);
    }

    // TODO: Depreciar.
    override async expressao(): Promise<Construto> {
        return await this.atribuir();
    }

    override async blocoEscopo(tipo?: string): Promise<Array<Declaracao>> {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        let declaracoes: Array<Declaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM) && !this.estaNoFinal()) {
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        this.consumir(
            tiposDeSimbolos.FIM,
            `Esperado 'fim' para concluir bloco de escopo ${tipo ? 'de ' + tipo : ''}.`
        );
        this.pilhaEscopos.removerUltimo();

        return declaracoes;
    }

    protected declaracaoComentarioUmaLinha(): Comentario {
        const simboloComentario = this.avancarEDevolverAnterior();
        return new Comentario(
            simboloComentario.hashArquivo,
            simboloComentario.linha,
            simboloComentario.literal,
            false
        );
    }

    override declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            throw this.erro(
                this.simbolos[this.atual - 1],
                "'continua' precisa estar em um laço de repetição."
            );
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Continua(this.simbolos[this.atual - 1]);
    }

    override async declaracaoEnquanto(): Promise<Enquanto> {
        try {
            const simboloEnquanto = this.simbolos[this.atual - 1];
            this.blocos += 1;

            const condicao = await this.expressao();

            this.consumir(tiposDeSimbolos.FAÇA, "Esperado 'faça' depois da condição.");

            const blocoCorpo = await this.blocoEscopo('enquanto');

            return new Enquanto(
                condicao,
                new Bloco(simboloEnquanto.linha, simboloEnquanto.hashArquivo, blocoCorpo)
            );
        } finally {
            this.blocos -= 1;
        }
    }

    override async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Construto[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                argumentos.push(await this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        // Ponto-e-vírgula é opcional aqui.
        // this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    protected async declaracaoExpressao(): Promise<Expressao> {
        const expressao = await this.expressao();
        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Expressao(expressao);
    }

    override async declaracaoPara(): Promise<Para | ParaCada> {
        const simboloPara: SimboloInterface = this.simbolos[this.atual - 1];
        this.consumir(tiposDeSimbolos.CADA, `Esperado palavra reservada 'cada' após 'para'.`);
        this.blocos += 1;

        const nomeVariavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável de iteração para instrução 'para cada'."
        );

        this.consumir(
            tiposDeSimbolos.EM,
            "Esperado palavra reservada 'em' após variável de iteração em instrução 'para cada'."
        );

        // Se for um literal ou identificador numérico, segue um `para`
        // tradicional de Delégua, com variável de controle e passo positivo, incrementado em 1.
        const literalOuVariavelInicio = await this.adicaoOuSubtracao();
        this.blocos -= 1;
        switch (literalOuVariavelInicio.constructor) {
            case Literal:
                return await this.declaracaoParaTradicional(
                    simboloPara,
                    nomeVariavelIteracao,
                    literalOuVariavelInicio
                );
            // TODO: Terminar
            default:
                return await this.declaracaoParaCada(
                    simboloPara,
                    nomeVariavelIteracao,
                    literalOuVariavelInicio
                );
        }
    }

    protected async declaracaoParaCada(
        simboloParaCada: SimboloInterface,
        simboloVariavelIteracao: SimboloInterface,
        literalOuVariavelIteravel: Construto
    ): Promise<ParaCada> {
        const tipoVetor = (literalOuVariavelIteravel as any).tipo as string;
        // TODO: Permitir 'qualquer' aqui é bastante frágil. Criar uma forma de validar o tipo
        // antes dessa avaliação.
        if (!tipoVetor.endsWith('[]') && !['qualquer', 'vetor'].includes(tipoVetor)) {
            throw this.erro(
                simboloParaCada,
                `Variável ou constante em 'para cada' não é iterável. Tipo resolvido: ${tipoVetor}.`
            );
        }

        let tipoVariavelIteracao = 'qualquer';
        if (tipoVetor.endsWith('[]')) {
            tipoVariavelIteracao = tipoVetor.slice(0, -2);
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            simboloVariavelIteracao.lexema,
            new InformacaoElementoSintatico(simboloVariavelIteracao.lexema, tipoVariavelIteracao)
        );

        this.consumir(
            tiposDeSimbolos.FAÇA,
            "Esperado palavra reservada 'faça' após literal ou variável de iteração em declaração 'para cada'."
        );

        const corpo: Array<Declaracao> = await this.blocoEscopo();

        return new ParaCada(
            this.hashArquivo,
            Number(simboloParaCada.linha),
            new Variavel(this.hashArquivo, simboloVariavelIteracao),
            literalOuVariavelIteravel,
            new Bloco(simboloParaCada.hashArquivo, simboloParaCada.linha, corpo)
        );
    }

    protected async declaracaoParaTradicional(
        simboloPara: SimboloInterface,
        simboloVariavelIteracao: SimboloInterface,
        literalOuVariavelInicio: Construto
    ): Promise<Para> {
        this.consumir(
            tiposDeSimbolos.ATÉ,
            "Esperado palavra reservada 'até' após literal ou identificador de início de declaração 'para cada'."
        );

        const literalOuVariavelFim = await this.adicaoOuSubtracao();

        this.consumir(
            tiposDeSimbolos.FAÇA,
            "Esperado palavra reservada 'faça' após literal ou variável de passo final em declaração 'para cada'."
        );

        // A variável de iteração precisa ser definida aqui, para que o corpo de `para cada` (um escopo)
        // seja capaz de reconhecer a variável e seu tipo.
        this.pilhaEscopos.definirInformacoesVariavel(
            simboloVariavelIteracao.lexema,
            new InformacaoElementoSintatico(simboloVariavelIteracao.lexema, 'inteiro')
        );

        const corpo: Array<Declaracao> = await this.blocoEscopo();

        // `variavelIteracao <= valorFinal`
        let operadorCondicao = new Simbolo(
            tiposDeSimbolos.MENOR_IGUAL,
            '<=',
            null,
            Number(simboloPara.linha),
            this.hashArquivo
        );
        let operadorCondicaoIncremento = new Simbolo(
            tiposDeSimbolos.MENOR,
            '<',
            null,
            Number(simboloPara.linha),
            this.hashArquivo
        );

        return new Para(
            this.hashArquivo,
            Number(simboloPara.linha),
            // Inicialização.
            new Expressao(
                new Atribuir(
                    this.hashArquivo,
                    new Variavel(this.hashArquivo, simboloVariavelIteracao, 'inteiro'),
                    literalOuVariavelInicio
                )
            ),
            // Condição.
            new Binario(
                this.hashArquivo,
                new Variavel(this.hashArquivo, simboloVariavelIteracao, 'inteiro'),
                operadorCondicao,
                literalOuVariavelFim
            ),
            // Incremento, feito em construto especial `FimPara`.
            new FimPara(
                this.hashArquivo,
                Number(simboloPara.linha),
                new Binario(
                    this.hashArquivo,
                    new Variavel(this.hashArquivo, simboloVariavelIteracao, 'inteiro'),
                    operadorCondicaoIncremento,
                    literalOuVariavelFim
                ),
                new Expressao(
                    new Atribuir(
                        this.hashArquivo,
                        new Variavel(this.hashArquivo, simboloVariavelIteracao, 'inteiro'),
                        new Binario(
                            this.hashArquivo,
                            new Variavel(this.hashArquivo, simboloVariavelIteracao, 'inteiro'),
                            new Simbolo(
                                tiposDeSimbolos.ADICAO,
                                '+',
                                null,
                                Number(simboloPara.linha),
                                this.hashArquivo
                            ),
                            new Literal(this.hashArquivo, Number(simboloPara.linha), 1)
                        )
                    )
                )
            ),
            new Bloco(simboloPara.hashArquivo, simboloPara.linha, corpo)
        );
    }

    override async declaracaoRetorna(): Promise<Retorna> {
        const simboloChave = this.simbolos[this.atual - 1];
        let valor = null;

        if (
            [
                tiposDeSimbolos.CHAVE_ESQUERDA,
                tiposDeSimbolos.COLCHETE_ESQUERDO,
                tiposDeSimbolos.FALSO,
                tiposDeSimbolos.FUNÇÃO,
                tiposDeSimbolos.IDENTIFICADOR,
                tiposDeSimbolos.ISTO,
                tiposDeSimbolos.NÃO,
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.NADA,
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                tiposDeSimbolos.SUPER,
                tiposDeSimbolos.TEXTO,
                tiposDeSimbolos.VERDADEIRO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = await this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Retorna(simboloChave, valor);
    }

    override async declaracaoSe(): Promise<Se> {
        const condicao = await this.expressao();

        this.consumir(tiposDeSimbolos.ENTÃO, "Esperado 'então' após a condição.");

        const caminhoEntao = (await this.resolverDeclaracao()) as Bloco;

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENÃO)) {
            caminhoSenao = await this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    override declaracaoSustar(): Sustar {
        if (this.blocos < 1) {
            throw this.erro(
                this.simbolos[this.atual - 1],
                "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
            );
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Sustar(this.simbolos[this.atual - 1]);
    }

    /**
     * Todas as resoluções triviais da linguagem, ou seja, todas as
     * resoluções que podem ocorrer dentro ou fora de um bloco.
     * @returns Normalmente uma `Declaracao`, mas há casos em que
     * outros objetos podem ser retornados.
     * @see resolverDeclaracaoForaDeBloco para as declarações que não podem
     * ocorrer em blocos de escopo elementares.
     */
    protected async resolverDeclaracao(): Promise<Declaracao | Declaracao[]> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.COMENTARIO:
                return this.declaracaoComentarioUmaLinha();
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.EXIBA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscreva();
            case tiposDeSimbolos.FAÇA:
                this.avancarEDevolverAnterior();
                return await this.blocoEscopo();
            case tiposDeSimbolos.PARA:
                this.avancarEDevolverAnterior();
                return this.declaracaoPara();
            case tiposDeSimbolos.PAUSA:
            case tiposDeSimbolos.SUSTAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoSustar();
            case tiposDeSimbolos.SE:
                this.avancarEDevolverAnterior();
                return this.declaracaoSe();
            case tiposDeSimbolos.RETORNA:
                this.avancarEDevolverAnterior();
                return this.declaracaoRetorna();
            case tiposDeSimbolos.TENTE:
                this.avancarEDevolverAnterior();
                return await this.declaracaoTente();
            case tiposDeSimbolos.SEJA:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeVariaveisOuFuncoes();
        }

        const simboloAtual = this.simbolos[this.atual];
        if (simboloAtual.tipo === tiposDeSimbolos.IDENTIFICADOR) {
            // Pela gramática, a seguinte situação não pode ocorrer:
            // 1. O símbolo anterior ser um identificador; e
            // 2. O símbolo anterior estar na mesma linha do identificador atual.

            const simboloAnterior = this.simbolos[this.atual - 1];
            if (
                !!simboloAnterior &&
                simboloAnterior.tipo === tiposDeSimbolos.IDENTIFICADOR &&
                simboloAnterior.linha === simboloAtual.linha
            ) {
                throw this.erro(
                    this.simbolos[this.atual],
                    'Não é permitido ter dois identificadores seguidos na mesma linha.'
                );
            }
        }

        return await this.declaracaoExpressao();
    }

    protected logicaComumInferenciaTiposVariaveis(inicializador: Construto): string {
        switch (inicializador.constructor) {
            case AcessoIndiceVariavel:
                const entidadeChamadaAcessoIndiceVariavel = (inicializador as AcessoIndiceVariavel)
                    .entidadeChamada;
                return entidadeChamadaAcessoIndiceVariavel.tipo.slice(0, -2);
            case Chamada:
                const entidadeChamadaChamada = (inicializador as Chamada).entidadeChamada;
                switch (entidadeChamadaChamada.constructor) {
                    case AcessoMetodo:
                        const entidadeChamadaAcessoMetodo = entidadeChamadaChamada as AcessoMetodo;
                        return entidadeChamadaAcessoMetodo.tipoRetornoMetodo;
                    case AcessoMetodoOuPropriedade:
                        // Este caso ocorre quando a variável/constante é do tipo 'qualquer',
                        // e a chamada normalmente é feita para uma primitiva.
                        // A inferência, portanto, ocorre pelo uso da primitiva.
                        const entidadeChamadaAcessoMetodoOuPropriedade =
                            entidadeChamadaChamada as AcessoMetodoOuPropriedade;
                        if (
                            this.primitivasConhecidas.hasOwnProperty(
                                entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema
                            )
                        ) {
                            return this.primitivasConhecidas[
                                entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema
                            ].tipo;
                        }

                        throw new ErroAvaliadorSintatico(
                            entidadeChamadaAcessoMetodoOuPropriedade.simbolo,
                            `Primitiva '${entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema}' não existe.`
                        );
                    case AcessoPropriedade:
                        const entidadeChamadaAcessoPropriedade =
                            entidadeChamadaChamada as AcessoPropriedade;
                        return entidadeChamadaAcessoPropriedade.tipoRetornoPropriedade;
                    case ArgumentoReferenciaFuncao:
                        // TODO: Voltar aqui se necessário.
                        return 'qualquer';
                    case ReferenciaFuncao:
                        const entidadeChamadaReferenciaFuncao =
                            entidadeChamadaChamada as ReferenciaFuncao;
                        return entidadeChamadaReferenciaFuncao.tipo;
                    case Variavel:
                        const entidadeChamadaVariavel = entidadeChamadaChamada as Variavel;
                        return entidadeChamadaVariavel.tipo;
                }

                break;
            case FuncaoConstruto:
                const funcaoConstruto = inicializador as FuncaoConstruto;
                return `função<${funcaoConstruto.tipo}>`;
            case Leia:
                return 'texto';
            case Dupla:
            case Trio:
            case Quarteto:
            case Quinteto:
            case Sexteto:
            case Septeto:
            case Octeto:
            case Noneto:
            case Deceto:
                return tipoDeDadosDelegua.TUPLA;
            default:
                return inicializador.tipo;
        }
    }

    /**
     * Após palavra reservada `seja`, é esperado ou uma variável, ou uma função.
     * @returns Um Construto, ou do tipo `Var` para variável, ou do tipo `FuncaoDeclaracao` se for
     *          declaração de função.
     */
    protected async declaracaoDeVariaveisOuFuncoes(): Promise<Var | FuncaoDeclaracao> {
        const identificador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da variável ou função.'
        );

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            return this.declaracaoDeFuncao(identificador);
        }

        this.consumir(
            tiposDeSimbolos.IGUAL,
            "Esperado símbolo de igual após nome de identificador em declaração 'seja'."
        );

        const inicializador = await this.expressao();
        const tipo = this.logicaComumInferenciaTiposVariaveis(inicializador);
        this.pilhaEscopos.definirInformacoesVariavel(
            identificador.lexema,
            new InformacaoElementoSintatico(identificador.lexema, tipo)
        );

        return new Var(identificador, inicializador, tipo);
    }

    protected async logicaComumParametros(): Promise<ParametroInterface[]> {
        const parametros: ParametroInterface[] = [];

        do {
            const parametro: Partial<ParametroInterface> = {};

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const valorPadrao = await this.primario();
                parametro.valorPadrao = valorPadrao;
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                let tipoDadoParametro = this.verificarDefinicaoTipoAtual();
                parametro.tipoDado = tipoDadoParametro;
                this.avancarEDevolverAnterior();
            }

            this.pilhaEscopos.definirInformacoesVariavel(
                parametro.nome.lexema,
                new InformacaoElementoSintatico(
                    parametro.nome.lexema,
                    parametro.tipoDado || 'qualquer'
                )
            );

            parametros.push(parametro as ParametroInterface);
            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    override async corpoDaFuncao(tipo: 'função' | 'implícita'): Promise<FuncaoConstruto> {
        // O parêntese esquerdo aqui é o símbolo atual.
        // Ele já foi lido neste ponto.
        const parenteseEsquerdo = this.simbolos[this.atual];

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = await this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        switch (tipo) {
            case 'função':
                this.consumir(
                    tiposDeSimbolos.SUBTRACAO,
                    'Esperado seta após fechamento de parênteses para declaração de função.'
                );
                this.consumir(
                    tiposDeSimbolos.MAIOR,
                    'Esperado seta após fechamento de parênteses para declaração de função.'
                );
                break;
            case 'implícita':
                this.consumir(
                    tiposDeSimbolos.IGUAL,
                    'Esperado sinal de igual após fechamento de parênteses para declaração de função.'
                );
                break;
        }

        const corpo = (await this.resolverDeclaracao()) as Bloco;
        // Se o corpo for uma `Expressao`, corpo é convertido para `Retorna`.
        // Tenda trabalha com retornos implícitos.
        let corpoResolvido = [];
        if (corpo.constructor === Expressao) {
            const expressaoComoRetorna = new Retorna(
                new Simbolo(
                    tiposDeSimbolos.RETORNA,
                    'retorna',
                    'retorna',
                    parenteseEsquerdo.linha,
                    this.hashArquivo
                ),
                (corpo as any).expressao
            );
            corpoResolvido.push(expressaoComoRetorna);
        } else {
            // TODO: Verificar se `corpo` é sempre um Array aqui.
            corpoResolvido = corpo as unknown as Declaracao[];
        }

        // TODO: Inferir o tipo de retorno corretamente.
        return new FuncaoConstruto(
            this.hashArquivo,
            Number(parenteseEsquerdo.linha),
            parametros,
            corpoResolvido,
            'qualquer'
        );
    }

    /**
     * Até então, Tenda não tem casos de declarações fora de blocos.
     * Isso pode mudar futuramente. Portanto, esta seção será mantida.
     * @returns Uma `Declaracao` ou várias, dependendo do retorno de `resolverDeclaracao`.
     * @see resolverDeclaracao
     */
    override async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        try {
            return await this.resolverDeclaracao();
        } catch (erro: any) {
            this.sincronizar();
            this.erros.push(erro);
            return null;
        }
    }

    /**
     * Usado quando há erros na avaliação sintática.
     * Garante que o código não entre em loop infinito.
     * @returns Sempre retorna `void`.
     */
    protected sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            const tipoSimboloAtual: string = this.simbolos[this.atual - 1].tipo;

            switch (tipoSimboloAtual) {
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.VARIAVEL:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.EXIBA:
                case tiposDeSimbolos.RETORNA:
                    return;
            }

            this.avancarEDevolverAnterior();
        }
    }

    /**
     * Inicializa o primeiro nível da pilha de escopos, normalmente com ítens da biblioteca global.
     */
    protected inicializarPilhaEscopos() {
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        // TODO: Escrever algum tipo de validação aqui.
        for (const tipos of Object.values(this.tiposDeFerramentasExternas)) {
            for (const [nomeTipo, tipo] of Object.entries(tipos)) {
                this.pilhaEscopos.definirInformacoesVariavel(
                    nomeTipo,
                    new InformacaoElementoSintatico(nomeTipo, tipo)
                );
            }
        }
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.tiposDefinidosEmCodigo = {};
        this.inicializarPilhaEscopos();

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else if (retornoDeclaracao !== null) {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        if (this.performance) {
            const deltaAnalise: [number, number] = hrtime(inicioAnalise);
            // eslint-disable-next-line no-undef
            console.log(
                `[Avaliador Sintático Tenda] Tempo para análise: ${deltaAnalise[0] * 1e9 + deltaAnalise[1]}ns`
            );
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
