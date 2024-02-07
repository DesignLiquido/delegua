import { RetornoLexador, RetornoAvaliadorSintatico } from '../../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../../avaliador-sintatico-base';
import {
    Aleatorio,
    Bloco,
    CabecalhoPrograma,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Leia,
    Para,
    Retorna,
    Se,
    Sustar,
    Var,
} from '../../../declaracoes';
import {
    AtribuicaoPorIndicesMatriz,
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Literal,
    Logico,
    Unario,
    Variavel,
} from '../../../construtos';
import { ParametroInterface, SimboloInterface } from '../../../interfaces';
import { Simbolo } from '../../../lexador';

import tiposDeSimbolos from '../../../tipos-de-simbolos/visualg';
import { ParametroVisuAlg } from './parametro-visualg';
import { TiposDadosInterface } from '../../../interfaces/tipos-dados-interface';
import { ErroAvaliadorSintatico } from '../../erro-avaliador-sintatico';
import { InicioAlgoritmo } from '../../../declaracoes/inicio-algoritmo';

export class AvaliadorSintaticoVisuAlg extends AvaliadorSintaticoBase {
    blocoPrincipalIniciado: boolean;
    dicionarioTiposPrimitivos = {
        caracter: 'texto',
        caractere: 'texto',
        inteiro: 'número',
        logico: 'lógico',
        real: 'número',
    };

    constructor() {
        super();
        this.blocoPrincipalIniciado = false;
    }

    private validarSegmentoAlgoritmo(): SimboloInterface {
        this.consumir(tiposDeSimbolos.ALGORITMO, "Esperada expressão 'algoritmo' para inicializar programa.");

        const descricaoAlgoritmo = this.consumir(tiposDeSimbolos.CARACTERE, "Esperada cadeia de caracteres após palavra-chave 'algoritmo'.");

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após definição do segmento 'algoritmo'.");

        return descricaoAlgoritmo;
    }

    private criarVetorNDimensional(dimensoes: number[]) {
        if (dimensoes.length > 0) {
            const dimensao = dimensoes[0] + 1;
            const resto = dimensoes.slice(1);
            const novoArray = Array(dimensao);
            for (let i = 0; i <= dimensao; i++) {
                novoArray[i] = this.criarVetorNDimensional(resto);
            }
            return novoArray;
        } else {
            return undefined;
        }
    }

