import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import hrtime from 'browser-process-hrtime';
import {
    AvaliadorSintaticoInterface,
    ParametroInterface,
    SimboloInterface,
} from '../interfaces';
import {
    AtribuicaoSobrescrita,
    Atribuir,
    Binario,
    Chamada,
    Dicionario,
    Conjunto,
    Funcao,
    AcessoMetodo as AcessoMetodo,
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
    Funcao as FuncaoDeclaracao,
    Importar,
    Para,
    Sustar,
    Retorna,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { RetornoAvaliadorSintatico } from '../interfaces/retornos/retorno-avaliador-sintatico';
import { RetornoLexador } from '../interfaces/retornos/retorno-lexador';

/**
 * O avaliador sintático (Parser) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintatico implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];

    hashArquivo: number;
    atual: number;
    ciclos: number;
    performance: boolean;

    constructor(performance: boolean = false) {
        this.hashArquivo = 0;
        this.atual = 0;
        this.ciclos = 0;
        this.erros = [];
        this.performance = performance;
    }

    erro(
        simbolo: SimboloInterface,
        mensagemDeErro: string
    ): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo))
            return this.avancarEDevolverAnterior();
        throw this.erro(this.simboloAtual(), mensagemDeErro);
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simboloAtual().tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: string): boolean {
        return this.simbolos[this.atual + 1].tipo === tipo;
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
        return this.simboloAnterior();
    }

    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean {
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
        const simboloAtual = this.simboloAtual();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUPER)) {
            const simboloChave = this.simboloAnterior();
            this.consumir(tiposDeSimbolos.PONTO, "Esperado '.' após 'super'.");
            const metodo = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do método da SuperClasse.'
            );
            return new Super(this.hashArquivo, simboloChave, metodo);
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.COLCHETE_ESQUERDO
            )
        ) {
            const valores = [];

            if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.COLCHETE_DIREITO
                )
            ) {
                return new Vetor(
                    this.hashArquivo,
                    Number(simboloAtual.linha),
                    []
                );
            }

            while (
                !this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.COLCHETE_DIREITO
                )
            ) {
                const valor = this.atribuir();
                valores.push(valor);
                if (
                    this.simboloAtual().tipo !==
                    tiposDeSimbolos.COLCHETE_DIREITO
                ) {
                    this.consumir(
                        tiposDeSimbolos.VIRGULA,
                        'Esperado vírgula antes da próxima expressão.'
                    );
                }
            }

            return new Vetor(
                this.hashArquivo,
                Number(simboloAtual.linha),
                valores
            );
        }

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)
        ) {
            const chaves = [];
            const valores = [];

            if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.CHAVE_DIREITA
                )
            ) {
                return new Dicionario(
                    this.hashArquivo,
                    Number(simboloAtual.linha),
                    [],
                    []
                );
            }

            while (
                !this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.CHAVE_DIREITA
                )
            ) {
                let chave = this.atribuir();
                this.consumir(
                    tiposDeSimbolos.DOIS_PONTOS,
                    "Esperado ':' entre chave e valor."
                );
                let valor = this.atribuir();

                chaves.push(chave);
                valores.push(valor);

                if (
                    this.simboloAtual().tipo !== tiposDeSimbolos.CHAVE_DIREITA
                ) {
                    this.consumir(
                        tiposDeSimbolos.VIRGULA,
                        'Esperado vírgula antes da próxima expressão.'
                    );
                }
            }

            return new Dicionario(
                this.hashArquivo,
                Number(simboloAtual.linha),
                chaves,
                valores
            );
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.FUNÇÃO,
                tiposDeSimbolos.FUNCAO
            )
        )
            return this.corpoDaFuncao(this.simboloAnterior().lexema);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO))
            return new Literal(
                this.hashArquivo,
                Number(simboloAtual.linha),
                false
            );
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO))
            return new Literal(
                this.hashArquivo,
                Number(simboloAtual.linha),
                true
            );
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NULO))
            return new Literal(
                this.hashArquivo,
                Number(simboloAtual.linha),
                null
            );
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ISTO))
            return new Isto(
                this.hashArquivo,
                Number(simboloAtual.linha),
                this.simboloAnterior()
            );

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.TEXTO
            )
        ) {
            const simboloAnterior: SimboloInterface = this.simboloAnterior();
            return new Literal(
                this.hashArquivo,
                Number(simboloAnterior.linha),
                simboloAnterior.literal
            );
        }

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)
        ) {
            return new Variavel(this.hashArquivo, this.simboloAnterior());
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.PARENTESE_ESQUERDO
            )
        ) {
            let expressao = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após a expressão."
            );

            return new Agrupamento(
                this.hashArquivo,
                Number(simboloAtual.linha),
                expressao
            );
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IMPORTAR))
            return this.declaracaoImportar();

        throw this.erro(this.simboloAtual(), 'Esperado expressão.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        const argumentos = [];

        if (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)
        ) {
            do {
                if (argumentos.length >= 255) {
                    throw this.erro(
                        this.simboloAtual(),
                        'Não pode haver mais de 255 argumentos.'
                    );
                }
                argumentos.push(this.expressao());
            } while (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)
            );
        }

        const parenteseDireito = this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os argumentos."
        );

        return new Chamada(
            this.hashArquivo,
            entidadeChamada,
            parenteseDireito,
            argumentos
        );
    }

    chamar(): Construto {
        let expressao = this.primario();

        while (true) {
            if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.PARENTESE_ESQUERDO
                )
            ) {
                expressao = this.finalizarChamada(expressao);
            } else if (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO)
            ) {
                const nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );
                expressao = new AcessoMetodo(this.hashArquivo, expressao, nome);
            } else if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.COLCHETE_ESQUERDO
                )
            ) {
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

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)
        ) {
            const operador = this.simboloAnterior();
            const direito = this.unario();
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    multiplicar(): Construto {
        let expressao = this.exponenciacao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIVISAO,
                tiposDeSimbolos.MULTIPLICACAO,
                tiposDeSimbolos.MODULO,
                tiposDeSimbolos.DIVISAO_IGUAL,
                tiposDeSimbolos.MULTIPLICACAO_IGUAL,
                tiposDeSimbolos.MODULO_IGUAL
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.exponenciacao();
            expressao = new Binario(
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
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    bitFill(): Construto {
        let expressao = this.adicaoOuSubtracao();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.adicaoOuSubtracao();
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitFill();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = this.bitFill();
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    bitOu(): Construto {
        let expressao = this.bitE();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.BIT_OR,
                tiposDeSimbolos.BIT_XOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.bitE();
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
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
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
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
            expressao = new Binario(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simboloAnterior();
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = this.em();
            expressao = new Logico(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = this.e();
            expressao = new Logico(
                this.hashArquivo,
                expressao,
                operador,
                direito
            );
        }

        return expressao;
    }

    /**
     * Método que resolve atribuições.
     * @returns Um construto do tipo `Atribuir`, `Conjunto` ou `AtribuicaoSobrescrita`.
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
                tiposDeSimbolos.MODULO_IGUAL,
            ].includes(expressao.operador.tipo)
        ) {
            return new Atribuir(
                this.hashArquivo,
                expressao.esquerda.simbolo,
                expressao
            );
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            const igual = this.simboloAnterior();
            const valor = this.atribuir();

            if (expressao instanceof Variavel) {
                const simbolo = expressao.simbolo;
                return new Atribuir(this.hashArquivo, simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                return new Conjunto(
                    this.hashArquivo,
                    0,
                    get.objeto,
                    get.simbolo,
                    valor
                );
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoSobrescrita(
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

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: any[] = [];

        do {
            argumentos.push(this.expressao());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        return new Escreva(
            Number(simboloAtual.linha),
            simboloAtual.hashArquivo,
            argumentos
        );
    }

    declaracaoExpressao(): Expressao {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    blocoEscopo(): any[] {
        const declaracoes = [];

        while (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) &&
            !this.estaNoFinal()
        ) {
            declaracoes.push(this.declaracao());
        }

        this.consumir(
            tiposDeSimbolos.CHAVE_DIREITA,
            "Esperado '}' após o bloco."
        );
        return declaracoes;
    }

    declaracaoSe(): Se {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' após 'se'."
        );
        const condicao = this.expressao();
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após condição do se."
        );

        const caminhoEntao = this.resolverDeclaracao();

        const caminhosSeSenao = [];
        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SENAOSE,
                tiposDeSimbolos.SENÃOSE
            )
        ) {
            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '(' após 'senaose' ou 'senãose'."
            );
            let condicaoSeSenao = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após codição do 'senaose' ou 'senãose'."
            );

            const caminho = this.resolverDeclaracao();

            caminhosSeSenao.push({
                condicao: condicaoSeSenao,
                caminho: caminho,
            });
        }

        let caminhoSenao = null;
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SENAO,
                tiposDeSimbolos.SENÃO
            )
        ) {
            caminhoSenao = this.resolverDeclaracao();
        }

        return new Se(condicao, caminhoEntao, caminhosSeSenao, caminhoSenao);
    }

    declaracaoEnquanto(): Enquanto {
        try {
            this.ciclos += 1;

            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '(' após 'enquanto'."
            );
            const condicao = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após condicional."
            );
            const corpo = this.resolverDeclaracao();

            return new Enquanto(condicao, corpo);
        } finally {
            this.ciclos -= 1;
        }
    }

    declaracaoPara(): Para {
        try {
            const simboloPara: SimboloInterface = this.simboloAnterior();
            this.ciclos += 1;

            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '(' após 'para'."
            );

            let inicializador: any;
            if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.PONTO_E_VIRGULA
                )
            ) {
                inicializador = null;
            } else if (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL)
            ) {
                inicializador = this.declaracaoDeVariavel();
            } else {
                inicializador = this.declaracaoExpressao();
            }

            let condicao = null;
            if (
                !this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)
            ) {
                condicao = this.expressao();
            }

            let incrementar = null;
            if (
                !this.verificarTipoSimboloAtual(
                    tiposDeSimbolos.PARENTESE_DIREITO
                )
            ) {
                incrementar = this.expressao();
            }

            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após cláusulas"
            );

            const corpo = this.resolverDeclaracao();

            return new Para(
                this.hashArquivo,
                Number(simboloPara.linha),
                inicializador,
                condicao,
                incrementar,
                corpo
            );
        } finally {
            this.ciclos -= 1;
        }
    }

    declaracaoSustar(): Sustar {
        if (this.ciclos < 1) {
            this.erro(
                this.simboloAnterior(),
                "'sustar' ou 'pausa' deve estar dentro de um laço de repetição."
            );
        }

        return new Sustar(this.simboloAtual());
    }

    declaracaoContinua(): Continua {
        if (this.ciclos < 1) {
            this.erro(
                this.simboloAnterior(),
                "'continua' precisa estar em um laço de repetição."
            );
        }

        return new Continua(this.simboloAtual());
    }

    declaracaoRetorna(): Retorna {
        const simboloChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = this.expressao();
        }

        return new Retorna(simboloChave, valor);
    }

    declaracaoEscolha(): Escolha {
        try {
            this.ciclos += 1;

            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '{' após 'escolha'."
            );
            const condicao = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado '}' após a condição de 'escolha'."
            );
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' antes do escopo do 'escolha'."
            );

            const caminhos = [];
            let caminhoPadrao = null;
            while (
                !this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.CHAVE_DIREITA
                ) &&
                !this.estaNoFinal()
            ) {
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                    let caminhoCondicoes = [this.expressao()];
                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após o 'caso'."
                    );

                    while (
                        this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)
                    ) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        caminhoCondicoes.push(this.expressao());
                        this.consumir(
                            tiposDeSimbolos.DOIS_PONTOS,
                            "Esperado ':' após declaração do 'caso'."
                        );
                    }

                    const declaracoes = [];
                    do {
                        declaracoes.push(this.resolverDeclaracao());
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(
                            tiposDeSimbolos.PADRAO
                        ) &&
                        !this.verificarTipoSimboloAtual(
                            tiposDeSimbolos.CHAVE_DIREITA
                        )
                    );

                    caminhos.push({
                        condicoes: caminhoCondicoes,
                        declaracoes,
                    });
                } else if (
                    this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)
                ) {
                    if (caminhoPadrao !== null) {
                        const excecao = new ErroAvaliadorSintatico(
                            this.simboloAtual(),
                            "Você só pode ter um 'padrao' em cada declaração de 'escolha'."
                        );
                        this.erros.push(excecao);
                        throw excecao;
                    }

                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após declaração do 'padrao'."
                    );

                    const declaracoes = [];
                    do {
                        declaracoes.push(this.resolverDeclaracao());
                    } while (
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO) &&
                        !this.verificarTipoSimboloAtual(
                            tiposDeSimbolos.PADRAO
                        ) &&
                        !this.verificarTipoSimboloAtual(
                            tiposDeSimbolos.CHAVE_DIREITA
                        )
                    );

                    caminhoPadrao = {
                        declaracoes,
                    };
                }
            }

            return new Escolha(condicao, caminhos, caminhoPadrao);
        } finally {
            this.ciclos -= 1;
        }
    }

    declaracaoImportar(): Importar {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' após declaração."
        );

        const caminho = this.expressao();

        const simboloFechamento = this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após declaração."
        );

        return new Importar(caminho as Literal, simboloFechamento);
    }

    declaracaoTente(): Tente {
        const simboloTente: SimboloInterface = this.simboloAnterior();
        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperado '{' após a declaração 'tente'."
        );

        let blocoTente = this.blocoEscopo();

        let blocoPegue = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'pegue'."
            );

            blocoPegue = this.blocoEscopo();
        }

        let blocoSenao = null;
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SENAO,
                tiposDeSimbolos.SENÃO
            )
        ) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'pegue'."
            );

            blocoSenao = this.blocoEscopo();
        }

        let blocoFinalmente = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
            this.consumir(
                tiposDeSimbolos.CHAVE_ESQUERDA,
                "Esperado '{' após a declaração 'pegue'."
            );

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
            this.ciclos += 1;

            const caminhoFazer = this.resolverDeclaracao();

            this.consumir(
                tiposDeSimbolos.ENQUANTO,
                "Esperado declaração do 'enquanto' após o escopo do 'fazer'."
            );
            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '(' após declaração 'enquanto'."
            );

            const condicaoEnquanto = this.expressao();

            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após declaração do 'enquanto'."
            );

            return new Fazer(
                simboloFazer.hashArquivo,
                Number(simboloFazer.linha),
                caminhoFazer,
                condicaoEnquanto
            );
        } finally {
            this.ciclos -= 1;
        }
    }

    resolverDeclaracao(): any {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FAZER))
            return this.declaracaoFazer();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TENTE))
            return this.declaracaoTente();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCOLHA))
            return this.declaracaoEscolha();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.RETORNA))
            return this.declaracaoRetorna();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONTINUA))
            return this.declaracaoContinua();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PAUSA))
            return this.declaracaoSustar();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARA))
            return this.declaracaoPara();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENQUANTO))
            return this.declaracaoEnquanto();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE))
            return this.declaracaoSe();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCREVA))
            return this.declaracaoEscreva();
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)
        ) {
            const simboloInicioBloco: SimboloInterface = this.simboloAnterior();
            return new Bloco(
                simboloInicioBloco.hashArquivo,
                Number(simboloInicioBloco.linha),
                this.blocoEscopo()
            );
        }

        const simboloAtual = this.simboloAtual();
        if (simboloAtual.tipo === tiposDeSimbolos.IDENTIFICADOR) {
            // Pela gramática, a seguinte situação não pode ocorrer:
            // 1. O símbolo anterior ser um identificador; e
            // 2. O símbolo anterior estar na mesma linha do identificador atual.

            const simboloAnterior = this.simboloAnterior();
            if (
                !!simboloAnterior &&
                simboloAnterior.tipo === tiposDeSimbolos.IDENTIFICADOR &&
                simboloAnterior.linha === simboloAtual.linha
            ) {
                this.erro(
                    this.simboloAtual(),
                    'Não é permitido ter dois identificadores seguidos na mesma linha.'
                );
            }
        }

        return this.declaracaoExpressao();
    }

    /**
     * Caso símbolo atual seja `var`, devolve uma declaração de variável.
     * @returns Um Construto do tipo Var.
     */
    declaracaoDeVariavel(): Var {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de variável.'
        );
        let inicializador = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
            inicializador = this.expressao();
        }

        return new Var(simbolo, inicializador);
    }

    funcao(tipo: string): FuncaoDeclaracao {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            `Esperado nome ${tipo}.`
        );
        return new FuncaoDeclaracao(simbolo, this.corpoDaFuncao(tipo));
    }

    logicaComumParametros(): ParametroInterface[] {
        let parametros: ParametroInterface[] = [];

        do {
            if (parametros.length >= 255) {
                this.erro(
                    this.simboloAtual(),
                    'Não pode haver mais de 255 parâmetros'
                );
            }

            let parametro: Partial<ParametroInterface> = {};

            if (this.simboloAtual().tipo === tiposDeSimbolos.MULTIPLICACAO) {
                this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                parametro.tipo = 'estrela';
            } else {
                parametro.tipo = 'padrao';
            }

            parametro.nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do parâmetro.'
            );

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                parametro.valorPadrao = this.primario();
            }

            parametros.push(parametro as ParametroInterface);

            if (parametro.tipo === 'estrela') break;
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    corpoDaFuncao(tipo: string): Funcao {
        // O parêntese esquerdo é considerado o símbolo inicial para
        // fins de pragma.
        const parenteseEsquerdo = this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)
        ) {
            parametros = this.logicaComumParametros();
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após parâmetros."
        );
        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            `Esperado '{' antes do escopo do ${tipo}.`
        );

        const corpo = this.blocoEscopo();

        return new Funcao(
            this.hashArquivo,
            Number(parenteseEsquerdo.linha),
            parametros,
            corpo
        );
    }

    declaracaoDeClasse(): Classe {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da classe.'
        );

        let superClasse = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
            this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome da SuperClasse.'
            );
            superClasse = new Variavel(
                this.hashArquivo,
                this.simboloAnterior()
            );
        }

        this.consumir(
            tiposDeSimbolos.CHAVE_ESQUERDA,
            "Esperado '{' antes do escopo da classe."
        );

        const metodos = [];
        while (
            !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA) &&
            !this.estaNoFinal()
        ) {
            metodos.push(this.funcao('método'));
        }

        this.consumir(
            tiposDeSimbolos.CHAVE_DIREITA,
            "Esperado '}' após o escopo da classe."
        );
        return new Classe(simbolo, superClasse, metodos);
    }

    declaracao(): any {
        try {
            if (
                (this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) ||
                    this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO)) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.avancarEDevolverAnterior();
                return this.funcao('funcao');
            }
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL))
                return this.declaracaoDeVariavel();
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro: any) {
            this.sincronizar();
            return null;
        }
    }

    /**
     * Usado quando há erros na avaliação sintática.
     * Garante que o código não entre em loop infinito.
     * @returns Sempre retorna `void`.
     */
    sincronizar() {
        this.avancarEDevolverAnterior();

        while (!this.estaNoFinal()) {
            const tipoSimboloAtual: string = this.simboloAnterior().tipo;
            if (tipoSimboloAtual === tiposDeSimbolos.PONTO_E_VIRGULA) return;

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
        retornoLexador: RetornoLexador,
        hashArquivo?: number
    ): RetornoAvaliadorSintatico {
        const inicioAnalise: [number, number] = hrtime();
        this.erros = [];
        this.atual = 0;
        this.ciclos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        if (this.performance) {
            const deltaAnalise: [number, number] = hrtime(inicioAnalise);
            console.log(
                `[Avaliador Sintático] Tempo para análise: ${
                    deltaAnalise[0] * 1e9 + deltaAnalise[1]
                }ns`
            );
        }

        return {
            declaracoes: declaracoes,
            erros: this.erros,
        } as RetornoAvaliadorSintatico;
    }
}
