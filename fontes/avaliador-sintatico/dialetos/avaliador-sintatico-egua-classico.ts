import { AvaliadorSintaticoInterface, SimboloInterface } from '../../interfaces';
import {
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Dicionario,
    DefinirValor,
    FuncaoConstruto,
    AcessoMetodo,
    Agrupamento,
    Literal,
    Logico,
    AcessoIndiceVariavel,
    Super,
    Unario,
    Variavel,
    Vetor,
    Isto,
    Construto,
} from '../../construtos';

import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import {
    Bloco,
    Classe,
    Continua,
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
} from '../../declaracoes';

import { RetornoAvaliadorSintatico } from '../../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from '../../interfaces/retornos/retorno-lexador';
import { RetornoDeclaracao, RetornoPrimario, RetornoResolverDeclaracao } from '../retornos';

import tiposDeSimbolos from '../../tipos-de-simbolos/egua-classico';

/**
 * O avaliador sintático (Parser) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * 
 * Esta implementação tenta seguir à risca o que está atualmente em https://github.com/eguatech/egua/blob/master/src/parser.js.
 */
export class AvaliadorSintaticoEguaClassico implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];

    hashArquivo: number;
    atual: number;
    blocos: number;

    constructor(simbolos?: SimboloInterface[]) {
        this.simbolos = simbolos;

        this.atual = 0;
        this.blocos = 0;
    }

    declaracaoLeia(): Leia {
        throw new Error('Método não implementado.');
    }

    sincronizar(): void {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            if (this.simboloAnterior().tipo === tiposDeSimbolos.PONTO_E_VIRGULA) return;

            switch (this.simboloAtual().tipo) {
                case tiposDeSimbolos.CLASSE:
                case tiposDeSimbolos.FUNCAO:
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

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancarEDevolverAnterior();
        else throw this.erro(this.simboloAtual(), mensagemDeErro);
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
        return this.simboloAtual().tipo === tiposDeSimbolos.EOF;
    }

    avancarEDevolverAnterior(): SimboloInterface {
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
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FUNCAO)) return this.corpoDaFuncao('função');
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO)) return new Literal(this.hashArquivo, 0, false);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO))
            return new Literal(this.hashArquivo, 0, true);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NULO)) return new Literal(this.hashArquivo, 0, null);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ISTO))
            return new Isto(this.hashArquivo, Number(this.simboloAnterior()));
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO, tiposDeSimbolos.TEXTO)) {
            return new Literal(this.hashArquivo, 0, this.simboloAnterior().literal);
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

    finalizarChamada(entidadeChamada: RetornoPrimario): Chamada {
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
    adicaoOuSubtracao;
    adicionar(): Construto {
        let expressao = this.multiplicar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)) {
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    bitShift(): Construto {
        let expressao = this.adicionar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MENOR_MENOR, tiposDeSimbolos.MAIOR_MAIOR)) {
            const operador = this.simboloAnterior();
            const direito = this.adicionar();
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

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simboloAnterior();
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                return new DefinirValor(this.hashArquivo, 0, get.objeto, get.simbolo, valor);
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
        return this.atribuir();
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.simboloAtual();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const valor = this.expressao();

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após o valor.");

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, [valor]);
    }

    declaracaoExpressao(): Expressao {
        const expressao = this.expressao();
        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após expressão.");
        return new Expressao(expressao);
    }

    blocoEscopo(): RetornoDeclaracao[] {
        const declaracoes: Array<RetornoDeclaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");
        return declaracoes;
    }

    declaracaoSe(): Se {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'.");
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do se.");

        const caminhoEntao = this.resolverDeclaracao();

        const caminhosSeSenao = [];
        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENÃOSE)) {
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'senãose'.");
            const condicaoSeSenao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' apóes codição do 'senãose.");

            const caminho = this.resolverDeclaracao();

            caminhosSeSenao.push({
                condicao: condicaoSeSenao,
                caminho: caminho,
            });
        }

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENÃO)) {
            caminhoSenao = this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, caminhosSeSenao, caminhoSenao);
    }

    declaracaoEnquanto(): Enquanto {
        try {
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condicional.");
            const corpo = this.resolverDeclaracao();

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoPara(): Para {
        try {
            const simboloPara: SimboloInterface = this.simboloAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'para'.");

            let inicializador;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                inicializador = null;
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) {
                inicializador = this.declaracaoDeVariavel();
            } else {
                inicializador = this.declaracaoExpressao();
            }

            let condicao = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                condicao = this.expressao();
            }

            this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após valores da condicional");

            let incrementar = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = this.expressao();
            }

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após cláusulas");

            const corpo = this.resolverDeclaracao();

            return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoSustar(): Sustar {
        if (this.blocos < 1) {
            this.erro(this.simboloAnterior(), "'pausa' deve estar dentro de um loop.");
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após 'pausa'.");
        return new Sustar(this.simboloAtual());
    }

    declaracaoContinua(): Continua {
        if (this.blocos < 1) {
            this.erro(this.simboloAnterior(), "'continua' precisa estar em um laço de repetição.");
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após 'continua'.");
        return new Continua(this.simboloAtual());
    }

    declaracaoRetorna(): Retorna {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = this.expressao();
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após o retorno.");
        return new Retorna(palavraChave, valor);
    }

    declaracaoEscolha(): Escolha {
        try {
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '{' após 'escolha'.");

            const condicao = this.expressao();

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado '}' após a condição de 'escolha'.");
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

                    const declaracoes = [];
                    do {
                        declaracoes.push(this.resolverDeclaracao());
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
                            this.simboloAtual(),
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

    declaracaoImportar(): Importar {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração.");

        const caminho = this.expressao();

        const simboloFechamento = this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração.");

        return new Importar(caminho as Literal, simboloFechamento);
    }

    declaracaoTente(): Tente {
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'tente'.");

        const tryBlock = this.blocoEscopo();

        let catchBlock = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'pegue'.");

            catchBlock = this.blocoEscopo();
        }

        let elseBlock = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENÃO)) {
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'pegue'.");

            elseBlock = this.blocoEscopo();
        }

        let finallyBlock = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' após a declaração 'pegue'.");

            finallyBlock = this.blocoEscopo();
        }

        return new Tente(0, 0, tryBlock, catchBlock, elseBlock, finallyBlock);
    }

    declaracaoFazer(): Fazer {
        try {
            this.blocos += 1;

            const caminhoFazer = this.resolverDeclaracao();

            this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado declaração do 'enquanto' após o escopo do 'fazer'.");
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração 'enquanto'.");

            const condicaoEnquanto = this.expressao();

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração do 'enquanto'.");

            return new Fazer(0, 0, caminhoFazer, condicaoEnquanto);
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
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PAUSA)) return this.declaracaoSustar();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARA)) return this.declaracaoPara();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENQUANTO)) return this.declaracaoEnquanto();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) return this.declaracaoSe();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCREVA)) return this.declaracaoEscreva();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA))
            return new Bloco(0, 0, this.blocoEscopo());

        return this.declaracaoExpressao();
    }

    declaracaoDeVariavel(): Var {
        const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de variável.');
        let inicializador = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            inicializador = this.expressao();
        }

        this.consumir(tiposDeSimbolos.PONTO_E_VIRGULA, "Esperado ';' após a declaração da variável.");

        return new Var(nome, inicializador);
    }

    funcao(kind: string): FuncaoDeclaracao {
        const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${kind}.`);
        return new FuncaoDeclaracao(nome, this.corpoDaFuncao(kind));
    }

    corpoDaFuncao(kind: string): FuncaoConstruto {
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, `Esperado '(' após o nome ${kind}.`);

        const parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
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
                    parametro['padrao'] = this.primario();
                }

                parametros.push(parametro);

                if (parametro['tipo'] === 'multiplo') break;
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, `Esperado '{' antes do escopo do ${kind}.`);

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, 0, parametros, corpo);
    }

    declaracaoDeClasse(): Classe {
        const nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da classe.');

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
            this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da Superclasse.');
            superClasse = new Variavel(this.hashArquivo, this.simboloAnterior());
        }

        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo da classe.");

        const metodos = [];
        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            metodos.push(this.funcao('método'));
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o escopo da classe.");
        return new Classe(nome, superClasse, metodos);
    }

    declaracao(): RetornoDeclaracao {
        try {
            if (
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.consumir(tiposDeSimbolos.FUNCAO, null);
                return this.funcao('função');
            }
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)) return this.declaracaoDeVariavel();
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE)) return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            return null;
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}