    private validarDimensoesVetor(): number[] {
        let dimensoes = [];
        do {
            const numeroInicial = this.consumir(
                tiposDeSimbolos.NUMERO,
                'Esperado índice inicial para inicialização de dimensão de vetor.'
            );
            this.consumir(
                tiposDeSimbolos.PONTO,
                'Esperado primeiro ponto após índice inicial para inicialização de dimensão de vetor.'
            );
            this.consumir(
                tiposDeSimbolos.PONTO,
                'Esperado segundo ponto após índice inicial para inicialização de dimensão de vetor.'
            );
            const numeroFinal = this.consumir(
                tiposDeSimbolos.NUMERO,
                'Esperado índice final para inicialização de dimensão de vetor.'
            );
            dimensoes.push(Number(numeroFinal.literal) - Number(numeroInicial.literal));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return dimensoes;
    }

    private logicaComumParametroVisuAlg(): ParametroVisuAlg {
        const identificadores = [];
        let referencia: boolean = this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VAR);

        do {
            identificadores.push(this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.'));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, 'Esperado dois-pontos após nome de variável.');

        if (
            !this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.CARACTERE,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.LOGICO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.VETOR
            )
        ) {
            throw this.erro(
                this.simbolos[this.atual],
                `Tipo de variável não conhecido: ${this.simbolos[this.atual].lexema}`
            );
        }

        const simboloAnterior = this.simbolos[this.atual - 1];
        const tipoVariavel: string = simboloAnterior.tipo;

        return {
            identificadores,
            tipo: tipoVariavel,
            simbolo: simboloAnterior,
            referencia: referencia,
        };
    }

    /**
     * Validação do segmento de declaração de variáveis (opcional).
     * @returns Vetor de Construtos para inicialização de variáveis.
     */
    private validarSegmentoVar(): Construto[] | Declaracao[] {
        // Podem haver linhas de comentários acima de `var`, que geram
        // quebras de linha.
        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.QUEBRA_LINHA) {
            this.avancarEDevolverAnterior();
        }

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.VAR)) {
            return [];
        }

        const inicializacoes = [];
        this.avancarEDevolverAnterior(); // Var

        // Quebra de linha é opcional aqui.
        // this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.INICIO)) {
            // Se ainda houver quebras de linha, volta para o começo do `while`.
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA)) {
                continue;
            }

            const simboloAtual = this.simbolos[this.atual];
            switch (simboloAtual.tipo) {
                case tiposDeSimbolos.FUNCAO:
                case tiposDeSimbolos.FUNÇÃO:
                    const dadosFuncao = this.funcao('funcao');
                    inicializacoes.push(dadosFuncao);
                    break;
                case tiposDeSimbolos.PROCEDIMENTO:
                    const dadosProcedimento = this.declaracaoProcedimento();
                    inicializacoes.push(dadosProcedimento);
                    break;
                default:
                    const dadosVariaveis = this.logicaComumParametroVisuAlg();
                    // Se chegou até aqui, variáveis são válidas.
                    // Devem ser declaradas com um valor inicial padrão.
                    if (dadosVariaveis.tipo === tiposDeSimbolos.VETOR) {
                        this.consumir(
                            tiposDeSimbolos.COLCHETE_ESQUERDO,
                            'Esperado colchete esquerdo após palavra reservada "vetor".'
                        );
                        const dimensoes = this.validarDimensoesVetor();
                        this.consumir(
                            tiposDeSimbolos.COLCHETE_DIREITO,
                            'Esperado colchete direito após declaração de dimensões de vetor.'
                        );
                        this.consumir(
                            tiposDeSimbolos.DE,
                            'Esperado palavra reservada "de" após declaração de dimensões de vetor.'
                        );

                        const simboloTipo = this.simbolos[this.atual];
                        if (
                            ![
                                tiposDeSimbolos.CARACTER,
                                tiposDeSimbolos.CARACTERE,
                                tiposDeSimbolos.INTEIRO,
                                tiposDeSimbolos.LOGICO,
                                tiposDeSimbolos.REAL,
                                tiposDeSimbolos.VETOR,
                            ].includes(simboloTipo.tipo)
                        ) {
                            throw this.erro(simboloTipo, 'Tipo de variável não conhecido para inicialização de vetor.');
                        }
                        for (let identificador of dadosVariaveis.identificadores) {
                            inicializacoes.push(
                                new Var(
                                    identificador,
                                    new Literal(
                                        this.hashArquivo,
                                        Number(dadosVariaveis.simbolo.linha),
                                        this.criarVetorNDimensional(dimensoes)
                                    ),
                                    this.dicionarioTiposPrimitivos[simboloTipo.lexema.toLowerCase()]
                                )
                            );
                        }
                        this.atual++;
                    } else {
                        for (let identificador of dadosVariaveis.identificadores) {
                            const tipo = dadosVariaveis.tipo as TiposDadosInterface
                            switch (dadosVariaveis.tipo) {
                                case tiposDeSimbolos.CARACTER:
                                case tiposDeSimbolos.CARACTERE:
                                    inicializacoes.push(
                                        new Var(
                                            identificador,
                                            new Literal(this.hashArquivo, Number(dadosVariaveis.simbolo.linha), ''),
                                            tipo
                                        )
                                    );
                                    break;
                                case tiposDeSimbolos.INTEIRO:
                                case tiposDeSimbolos.REAL:
                                    inicializacoes.push(
                                        new Var(
                                            identificador,
                                            new Literal(this.hashArquivo, Number(dadosVariaveis.simbolo.linha), 0),
                                            tipo
                                        )
                                    );
                                    break;
                                case tiposDeSimbolos.LOGICO:
                                    inicializacoes.push(
                                        new Var(
                                            identificador,
                                            new Literal(this.hashArquivo, Number(dadosVariaveis.simbolo.linha), false),
                                            tipo
                                        )
                                    );
                                    break;
                            }
                        }
                    }
                    break;
            }

            this.consumir(tiposDeSimbolos.QUEBRA_LINHA, 'Esperado quebra de linha após declaração de variável.');
        }

        return inicializacoes;
    }

    private validarSegmentoInicio(algoritmoOuFuncao: string): SimboloInterface {
        const simboloInicio = this.consumir(
            tiposDeSimbolos.INICIO,
            `Esperada expressão 'inicio' para marcar escopo de ${algoritmoOuFuncao}.`
        );
        return simboloInicio;
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    metodoBibliotecaGlobal(): Construto {
        const simboloAnterior = this.simbolos[this.atual - 1];

        switch (simboloAnterior.lexema) {
            case 'int':
                return new Chamada(
                    this.hashArquivo,
                    new Variavel(
                        this.hashArquivo,
                        new Simbolo(
                            tiposDeSimbolos.IDENTIFICADOR,
                            'inteiro',
                            null,
                            Number(simboloAnterior.linha),
                            this.hashArquivo
                        )
                    ),
                    null,
                    []
                );
            default:
                return null;
        }
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO))
            return new Literal(this.hashArquivo, Number(simboloAtual.linha), false);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO))
            return new Literal(this.hashArquivo, Number(simboloAtual.linha), true);
        if (simboloAtual.lexema === 'limpatela') {
            const variavel = new Variavel(this.hashArquivo, simboloAtual);
            this.avancarEDevolverAnterior();
            return new Chamada(this.hashArquivo, variavel, null, []);
        }
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR, tiposDeSimbolos.METODO_BIBLIOTECA_GLOBAL)
        ) {
            return new Variavel(this.hashArquivo, this.simbolos[this.atual - 1]);
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.CARACTERE
            )
        ) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            const expressao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

            return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);
        }

        throw this.erro(this.simbolos[this.atual], "Esperado expressão.");
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, simboloAnterior, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU, tiposDeSimbolos.XOU)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoPorIndice`.
     */
    atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA_ATRIBUICAO)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            } else if (expressao instanceof AcessoElementoMatriz) {
                return new AtribuicaoPorIndicesMatriz(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indicePrimario,
                    expressao.indiceSecundario,
                    valor
                );
            }

            this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    expressao(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.LEIA)) return this.declaracaoLeia();
        return this.atribuir();
    }

    blocoEscopo(): any[] {
        const declaracoes = [];

        while (
            ![tiposDeSimbolos.FIM_FUNCAO, tiposDeSimbolos.FIM_FUNÇÃO, tiposDeSimbolos.FIM_PROCEDIMENTO].includes(
                this.simbolos[this.atual].tipo
            ) &&
            !this.estaNoFinal()
        ) {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        }

        // Se chegou até aqui, simplesmente consome o símbolo.
        this.avancarEDevolverAnterior();
        // this.consumir(tiposDeSimbolos.FIM_FUNCAO, "Esperado palavra-chave 'fimfuncao' após o bloco.");
        return declaracoes;
    }

    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indices = [];
                do {
                    indices.push(this.expressao());
                } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                if (!indices[1]) {
                    expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indices[0], simboloFechamento);
                } else {
                    expressao = new AcessoElementoMatriz(this.hashArquivo, expressao, indices[0], indices[1], simboloFechamento);
                }
            } else {
                break;
            }
        }

        return expressao;
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual - 2];
    }

    verificarDefinicaoTipoAtual(): TiposDadosInterface {
        const tipos = ['inteiro', 'qualquer', 'real', 'texto', 'vazio', 'vetor', 'caracter'];

        const lexema = this.simboloAtual().lexema.toLowerCase();

        const contemTipo = tipos.find((tipo) => tipo === lexema);

        if (contemTipo && this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            const tiposVetores = ['inteiro[]', 'qualquer[]', 'real[]', 'texto[]', 'caracter[]'];
            this.avancarEDevolverAnterior();

            if (!this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_DIREITO)) {
                throw this.erro(this.simbolos[this.atual - 1], "Esperado símbolo de fechamento do vetor ']'.");
            }

            const contemTipoVetor = tiposVetores.find((tipo) => tipo === `${lexema}[]`);

            this.avancarEDevolverAnterior();

            return contemTipoVetor as TiposDadosInterface;
        }

        return contemTipo as TiposDadosInterface;
    }

    corpoDaFuncao(tipo: any): FuncaoConstruto {
        const simboloAnterior = this.simbolos[this.atual - 1];

        // Parâmetros
        const parametros = this.logicaComumParametros();
        this.consumir(tiposDeSimbolos.DOIS_PONTOS, 'Esperado dois-pontos após nome de função.');

        // Tipo retornado pela função.
        let tipoRetorno = null
        if (
            !this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.CARACTERE,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.LOGICO
            )
        ) {
            throw this.erro(this.simbolos[this.atual], 'Esperado um tipo válido para retorno de função');
        }

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após tipo retornado por 'funcao'.");
        tipoRetorno = this.verificarDefinicaoTipoAtual();
        const inicializacoes = this.validarSegmentoVar();
        this.validarSegmentoInicio('função');

        const corpo: any[] = (inicializacoes as any[]).concat(this.blocoEscopo());

        return new FuncaoConstruto(
            this.hashArquivo,
            Number(simboloAnterior.linha),
            parametros,
            corpo.filter((d) => d),
            tipoRetorno
        );
    }

    declaracaoEnquanto(): Enquanto {
        const simboloAtual = this.avancarEDevolverAnterior();

        const condicao = this.expressao();

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FACA, tiposDeSimbolos.FAÇA)) {
            this.consumir(
                this.simbolos[this.atual].tipo,
                "Esperado paravra reservada 'faca' ou 'faça' após condição de continuidade em declaracão 'enquanto'."
            );
        }

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra reservada 'faca' em declaracão 'enquanto'."
        );

        const declaracoes = [];
        do {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        } while (![tiposDeSimbolos.FIM_ENQUANTO].includes(this.simbolos[this.atual].tipo));

        this.consumir(
            tiposDeSimbolos.FIM_ENQUANTO,
            "Esperado palavra-chave 'fimenquanto' para fechamento de declaração 'enquanto'."
        );

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra-chave 'fimenquanto'.");

        return new Enquanto(
            condicao,
            new Bloco(
                simboloAtual.hashArquivo,
                Number(simboloAtual.linha),
                declaracoes.filter((d) => d)
            )
        );
    }

    private logicaCasosEscolha(): any {
        const literais = [];

        let simboloAtualCaso: SimboloInterface = this.simbolos[this.atual];
        while (simboloAtualCaso.tipo !== tiposDeSimbolos.QUEBRA_LINHA) {
            literais.push(this.primario());
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA);
            simboloAtualCaso = this.simbolos[this.atual];
        }

        return literais;
    }

    declaracaoEscolha(): Escolha {
        const simboloAtual = this.avancarEDevolverAnterior();

        // Parênteses são opcionais para delimitar o identificador.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO);
        const identificador = this.primario();
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_DIREITO);
        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após variável ou literal de declaração 'caso'."
        );

        while (this.simbolos[this.atual].tipo === tiposDeSimbolos.QUEBRA_LINHA) {
            this.avancarEDevolverAnterior();
        }

        // Blocos de caso
        const caminhos = [];
        let simboloAtualBlocoCaso: SimboloInterface = this.avancarEDevolverAnterior();
        while (![tiposDeSimbolos.OUTRO_CASO, tiposDeSimbolos.FIM_ESCOLHA].includes(simboloAtualBlocoCaso.tipo)) {
            const caminhoCondicoes = this.logicaCasosEscolha();

            const declaracoes = [];
            do {
                declaracoes.push(this.resolverDeclaracaoForaDeBloco());
            } while (
                ![tiposDeSimbolos.CASO, tiposDeSimbolos.OUTRO_CASO, tiposDeSimbolos.FIM_ESCOLHA].includes(
                    this.simbolos[this.atual].tipo
                )
            );

            caminhos.push({
                condicoes: caminhoCondicoes.filter((c: any) => c),
                declaracoes: declaracoes.filter((d) => d),
            });

            while (this.simbolos[this.atual].tipo === tiposDeSimbolos.QUEBRA_LINHA) {
                this.avancarEDevolverAnterior();
            }

            simboloAtualBlocoCaso = this.avancarEDevolverAnterior();
        }

        let caminhoPadrao = null;
        if (simboloAtualBlocoCaso.tipo === tiposDeSimbolos.OUTRO_CASO) {
            const declaracoes = [];
            do {
                declaracoes.push(this.resolverDeclaracaoForaDeBloco());
            } while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.FIM_ESCOLHA));

            caminhoPadrao = {
                declaracoes: declaracoes.filter((d) => d),
            };

            simboloAtualBlocoCaso = this.avancarEDevolverAnterior();
        }

        if (simboloAtualBlocoCaso.tipo !== tiposDeSimbolos.FIM_ESCOLHA) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavra-chave 'fimescolha' para fechamento de declaração 'escolha'."
            );
        }

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra-chave 'fimescolha'.");

        return new Escolha(identificador, caminhos, caminhoPadrao);
    }

    private logicaComumEscreva(): FormatacaoEscrita[] {
        const simboloParenteses = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );
        const argumentos: FormatacaoEscrita[] = [];

        // Sem não houver parâmetros, retorna vetor com literal vazio.
        if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PARENTESE_DIREITO) {
            this.avancarEDevolverAnterior();
            return [
                new FormatacaoEscrita(
                    this.hashArquivo,
                    Number(simboloParenteses.linha),
                    new Literal(this.hashArquivo, Number(simboloParenteses.linha), '')
                ),
            ];
        }

        do {
            const valor = this.expressao();

            let espacos = 0;
            let casasDecimais = 0;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                // Espaços
                const simboloEspacos = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    'Esperado número após sinal de dois-pontos após identificador como argumento.'
                );
                espacos = Number(simboloEspacos.lexema) - 1;
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                // Casas decimais
                const simboloCasasDecimais = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    'Esperado número após segundo sinal de dois-pontos após identificador como argumento.'
                );
                casasDecimais = Number(simboloCasasDecimais.lexema);
            }

            argumentos.push(
                new FormatacaoEscrita(this.hashArquivo, Number(simboloParenteses.linha), valor, espacos, casasDecimais)
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após fechamento de parênteses pós instrução 'escreva'."
        );

        return argumentos;
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos = this.logicaComumEscreva();

        return new Escreva(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    declaracaoEscrevaMesmaLinha(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos = this.logicaComumEscreva();

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    /**
     * Criação de declaração "repita".
     * @returns Um construto do tipo Fazer
     */
    declaracaoFazer(): Fazer {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após instrução 'repita'.");

        const declaracoes = [];
        do {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        } while (![tiposDeSimbolos.ATE, tiposDeSimbolos.ATÉ].includes(this.simbolos[this.atual].tipo));

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ATE, tiposDeSimbolos.ATÉ)) {
            this.consumir(
                this.simbolos[this.atual].tipo,
                "Esperado palavra-chave 'ate' ou 'até' após declaração de bloco em instrução 'repita'."
            );
        }

        const condicao = this.expressao();

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após condição de continuidade em instrução 'repita'."
        );

        return new Fazer(
            this.hashArquivo,
            Number(simboloAtual.linha),
            new Bloco(
                this.hashArquivo,
                Number(simboloAtual.linha),
                declaracoes.filter((d) => d)
            ),
            condicao
        );
    }

    /**
     * Criação de declaração "interrompa".
     * Em VisuAlg, "sustar" é chamada de "interrompa".
     * @returns Uma declaração do tipo Sustar.
     */
    private declaracaoInterrompa(): Sustar {
        const simboloAtual = this.avancarEDevolverAnterior();

        // TODO: Contar blocos para colocar esta condição de erro.
        /* if (this.blocos < 1) {
            this.erro(this.simbolos[this.atual - 1], "'interrompa' deve estar dentro de um laço de repetição.");
        } */

        return new Sustar(simboloAtual);
    }

    /**
     * Análise de uma declaração `leia()`. No VisuAlg, `leia()` aceita 1..N argumentos.
     * @returns Uma declaração `Leia`.
     */
    declaracaoLeia(): Leia {
        const simboloLeia = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes do argumento em instrução `leia`.");

        const argumentos = [];
        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após o argumento em instrução `leia`.");

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            'Esperado quebra de linha após fechamento de parênteses pós instrução `leia`.'
        );

        return new Leia(simboloLeia, argumentos);
    }

    declaracaoPara(): Para {
        const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();

        const variavelIteracao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador de variável após 'para'."
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.SETA_ATRIBUICAO)) {
            throw this.erro(
                this.simbolos[this.atual],
                "Esperado palavra reservada 'de' ou seta de atribuição após variável de controle de 'para'."
            );
        }

        const literalOuVariavelInicio = this.adicaoOuSubtracao();

        this.consumir(
            tiposDeSimbolos.ATE,
            "Esperado palavra reservada 'ate' após valor inicial do laço de repetição 'para'."
        );

        const literalOuVariavelFim = this.adicaoOuSubtracao();

        let operadorCondicao = new Simbolo(
            tiposDeSimbolos.MENOR_IGUAL,
            '',
            '',
            Number(simboloPara.linha),
            this.hashArquivo
        );
        let operadorCondicaoIncremento = new Simbolo(
            tiposDeSimbolos.MENOR,
            '',
            '',
            Number(simboloPara.linha),
            this.hashArquivo
        );

        // Isso existe porque o laço `para` do VisuAlg pode ter o passo positivo ou negativo
        // dependendo dos operandos de início e fim, que só são possíveis de determinar
        // em tempo de execução.
        // Quando um dos operandos é uma variável, tanto a condição do laço quanto o
        // passo são considerados indefinidos aqui.
        let passo: Construto;
        let resolverIncrementoEmExecucao = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PASSO)) {
            passo = this.unario();
            if (passo.hasOwnProperty('operador') && (passo as Unario).operador.tipo === tiposDeSimbolos.SUBTRACAO) {
                operadorCondicao = new Simbolo(
                    tiposDeSimbolos.MAIOR_IGUAL,
                    '',
                    '',
                    Number(simboloPara.linha),
                    this.hashArquivo
                );
                operadorCondicaoIncremento = new Simbolo(
                    tiposDeSimbolos.MAIOR,
                    '',
                    '',
                    Number(simboloPara.linha),
                    this.hashArquivo
                );
            }
        } else {
            if (literalOuVariavelInicio instanceof Literal && literalOuVariavelFim instanceof Literal) {
                if (literalOuVariavelInicio.valor > literalOuVariavelFim.valor) {
                    passo = new Unario(
                        this.hashArquivo,
                        new Simbolo(
                            tiposDeSimbolos.SUBTRACAO,
                            '-',
                            undefined,
                            simboloPara.linha,
                            simboloPara.hashArquivo
                        ),
                        new Literal(this.hashArquivo, Number(simboloPara.linha), 1),
                        'ANTES'
                    );
                    operadorCondicao = new Simbolo(
                        tiposDeSimbolos.MAIOR_IGUAL,
                        '',
                        '',
                        Number(simboloPara.linha),
                        this.hashArquivo
                    );
                    operadorCondicaoIncremento = new Simbolo(
                        tiposDeSimbolos.MAIOR,
                        '',
                        '',
                        Number(simboloPara.linha),
                        this.hashArquivo
                    );
                } else {
                    passo = new Literal(this.hashArquivo, Number(simboloPara.linha), 1);
                }
            } else {
                // Passo e operador de condição precisam ser resolvidos em tempo de execução.
                passo = undefined;
                operadorCondicao = undefined;
                operadorCondicaoIncremento = undefined;
                resolverIncrementoEmExecucao = true;
            }
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FACA, tiposDeSimbolos.FAÇA)) {
            this.consumir(
                this.simbolos[this.atual].tipo,
                "Esperado palavra reservada 'faca' ou 'faça' após valor final do laço de repetição 'para'."
            );
        }

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra reservada 'faca' do laço de repetição 'para'."
        );

        const declaracoesBlocoPara = [];
        let simboloAtualBlocoPara: SimboloInterface = this.simbolos[this.atual];
        while (simboloAtualBlocoPara.tipo !== tiposDeSimbolos.FIM_PARA) {
            declaracoesBlocoPara.push(this.resolverDeclaracaoForaDeBloco());
            simboloAtualBlocoPara = this.simbolos[this.atual];
        }

        this.consumir(tiposDeSimbolos.FIM_PARA, '');
        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra reservada 'fimpara'.");

        const corpo = new Bloco(
            this.hashArquivo,
            Number(simboloPara.linha) + 1,
            declaracoesBlocoPara.filter((d) => d)
        );

        const para = new Para(
            this.hashArquivo,
            Number(simboloPara.linha),
            // Inicialização.
            new Atribuir(this.hashArquivo, variavelIteracao, literalOuVariavelInicio),
            // Condição.
            new Binario(
                this.hashArquivo,
                new Variavel(this.hashArquivo, variavelIteracao),
                operadorCondicao,
                literalOuVariavelFim
            ),
            // Incremento, feito em construto especial `FimPara`.
            new FimPara(
                this.hashArquivo,
                Number(simboloPara.linha),
                new Binario(
                    this.hashArquivo,
                    new Variavel(this.hashArquivo, variavelIteracao),
                    operadorCondicaoIncremento,
                    literalOuVariavelFim
                ),
                new Expressao(
                    new Atribuir(
                        this.hashArquivo,
                        variavelIteracao,
                        new Binario(
                            this.hashArquivo,
                            new Variavel(this.hashArquivo, variavelIteracao),
                            new Simbolo(tiposDeSimbolos.ADICAO, '', null, Number(simboloPara.linha), this.hashArquivo),
                            passo
                        )
                    )
                )
            ),
            corpo
        );
        para.blocoPosExecucao = corpo;
        para.resolverIncrementoEmExecucao = resolverIncrementoEmExecucao;
        return para;
    }

    logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                const dadosParametros = this.logicaComumParametroVisuAlg();
                const tipoDadoParametro = {
                    nome: dadosParametros.simbolo.lexema,
                    tipo: dadosParametros.tipo as TiposDadosInterface,
                    tipoInvalido: !dadosParametros.tipo ? this.simboloAtual().lexema : null
                }

                for (let parametro of dadosParametros.identificadores) {
                    parametros.push({
                        abrangencia: 'padrao',
                        nome: parametro,
                        referencia: dadosParametros.referencia,
                        tipoDado: tipoDadoParametro,
                    });
                }
            }

            // Consumir parêntese direito
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                'Esperado parêntese direito para finalização da leitura de parâmetros.'
            );
        }

        return parametros;
    }

    /**
     * Procedimentos nada mais são do que funções que não retornam valor.
     */
    declaracaoProcedimento() {
        const simboloProcedimento: SimboloInterface = this.avancarEDevolverAnterior();

        const nomeProcedimento = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome do procedimento após palavra-chave `procedimento`.'
        );

        // Parâmetros
        const parametros = this.logicaComumParametros();

        const inicializacoes = this.validarSegmentoVar();
        this.validarSegmentoInicio('procedimento');

        const corpo: any[] = (inicializacoes as any[]).concat(this.blocoEscopo());

        return new FuncaoDeclaracao(
            nomeProcedimento,
            new FuncaoConstruto(
                this.hashArquivo,
                Number(simboloProcedimento.linha),
                parametros,
                corpo.filter((d) => d)
            )
        );
    }

    declaracaoRetorna(): Retorna {
        const simboloRetorna: SimboloInterface = this.avancarEDevolverAnterior();
        let valor = null;

        if (
            [
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.CARACTERE,
                tiposDeSimbolos.IDENTIFICADOR,
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.VERDADEIRO,
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.FALSO,
                tiposDeSimbolos.PARENTESE_ESQUERDO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = this.expressao();
        }

        return new Retorna(simboloRetorna, valor);
    }

    declaracaoSe(): Se {
        const simboloSe: SimboloInterface = this.avancarEDevolverAnterior();

        const condicao = this.expressao();

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENTAO, tiposDeSimbolos.ENTÃO)) {
            this.consumir(
                this.simbolos[this.atual].tipo,
                "Esperado palavra reservada 'entao' ou 'então' após condição em declaração 'se'."
            );
        }
        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra reservada 'entao' em declaração 'se'."
        );

        const declaracoes = [];
        do {
            declaracoes.push(this.resolverDeclaracaoForaDeBloco());
        } while (
            ![tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO, tiposDeSimbolos.FIM_SE].includes(
                this.simbolos[this.atual].tipo
            )
        );

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            const simboloSenao = this.simbolos[this.atual - 1];
            const declaracoesSenao = [];

            do {
                declaracoesSenao.push(this.resolverDeclaracaoForaDeBloco());
            } while (![tiposDeSimbolos.FIM_SE].includes(this.simbolos[this.atual].tipo));

            caminhoSenao = new Bloco(
                this.hashArquivo,
                Number(simboloSenao.linha),
                declaracoesSenao.filter((d) => d)
            );
        }

        this.consumir(tiposDeSimbolos.FIM_SE, "Esperado palavra-chave 'fimse' para fechamento de declaração 'se'.");

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após palavra-chave 'fimse'.");

        return new Se(
            condicao,
            new Bloco(
                this.hashArquivo,
                Number(simboloSe.linha),
                declaracoes.filter((d) => d)
            ),
            [],
            caminhoSenao
        );
    }

    declaracaoAleatorio(): Aleatorio {
        const simboloAleatorio: SimboloInterface = this.avancarEDevolverAnterior();

        let argumentos: { min: number, max: number } | null = {
            min: 0,
            max: 0
        };

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO)) {

            this.consumir(tiposDeSimbolos.VIRGULA, "Esperado ',' após declaração do primeiro número.");

            argumentos.min = Number(this.simboloAtual().literal);

            this.consumir(tiposDeSimbolos.NUMERO, "Esperado um número após ','.");

            argumentos.max = Number(this.simbolos[this.atual - 1].literal);

        } else if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ON)) {
            this.consumir(
                simboloAleatorio.tipo,
                "Esperado palavra reservada 'ON'ou 'on' ou combinação de número'(min, max)' após declaração 'aleatorio'"
            )
            argumentos = null
        }

        this.consumir(tiposDeSimbolos.QUEBRA_LINHA, "Esperado quebra de linha após declaração do último número.");

        const decoracoes = [];

        do {
            const decoracao = this.resolverDeclaracaoForaDeBloco()
            if(decoracao instanceof Leia) decoracao.eParaInterromper = true;
            decoracoes.push(decoracao);
        } while (![tiposDeSimbolos.ALEATORIO, tiposDeSimbolos.FIM_ALGORITMO].includes(this.simbolos[this.atual].tipo))

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ALEATORIO)) {
            this.consumir(tiposDeSimbolos.OFF, "Esperado palavra reservada 'off' ou 'OFF' após declaração 'aleatorio'.");
        }

        return new Aleatorio(simboloAleatorio.linha, simboloAleatorio.hashArquivo, new Bloco(simboloAleatorio.hashArquivo, Number(simboloAleatorio.linha), decoracoes.filter((d) => d)), argumentos)

    }

    resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];

        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ALEATORIO:
                return this.declaracaoAleatorio();
            case tiposDeSimbolos.ENQUANTO:
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                return this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.ESCREVA_LINHA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.FUNCAO:
                return this.funcao('funcao');
            case tiposDeSimbolos.INICIO:
                const simboloInicio = this.validarSegmentoInicio('algoritmo');
                return new InicioAlgoritmo(simboloInicio.linha, simboloInicio.hashArquivo);
            case tiposDeSimbolos.INTERROMPA:
                return this.declaracaoInterrompa();
            case tiposDeSimbolos.LEIA:
                return this.declaracaoLeia();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();
            case tiposDeSimbolos.PARENTESE_DIREITO:
                throw new Error('Não deveria estar caindo aqui.');
            case tiposDeSimbolos.PROCEDIMENTO:
                return this.declaracaoProcedimento();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.REPITA:
                return this.declaracaoFazer();
            case tiposDeSimbolos.RETORNE:
                return this.declaracaoRetorna();
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
            case tiposDeSimbolos.VAR:
                if (this.blocoPrincipalIniciado) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Sintaxe incorreta: início do bloco principal já foi declarado.'
                    );
                }
                return this.validarSegmentoVar();
            default:
                return new Expressao(this.expressao());
        }
    }

    /**
     * No VisuAlg, há uma determinada cadência de validação de símbolos.
     * - O primeiro símbolo é `algoritmo`, seguido por um identificador e
     * uma quebra de linha.
     * - Os próximos símbolo pode `var`, que pode ser seguido por uma série de
     * declarações de variáveis e finalizado por uma quebra de linha,
     * ou ainda `funcao` ou `procedimento`, seguidos dos devidos símbolos que definem
     * os blocos.
     * - O penúltimo símbolo é `inicio`, seguido por uma quebra de linha.
     * Pode haver ou não declarações dentro do bloco.
     * - O último símbolo deve ser `fimalgoritmo`, que também é usado para
     * definir quando não existem mais construtos a serem adicionados.
     * @param retornoLexador Os símbolos entendidos pelo Lexador.
     * @param hashArquivo Obrigatório por interface mas não usado aqui.
     */
    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.blocoPrincipalIniciado = false;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes: Declaracao[] = [];
        const simboloNomeAlgoritmo = this.validarSegmentoAlgoritmo();
        declaracoes.push(new CabecalhoPrograma(simboloNomeAlgoritmo.linha, simboloNomeAlgoritmo.hashArquivo, simboloNomeAlgoritmo.literal));

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_ALGORITMO) {
            const declaracao = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracao)) {
                declaracoes = declaracoes.concat(declaracao);
            } else {
                declaracoes.push(declaracao);
            }
        }

        const ultimoSimbolo = this.simbolos[this.simbolos.length - 1];
        if (ultimoSimbolo.tipo !== tiposDeSimbolos.FIM_ALGORITMO) {
            throw new ErroAvaliadorSintatico(
                ultimoSimbolo,
                `Programa não termina com 'fimalgoritmo'. Último símbolo: '${ultimoSimbolo.lexema || ultimoSimbolo.literal}'.`
            );
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
