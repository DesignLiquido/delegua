import hrtime from 'browser-process-hrtime';

import {
    AcessoIndiceVariavel,
    AcessoMetodo,
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
    FuncaoDeclaracao as FuncaoDeclaracao,
    Classe,
    Declaracao,
    Expressao,
    Bloco,
    Sustar,
    Leia,
    Const,
} from '../../declaracoes';

import { AvaliadorSintaticoInterface, SimboloInterface } from '../../interfaces';
import { Pragma } from '../../lexador/dialetos/pragma';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoDeclaracao, RetornoPrimario, RetornoResolverDeclaracao } from '../retornos';

import tiposDeSimbolos from '../../tipos-de-simbolos/eguap';
import { Simbolo } from '../../lexador';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 *
 * A grande diferença entre este avaliador e os demais é a forma como são entendidos os blocos de escopo.
 * Este avaliador espera uma estrutura de pragmas, que explica quantos espaços há na frente de cada linha.
 */
export class AvaliadorSintaticoEguaP implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    pragmas: { [linha: number]: Pragma };

    hashArquivo: number;
    atual: number;
    blocos: number;
    escopos: number[];
    performance: boolean;

    constructor(performance = false) {
        this.atual = 0;
        this.blocos = 0;
        this.performance = performance;
        this.escopos = [];
    }
    
    declaracaoDeConstantes(): Const[] {
        throw new Error("Método não implementado.");
    }

    declaracaoDeVariavel(): Var {
        throw new Error("Método não implementado.");
    }

    declaracaoDeVariaveis(): any {
        const identificadores: SimboloInterface[] = [];
        let retorno: Declaracao[] = [];

        do {
            identificadores.push(this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.'));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            for (let [indice, identificador] of identificadores.entries()) {
                retorno.push(new Var(identificador, null));
            }
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
            return retorno;
        }

        //this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador em instrução 'var'.");

        const inicializadores = [];
        do {
            inicializadores.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        if (identificadores.length !== inicializadores.length) {
            throw this.erro(this.simboloAtual(), "Quantidade de identificadores à esquerda do igual é diferente da quantidade de valores à direita.");
        }

        for (let [indice, identificador] of identificadores.entries()) {
            retorno.push(new Var(identificador, inicializadores[indice]));
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

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

    primario(): RetornoPrimario {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUPER)) {
            const simboloChave = this.simboloAnterior();
            this.consumir(tiposDeSimbolos.PONTO, "Esperado '.' após 'super'.");
            const metodo = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do método da Superclasse.');
            return new Super(this.hashArquivo, simboloChave, metodo);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
            const valores = [];

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                return new Vetor(this.hashArquivo, 0, []);
            }

            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
                const valor = this.atribuir();
                valores.push(valor);
                if (this.simboloAtual().tipo !== tiposDeSimbolos.COLCHETE_DIREITO) {
                    this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula antes da próxima expressão.');
                }
            }

            return new Vetor(this.hashArquivo, 0, valores);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)) {
            const chaves = [];
            const valores = [];

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                return new Dicionario(this.hashArquivo, 0, [], []);
            }

            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
                const chave = this.atribuir();
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' entre chave e valor.");
                const valor = this.atribuir();

                chaves.push(chave);
                valores.push(valor);

                if (this.simboloAtual().tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
                    this.consumir(tiposDeSimbolos.VIRGULA, 'Esperado vírgula antes da próxima expressão.');
                }
            }

            return new Dicionario(this.hashArquivo, 0, chaves, valores);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO)) return new Literal(this.hashArquivo, 0, false);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO))
            return new Literal(this.hashArquivo, 0, true);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NULO)) return new Literal(this.hashArquivo, 0, null);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ISTO))
            return new Isto(this.hashArquivo, 0, this.simboloAnterior());

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO, tiposDeSimbolos.TEXTO)) {
            const simboloAnterior: SimboloInterface = this.simboloAnterior();
            return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)) {
            return new Variavel(this.hashArquivo, this.simboloAnterior());
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            const expressao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

            return new Agrupamento(this.hashArquivo, 0, expressao);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IMPORTAR)) return this.declaracaoImportar();

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

        const parenteseDireito = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os argumentos.");

        return new Chamada(this.hashArquivo, entidadeChamada, parenteseDireito, argumentos);
    }

    chamar(): Construto | RetornoPrimario {
        let expressao: RetornoPrimario | Construto = this.primario();

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

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)) {
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitShift(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MENOR_MENOR, tiposDeSimbolos.MAIOR_MAIOR)) {
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

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)) {
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

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
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
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                return new DefinirValor(this.hashArquivo, 0, expressao.objeto, expressao.simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    0,
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
        const simboloAtual = this.simboloAtual();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Array<Construto> = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    declaracaoExpressao() {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    declaracaoLeia(): Leia {
        const simboloAtual = this.simbolos[this.atual];

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em leia.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em leia.");

        return new Leia(simboloAtual.hashArquivo, Number(simboloAtual.linha), argumentos);
    }

    blocoEscopo(): any[] {
        let declaracoes: Array<RetornoDeclaracao> = [];
        let simboloAtual = this.simboloAtual();
        const simboloAnterior = this.simboloAnterior();

        // Situação 1: não tem bloco de escopo.
        //
        // Exemplo: `se verdadeiro: escreva('Alguma coisa')`.
        // Neste caso, linha do símbolo atual é igual à linha do símbolo anterior.

        if (simboloAtual.linha === simboloAnterior.linha) {
            declaracoes.push(this.declaracao());
        } else {
            // Situação 2: símbolo atual fica na próxima linha.
            //
            // Verifica-se o número de espaços à esquerda da linha através dos pragmas.
            // Se número de espaços da linha do símbolo atual é menor ou igual ao número de espaços
            // da linha anterior, e bloco ainda não começou, é uma situação de erro.
            let espacosIndentacaoLinhaAtual = this.pragmas[simboloAtual.linha].espacosIndentacao;
            const espacosIndentacaoLinhaAnterior = this.pragmas[simboloAnterior.linha].espacosIndentacao;
            if (espacosIndentacaoLinhaAtual <= espacosIndentacaoLinhaAnterior) {
                this.erro(
                    simboloAtual,
                    `Indentação inconsistente na linha ${simboloAtual.linha}. ` +
                        `Esperado: >= ${espacosIndentacaoLinhaAnterior}. ` +
                        `Atual: ${espacosIndentacaoLinhaAtual}`
                );
            } else {
                // Indentação ok, é um bloco de escopo.
                // Inclui todas as declarações cujas linhas tenham o mesmo número de espaços
                // de indentação do bloco.
                // Se `simboloAtual` for definido em algum momento como indefinido,
                // Significa que o código acabou, então o bloco também acabou.
                const espacosIndentacaoBloco = espacosIndentacaoLinhaAtual;
                while (espacosIndentacaoLinhaAtual === espacosIndentacaoBloco) {
                    const retornoDeclaracao = this.declaracao();
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
        }

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
                [tiposDeSimbolos.CASO, tiposDeSimbolos.PADRAO].includes(this.simbolos[this.atual].tipo)
            ) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    const caminhoCondicoes = [this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'caso'.");
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

                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'padrao'.");

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

    declaracaoPara(): Para {
        try {
            const simboloPara: SimboloInterface = this.simboloAnterior();
            this.blocos += 1;

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

            return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } catch (erro) {
            throw erro;
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoSe(): Se {
        const condicao = this.expressao();

        // this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após condição de declaração 'se'.");

        const caminhoEntao = this.resolverDeclaracao();
        // const caminhoEntao = this.blocoEscopo();

        // TODO: `senãose` não existe na língua portuguesa, e a forma separada, `senão se`,
        // funciona do jeito que deveria.
        // Marcando este código para ser removido em versões futuras.
        /* while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAOSE, tiposDeSimbolos.SENÃOSE)) {
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'senaose' ou 'senãose'.");
            const condicaoSeSenao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após codição do 'senaose' ou 'senãose'.");

            const caminho = this.resolverDeclaracao();

            caminhosSeSenao.push({
                condicao: condicaoSeSenao,
                caminho: caminho,
            });
        } */

        // Se há algum escopo aberto, conferir antes do senão se símbolo
        // atual é um espaço de indentação
        /* if (this.escopos.length > 0) {
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESPACO_INDENTACAO);
        } */

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO, tiposDeSimbolos.SENÃO)) {
            caminhoSenao = this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    declaracaoSustar() {
        if (this.blocos < 1) {
            this.erro(this.simboloAnterior(), "'sustar' deve estar dentro de um laço de repetição.");
        }

        return new Sustar(this.simboloAtual());
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            this.erro(this.simboloAnterior(), "'continua' precisa estar em um laço de repetição.");
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
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");

        const caminho = this.expressao();

        const simboloFechamento = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal, simboloFechamento);
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
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FAZER)) return this.declaracaoFazer();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TENTE)) return this.declaracaoTente();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCOLHA)) return this.declaracaoEscolha();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.RETORNA)) return this.declaracaoRetorna();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONTINUA)) return this.declaracaoContinua();
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUSTAR) ||
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PAUSA)
        )
            return this.declaracaoSustar();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARA)) return this.declaracaoPara();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENQUANTO)) return this.declaracaoEnquanto();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) return this.declaracaoSe();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCREVA)) return this.declaracaoEscreva();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOIS_PONTOS)) {
            const simboloInicioBloco: SimboloInterface = this.simboloAnterior();
            return new Bloco(simboloInicioBloco.hashArquivo, Number(simboloInicioBloco.linha), this.blocoEscopo());
        }

        return this.declaracaoExpressao();
    }

    funcao(tipo: string, construtor?: boolean): FuncaoDeclaracao {
        const simbolo: SimboloInterface = !construtor
            ? this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`)
            : new Simbolo(tiposDeSimbolos.CONSTRUTOR, 'construtor', null, -1, -1);
        return new FuncaoDeclaracao(simbolo, this.corpoDaFuncao(tipo));
    }

    logicaComumParametros(): Array<object> {
        const parametros: Array<object> = [];

        do {
            if (parametros.length >= 255) {
                this.erro(this.simboloAtual(), 'Não pode haver mais de 255 parâmetros');
            }

            const parametro = {};

            if (this.simboloAtual().tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro['tipo'] = 'multiplo';
            } else {
                parametro['tipo'] = 'padrao';
            }

            parametro['nome'] = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do parâmetro.');

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro['valorPadrao'] = this.primario();
            }

            parametros.push(parametro);

            if (parametro['tipo'] === 'multiplo') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    corpoDaFuncao(tipo: string): FuncaoConstruto {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, `Esperado '(' após o nome ${tipo}.`);

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");

        this.consumir(tiposDeSimbolos.DOIS_PONTOS, `Esperado ':' antes do escopo do ${tipo}.`);

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, 0, parametros, corpo);
    }

    declaracaoDeClasse(): Classe {
        const simbolo: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da classe.');

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
            this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da Superclasse.');
            superClasse = new Variavel(this.hashArquivo, this.simboloAnterior());
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
            metodos.push(this.funcao('método', this.simbolos[this.atual - 1].tipo === tiposDeSimbolos.CONSTRUTOR));
        }

        return new Classe(simbolo, superClasse, metodos);
    }

    /**
     * Consome o símbolo atual, verificando se é uma declaração de função, variável, classe
     * ou uma expressão.
     * @returns Objeto do tipo `Declaracao`.
     */
    declaracao(): RetornoDeclaracao {
        try {
            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return this.funcao('funcao');
            }
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) return this.declaracaoDeVariaveis();
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE)) return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            return null;
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.escopos = [];

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.pragmas = retornoLexador?.pragmas || {};

        let declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            const retornoDeclaracao = this.declaracao();
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
        } as RetornoAvaliadorSintatico;
    }
}
