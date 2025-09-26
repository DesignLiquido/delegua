import hrtime from 'browser-process-hrtime';

import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Construto,
    Dicionario,
    FuncaoConstruto,
    Isto,
    Literal,
    Logico,
    Super,
    Unario,
    Variavel,
    Vetor,
    Leia,
    AcessoMetodo,
    AcessoPropriedade,
    ReferenciaFuncao,
    ComentarioComoConstruto,
    ParaCadaComoConstruto,
} from '../../construtos';
import {
    Escreva,
    Se,
    Enquanto,
    Para,
    Continua,
    Retorna,
    Escolha,
    Importar,
    Tente,
    Fazer,
    Var,
    FuncaoDeclaracao,
    Classe,
    Declaracao,
    Expressao,
    Bloco,
    Sustar,
    Falhar,
    ParaCada,
} from '../../declaracoes';

import {
    AvaliadorSintaticoInterface,
    ParametroInterface,
    SimboloInterface,
} from '../../interfaces';
import { Pragma } from '../../lexador/dialetos/pragma';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoPrimario } from '../retornos';

import { Simbolo } from '../../lexador';
import {
    inferirTipoVariavel,
    TipoInferencia,
    tipoInferenciaParaTipoDadosElementar,
} from '../../inferenciador';
import { TipoDadosElementar } from '../../tipo-dados-elementar';

import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import {
    logicaDescobertaRetornoFuncao as logicaValidacaoRetornoFuncao,
    registrarPrimitiva,
} from '../comum';

import tiposDeDadosPitugues from '../../tipos-de-dados/dialetos/pitugues';
import tiposDeSimbolos from '../../tipos-de-simbolos/pitugues';

import primitivasDicionario from '../../bibliotecas/primitivas-dicionario';
import primitivasNumero from '../../bibliotecas/primitivas-numero';
import primitivasTexto from '../../bibliotecas/primitivas-texto';
import primitivasVetor from '../../bibliotecas/primitivas-vetor';
import { ListaCompreensao } from '../../construtos/lista-compreensao';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 *
 * A grande diferença entre este avaliador e os demais é a forma como são entendidos os blocos de escopo.
 * Este avaliador espera uma estrutura de pragmas, que explica quantos espaços há na frente de cada linha.
 */
