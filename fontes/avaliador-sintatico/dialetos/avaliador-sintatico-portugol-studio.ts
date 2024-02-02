import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FuncaoConstruto,
    Literal,
    Unario,
    Variavel,
    Vetor,
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
    EscrevaMesmaLinha,
    Retorna,
    Const,
} from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import { ParametroInterface, SimboloInterface } from '../../interfaces';

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-studio';
import { RetornoDeclaracao } from '../retornos';
import { ErroAvaliadorSintatico } from '../erro-avaliador-sintatico';
import { TiposDadosInterface } from '../../interfaces/tipos-dados-interface';

/**
 * O avaliador sintático (_Parser_) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintaticoPortugolStudio extends AvaliadorSintaticoBase {
    private declaracoes: Declaracao[] = []

    declaracaoEscreva(): Escreva {
        throw new Error('Método não implementado.');
    }

    private validarEscopoPrograma(): void {
        this.consumir(tiposDeSimbolos.PROGRAMA, "Esperada expressão 'programa' para inicializar programa.");

        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperada chave esquerda após expressão 'programa' para inicializar programa."
        );

        while (!this.estaNoFinal()) {
            const declaracaoOuVetor: any = this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(declaracaoOuVetor)) {
                this.declaracoes = this.declaracoes.concat(declaracaoOuVetor);
            } else {
                this.declaracoes.push(declaracaoOuVetor);
            }
        }

        if (this.simbolos[this.atual - 1].tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
            throw this.erro(this.simbolos[this.atual - 1], 'Esperado chave direita final para término do programa.');
        }

        const encontrarDeclaracaoInicio = this.declaracoes.filter(
            (d) => d instanceof FuncaoDeclaracao && d.simbolo.lexema === 'inicio'
        );

        if (encontrarDeclaracaoInicio.length <= 0) {
            throw this.erro(this.simbolos[0], "Função 'inicio()' para iniciar o programa não foi definida.");
        }

        // A última declaração do programa deve ser uma chamada a inicio()
        const declaracaoInicio = encontrarDeclaracaoInicio[0];
        this.declaracoes.push(
            new Expressao(new Chamada(declaracaoInicio.hashArquivo, (declaracaoInicio as any).funcao, null, []))
        );
    }

    comparacaoIgualdade(): Construto {
        let expressao = this.comparar();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            const direito = this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, simboloAnterior, direito);
        }

        return expressao;
    }

    primario(): Construto {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
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

            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
    
                return new Agrupamento(this.hashArquivo, Number(simboloAtual.linha), expressao);

            case tiposDeSimbolos.CADEIA:
            case tiposDeSimbolos.CARACTER:
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.REAL:
                const simboloVariavel: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloVariavel.linha), simboloVariavel.literal);
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
                return new AtribuicaoPorIndice(
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

    declaracaoEscrevaMesmaLinha(): EscrevaMesmaLinha {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' antes dos valores em escreva.");

        const argumentos: Construto[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após os valores em escreva.");

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), simboloAtual.hashArquivo, argumentos);
    }

    blocoEscopo(): Declaracao[] {
        this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '}' antes do bloco.");

        let declaracoes: Array<RetornoDeclaracao> = [];

        while (!this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
            const declaracaoOuVetor: any = this.resolverDeclaracaoForaDeBloco();
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

        const caminhoEntao = this.resolverDeclaracaoForaDeBloco();

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            caminhoSenao = this.resolverDeclaracaoForaDeBloco();
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
            const corpo = this.resolverDeclaracaoForaDeBloco();

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoEscolha(): Escolha {
        try {
            this.avancarEDevolverAnterior();
            this.blocos += 1;

            const condicao = this.expressao();
            this.consumir(tiposDeSimbolos.CHAVE_ESQUERDA, "Esperado '{' antes do escopo do 'escolha'.");

            const caminhos = [];
            let caminhoPadrao = null;
            while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA) && !this.estaNoFinal()) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {

                    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONTRARIO)) {
                        if (caminhoPadrao !== null) {
                            const excecao = new ErroAvaliadorSintatico(
                                this.simbolos[this.atual],
                                "Você só pode ter um 'contrario' em cada declaração de 'escolha'."
                            );
                            this.erros.push(excecao);
                            throw excecao;
                        }
    
                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'contrario'.");
    
                        const declaracoes = [];
                        do {
                            declaracoes.push(this.resolverDeclaracaoForaDeBloco());

                            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARE)
                        } while (
                            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CONTRARIO) &&
                            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                        );
    
                        caminhoPadrao = {
                            declaracoes,
                        };
                        break;
                    }

                    const caminhoCondicoes = [this.expressao()];
                    this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após o 'caso'.");

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após declaração do 'caso'.");
                    }

                    let declaracoes = [];
                    do {
                        const retornoDeclaracao = this.resolverDeclaracaoForaDeBloco();
                        if (Array.isArray(retornoDeclaracao)) {
                            declaracoes = declaracoes.concat(retornoDeclaracao);
                        } else {
                            declaracoes.push(retornoDeclaracao as Declaracao);
                        }
                        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARE)
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CONTRARIO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                } 
            }

            return new Escolha(condicao, caminhos, caminhoPadrao);
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * No Portugol Studio, a palavra reservada é `faca`, sem acento.
     */
    declaracaoFazer(): Fazer {
        const simboloFaca: SimboloInterface = this.avancarEDevolverAnterior();
        try {
            this.blocos += 1;

            const caminhoFazer = this.resolverDeclaracaoForaDeBloco();

            this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado declaração do 'enquanto' após o escopo do 'fazer'.");
            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após declaração 'enquanto'.");

            const condicaoEnquanto = this.expressao();

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração do 'enquanto'.");

            return new Fazer(simboloFaca.hashArquivo, Number(simboloFaca.linha), caminhoFazer, condicaoEnquanto);
        } finally {
            this.blocos -= 1;
        }
    }

    protected logicaComumParametros(): ParametroInterface[] {
        const parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                this.erro(this.simbolos[this.atual], 'Não pode haver mais de 255 parâmetros');
            }

            const parametro: Partial<ParametroInterface> = {
                abrangencia: 'padrao',
            };

            if (
                !this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.CADEIA,
                    tiposDeSimbolos.REAL,
                    tiposDeSimbolos.INTEIRO
                )
            ) {
                throw this.erro(
                    this.simbolos[this.atual],
                    'Esperado tipo de parâmetro válido para declaração de função.'
                );
            }

            parametro.nome = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome do parâmetro.');

            // Em Portugol Studio, um parâmetro múltiplo é terminado por abre e fecha colchetes.
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    'Esperado colchete direito após colchete esquerdo ao definir parâmetro múltiplo em função.'
                );
                parametro.abrangencia = 'multiplo';
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            }

            parametros.push(parametro as ParametroInterface);

            if (parametro.abrangencia === 'multiplo') break;
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
                this.consumir(tiposDeSimbolos.IGUAL, 'Esperado símbolo igual para inicialização de variável.');
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.INTEIRO,
                    'Esperado literal inteiro após símbolo de igual em declaração de variável.'
                );
                const valorInicializacao = Number(literalInicializacao.literal);
                return new Var(
                    identificador,
                    new Literal(this.hashArquivo, Number(literalInicializacao.linha), valorInicializacao)
                );
        }
    }

    declaracaoCadeiasCaracteres(): Var[] {
        const simboloCadeia = this.consumir(tiposDeSimbolos.CADEIA, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'cadeia'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = '';
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.CADEIA,
                    'Esperado literal de cadeia de caracteres após símbolo de igual em declaração de variável.'
                );
                valorInicializacao = literalInicializacao.literal;
            }

            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloCadeia.linha), valorInicializacao)));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoCaracteres(): Var[] {
        const simboloCaracter = this.consumir(tiposDeSimbolos.CARACTER, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'caracter'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = '';
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.CARACTER,
                    'Esperado literal de caracter após símbolo de igual em declaração de variável.'
                );
                valorInicializacao = literalInicializacao.literal;
            }

            inicializacoes.push(
                new Var(identificador, new Literal(this.hashArquivo, Number(simboloCaracter.linha), valorInicializacao))
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoExpressao(simboloAnterior?: SimboloInterface): Expressao {
        const expressao = this.expressao();
        // Ponto-e-vírgula é opcional aqui.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        if (!expressao) {
            throw new ErroAvaliadorSintatico(simboloAnterior, 'Esperado expressão.');
        }

        return new Expressao(expressao);
    }

    protected declaracaoVetorInteiros(
        simboloInteiro: SimboloInterface,
        identificador: SimboloInterface,
        posicoes: number
    ) {
        let valorInicializacao: Vetor = new Vetor(this.hashArquivo, Number(simboloInteiro.linha), []);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                'Esperado chave esquerda após sinal de igual em lado direito da atribuição de vetor.'
            );

            const valores = [];
            do {
                valores.push(this.primario());
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

            this.consumir(
                tiposDeSimbolos.CHAVE_DIREITA,
                'Esperado chave direita após valores de vetor em lado direito da atribuição de vetor.'
            );

            if (posicoes !== valores.length) {
                throw this.erro(
                    simboloInteiro,
                    `Esperado ${posicoes} números, mas foram fornecidos ${valores.length} valores do lado direito da atribuição.`
                );
            }

            valorInicializacao.valores = valores;
        }

        return new Var(identificador, valorInicializacao);
    }

    protected declaracaoTrivialInteiro(simboloInteiro: SimboloInterface, identificador: SimboloInterface) {
        // Inicializações de variáveis podem ter valores definidos.
        let valorInicializacao: Construto = new Literal(this.hashArquivo, Number(simboloInteiro.linha), 0);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            valorInicializacao = this.expressao();
        }

        return new Var(identificador, valorInicializacao);
    }

    declaracaoInteiros(): Var[] {
        const simboloInteiro = this.consumir(tiposDeSimbolos.INTEIRO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'inteiro'."
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                // TODO
                const numeroPosicoes = this.consumir(
                    tiposDeSimbolos.INTEIRO,
                    'Esperado número inteiro para definir quantas posições terá o vetor.'
                );

                this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    'Esperado fechamento de identificação de número de posições de uma declaração de vetor.'
                );

                inicializacoes.push(
                    this.declaracaoVetorInteiros(simboloInteiro, identificador, Number(numeroPosicoes.literal))
                );
            } else {
                inicializacoes.push(this.declaracaoTrivialInteiro(simboloInteiro, identificador));
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
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
            argumentos.push(this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após o argumento em instrução `leia`.");

        return new Leia(simboloLeia, argumentos);
    }

    declaracaoLogicos(): Var[] {
        const simboloLogico = this.consumir(tiposDeSimbolos.LOGICO, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'logico'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = false;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                if (![tiposDeSimbolos.VERDADEIRO, tiposDeSimbolos.FALSO].includes(this.simbolos[this.atual].tipo)) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Esperado literal verdadeiro ou falso após símbolo de igual em declaração de variável.'
                    );
                }
                const literalInicializacao = this.avancarEDevolverAnterior();
                valorInicializacao = literalInicializacao.lexema.toLowerCase() === 'verdadeiro' ? true : false;
            }

            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloLogico.linha), valorInicializacao)));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    declaracaoRetorne(): Retorna {
        this.avancarEDevolverAnterior()
        const simboloChave = this.simbolos[this.atual];
        let valor = null;

        if (
            [
                tiposDeSimbolos.CADEIA,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.FALSO,
                tiposDeSimbolos.IDENTIFICADOR,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.VERDADEIRO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            valor = this.expressao();
        }

        return new Retorna(simboloChave, valor);
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
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR)
            }

            this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após cláusulas");

            const corpo = this.resolverDeclaracaoForaDeBloco();

            return new Para(this.hashArquivo, Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    declaracaoReais(): Var[] {
        const simboloReal = this.consumir(tiposDeSimbolos.REAL, '');

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após palavra reservada 'real'."
            );

            // Inicializações de variáveis podem ter valores definidos.
            let valorInicializacao = 0;
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.REAL,
                    'Esperado literal real após símbolo de igual em declaração de variável.'
                );
                valorInicializacao = Number(literalInicializacao.literal);
            }

            inicializacoes.push(new Var(identificador, new Literal(this.hashArquivo, Number(simboloReal.linha), valorInicializacao)));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    expressao(): Construto {
        // if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.LEIA)) return this.declaracaoLeia();
        return this.atribuir();
    }

    funcao(tipo: string): FuncaoDeclaracao {
        const simboloFuncao: SimboloInterface = this.avancarEDevolverAnterior();

        // No Portugol Studio, se temos um símbolo de tipo após `função`,
        // teremos um retorno no corpo da função.
        if (
            [
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.CADEIA,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.LOGICO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            // Por enquanto apenas consumimos o símbolo sem ações adicionais.
            this.avancarEDevolverAnterior();
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VAZIO);

        const nomeFuncao: SimboloInterface = this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado nome ${tipo}.`);
        return new FuncaoDeclaracao(nomeFuncao, this.corpoDaFuncao(tipo));
    }

    declaracaoDeConstantes(): any {
        let identificador: SimboloInterface;
        let tipo: SimboloInterface;
        if (
            [
                tiposDeSimbolos.REAL,
                tiposDeSimbolos.INTEIRO,
                tiposDeSimbolos.CADEIA,
                tiposDeSimbolos.CARACTER,
                tiposDeSimbolos.LOGICO,
            ].includes(this.simbolos[this.atual].tipo)
        ) {
            tipo = this.avancarEDevolverAnterior();
        }

        identificador = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da constante.');

        this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após identificador em instrução 'constante'.");

        const inicializador = this.expressao();

        return new Const(identificador, inicializador, tipo.lexema as TiposDadosInterface);
    }

    resolverDeclaracaoForaDeBloco(): Declaracao | Declaracao[] | Construto | Construto[] | any {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.CADEIA:
                return this.declaracaoCadeiasCaracteres();
            case tiposDeSimbolos.CARACTER:
                return this.declaracaoCaracteres();
            case tiposDeSimbolos.CHAVE_ESQUERDA:
                const simboloInicioBloco: SimboloInterface = this.simbolos[this.atual];
                return new Bloco(simboloInicioBloco.hashArquivo, Number(simboloInicioBloco.linha), this.blocoEscopo());
            case tiposDeSimbolos.CONSTANTE:
                this.avancarEDevolverAnterior();
                return this.declaracaoDeConstantes();
            case tiposDeSimbolos.ENQUANTO:
                return this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                return this.declaracaoEscolha();
            case tiposDeSimbolos.ESCREVA:
                return this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.FACA:
                return this.declaracaoFazer();
            case tiposDeSimbolos.FUNCAO:
                return this.funcao('funcao');
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.LEIA:
                return this.declaracaoLeia();
            case tiposDeSimbolos.LOGICO:
                return this.declaracaoLogicos();
            case tiposDeSimbolos.PARA:
                return this.declaracaoPara();
            case tiposDeSimbolos.PROGRAMA:
            case tiposDeSimbolos.CHAVE_DIREITA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.REAL:
                return this.declaracaoReais();
            case tiposDeSimbolos.RETORNE:
                return this.declaracaoRetorne();
            case tiposDeSimbolos.SE:
                return this.declaracaoSe();
            default:
                return this.declaracaoExpressao(simboloAtual);
        }
    }

    analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): RetornoAvaliadorSintatico<Declaracao> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];
        this.declaracoes = []

        this.validarEscopoPrograma();

        return {
            declaracoes: this.declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
