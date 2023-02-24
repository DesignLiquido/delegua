import {
    AcessoIndiceVariavel,
    AtribuicaoSobrescrita,
    Atribuir,
    Chamada,
    Construto,
    FuncaoConstruto,
    Literal,
    Variavel,
} from '../../construtos';
import {
    Escreva,
    Declaracao,
    Se,
    Enquanto,
    Para,
    Escolha,
    Fazer,
    FuncaoDeclaracao,
    Expressao,
    Leia,
    Var,
    Bloco,
} from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import { SimboloInterface } from '../../interfaces';

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-studio';
import { RetornoDeclaracao } from '../retornos';
import { DeleguaFuncao } from '../../estruturas';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintaticoPortugolStudio extends AvaliadorSintaticoBase {
    private validarEscopoPrograma(declaracoes: Declaracao[]): void {
        this.consumir(tiposDeSimbolos.PROGRAMA, "Esperada expressão 'programa' para inicializar programa.");

        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperada chave esquerda após expressão 'programa' para inicializar programa."
        );

        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        if (this.simbolos[this.atual - 1].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
            throw this.erro(this.simbolos[this.atual - 1], 'Esperado chave direita final para término do programa.');
        }

        const encontrarDeclaracaoInicio = declaracoes.filter(
            (d) => d instanceof FuncaoDeclaracao && d.simbolo.lexema === 'inicio'
        );

        if (encontrarDeclaracaoInicio.length <= 0) {
            throw this.erro(this.simbolos[0], "Função 'inicio()' para iniciar o programa não foi definida.");
        }

        // A última declaração do programa deve ser uma chamada a inicio()
        const declaracaoInicio = encontrarDeclaracaoInicio[0];
        declaracoes.push(
            new Expressao(new Chamada(declaracaoInicio.hashArquivo, (declaracaoInicio as any).funcao, null, []))
        );
    }

    primario(): Construto {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)) {
            return new Variavel(this.hashArquivo, this.simbolos[this.atual - 1]);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.REAL, tiposDeSimbolos.INTEIRO, tiposDeSimbolos.CADEIA)) {
            const simboloAnterior: SimboloInterface = this.simbolos[this.atual - 1];
            return new Literal(this.hashArquivo, Number(simboloAnterior.linha), simboloAnterior.literal);
        }
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

                const indice = indices[0];
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

    atribuir(): Construto {
        const expressao = this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoSobrescrita(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }

            this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    declaracaoEscreva(): Escreva {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        return new Escreva(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    blocoEscopo(): Declaracao[] {
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '}' antes do bloco.");

        let declaracoes: Array<RetornoDeclaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            const declaracaoOuVetor: any = this.declaracao();
            if (Array.isArray(declaracaoOuVetor)) {
                declaracoes = declaracoes.concat(declaracaoOuVetor);
            } else {
                declaracoes.push(declaracaoOuVetor);
            }
        }

        this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");
        return declaracoes;
    }

    declaracaoSe(): Se {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'.");
        const condicao = this.expressao();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do se.");

        const caminhoEntao = this.declaracao();

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            caminhoSenao = this.declaracao();
        }

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    declaracaoEnquanto(): Enquanto {
        try {
            this.avancarEDevolverAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição.");
            const corpo = this.declaracao();

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
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

        const corpo = this.blocoEscopo();

        return new FuncaoConstruto(this.hashArquivo, Number(parenteseEsquerdo.linha), parametros, corpo);
    }

    /**
     * Declaração de apenas uma variável. 
     * Neste caso, o símbolo que determina o tipo da variável já foi consumido, 
     * e o retorno conta com apenas uma variável retornada.
     */
    declaracaoDeVariavel(): Var {
        switch (this.simboloAnterior().tipo) {
            case tiposDeSimbolos.INTEIRO:
                const identificador = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado identificador após palavra reservada 'inteiro'."
                );
                this.consumir(tiposDeSimbolos.IGUAL, "Esperado símbolo igual para inicialização de variável.");
                const literalInicializacao = this.consumir(tiposDeSimbolos.INTEIRO, 
                    'Esperado literal inteiro após símbolo de igual em declaração de variável.');
                const valorInicializacao = Number(literalInicializacao.literal);
                return new Var(
                    identificador, 
                    new Literal(this.hashArquivo, 
                        Number(literalInicializacao.linha), 
                        valorInicializacao
                    )
                );
        }
    }

    declaracaoInteiros(): Var[] {
        const simboloInteiro = this.consumir(tiposDeSimbolos.INTEIRO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'inteiro'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = 0;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(tiposDeSimbolos.INTEIRO, 
                    'Esperado literal inteiro após símbolo de igual em declaração de variável.');
                valorInicializacao = Number(literalInicializacao.literal);
            }

            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloInteiro.linha), valorInicializacao)));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    /**
     * Análise de uma declaração `leia()`. No VisuAlg, `leia()` aceita 1..N argumentos.
     * @returns Uma declaração `Leia`.
     */
    declaracaoLeia(): Leia {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes do argumento em instrução `leia`.");

        const argumentos = [];
        do {
            argumentos.push(this.declaracao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após o argumento em instrução `leia`.");

        return new Leia(simboloAtual.hashArquivo, Number(simboloAtual.linha), argumentos);
    }

    declaracaoPara(): Para {
        try {
            const simboloPara: SimboloInterface = this.avancarEDevolverAnterior();
            this.blocos += 1;

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'para'.");

            let inicializador: Var | Expressao;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                inicializador = null;
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INTEIRO)) {
                inicializador = this.declaracaoDeVariavel();
            } else {
                inicializador = this.declaracaoExpressao();
            }

            let condicao = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                condicao = this.expressao();
            }

            let incrementar = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = this.expressao();
            }

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após cláusulas");

            const corpo = this.declaracao();

            return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoReal(): Var[] {
        const simboloReal = this.consumir(tiposDeSimbolos.REAL, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'real'."
            );
            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloReal.linha), 0)));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    expressao(): Construto {
        // if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.LEIA)) return this.declaracaoLeia();
        return this.atribuir();
    }

    declaracao(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                const simboloInicioBloco: SimboloInterface = this.simbolos[this.atual];
                return new Bloco(simboloInicioBloco.hashArquivo, Number(simboloInicioBloco.linha), this.blocoEscopo());
            case tiposDeSimbolos.ENQUANTO:
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscreva();
            case tiposDeSimbolos.FUNCAO:
                return this.funcao('funcao');
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.LEIA:
                return this.declaracaoLeia();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();        
            case tiposDeSimbolos.PROGRAMA:
            case tiposDeSimbolos.CHAVE_DIREITA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.REAL:
                return this.declaracaoReal();
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
            default:
                return this.expressao();
        }
    }

    analisar(retornoLexador: RetornoLexador, hashArquivo?: number): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        this.validarEscopoPrograma(declaracoes);

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}