export class AvaliadorSintaticoPitugues
    implements AvaliadorSintaticoInterface<SimboloInterface, Declaracao> {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    pragmas: { [linha: number]: Pragma };

    tiposDefinidosEmCodigo: { [nomeTipo: string]: Declaracao };
    pilhaEscopos: PilhaEscopos;
    primitivasConhecidas: {
        [nomeModuloOuClasse: string]: { [nomePrimitiva: string]: InformacaoElementoSintatico };
    };

    hashArquivo: number;
    atual: number;
    blocos: number;
    escopos: number[];
    performance: boolean;
    superclasseAtual: string | undefined;

    constructor(performance = false) {
        this.atual = 0;
        this.blocos = 0;
        this.performance = performance;
        this.escopos = [];
        this.pilhaEscopos = new PilhaEscopos();
        this.primitivasConhecidas = {};
        this.tiposDefinidosEmCodigo = {};

        registrarPrimitiva(this.primitivasConhecidas, 'dicionário', primitivasDicionario);
        registrarPrimitiva(this.primitivasConhecidas, 'número', primitivasNumero);
        registrarPrimitiva(this.primitivasConhecidas, 'texto', primitivasTexto);
        registrarPrimitiva(this.primitivasConhecidas, 'vetor', primitivasVetor);
    }

    protected logicaComumInferenciaTiposVariaveisEConstantes(
        inicializador: Construto,
        tipo: string
    ): string {
        if (tipo !== 'qualquer') {
            return tipo;
        }

        switch (inicializador.constructor.name) {
            case 'AcessoIndiceVariavel':
                const entidadeChamadaAcessoIndiceVariavel = (inicializador as AcessoIndiceVariavel)
                    .entidadeChamada;

                // Este condicional ocorre com chamadas aninhadas. Por exemplo, `vetor[1][2]`.
                if (
                    entidadeChamadaAcessoIndiceVariavel.constructor.name === 'AcessoIndiceVariavel'
                ) {
                    return this.logicaComumInferenciaTiposVariaveisEConstantes(
                        entidadeChamadaAcessoIndiceVariavel,
                        tipo
                    );
                }

                if (entidadeChamadaAcessoIndiceVariavel.tipo.endsWith('[]')) {
                    return entidadeChamadaAcessoIndiceVariavel.tipo.slice(0, -2);
                }

                // Normalmente, `entidadeChamadaAcessoIndiceVariavel.tipo` aqui será 'vetor'.
                return 'qualquer';
            case 'Chamada':
                const entidadeChamadaChamada = (inicializador as Chamada).entidadeChamada;
                switch (entidadeChamadaChamada.constructor.name) {
                    case 'AcessoMetodo':
                        const entidadeChamadaAcessoMetodo = entidadeChamadaChamada as AcessoMetodo;
                        return entidadeChamadaAcessoMetodo.tipoRetornoMetodo;
                    case 'AcessoMetodoOuPropriedade':
                        // Este caso ocorre quando a variável/constante é do tipo 'qualquer',
                        // e a chamada normalmente é feita para uma primitiva.
                        // A inferência, portanto, ocorre pelo uso da primitiva.
                        const entidadeChamadaAcessoMetodoOuPropriedade =
                            entidadeChamadaChamada as AcessoMetodoOuPropriedade;

                        for (const primitiva in this.primitivasConhecidas) {
                            if (
                                this.primitivasConhecidas[primitiva].hasOwnProperty(
                                    entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema
                                )
                            ) {
                                return this.primitivasConhecidas[primitiva][
                                    entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema
                                ].tipo;
                            }
                        }

                        throw new ErroAvaliadorSintatico(
                            entidadeChamadaAcessoMetodoOuPropriedade.simbolo,
                            `Primitiva '${entidadeChamadaAcessoMetodoOuPropriedade.simbolo.lexema}' não existe.`
                        );
                    case 'AcessoPropriedade':
                        const entidadeChamadaAcessoPropriedade =
                            entidadeChamadaChamada as AcessoPropriedade;
                        return entidadeChamadaAcessoPropriedade.tipoRetornoPropriedade;
                    case 'ArgumentoReferenciaFuncao':
                        // TODO: Voltar aqui se necessário.
                        return 'qualquer';
                    case 'ReferenciaFuncao':
                        const entidadeChamadaReferenciaFuncao =
                            entidadeChamadaChamada as ReferenciaFuncao;
                        return entidadeChamadaReferenciaFuncao.tipo;
                    case 'Variavel':
                        const entidadeChamadaVariavel = entidadeChamadaChamada as Variavel;
                        return entidadeChamadaVariavel.tipo;
                }

                break;
            case 'FuncaoConstruto':
                const funcaoConstruto = inicializador as FuncaoConstruto;
                return `função<${funcaoConstruto.tipo}>`;
            case 'Leia':
                return 'texto';
            case 'Dupla':
            case 'Trio':
            case 'Quarteto':
            case 'Quinteto':
            case 'Sexteto':
            case 'Septeto':
            case 'Octeto':
            case 'Noneto':
            case 'Deceto':
                return 'tupla';
            case 'ImportarBiblioteca':
            case 'ModuloDeclaracoes':
                return 'módulo';
            default:
                return inicializador.tipo;
        }
    }

    expressaoLeia(): Leia {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em leia."
        );

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em leia.");

        return new Leia(simboloLeia, argumentos);
    }

    declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    declaracaoDeVariaveis(): any {
        const identificadores: SimboloInterface[] = [];
        let retorno: Declaracao[] = [];
        let tipo: string = 'qualquer';

        do {
            identificadores.push(
                this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.')
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            // Inicialização de variáveis sem valor.
            for (let [indice, identificador] of identificadores.entries()) {
                retorno.push(new Var(identificador, null));
            }
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
            return retorno;
        }

        const inicializadores = [];
        do {
            inicializadores.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(
                this.simboloAtual(),
                'Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.'
            );
        }

        for (let [indice, identificador] of identificadores.entries()) {
            const inicializador = inicializadores[indice];
            tipo = this.logicaComumInferenciaTiposVariaveisEConstantes(
                inicializadores[indice],
                tipo
            );
            this.pilhaEscopos.definirInformacoesVariavel(
                identificador.lexema,
                new InformacaoElementoSintatico(identificador.lexema, tipo)
            );
            retorno.push(new Var(identificador, inicializador, tipo));
        }

        return retorno;
    }

    sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            switch (this.simboloAtual().tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                case tiposDeSimbolos.VARIAVEL:
                case tiposDeSimbolos.PARA:
                case tiposDeSimbolos.SE:
                case tiposDeSimbolos.ENQUANTO:
                case tiposDeSimbolos.ESCREVA:
                case tiposDeSimbolos.RETORNA:
                    return;
            }

            this.avancarEDevolverAnterior();
        }
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    consumir(tipo: string, mensagemDeErro: string) {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simboloAtual(), mensagemDeErro);
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simboloAtual().tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual];
    }

    simboloAnterior(): SimboloInterface {
        return this.simbolos[this.atual - 1];
    }

    simboloNaPosicao(posicao: number): SimboloInterface {
        return this.simbolos[this.atual + posicao];
    }

    estaNoFinal(): boolean {
        return this.atual >= this.simbolos.length;
    }

    avancarEDevolverAnterior() {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simboloAnterior();
    }

    verificarSeSimboloAtualEIgualA(...argumentos: string[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }

        return false;
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];
        let valores = [];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                this.avancarEDevolverAnterior();
                const chaves = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    return new Dicionario(this.hashArquivo, simboloAtual.linha, [], []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    const chave = this.atribuir();
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
                    const valor = this.atribuir();

                    chaves.push(chave);
                    valores.push(valor);

                    if (this.simboloAtual().tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                        this.consumir(
                            tiposDeSimbolos.VIRGULA,
                            'Esperado vírgula antes da próxima expressão.'
                        );
                    }
                }

                return new Dicionario(this.hashArquivo, simboloAtual.linha, chaves, valores);

            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(this.hashArquivo, simboloAtual.linha, [], 0, 'qualquer[]');
                }


                if (this.simbolos[this.atual].tipo == 'IDENTIFICADOR' && !this.verificarTipoProximoSimbolo(tiposDeSimbolos.VIRGULA)) {
                    return this.resolverListaDeCompreensao();
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    const valor = this.atribuir();
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
                    simboloAtual.linha,
                    valores,
                    valores.length,
                    tipoVetor
                );
            
            case tiposDeSimbolos.COMENTARIO:
                const simboloComentario = this.avancarEDevolverAnterior();
                return new ComentarioComoConstruto(simboloComentario);
            case tiposDeSimbolos.FALSO:
            case tiposDeSimbolos.VERDADEIRO:
                const simboloLogico = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    simboloAtual.linha,
                    simboloLogico.tipo === tiposDeSimbolos.VERDADEIRO,
                    'lógico'
                );
            case tiposDeSimbolos.FUNCAO:
            case tiposDeSimbolos.FUNÇÃO:
                const simboloFuncao = this.avancarEDevolverAnterior();
                const corpoDaFuncao = this.corpoDaFuncao(simboloFuncao.lexema);
                this.pilhaEscopos.definirInformacoesVariavel(
                    simboloFuncao.lexema,
                    new InformacaoElementoSintatico(simboloFuncao.lexema, 'função')
                );
                return corpoDaFuncao;
            case tiposDeSimbolos.IMPORTAR:
                return this.declaracaoImportar();
            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, simboloAtual.linha, null);
            case tiposDeSimbolos.ISTO:
                const simboloIsto = this.avancarEDevolverAnterior();
                return new Isto(this.hashArquivo, simboloAtual.linha, simboloIsto);
            case tiposDeSimbolos.LEIA:
                return this.expressaoLeia();
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloLiteral: SimboloInterface = this.avancarEDevolverAnterior();
                const tipoInferido = inferirTipoVariavel(simboloLiteral.literal);
                const tipoDadosElementar = tipoInferenciaParaTipoDadosElementar(
                    tipoInferido as TipoInferencia
                );
                return new Literal(
                    this.hashArquivo,
                    Number(simboloLiteral.linha),
                    simboloLiteral.literal,
                    tipoDadosElementar
                );
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador = this.avancarEDevolverAnterior();
                let tipoOperando: string;
                if (simboloIdentificador.lexema in this.tiposDefinidosEmCodigo) {
                    tipoOperando = simboloIdentificador.lexema;
                } else {
                    try {
                        tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                            simboloIdentificador.lexema
                        );
                    } catch (erro: any) {
                        throw this.erro(simboloIdentificador, erro.message);
                    }
                }
                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, simboloAtual.linha, expressao);
            case tiposDeSimbolos.SUPER:
                const simboloSuper = this.avancarEDevolverAnterior();
                return new Super(this.hashArquivo, simboloSuper, this.superclasseAtual);
        }

        throw this.erro(this.simboloAtual(), 'Esperado expressão.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        const argumentos = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(this.simboloAtual(), 'Não pode haver mais de 255 argumentos.');
                }
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        return new Chamada(this.hashArquivo, entidadeChamada, argumentos);
    }

    chamar(): Construto | RetornoPrimario {
        let expressao: RetornoPrimario | Construto = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );

                expressao = new AcessoMetodoOuPropriedade(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = this.expressao();
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

    unario(): Construto {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.BIT_NOT
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            return new Unario(this.hashArquivo, operador, direito);
        }

        return this.chamar();
    }

    exponenciacao(): Construto {
        let expressao = this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    multiplicar(): Construto {
        let expressao = this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)
        ) {
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitShift(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = this.bitShift();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitOu(): Construto {
        let expressao = this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)
        ) {
            const operador = this.simboloAnterior();
            const direito = this.bitE();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    comparar(): Construto {
        let expressao = this.bitOu();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MAIOR,
                tiposDeSimbolos.MAIOR_IGUAL,
                tiposDeSimbolos.MENOR,
                tiposDeSimbolos.MENOR_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.bitOu();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simboloAnterior();
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    atribuir(): Construto {
        const expressao = this.ou();

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
        ) {
            const igual = this.simboloAnterior();
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                return new Atribuir(this.hashArquivo, expressao, valor);
            }

            if (expressao instanceof AcessoMetodoOuPropriedade) {
                return new DefinirValor(
                    this.hashArquivo,
                    0,
                    expressao.objeto,
                    expressao.simbolo,
                    valor
                );
            }

            if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    0,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }
            throw this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    // TODO: Depreciar.
    expressao(): Construto {
        return this.atribuir();
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.simboloAtual();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: Array<Construto> = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    declaracaoExpressao() {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    blocoEscopo(): any[] {
        this.pilhaEscopos.empilhar(new InformacaoEscopo());
        let declaracoes: Array<Declaracao> = [];
        let simboloAtual = this.simboloAtual();
        const simboloAnterior = this.simboloAnterior();

        // Situação 1: não tem bloco de escopo.
        //
        // Exemplo: `se verdadeiro: escreva('Alguma coisa')`.
        // Neste caso, linha do símbolo atual é igual à linha do símbolo anterior.

        if (simboloAtual.linha === simboloAnterior.linha) {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        } else {
            // Situação 2: símbolo atual fica na próxima linha.
            //
            // Verifica-se o número de espaços à esquerda da linha através dos pragmas.
            // Se número de espaços da linha do símbolo atual é menor ou igual ao número de espaços
            // da linha anterior, e bloco ainda não começou, é uma situação de erro.
            let espacosIndentacaoLinhaAtual = this.pragmas[simboloAtual.linha].espacosIndentacao;
            const espacosIndentacaoLinhaAnterior =
                this.pragmas[simboloAnterior.linha].espacosIndentacao;

            if (espacosIndentacaoLinhaAtual <= espacosIndentacaoLinhaAnterior) {
                throw this.erro(
                    simboloAtual,
                    `Indentação inconsistente na linha ${simboloAtual.linha}. ` +
                    `Esperado: >= ${espacosIndentacaoLinhaAnterior}. ` +
                    `Atual: ${espacosIndentacaoLinhaAtual}`
                );
            }

            // Indentação ok, é um bloco de escopo.
            // Inclui todas as declarações cujas linhas tenham o mesmo número de espaços
            // de indentação do bloco.
            // Se `simboloAtual` for definido em algum momento como indefinido,
            // Significa que o código acabou, então o bloco também acabou.
            const espacosIndentacaoBloco = espacosIndentacaoLinhaAtual;
            while (espacosIndentacaoLinhaAtual === espacosIndentacaoBloco) {
                const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
                if (Array.isArray(retornoDeclaracao)) {
                    declaracoes = declaracoes.concat(retornoDeclaracao);
                } else {
                    declaracoes.push(retornoDeclaracao as Declaracao);
                }

                simboloAtual = this.simboloAtual();
                if (!simboloAtual) break;
                espacosIndentacaoLinhaAtual = this.pragmas[simboloAtual.linha].espacosIndentacao;
            }
        }

        this.pilhaEscopos.removerUltimo();
        return declaracoes;
    }

    declaracaoEnquanto(): Enquanto {
        try {
            this.blocos += 1;

            const condicao = this.expressao();

            const bloco = this.resolverDeclaracao();

            return new Enquanto(condicao, bloco);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoEscolha(): Escolha {
        try {
            this.blocos += 1;

            const condicao = this.expressao();

            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após 'escolha'.");

            const caminhos = [];
            let caminhoPadrao = null;
            while (
                !this.estaNoFinal() &&
                [tiposDeSimbolos.CASO, tiposDeSimbolos.PADRAO].includes(
                    this.simbolos[this.atual].tipo
                )
            ) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    const caminhoCondicoes = [this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(
                            tiposDeSimbolos.DOIS_PONTOS,
                            "Esperado ':' após declaração do 'caso'."
                        );
                    }

                    // Como dois-pontos é um símbolo usado para conferir se há um início de bloco,
                    // não podemos simplesmente chamar `this.resolverDeclaracao()` porque o dois-pontos já
                    // foi consumido na verificação.
                    // Outro problema é que, aparentemente, o Interpretador não espera um Bloco, e sim
                    // um vetor de Declaracao, o qual obtemos com `this.blocoEscopo()`.
                    const declaracoes = this.blocoEscopo();

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)) {
                    if (caminhoPadrao !== null) {
                        const excecao = new ErroAvaliadorSintatico(
                            this.simboloAtual(),
                            "Você só pode ter um caminho padrão em cada declaração de 'escolha'."
                        );
                        this.erros.push(excecao);
                        throw excecao;
                    }

                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após declaração do 'padrao'."
                    );

                    // Como dois-pontos é um símbolo usado para conferir se há um início de bloco,
                    // não podemos simplesmente chamar `this.resolverDeclaracao()` porque o dois-pontos já
                    // foi consumido na verificação.
                    // Outro problema é que, aparentemente, o Interpretador não espera um Bloco, e sim
                    // um vetor de Declaracao, o qual obtemos com `this.blocoEscopo()`.
                    const declaracoes = this.blocoEscopo();

                    caminhoPadrao = {
                        declaracoes,
                    };
                }
            }

            return new Escolha(condicao, caminhos, caminhoPadrao);
        } finally {
            this.blocos -= 1;
        }
    }

    protected declaracaoParaCada(simboloPara: SimboloInterface): ParaCada {
        const nomeVariavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável de iteração para instrução 'para cada'."
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução 'para cada'."
            );
        }

        const vetor = this.expressao();
        if (!vetor.hasOwnProperty('tipo')) {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não parece possuir um tipo iterável.`
            );
        }

        const tipoVetor = (vetor as any).tipo as string;
        if (!tipoVetor.endsWith('[]') && !['qualquer', 'vetor'].includes(tipoVetor)) {
            throw this.erro(
                simboloPara,
                `Variável ou constante em 'para cada' não é iterável. Tipo resolvido: ${tipoVetor}.`
            );
        }

        this.pilhaEscopos.definirInformacoesVariavel(
            nomeVariavelIteracao.lexema,
            new InformacaoElementoSintatico(nomeVariavelIteracao.lexema, tipoVetor.slice(0, -2))
        );
        // TODO: Talvez não seja uma ideia melhor chamar o método de `Bloco` aqui?
        const corpo: Bloco = this.resolverDeclaracao() as Bloco;

        return new ParaCada(
            this.hashArquivo,
            Number(simboloPara.linha),
            new Variavel(this.hashArquivo, nomeVariavelIteracao),
            vetor,
            corpo
        );
    }

    protected declaracaoParaTradicional(simboloPara: SimboloInterface): Para {
        let inicializador: Var | Expressao;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            inicializador = null;
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) {
            inicializador = this.declaracaoDeVariaveis();
        } else {
            inicializador = this.declaracaoExpressao();
        }

        let condicao = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            condicao = this.expressao();
        }

        let incrementar = null;
        if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.DOIS_PONTOS) {
            incrementar = this.expressao();
        }

        const corpo = this.resolverDeclaracao();

        return new Para(
            this.hashArquivo,
            Number(simboloPara.linha),
            inicializador,
            condicao,
            incrementar,
            corpo
        );
    }

    declaracaoPara(): Para | ParaCada {
        try {
            const simboloPara: SimboloInterface = this.simboloAnterior();
            this.blocos += 1;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CADA)) {
                return this.declaracaoParaCada(simboloPara);
            }

            return this.declaracaoParaTradicional(simboloPara);
        } catch (erro) {
            throw erro;
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoSe(): Se {
        const condicao = this.expressao();

        const caminhoEntao = this.resolverDeclaracao();

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            caminhoSenao = this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    declaracaoSustar() {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'sustar' deve estar dentro de um laço de repetição."
            );
        }

        return new Sustar(this.simboloAtual());
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            throw this.erro(
                this.simboloAnterior(),
                "'continua' precisa estar em um laço de repetição."
            );
        }

        return new Continua(this.simboloAtual());
    }

    declaracaoRetorna(): Retorna {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = this.expressao();
        }

        return new Retorna(palavraChave, valor);
    }

    declaracaoImportar(): Importar {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");
        const caminho = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal);
    }

    declaracaoTente(): Tente {
        const simboloTente: SimboloInterface = this.simboloAnterior();
        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'tente'.");

        const blocoTente = this.blocoEscopo();

        let blocoPegue = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'pegue'.");

            blocoPegue = this.blocoEscopo();
        }

        let blocoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'senão'.");

            blocoSenao = this.blocoEscopo();
        }

        let blocoFinalmente = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após a declaração 'pegue'.");

            blocoFinalmente = this.blocoEscopo();
        }

        return new Tente(
            simboloTente.hashArquivo,
            Number(simboloTente.linha),
            blocoTente,
            blocoPegue,
            blocoSenao,
            blocoFinalmente
        );
    }

    declaracaoFazer(): Fazer {
        const simboloFazer: SimboloInterface = this.simboloAnterior();

        try {
            this.blocos += 1;

            const declaracaoOuBlocoFazer = this.resolverDeclaracao();

            this.consumir(
                tiposDeSimbolos.ENQUANTO,
                "Esperado declaração do 'enquanto' após o escopo da declaração 'fazer'."
            );

            const condicaoEnquanto = this.expressao();

            return new Fazer(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                declaracaoOuBlocoFazer,
                condicaoEnquanto
            );
        } finally {
            this.blocos -= 1;
        }
    }

    resolverDeclaracao(): any {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.DOIS_PONTOS:
                this.avancarEDevolverAnterior();
                const simboloInicioBloco: SimboloInterface = this.simboloAnterior();
                return new Bloco(
                    simboloInicioBloco.hashArquivo,
                    Number(simboloInicioBloco.linha),
                    this.blocoEscopo()
                );
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscolha();
            case tiposDeSimbolos.IMPRIMA:
            case tiposDeSimbolos.ESCREVA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscreva();
            case tiposDeSimbolos.FALHAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoFalhar();
            case tiposDeSimbolos.FAZER:
                this.avancarEDevolverAnterior();
                return this.declaracaoFazer();
            case tiposDeSimbolos.PARA:
                this.avancarEDevolverAnterior();
                return this.declaracaoPara();
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
                return this.declaracaoTente();
            case tiposDeSimbolos.VARIAVEL:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeVariaveis();
        }

        return this.declaracaoExpressao();
    }

    funcao(tipo: string, construtor?: boolean): FuncaoDeclaracao {
        const simbolo: SimboloInterface = !construtor
            ? this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`)
            : new Simbolo(tiposDeSimbolos.CONSTRUTOR, 'construtor', null, -1, -1);

        // Se houver chamadas recursivas à função, precisamos definir um tipo
        // para ela. Vai ser atualizado após avaliação do corpo da função.
        this.pilhaEscopos.definirInformacoesVariavel(
            simbolo.lexema,
            new InformacaoElementoSintatico(simbolo.lexema, 'qualquer')
        );

        const corpoDaFuncao = this.corpoDaFuncao(tipo);
        const tipoDaFuncao = `função<${corpoDaFuncao.tipo}>`;
        this.pilhaEscopos.definirInformacoesVariavel(
            simbolo.lexema,
            new InformacaoElementoSintatico(simbolo.lexema, tipoDaFuncao)
        );
        const funcaoDeclaracao = new FuncaoDeclaracao(simbolo, corpoDaFuncao, tipoDaFuncao);
        this.pilhaEscopos.registrarReferenciaFuncao(simbolo.lexema, funcaoDeclaracao);
        return funcaoDeclaracao;
    }

    logicaComumParametros(): Array<object> {
        const parametros: Array<object> = [];

        do {
            if (parametros.length >= 255) {
                throw this.erro(this.simboloAtual(), 'Função não pode ter mais de 255 parâmetros.');
            }

            const parametro: Partial<ParametroInterface> = {};

            if (this.simboloAtual().tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            }

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            }

            this.pilhaEscopos.definirInformacoesVariavel(
                parametro.nome.lexema,
                new InformacaoElementoSintatico(
                    parametro.nome.lexema,
                    parametro.tipoDado || 'qualquer'
                )
            );

            parametros.push(parametro);

            if (parametro.abrangencia === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    /**
     * Resolve uma lista de compreensão.
     * @returns {ListaCompreensao} A lista de compreensão resolvida.
     */
    protected resolverListaDeCompreensao(): ListaCompreensao {
        // TODO: Mais futuramente, aceitar uma Expressão (Construto) aqui.
        const identificador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável de iteração na instrução 'para cada'."
        );

        this.consumir(
            tiposDeSimbolos.PARA,
            "Esperado instrução 'para' após identificado."
        );

        this.consumir(
            tiposDeSimbolos.CADA,
            "Esperado instrução 'cada' após 'para'."
        );

        const simboloVariavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para cada'."
        );

        if (identificador.lexema != simboloVariavelIteracao.lexema) {
            throw this.erro(
                this.simbolos[this.atual],
                "Identificadores de variáveis não correspondentes."
            )
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavras reservadas 'em' ou 'de' após variável de iteração em instrução em lista de compreensão."
            );
        }

        const localizacaoVetor = this.simboloAnterior();
        const vetor = this.expressao();

        this.consumir(
            tiposDeSimbolos.SE,
            "Esperado condição 'se' após vetor."
        );

        // Antes de avaliar a condição, precisamos registrar a variável de iteração.
        this.pilhaEscopos.definirInformacoesVariavel(
            simboloVariavelIteracao.lexema,
            new InformacaoElementoSintatico(simboloVariavelIteracao.lexema, 'qualquer') // TODO: Talvez um dia inferir o tipo aqui.
        );

        const condicao = this.expressao();

        this.consumir(
            tiposDeSimbolos.COLCHETE_DIREITO,
            'Espero fechamento de colchetes após condição.'
        );

        const tipoVetor = (vetor as any).tipo as string;
        if (!tipoVetor.endsWith('[]') && !['qualquer', 'vetor'].includes(tipoVetor)) {
            throw this.erro(
                localizacaoVetor,
                `Variável ou constante em 'para cada' não é iterável. Tipo resolvido: ${tipoVetor}.`
            );
        }

        const variavelIteracao = new Variavel(this.hashArquivo, simboloVariavelIteracao);

        return new ListaCompreensao(
            Number(this.simbolos[this.atual]),
            this.hashArquivo,
            identificador,
            vetor,
            new ParaCadaComoConstruto(
                identificador.hashArquivo,
                identificador.linha,
                variavelIteracao,
                vetor,
                new Bloco(
                    identificador.hashArquivo,
                    identificador.linha,
                    [
                        new Se(
                            condicao,
                        new Bloco(
                            identificador.hashArquivo,
                            identificador.linha,
                            [
                                new Retorna(
                                    simboloVariavelIteracao,
                                    new Variavel(
                                        identificador.hashArquivo,
                                        simboloVariavelIteracao,
                                        'qualquer'
                                    )
                                )
                            ]
                        ),
                        [],
                        null
                    )
                    ]
                )
            ),
            'qualquer[]' // TODO: Talvez um dia inferir o tipo aqui.
        );
    }

    protected verificarDefinicaoTipoAtual(): string {
        const tipos = [...Object.values(tiposDeDadosPitugues)];

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
            return tipoVetor as TipoDadosElementar;
        }

        return tipoElementarResolvido as TipoDadosElementar;
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de localização.
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        let tipoRetorno: string = 'qualquer';
        let definicaoExplicitaDeTipo: boolean = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA)) {
            tipoRetorno = this.verificarDefinicaoTipoAtual();
            this.avancarEDevolverAnterior();
            definicaoExplicitaDeTipo = true;
        }

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, `Esperado ':' antes do escopo do ${tipo}.`);

        const corpo = this.blocoEscopo();
        tipoRetorno = logicaValidacaoRetornoFuncao(
            this,
            corpo,
            tipoRetorno,
            definicaoExplicitaDeTipo,
            parenteseEsquerdo
        );

        return new FuncaoConstruto(
            this.hashArquivo,
            0,
            parametros,
            corpo,
            tipoRetorno,
            definicaoExplicitaDeTipo
        );
    }

    declaracaoDeClasse(): Classe {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da classe.'
        );

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {

            const simboloSuperclasse = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome da Superclasse.'
            );
            this.superclasseAtual = simboloSuperclasse.lexema;
            superClasse = new Variavel(this.hashArquivo, this.simboloAnterior());

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");
        }

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' antes do escopo da classe.");

        const metodos = [];
        while (
            !this.estaNoFinal() &&
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.CONSTRUTOR,
                tiposDeSimbolos.FUNCAO,
                tiposDeSimbolos.FUNÇÃO
            )
        ) {
            metodos.push(
                this.funcao(
                    'método',
                    this.simbolos[this.atual - 1].tipo === tiposDeSimbolos.CONSTRUTOR
                )
            );
        }

        this.superclasseAtual = undefined;
        const definicaoClasse = new Classe(simbolo, superClasse, metodos);
        this.tiposDefinidosEmCodigo[definicaoClasse.simbolo.lexema] = definicaoClasse;
        return definicaoClasse;
    }

    declaracaoFalhar(): Falhar {
        const simboloFalha: SimboloInterface = this.simbolos[this.atual - 1];
        const textoFalha = this.consumir(
            tiposDeSimbolos.TEXTO,
            'Esperado texto para explicar falha.'
        );
        return new Falhar(simboloFalha, textoFalha.literal);
    }

    /**
     * Consome o símbolo atual, verificando se é uma declaração de função, variável, classe
     * ou uma expressão.
     * @returns Objeto do tipo `Declaracao`.
     */
    resolverDeclaracaoForaDeBloco(): Declaracao {
        try {
            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return this.funcao('funcao');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            return null;
        }
    }

    /**
     * Inicializa o primeiro nível da pilha de escopos, normalmente com ítens da biblioteca global.
     * É separada da inicialização do avaliador sintático, pois é necessário manipular essa
     * inicialização de outra forma em `delegua-node`.
     */
    protected inicializarPilhaEscopos() {
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        // Funções nativas de Delégua (e de Pituguês também, por enquanto)
        this.pilhaEscopos.definirInformacoesVariavel(
            'aleatorio',
            new InformacaoElementoSintatico('aleatorio', 'número')
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'aleatorioEntre',
            new InformacaoElementoSintatico('aleatorioEntre', 'número', true, [
                new InformacaoElementoSintatico('minimo', 'número'),
                new InformacaoElementoSintatico('maximo', 'número'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'algum',
            new InformacaoElementoSintatico('algum', 'lógico', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrar',
            new InformacaoElementoSintatico('encontrar', 'qualquer', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrarIndice',
            new InformacaoElementoSintatico('encontrarIndice', 'inteiro', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrarUltimo',
            new InformacaoElementoSintatico('encontrarUltimo', 'inteiro', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'encontrarUltimoIndice',
            new InformacaoElementoSintatico('encontrarUltimoIndice', 'inteiro', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoPesquisa', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'filtrarPor',
            new InformacaoElementoSintatico('filtrarPor', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'incluido',
            new InformacaoElementoSintatico('incluido', 'lógico', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'inteiro',
            new InformacaoElementoSintatico('inteiro', 'inteiro', true, [
                new InformacaoElementoSintatico('valor', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'mapear',
            new InformacaoElementoSintatico('mapear', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoMapeamento', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'numero',
            new InformacaoElementoSintatico('número', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'número',
            new InformacaoElementoSintatico('número', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'ordenar',
            new InformacaoElementoSintatico('ordenar', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoOrdenacao', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'paraCada',
            new InformacaoElementoSintatico('paraCada', 'qualquer[]', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'primeiroEmCondicao',
            new InformacaoElementoSintatico('primeiroEmCondicao', 'qualquer', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoFiltragem', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'real',
            new InformacaoElementoSintatico('real', 'número', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'reduzir',
            new InformacaoElementoSintatico('reduzir', 'qualquer', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoReducao', 'função'),
                new InformacaoElementoSintatico('valorInicial', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tamanho',
            new InformacaoElementoSintatico('tamanho', 'inteiro', true, [
                new InformacaoElementoSintatico('objeto', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'texto',
            new InformacaoElementoSintatico('texto', 'texto', true, [
                new InformacaoElementoSintatico('valorParaConverter', 'qualquer'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'todosEmCondicao',
            new InformacaoElementoSintatico('todosEmCondicao', 'lógico', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
                new InformacaoElementoSintatico('funcaoCondicional', 'função'),
            ])
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            'tupla',
            new InformacaoElementoSintatico('tupla', 'tupla', true, [
                new InformacaoElementoSintatico('vetor', 'qualquer[]'),
            ])
        );
    }

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.escopos = [];
        this.inicializarPilhaEscopos();
        this.tiposDefinidosEmCodigo = {};

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.pragmas = retornoLexador?.pragmas || {};

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        if (this.performance) {
            const deltaAnalise: [number, number] = hrtime(inicioAnalise);
            // eslint-disable-next-line no-undef
            console.log(
                `[Avaliador Sintático] Tempo para análise: ${deltaAnalise[0] * 1e9 + deltaAnalise[1]}ns`
            );
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
