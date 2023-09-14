import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import hrtime from 'browser-process-hrtime';

import { AvaliadorSintaticoInterface, ParametroInterface, SimboloInterface } from '../interfaces';
import {
    AcessoMetodo as AcessoMetodo,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    Dicionario,
    DefinirValor,
    FuncaoConstruto,
    Literal,
    Logico,
    AcessoIndiceVariavel,
    Super,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
    Isto,
} from '../construtos';

import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';

import {
    Bloco,
    Classe,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    FuncaoDeclaracao as FuncaoDeclaracao,
    Importar,
    Para,
    Sustar,
    Retorna,
    Se,
    Tente,
    Var,
    Leia,
    Const,
    ParaCada,
    Falhar,
} from '../declaracoes';
import { RetornoAvaliadorSintatico } from '../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from '../interfaces/retornos/retorno-lexador';
import { RetornoDeclaracao } from './retornos';
import { TiposDadosInterface } from '../interfaces/tipos-dados-interface';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintatico implements AvaliadorSintaticoInterface<SimboloInterface, Declaracao> {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];

    hashArquivo: number;
    atual: number;
    blocos: number;
    performance: boolean;

    constructor(performance = false) {
        this.hashArquivo = 0;
        this.atual = 0;
        this.blocos = 0;
        this.erros = [];
        this.performance = performance;
    }

    declaracaoDeVariavel(): Var {
        throw new Error('Método não implementado.');
    }

    erro(simbolo: SimboloInterface, mensagemDeErro: string): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual].tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: string): boolean {
        return this.simbolos[this.atual + 1].tipo === tipo;
    }

    verificarDefinicaoTipoAtual(): string {
        const tipos = ['inteiro', 'qualquer', 'real', 'texto', 'vazio', 'vetor'];

        const lexema = this.simboloAtual().lexema.toLowerCase();
        const contemTipo = tipos.find((tipo) => tipo === lexema);

        if (contemTipo && this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            const tiposVetores = ['inteiro[]', 'qualquer[]', 'real[]', 'texto[]'];
            this.avancarEDevolverAnterior();

            if (!this.verificarTipoProximoSimbolo(tiposDeSimbolos.COLCHETE_DIREITO)) {
                throw this.erro(this.simbolos[this.atual], "Esperado símbolo de fechamento do vetor ']'.");
            }

            const contemTipoVetor = tiposVetores.find((tipo) => tipo === `${lexema}[]`);

            this.avancarEDevolverAnterior();

            return contemTipoVetor;
        }

        return contemTipo;
    }

    simboloAtual(): SimboloInterface {
        return this.simbolos[this.atual];
    }

    simboloAnterior(): SimboloInterface {
        return this.simbolos[this.atual - 1];
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    avancarEDevolverAnterior(): SimboloInterface {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simbolos[this.atual - 1];
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
                valores = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    return new Dicionario(this.hashArquivo, Number(simboloAtual.linha), [], []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                    const chave = this.atribuir();
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
                    const valor = this.atribuir();

                    chaves.push(chave);
                    valores.push(valor);

                    if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                        this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula antes da próxima expressão.');
                    }
                }

                return new Dicionario(this.hashArquivo, Number(simboloAtual.linha), chaves, valores);

            case tiposDeSimbolos.COLCHETE_ESQUERDO:
                this.avancarEDevolverAnterior();
                valores = [];

                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    return new Vetor(this.hashArquivo, Number(simboloAtual.linha), []);
                }

                while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                    const valor = this.atribuir();
                    valores.push(valor);
                    if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.COLCHETE_DIREITO) {
                        this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula antes da próxima expressão.');
                    }
                }

                return new Vetor(this.hashArquivo, Number(simboloAtual.linha), valores);

            case tiposDeSimbolos.FALSO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), false);

            case tiposDeSimbolos.FUNCAO:
            case tiposDeSimbolos.FUNÇÃO:
                const simboloFuncao = this.avancarEDevolverAnterior();
                return this.corpoDaFuncao(simboloFuncao.lexema);

            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                // Se o próximo símbolo é um incremento ou um decremento,
                // aqui deve retornar um unário correspondente.
                // Caso contrário, apenas retornar um construto de variável.
                if (
                    this.simbolos[this.atual] &&
                    [tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(this.simbolos[this.atual].tipo)
                ) {
                    const simboloIncrementoDecremento: SimboloInterface = this.avancarEDevolverAnterior();
                    return new Unario(
                        this.hashArquivo,
                        simboloIncrementoDecremento,
                        new Variavel(this.hashArquivo, simboloIdentificador),
                        'DEPOIS'
                    );
                }

                return new Variavel(this.hashArquivo, simboloIdentificador);

            case tiposDeSimbolos.IMPORTAR:
                this.avancarEDevolverAnterior();
                return this.declaracaoImportar();

            case tiposDeSimbolos.ISTO:
                this.avancarEDevolverAnterior();
                return new Isto(this.hashArquivo, Number(simboloAtual.linha), simboloAtual);

            case tiposDeSimbolos.NULO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), null);

            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
                const simboloNumeroTexto: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloNumeroTexto.linha), simboloNumeroTexto.literal);

            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.SUPER:
                const simboloChave = this.avancarEDevolverAnterior();
                this.consumir(tiposDeSimbolos.PONTO, "Esperado '.' após 'super'.");
                const metodo = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do método da Superclasse.');
                return new Super(this.hashArquivo, simboloChave, metodo);

            case tiposDeSimbolos.VERDADEIRO:
                this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloAtual.linha), true);

            case tiposDeSimbolos.TIPO:
                this.avancarEDevolverAnterior();
                this.consumir(tiposDeSimbolos.DE, "Esperado 'de' após 'tipo'.");
                const _expressao = this.expressao() as any;
                return new TipoDe(
                    this.hashArquivo,
                    simboloAtual,
                    _expressao instanceof Literal ? _expressao.valor : _expressao
                );
        }

        throw this.erro(this.simbolos[this.atual], 'Esperado expressão.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        const argumentos: Array<Construto> = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 argumentos.');
                }
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        const parenteseDireito = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        return new Chamada(this.hashArquivo, entidadeChamada, parenteseDireito, argumentos);
    }

    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                expressao = this.finalizarChamada(expressao);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)) {
                const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, "Esperado nome do método após '.'.");
                expressao = new AcessoMetodo(this.hashArquivo, expressao, nome);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = this.expressao();
                const simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indice, simboloFechamento);
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
                tiposDeSimbolos.BIT_NOT,
                tiposDeSimbolos.INCREMENTAR,
                tiposDeSimbolos.DECREMENTAR
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.unario();
            return new Unario(this.hashArquivo, operador, direito, 'ANTES');
        }

        return this.chamar();
    }

    exponenciacao(): Construto {
        let expressao = this.unario();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
            const operador = this.simbolos[this.atual - 1];
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
                tiposDeSimbolos.DIVISAO_IGUAL,
                tiposDeSimbolos.DIVISAO_INTEIRA,
                tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL,
                tiposDeSimbolos.MODULO,
                tiposDeSimbolos.MODULO_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.exponenciacao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Se símbolo de operação é `+`, `-`, `+=` ou `-=`, monta objeto `Binario` para
     * ser avaliado pelo Interpretador.
     * @returns Um Construto, normalmente um `Binario`, ou `Unario` se houver alguma operação unária para ser avaliada.
     */
    adicaoOuSubtracao(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO,
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitShift(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MENOR_MENOR, tiposDeSimbolos.MAIOR_MAIOR)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitShift();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitShift();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitOu(): Construto {
        let expressao = this.bitE();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)) {
            const operador = this.simbolos[this.atual - 1];
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
            const operador = this.simbolos[this.atual - 1];
            const direito = this.bitOu();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = this.em();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
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

        if (
            expressao instanceof Binario &&
            [
                tiposDeSimbolos.MAIS_IGUAL,
                tiposDeSimbolos.MENOS_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                tiposDeSimbolos.DIVISAO_IGUAL,
                tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL,
                tiposDeSimbolos.MODULO_IGUAL,
            ].includes(expressao.operador.tipo)
        ) {
            return new Atribuir(this.hashArquivo, (expressao.esquerda as Variavel).simbolo, expressao);
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simbolos[this.atual - 1];
            const valor = this.expressao();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                return new DefinirValor(this.hashArquivo, igual.linha, get.objeto, get.simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }
            this.erro(igual, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    expressao(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.LEIA)) return this.declaracaoLeia();
        return this.atribuir();
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    declaracaoExpressao(): Expressao {
        const expressao = this.expressao();
        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Expressao(expressao);
    }

    /**
     * Declaração para comando `leia`, para ler dados de entrada do usuário.
     * @returns Um objeto da classe `Leia`.
     */
    declaracaoLeia(): Leia {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos argumentos em instrução `leia`.");

        const argumentos: Construto[] = [];

        if (this.simbolos[this.atual].tipo !== tiposDeSimbolos.PARENTESE_DIREITO) {
            do {
                argumentos.push(this.expressao());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos em instrução `leia`.");

        return new Leia(simboloAtual.hashArquivo, Number(simboloAtual.linha), argumentos);
    }

    blocoEscopo(): Array<RetornoDeclaracao> {
        let declaracoes: Array<RetornoDeclaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(retornoDeclaracao)) {
                declaracoes = declaracoes.concat(retornoDeclaracao);
            } else {
                declaracoes.push(retornoDeclaracao as Declaracao);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return declaracoes;
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

    declaracaoEnquanto(): Enquanto {
        try {
            this.blocos += 1;

            const condicao = this.expressao();
            const corpo = this.resolverDeclaracao();

            return new Enquanto(condicao, corpo);
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
        const corpo = this.resolverDeclaracao();

        return new ParaCada(this.hashArquivo, Number(simboloPara.linha), nomeVariavelIteracao.lexema, vetor, corpo);
    }

    protected declaracaoParaTradicional(simboloPara: SimboloInterface): Para {
        const comParenteses = this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO);

        let inicializador: Var | Expressao;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            inicializador = null;
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) {
            inicializador = this.declaracaoDeVariaveis();
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONSTANTE)) {
            inicializador = this.declaracaoDeConstantes();
        } else {
            inicializador = this.declaracaoExpressao();
        }

        let condicao = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            condicao = this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        let incrementar = null;
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            incrementar = this.expressao();
        }

        if (comParenteses) {
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após cláusulas de inicialização, condição e incremento."
            );
        }

        const corpo = this.resolverDeclaracao();

        return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
    }

    declaracaoPara(): Para | ParaCada {
        try {
            const simboloPara: SimboloInterface = this.simbolos[this.atual - 1];
            this.blocos += 1;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CADA)) {
                return this.declaracaoParaCada(simboloPara);
            }

            return this.declaracaoParaTradicional(simboloPara);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoSustar(): Sustar {
        if (this.blocos < 1) {
            this.erro(this.simbolos[this.atual - 1], "'sustar' ou 'pausa' deve estar dentro de um laço de repetição.");
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Sustar(this.simbolos[this.atual - 1]);
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            this.erro(this.simbolos[this.atual - 1], "'continua' precisa estar em um laço de repetição.");
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Continua(this.simbolos[this.atual - 1]);
    }

    declaracaoRetorna(): Retorna {
        const simboloChave = this.simbolos[this.atual - 1];
        let valor = null;

        if (
            [
                tiposDeSimbolos.COLCHETE_ESQUERDO,
                tiposDeSimbolos.FALSO,
                tiposDeSimbolos.IDENTIFICADOR,
                tiposDeSimbolos.ISTO,
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.NULO,
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                tiposDeSimbolos.SUPER,
                tiposDeSimbolos.TEXTO,
                tiposDeSimbolos.VERDADEIRO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = this.expressao();
        }

        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Retorna(simboloChave, valor);
    }

    declaracaoEscolha(): Escolha {
        try {
            this.blocos += 1;

            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo do 'escolha'.");

            const caminhos = [];
            let caminhoPadrao = null;
            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    const caminhoCondicoes = [this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'caso'.");
                    }

                    let declaracoes = [];
                    do {
                        const retornoDeclaracao = this.resolverDeclaracao();
                        if (Array.isArray(retornoDeclaracao)) {
                            declaracoes = declaracoes.concat(retornoDeclaracao);
                        } else {
                            declaracoes.push(retornoDeclaracao as Declaracao);
                        }
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.PADRAO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)) {
                    if (caminhoPadrao !== null) {
                        const excecao = new ErroAvaliadorSintatico(
                            this.simbolos[this.atual],
                            "Você só pode ter um 'padrao' em cada declaração de 'escolha'."
                        );
                        this.erros.push(excecao);
                        throw excecao;
                    }

                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'padrao'.");

                    const declaracoes = [];
                    do {
                        declaracoes.push(this.resolverDeclaracao());
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.PADRAO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

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

    declaracaoFalhar(): Falhar {
        const simboloFalha: SimboloInterface = this.simbolos[this.atual - 1];
        const textoFalha = this.consumir(tiposDeSimbolos.TEXTO, 'Esperado texto para explicar falha.');
        return new Falhar(simboloFalha, textoFalha.literal);
    }

    declaracaoImportar(): Importar {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");

        const caminho = this.expressao();

        const simboloFechamento = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal, simboloFechamento);
    }

    declaracaoTente(): Tente {
        const simboloTente: SimboloInterface = this.simbolos[this.atual - 1];
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'tente'.");

        const blocoTente: any[] = this.blocoEscopo();

        let blocoPegue: FuncaoConstruto | Declaracao[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                // Caso 1: com parâmetro de erro.
                // `pegue` recebe um `FuncaoConstruto`.
                blocoPegue = this.corpoDaFuncao('bloco `pegue`');
            } else {
                // Caso 2: sem parâmetro de erro.
                // `pegue` recebe um bloco.
                this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'pegue'.");
                blocoPegue = this.blocoEscopo();
            }
        }

        let blocoSenao: any[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'senão'.");

            blocoSenao = this.blocoEscopo();
        }

        let blocoFinalmente: any[] = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'finalmente'.");

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
        const simboloFazer: SimboloInterface = this.simbolos[this.atual - 1];
        try {
            this.blocos += 1;

            const caminhoFazer = this.resolverDeclaracao();

            this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado declaração do 'enquanto' após o escopo do 'fazer'.");

            const condicaoEnquanto = this.expressao();

            return new Fazer(simboloFazer.hashArquivo, Number(simboloFazer.linha), caminhoFazer, condicaoEnquanto);
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * Todas as resoluções triviais da linguagem, ou seja, todas as
     * resoluções que podem ocorrer dentro ou fora de um bloco.
     * @returns Normalmente uma `Declaracao`, mas há casos em que
     * outros objetos podem ser retornados.
     * @see resolverDeclaracaoForaDeBloco para as declarações que não podem
     * ocorrer em blocos de escopo elementares.
     */
    resolverDeclaracao(): any {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                const simboloInicioBloco: SimboloInterface = this.avancarEDevolverAnterior();
                return new Bloco(simboloInicioBloco.hashArquivo, Number(simboloInicioBloco.linha), this.blocoEscopo());
            case tiposDeSimbolos.CONSTANTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeConstantes();
            case tiposDeSimbolos.CONTINUA:
                this.avancarEDevolverAnterior();
                return this.declaracaoContinua();
            case tiposDeSimbolos.ENQUANTO:
                this.avancarEDevolverAnterior();
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                this.avancarEDevolverAnterior();
                return this.declaracaoEscolha();
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
                return this.declaracaoTente();
            case tiposDeSimbolos.VARIAVEL:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeVariaveis();
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
                this.erro(
                    this.simbolos[this.atual],
                    'Não é permitido ter dois identificadores seguidos na mesma linha.'
                );
            }
        }

        return this.declaracaoExpressao();
    }

    verificarTipoAtribuido(tipo: string, inicializador: any) {
        if (tipo) {
            if (['vetor', 'qualquer[]', 'inteiro[]', 'texto[]'].includes(tipo)) {
                if (inicializador instanceof Vetor) {
                    const vetor = inicializador as Vetor;
                    if (tipo === 'inteiro[]') {
                        for (let elemento of vetor.valores) {
                            if (typeof elemento.valor !== 'number') {
                                throw this.erro(
                                    this.simboloAtual(),
                                    "Atribuição inválida, é esperado um vetor de 'inteiros' ou 'real'."
                                );
                            }
                        }
                    }
                    if (tipo === 'texto[]') {
                        for (let elemento of vetor.valores) {
                            if (typeof elemento.valor !== 'string') {
                                throw this.erro(
                                    this.simboloAtual(),
                                    "Atribuição inválida, é esperado um vetor de 'texto'."
                                );
                            }
                        }
                    }
                } else {
                    throw this.erro(this.simboloAtual(), 'Atribuição inválida, é esperado um vetor de elementos.');
                }
            }

            if (inicializador instanceof Literal) {
                const literal = inicializador as Literal;
                if (tipo === 'texto') {
                    if (typeof literal.valor !== 'string') {
                        throw this.erro(this.simboloAtual(), "Atribuição inválida, é esperado um 'texto'.");
                    }
                }
                if (['inteiro', 'real'].includes(tipo)) {
                    if (typeof literal.valor !== 'number') {
                        throw this.erro(this.simboloAtual(), "Atribuição inválida, é esperado um 'número'.");
                    }
                }
            }
        }
    }

    /**
     * Caso símbolo atual seja `var`, devolve uma declaração de variável.
     * @returns Um Construto do tipo Var.
     */
    protected declaracaoDeVariaveis(): any {
        const identificadores: SimboloInterface[] = [];
        let retorno: Declaracao[] = [];
        let tipo: any = null;

        do {
            identificadores.push(this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da variável.'));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            const tipoVariavel = this.verificarDefinicaoTipoAtual();
            if (!tipoVariavel) {
                throw this.erro(this.simboloAtual(), 'Tipo definido na variável não é válido.');
            }
            tipo = tipoVariavel;
            this.avancarEDevolverAnterior();
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            for (let [indice, identificador] of identificadores.entries()) {
                retorno.push(new Var(identificador, null, tipo));
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

            this.verificarTipoAtribuido(tipo, inicializador);

            retorno.push(new Var(identificador, inicializador, tipo));
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return retorno;
    }

    /**
     * Caso símbolo atual seja `const, constante ou fixo`, devolve uma declaração de const.
     * @returns Um Construto do tipo Const.
     */
    declaracaoDeConstantes(): any {
        const identificadores: SimboloInterface[] = [];
        let tipo: any = null;

        do {
            identificadores.push(this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da constante.'));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            const tipoConstante = this.verificarDefinicaoTipoAtual();
            if (!tipoConstante) {
                throw this.erro(this.simboloAtual(), 'Tipo definido na constante não é válido.');
            }
            tipo = tipoConstante;
            this.avancarEDevolverAnterior();
        }

        this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador em instrução 'constante'.");

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

        let retorno: Declaracao[] = [];
        for (let [indice, identificador] of identificadores.entries()) {
            const inicializador = inicializadores[indice];

            this.verificarTipoAtribuido(tipo, inicializador);

            retorno.push(new Const(identificador, inicializadores[indice], tipo));
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return retorno;
    }

    funcao(tipo: string): FuncaoDeclaracao {
        let simbolo: SimboloInterface;
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.CONSTRUTOR:
                simbolo = this.avancarEDevolverAnterior();
                break;
            default:
                simbolo = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome de ${tipo}.`);
                break;
        }
        return new FuncaoDeclaracao(simbolo, this.corpoDaFuncao(tipo));
    }

    logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 parâmetros');
            }

            const parametro: Partial<ParametroInterface> = {};

            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.abrangencia = 'multiplo';
            } else {
                parametro.abrangencia = 'padrao';
            }

            parametro.nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do parâmetro.');

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            }

            if (parametro.abrangencia === 'multiplo') break;

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
                let tipoDadoParametro = this.verificarDefinicaoTipoAtual();

                if (!tipoDadoParametro) {
                    this.erro(this.simboloAtual(), `O tipo '${this.simboloAtual().lexema}' não é válido.`);
                } else {
                    parametro.tipo = tipoDadoParametro as TiposDadosInterface;
                    this.avancarEDevolverAnterior();
                }
            }

            parametros.push(parametro as ParametroInterface);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma.
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        let tipoRetorno = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            tipoRetorno = this.verificarDefinicaoTipoAtual();

            if (!tipoRetorno) {
                this.erro(this.simboloAtual(), `Esperado um tipo de retorno válido após ':'`);
            }

            this.avancarEDevolverAnterior();
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do escopo do ${tipo}.`);

        const corpo = this.blocoEscopo();

        if (tipoRetorno) {
            let funcaoContemRetorno = corpo.find((c) => c instanceof Retorna) as Retorna;
            if (funcaoContemRetorno) {
                if (tipoRetorno === 'vazio') {
                    throw this.erro(this.simboloAtual(), `A função não pode ter nenhum tipo de retorno.`);
                }

                const tipoValor = typeof funcaoContemRetorno.valor.valor;
                if (!['qualquer'].includes(tipoRetorno)) {
                    if (tipoValor === 'string') {
                        if (tipoRetorno != 'texto') {
                            this.erro(
                                this.simboloAtual(),
                                `Esperado retorno do tipo '${tipoRetorno}' dentro da função.`
                            );
                        }
                    }
                    if (tipoValor === 'number') {
                        if (!['inteiro', 'real'].includes(tipoRetorno)) {
                            this.erro(
                                this.simboloAtual(),
                                `Esperado retorno do tipo '${tipoRetorno}' dentro da função.`
                            );
                        }
                    }
                }
            } else {
                if (tipoRetorno !== 'vazio') {
                    this.erro(this.simboloAtual(), `Esperado retorno do tipo '${tipoRetorno}' dentro da função.`);
                }
            }
        }

        return new FuncaoConstruto(this.hashArquivo, Number(parenteseEsquerdo.linha), parametros, corpo, tipoRetorno);
    }

    declaracaoDeClasse(): Classe {
        const simbolo: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da classe.');

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
            this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da Superclasse.');
            superClasse = new Variavel(this.hashArquivo, this.simbolos[this.atual - 1]);
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo da classe.");

        const metodos = [];
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            metodos.push(this.funcao('método'));
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o escopo da classe.");
        return new Classe(simbolo, superClasse, metodos);
    }

    /**
     * Declarações fora de bloco precisam ser verificadas primeiro porque
     * não é possível declarar uma classe/função dentro de um bloco `enquanto`,
     * `fazer ... enquanto`, `para`, `escolha`, etc.
     * @returns Uma função ou classe se o símbolo atual resolver aqui.
     *          O retorno de `resolverDeclaracao()` em caso contrário.
     * @see resolverDeclaracao
     */
    resolverDeclaracaoForaDeBloco(): RetornoDeclaracao {
        try {
            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return this.funcao('funcao');
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE)) return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
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
    sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            const tipoSimboloAtual: string = this.simbolos[this.atual - 1].tipo;

            switch (tipoSimboloAtual) {
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

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

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
            console.log(`[Avaliador Sintático] Tempo para análise: ${deltaAnalise[0] * 1e9 + deltaAnalise[1]}ns`);
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
