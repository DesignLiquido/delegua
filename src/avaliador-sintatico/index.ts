import tiposDeSimbolos from '../tiposDeSimbolos';
import { performance } from 'perf_hooks';
import { AvaliadorSintaticoInterface, SimboloInterface } from '../interfaces';
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

import { ErroAvaliador } from './erros-avaliador';

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
    Pausa,
    Retorna,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { Delegua } from '../delegua';

/**
 * O avaliador sintático (Parser) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 * Há dois grupos de estruturas de alto nível: Construtos e Declarações.
 */
export class AvaliadorSintatico implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    Delegua: Delegua;

    atual: number;
    ciclos: number;
    performance: boolean;

    constructor(Delegua: Delegua, performance: boolean = false) {
        this.Delegua = Delegua;

        this.atual = 0;
        this.ciclos = 0;
        this.performance = performance;
    }

    sincronizar() {
        this.avancar();

        while (!this.estaNoFinal()) {
            if (this.simboloAnterior().tipo === tiposDeSimbolos.PONTO_E_VIRGULA) return;

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

            this.avancar();
        }
    }

    erro(simbolo: any, mensagemDeErro: string): ErroAvaliador {
        this.Delegua.erro(simbolo, mensagemDeErro);
        return new ErroAvaliador();
    }

    consumir(tipo: any, mensagemDeErro: string): any {
        if (this.verificarTipoSimboloAtual(tipo)) return this.avancar();
        throw this.erro(this.simboloAtual(), mensagemDeErro);
    }

    verificarTipoSimboloAtual(tipo: any): boolean {
        if (this.estaNoFinal()) return false;
        return this.simboloAtual().tipo === tipo;
    }

    verificarTipoProximoSimbolo(tipo: any): boolean {
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
        const simboloAtual = this.simboloAtual();
        if (
            simboloAtual &&
            simboloAtual.tipo === tiposDeSimbolos.PONTO_E_VIRGULA
        ) {
            return true;
        }

        return this.atual === this.simbolos.length;
    }

    avancar(): any {
        if (!this.estaNoFinal()) this.atual += 1;
        return this.simboloAnterior();
    }

    verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancar();
                return true;
            }
        }

        return false;
    }

    primario(): any {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUPER)) {
            const palavraChave = this.simboloAnterior();
            this.consumir(tiposDeSimbolos.PONTO, "Esperado '.' após 'super'.");
            const metodo = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome do método da SuperClasse.'
            );
            return new Super(0, palavraChave, metodo);
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
                return new Vetor(0, []);
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

            return new Vetor(0, valores);
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
                return new Dicionario(0, [], []);
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

            return new Dicionario(0, chaves, valores);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FUNÇÃO))
            return this.corpoDaFuncao('função');
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FUNCAO))
            return this.corpoDaFuncao('funcao');
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO))
            return new Literal(0, false);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO))
            return new Literal(0, true);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NULO))
            return new Literal(0, null);
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ISTO))
            return new Isto(0, this.simboloAnterior());

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NUMERO,
                tiposDeSimbolos.TEXTO
            )
        ) {
            const simboloAnterior: SimboloInterface = this.simboloAnterior();
            return new Literal(Number(simboloAnterior.linha), simboloAnterior.literal);
        }

        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)
        ) {
            return new Variavel(this.simboloAnterior());
        }

        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.PARENTESE_ESQUERDO
            )
        ) {
            let expr = this.expressao();
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após a expressão."
            );

            return new Agrupamento(0, expr);
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IMPORTAR))
            return this.declaracaoImportar();

        throw this.erro(this.simboloAtual(), 'Esperado expressão.');
    }

    finalizarChamada(entidadeChamada: Construto): Construto {
        const argumentos = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
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

        return new Chamada(entidadeChamada, parenteseDireito, argumentos);
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
                let nome = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    "Esperado nome do método após '.'."
                );
                expressao = new AcessoMetodo(expressao, nome);
            } else if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.COLCHETE_ESQUERDO
                )
            ) {
                const indice = this.expressao();
                let simboloFechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após escrita do indice."
                );
                expressao = new AcessoIndiceVariavel(expressao, indice, simboloFechamento);
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
            return new Unario(operador, direito);
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
            expressao = new Binario(expressao, operador, direito);
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
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    adicionar(): Construto {
        let expressao = this.multiplicar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.SUBTRACAO,
                tiposDeSimbolos.ADICAO
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.multiplicar();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    bitFill(): Construto {
        let expressao = this.adicionar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.MENOR_MENOR,
                tiposDeSimbolos.MAIOR_MAIOR
            )
        ) {
            const operador = this.simboloAnterior();
            const direito = this.adicionar();
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    bitE(): Construto {
        let expressao = this.bitFill();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
            const operador = this.simboloAnterior();
            const direito = this.bitFill();
            expressao = new Binario(expressao, operador, direito);
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
            expressao = new Binario(expressao, operador, direito);
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
            expressao = new Binario(expressao, operador, direito);
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
            expressao = new Binario(expressao, operador, direito);
        }

        return expressao;
    }

    em(): Construto {
        let expressao = this.comparacaoIgualdade();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
            const operador = this.simboloAnterior();
            const direito = this.comparacaoIgualdade();
            expressao = new Logico(expressao, operador, direito);
        }

        return expressao;
    }

    e(): Construto {
        let expressao = this.em();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simboloAnterior();
            const direito = this.em();
            expressao = new Logico(expressao, operador, direito);
        }

        return expressao;
    }

    ou(): Construto {
        let expressao = this.e();

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
            const operador = this.simboloAnterior();
            const direito = this.e();
            expressao = new Logico(expressao, operador, direito);
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
                return new Atribuir(simbolo, valor);
            } else if (expressao instanceof AcessoMetodo) {
                const get = expressao;
                return new Conjunto(0, get.objeto, get.simbolo, valor);
            } else if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoSobrescrita(0, 
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
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const simbolo: any = this.expressao();

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        return new Escreva(simbolo);
    }

    declaracaoExpressao(): any {
        const expressao = this.expressao();
        return new Expressao(expressao);
    }

    blocoEscopo(): any {
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
        const simboloSe = this.simboloAnterior();
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

        return new Se(Number(simboloSe.linha), condicao, caminhoEntao, caminhosSeSenao, caminhoSenao);
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
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
                condicao = this.expressao();
            }

            let incrementar = null;
            if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                incrementar = this.expressao();
            }

            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após cláusulas"
            );

            const corpo = this.resolverDeclaracao();

            return new Para(Number(simboloPara.linha), inicializador, condicao, incrementar, corpo);
        } finally {
            this.ciclos -= 1;
        }
    }

    declaracaoInterromper(): any {
        if (this.ciclos < 1) {
            this.erro(this.simboloAnterior(), "'pausa' deve estar dentro de um loop.");
        }

        return new Pausa();
    }

    declaracaoContinua(): Continua {
        if (this.ciclos < 1) {
            this.erro(
                this.simboloAnterior(),
                "'continua' precisa estar em um laço de repetição."
            );
        }

        return new Continua();
    }

    declaracaoRetorna(): Retorna {
        const palavraChave = this.simboloAnterior();
        let valor = null;

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PONTO_E_VIRGULA)) {
            valor = this.expressao();
        }

        return new Retorna(palavraChave, valor);
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
                    let branchConditions = [this.expressao()];
                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após o 'caso'."
                    );

                    while (this.verificarTipoSimboloAtual(tiposDeSimbolos.CASO)) {
                        this.consumir(tiposDeSimbolos.CASO, null);
                        branchConditions.push(this.expressao());
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
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.PADRAO) &&
                        !this.verificarTipoSimboloAtual(tiposDeSimbolos.CHAVE_DIREITA)
                    );

                    caminhos.push({
                        conditions: branchConditions,
                        declaracoes,
                    });
                } else if (
                    this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)
                ) {
                    if (caminhoPadrao !== null)
                        throw new ErroAvaliador(
                            "Você só pode ter um 'padrao' em cada declaração de 'escolha'."
                        );

                    this.consumir(
                        tiposDeSimbolos.DOIS_PONTOS,
                        "Esperado ':' após declaração do 'padrao'."
                    );

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
            this.ciclos -= 1;
        }
    }

    declaracaoImportar(): Importar {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' após declaração."
        );

        const caminho = this.expressao();

        let simboloFechamento = this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após declaração."
        );

        return new Importar(caminho as Literal, simboloFechamento);
    }

    declaracaoTente(): Tente {
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

        return new Tente(blocoTente, blocoPegue, blocoSenao, blocoFinalmente);
    }

    declaracaoFazer(): Fazer {
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

            return new Fazer(caminhoFazer, condicaoEnquanto);
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
            return this.declaracaoInterromper();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARA))
            return this.declaracaoPara();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENQUANTO))
            return this.declaracaoEnquanto();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE))
            return this.declaracaoSe();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCREVA))
            return this.declaracaoEscreva();
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA))
            return new Bloco(this.blocoEscopo());

        return this.declaracaoExpressao();
    }

    declaracaoDeVariavel(): Var {
        const simbolo: SimboloInterface = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de variável.'
        );
        let inicializador = null;
        if (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
        ) {
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

    corpoDaFuncao(tipo: string): Funcao {
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            `Esperado '(' após o nome ${tipo}.`
        );

        let parametros = [];
        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                if (parametros.length >= 255) {
                    this.erro(
                        this.simboloAtual(),
                        'Não pode haver mais de 255 parâmetros'
                    );
                }

                let paramObj = {};

                if (
                    this.simboloAtual().tipo === tiposDeSimbolos.MULTIPLICACAO
                ) {
                    this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
                    paramObj['tipo'] = 'wildcard';
                } else {
                    paramObj['tipo'] = 'standard';
                }

                paramObj['nome'] = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    'Esperado nome do parâmetro.'
                );

                if (
                    this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)
                ) {
                    paramObj['default'] = this.primario();
                }

                parametros.push(paramObj);

                if (paramObj['tipo'] === 'wildcard') break;
            } while (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)
            );
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

        return new Funcao(0, parametros, corpo);
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
            superClasse = new Variavel(this.simboloAnterior());
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
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNÇÃO) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.consumir(tiposDeSimbolos.FUNÇÃO, null);
                return this.funcao('função');
            }
            if (
                this.verificarTipoSimboloAtual(tiposDeSimbolos.FUNCAO) &&
                this.verificarTipoProximoSimbolo(tiposDeSimbolos.IDENTIFICADOR)
            ) {
                this.consumir(tiposDeSimbolos.FUNCAO, null);
                return this.funcao('funcao');
            }
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VARIAVEL))
                return this.declaracaoDeVariavel();
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE))
                return this.declaracaoDeClasse();

            return this.resolverDeclaracao();
        } catch (erro) {
            this.sincronizar();
            return null;
        }
    }

    analisar(simbolos?: SimboloInterface[]): Declaracao[] {
        const inicioAnalise: number = performance.now();
        this.atual = 0;
        this.ciclos = 0;

        if (simbolos) {
            this.simbolos = simbolos;
        }

        const declaracoes: Declaracao[] = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        const fimAnalise: number = performance.now();
        if (this.performance) {
            console.log(`[Avaliador Sintático] Tempo para análise: ${fimAnalise - inicioAnalise}ms`);
        }
        
        return declaracoes;
    }
}
