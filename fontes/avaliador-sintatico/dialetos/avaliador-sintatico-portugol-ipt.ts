import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    Unario,
    Variavel,
    Vetor,
} from '../../construtos';
import { Simbolo } from '../../lexador/simbolo';
import {
    Bloco,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Para,
    Se,
    Var,
} from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { SimboloInterface } from '../../interfaces';
import { CaminhoEscolha } from '../../interfaces/construtos';

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-ipt';
import { TipoInferencia } from '../../inferenciador';

export class AvaliadorSintaticoPortugolIpt extends AvaliadorSintaticoBase {

    private simboloAtualEh(tipo: string): boolean {
        return !this.estaNoFinal() && this.simbolos[this.atual].tipo === tipo;
    }

    private fechamentoEnquantoAtual(): boolean {
        return (
            this.simboloAtualEh(tiposDeSimbolos.FIMENQUANTO) ||
            (this.simboloAtualEh(tiposDeSimbolos.FIM) &&
                this.simbolos[this.atual + 1]?.tipo === tiposDeSimbolos.ENQUANTO)
        );
    }

    private consumirFechamentoEnquanto(): void {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FIMENQUANTO)) {
            return;
        }

        this.consumir(tiposDeSimbolos.FIM, "Esperado 'fimenquanto' ou 'fim enquanto'.");
        this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado 'enquanto' após 'fim'.");
    }

    private fechamentoEscolheAtual(): boolean {
        return (
            this.simboloAtualEh(tiposDeSimbolos.FIMESCOLHE) ||
            (this.simboloAtualEh(tiposDeSimbolos.FIM) &&
                this.simbolos[this.atual + 1]?.tipo === tiposDeSimbolos.ESCOLHE)
        );
    }

    private consumirFechamentoEscolhe(): void {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FIMESCOLHE)) {
            return;
        }

        this.consumir(tiposDeSimbolos.FIM, "Esperado 'fimescolhe' ou 'fim escolhe'.");
        this.consumir(tiposDeSimbolos.ESCOLHE, "Esperado 'escolhe' após 'fim'.");
    }

    private avaliarExpressaoNumericaConstante(expressao: Construto): number | null {
        if (expressao instanceof Literal && typeof expressao.valor === 'number') {
            return Number(expressao.valor);
        }

        if (expressao instanceof Agrupamento) {
            return this.avaliarExpressaoNumericaConstante(expressao.expressao);
        }

        if (expressao instanceof Unario) {
            const operando = this.avaliarExpressaoNumericaConstante(expressao.operando);
            if (operando === null) return null;

            switch (expressao.operador.tipo) {
                case tiposDeSimbolos.SUBTRACAO:
                    return -operando;
                default:
                    return null;
            }
        }

        if (expressao instanceof Binario) {
            const esquerda = this.avaliarExpressaoNumericaConstante(expressao.esquerda);
            const direita = this.avaliarExpressaoNumericaConstante(expressao.direita);
            if (esquerda === null || direita === null) return null;

            switch (expressao.operador.tipo) {
                case tiposDeSimbolos.ADICAO:
                    return esquerda + direita;
                case tiposDeSimbolos.SUBTRACAO:
                    return esquerda - direita;
                case tiposDeSimbolos.MULTIPLICACAO:
                    return esquerda * direita;
                case tiposDeSimbolos.DIVISAO:
                    return esquerda / direita;
                case tiposDeSimbolos.MODULO:
                    return esquerda % direita;
                case tiposDeSimbolos.EXPONENCIACAO:
                    return Math.pow(esquerda, direita);
                default:
                    return null;
            }
        }

        return null;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Consome quebras de linha opcionais.
     */
    private consumirQuebrasLinha(): void {
        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA));
    }

    /**
     * Coleta declarações até encontrar um token cujo tipo esteja em `tiposParada`.
     * O token de parada NÃO é consumido.
     */
    private async resolverBloco(tiposParada: string[]): Promise<Bloco> {
        const declaracoes: Declaracao[] = [];
        const primeiroSimbolo = this.simbolos[this.atual];

        while (!this.estaNoFinal() && !tiposParada.includes(this.simbolos[this.atual].tipo)) {
            const resolucao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(resolucao)) {
                declaracoes.push(...resolucao);
            } else if (resolucao !== null && resolucao !== undefined) {
                declaracoes.push(resolucao);
            }
        }

        return new Bloco(
            this.hashArquivo,
            Number(primeiroSimbolo?.linha ?? 0),
            declaracoes.filter((d) => d)
        );
    }

    // ── Expressões ─────────────────────────────────────────────────────────────

    async primario(): Promise<Construto> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR: {
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                return new Variavel(this.hashArquivo, simboloIdentificador);
            }
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO: {
                const simboloAnterior: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloAnterior.linha),
                    simboloAnterior.literal
                );
            }
            case tiposDeSimbolos.PARENTESE_ESQUERDO: {
                this.avancarEDevolverAnterior();
                const expressao = await this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");
                return new Agrupamento(
                    this.hashArquivo,
                    Number(this.simbolos[this.atual].linha),
                    expressao
                );
            }
        }
    }

    /**
     * Suporta chamadas de funções embutidas: SEN(x), COS(x), POTENCIA(b,e), etc.
     */
    async chamar(): Promise<Construto> {
        let expressao = await this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                const argumentos: Construto[] = [];
                if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                    do {
                        argumentos.push(await this.expressao());
                    } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
                }
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após argumentos.");
                expressao = new Chamada(this.hashArquivo, expressao, argumentos);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = await this.expressao();
                const fechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após índice."
                );
                expressao = new AcessoIndiceVariavel(this.hashArquivo, expressao, indice, fechamento);
            } else {
                break;
            }
        }

        return expressao;
    }

    /**
     * Override de `unario()` para incluir operadores unários aritméticos.
     * `NAO` é tratado em `e()` para ter precedência menor que comparações.
     */
    protected async unario(): Promise<Construto> {
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NEGACAO,
                tiposDeSimbolos.SUBTRACAO
            )
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.unario();
            return new Unario(this.hashArquivo, operador, direito, 'ANTES');
        }
        return await this.chamar();
    }

    /**
     * Override de `e()` para suportar o operador lógico `NAO` com precedência
     * menor que comparações: `nao x = 0` → `nao (x = 0)`.
     */
    protected async e(): Promise<Construto> {
        let expressao: Construto;

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NAO)) {
            const operador = this.simbolos[this.atual - 1];
            const operando = await this.comparacaoIgualdade();
            expressao = new Unario(this.hashArquivo, operador, operando, 'ANTES');
        } else {
            expressao = await this.comparacaoIgualdade();
        }

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.comparacaoIgualdade();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    /**
     * Override de `ou()` para incluir o operador lógico `XOU`.
     */
    protected async ou(): Promise<Construto> {
        let expressao = await this.e();

        while (
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU, tiposDeSimbolos.XOU)
        ) {
            const operador = this.simbolos[this.atual - 1];
            const direito = await this.e();
            expressao = new Logico(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    async atribuir(): Promise<Construto> {
        const expressao = await this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SETA_ATRIBUICAO)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = await this.atribuir();

            if (expressao instanceof Variavel) {
                return new Atribuir(this.hashArquivo, expressao, valor);
            }

            if (expressao instanceof AcessoIndiceVariavel) {
                return new AtribuicaoPorIndice(
                    this.hashArquivo,
                    expressao.linha,
                    expressao.entidadeChamada,
                    expressao.indice,
                    valor
                );
            }

            throw this.erro(setaAtribuicao, 'Tarefa de atribuição inválida');
        }

        return expressao;
    }

    // ── Declarações ────────────────────────────────────────────────────────────

    /**
     * `escrever expr [, expr ...]`
     */
    async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos: FormatacaoEscrita[] = [];
        do {
            const valor = await this.expressao();
            argumentos.push(
                new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    /**
     * `se cond entao ... [senao ...] fimse`
     */
    async declaracaoSe(): Promise<Se> {
        this.avancarEDevolverAnterior(); // consome 'se'
        const condicao = await this.expressao();
        this.consumir(tiposDeSimbolos.ENTAO, "Esperado 'então' após condição do se.");
        this.consumirQuebrasLinha();

        const caminhoEntao = await this.resolverBloco([
            tiposDeSimbolos.SENAO,
            tiposDeSimbolos.FIMSE,
        ]);

        this.consumirQuebrasLinha();

        let caminhoSenao: Bloco | null = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            this.consumirQuebrasLinha();
            caminhoSenao = await this.resolverBloco([tiposDeSimbolos.FIMSE]);
        }

        this.consumirQuebrasLinha();
        this.consumir(tiposDeSimbolos.FIMSE, "Esperado 'fimse' para fechar instrução se.");

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    /**
     * `enquanto cond faz ... fimenquanto`
     */
    async declaracaoEnquanto(): Promise<Enquanto> {
        this.avancarEDevolverAnterior(); // consome 'enquanto'
        const condicao = await this.expressao();
        this.consumir(tiposDeSimbolos.FAZ, "Esperado 'faz' após condição do enquanto.");
        this.consumirQuebrasLinha();

        const declaracoes: Declaracao[] = [];
        const primeiroSimbolo = this.simbolos[this.atual];
        while (!this.estaNoFinal() && !this.fechamentoEnquantoAtual()) {
            const resolucao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(resolucao)) {
                declaracoes.push(...resolucao);
            } else if (resolucao !== null && resolucao !== undefined) {
                declaracoes.push(resolucao);
            }
        }

        const corpo = new Bloco(
            this.hashArquivo,
            Number(primeiroSimbolo?.linha ?? 0),
            declaracoes.filter((d) => d)
        );

        this.consumirFechamentoEnquanto();

        return new Enquanto(condicao, corpo);
    }

    /**
     * `para v de ini ate fim [passo p]` + corpo + `proximo`
     */
    async declaracaoPara(): Promise<Para> {
        const simboloPara = this.avancarEDevolverAnterior(); // consome 'para'
        const linha = Number(simboloPara.linha);

        const identificador = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            "Esperado identificador após 'para'."
        );

        this.consumir(tiposDeSimbolos.DE, "Esperado 'de' após variável do 'para'.");
        const inicioExpr = await this.expressao();

        this.consumir(tiposDeSimbolos.ATE, "Esperado 'ate' após valor inicial do 'para'.");
        const fimExpr = await this.expressao();

        let passoExpr: Construto = new Literal(this.hashArquivo, linha, 1, 'inteiro');
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PASSO)) {
            passoExpr = await this.expressao();
        }

        this.consumirQuebrasLinha();

        const corpo = await this.resolverBloco([tiposDeSimbolos.PROXIMO]);
        this.consumir(tiposDeSimbolos.PROXIMO, "Esperado 'proximo' para fechar o laço 'para'.");

        const varIteracao = new Variavel(this.hashArquivo, identificador, 'inteiro');
        const simboloMenorIgual = new Simbolo(
            tiposDeSimbolos.MENOR_IGUAL, '<=', null, linha, this.hashArquivo
        );
        const simboloAdicao = new Simbolo(
            tiposDeSimbolos.ADICAO, '+', null, linha, this.hashArquivo
        );

        const inicializador = new Expressao(new Atribuir(this.hashArquivo, varIteracao, inicioExpr));
        const condicao = new Binario(this.hashArquivo, varIteracao, simboloMenorIgual, fimExpr);
        const incrementar = new Atribuir(
            this.hashArquivo,
            varIteracao,
            new Binario(this.hashArquivo, varIteracao, simboloAdicao, passoExpr)
        );

        return new Para(this.hashArquivo, linha, inicializador, condicao, incrementar, corpo);
    }

    /**
     * `repete ... ate cond`
     * Semântica: executa o corpo e repete enquanto a condição for FALSA (repeat-until).
     * Mapeado para `Fazer` com a condição invertida via `nao`.
     */
    private async declaracaoRepete(): Promise<Fazer> {
        const simboloRepete = this.avancarEDevolverAnterior(); // consome 'repete'
        this.consumirQuebrasLinha();

        const corpo = await this.resolverBloco([tiposDeSimbolos.ATE]);
        this.consumir(tiposDeSimbolos.ATE, "Esperado 'ate' para fechar o laço 'repete'.");

        const condicaoAte = await this.expressao();

        // Inverte a condição: o loop continua enquanto `ate cond` for falso
        const operadorNao = new Simbolo(
            tiposDeSimbolos.NAO, 'nao', null, condicaoAte.linha, this.hashArquivo
        );
        const condicaoInvertida = new Unario(this.hashArquivo, operadorNao, condicaoAte, 'ANTES');

        return new Fazer(this.hashArquivo, Number(simboloRepete.linha), corpo, condicaoInvertida);
    }

    /**
     * `faz ... enquanto cond`
     * O `enquanto` de fechamento é distinguido no lexer (FAZENQUANTO) do `enquanto` de abertura.
     */
    async declaracaoFazer(): Promise<Fazer> {
        const simboloFaz = this.avancarEDevolverAnterior(); // consome 'faz'
        this.consumirQuebrasLinha();

        const corpo = await this.resolverBloco([tiposDeSimbolos.FAZENQUANTO]);
        this.consumir(tiposDeSimbolos.FAZENQUANTO, "Esperado 'enquanto' para fechar o laço 'faz'.");

        const condicao = await this.expressao();

        return new Fazer(this.hashArquivo, Number(simboloFaz.linha), corpo, condicao);
    }

    /**
     * `escolhe expr caso v[, v...]: instr ... [defeito: instr] fimescolhe`
     */
    declaracaoEscolha(): Escolha {
        this.avancarEDevolverAnterior(); // consome 'escolhe'
        const identificador = this.primario() as unknown as Construto;

        // A versão síncrona é necessária porque a interface do base declara este como não-async.
        // Fazemos o cast após — o analisar() é async e usa await nos callers.
        throw new Error('Use declaracaoEscolhaAsync() internamente.');
    }

    private async declaracaoEscolhaAsync(): Promise<Escolha> {
        this.avancarEDevolverAnterior(); // consome 'escolhe'
        const identificador = await this.expressao();
        this.consumirQuebrasLinha();

        const caminhos: CaminhoEscolha[] = [];
        let caminhoPadrao: CaminhoEscolha = null;

        while (!this.estaNoFinal() && !this.fechamentoEscolheAtual()) {
            this.consumirQuebrasLinha();
            if (this.estaNoFinal() || this.fechamentoEscolheAtual()) {
                break;
            }

            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                // Múltiplos valores por caso: `caso 1, 2, 3:`
                const condicoes: Construto[] = [];
                do {
                    condicoes.push(await this.expressao());
                } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após valor do 'caso'.");
                this.consumirQuebrasLinha();

                const bloco = await this.resolverBloco([
                    tiposDeSimbolos.CASO,
                    tiposDeSimbolos.DEFEITO,
                    tiposDeSimbolos.FIMESCOLHE,
                    tiposDeSimbolos.FIM,
                ]);
                caminhos.push({ condicoes, declaracoes: bloco.declaracoes });

            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DEFEITO)) {
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após 'defeito'.");
                this.consumirQuebrasLinha();

                const bloco = await this.resolverBloco([tiposDeSimbolos.FIMESCOLHE, tiposDeSimbolos.FIM]);
                caminhoPadrao = { condicoes: [], declaracoes: bloco.declaracoes };
            } else {
                break;
            }
        }

        this.consumirFechamentoEscolhe();

        return new Escolha(identificador, caminhos, caminhoPadrao);
    }

    /**
     * `ler var [, var ...]`
     */
    async expressaoLeia(): Promise<Leia> {
        const simboloAtual = this.avancarEDevolverAnterior();
        const argumentos = [];
        do {
            argumentos.push(await this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return new Leia(simboloAtual, argumentos);
    }

    /**
     * Declara variáveis de um dado tipo, com suporte a arrays e valor inicial.
     * Ex: `inteiro x`, `real y = 3.14`, `logico v[5]`
     */
    private async declaracaoVariaveis(
        tipoToken: string,
        tipoDelegua: TipoInferencia,
        valorPadrao: any
    ): Promise<Var[]> {
        const simboloTipo = this.avancarEDevolverAnterior();
        const linha = Number(simboloTipo.linha);
        const inicializacoes: Var[] = [];

        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após '${simboloTipo.lexema}'.`
            );

            // Array: `inteiro v[10]`
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const expressaoTamanho = await this.expressao();
                const tamanhoConstante = this.avaliarExpressaoNumericaConstante(expressaoTamanho);
                if (
                    tamanhoConstante === null ||
                    !Number.isInteger(tamanhoConstante) ||
                    tamanhoConstante < 0
                ) {
                    throw this.erro(
                        identificador,
                        'Tamanho do vetor deve ser expressão numérica inteira constante e não-negativa.'
                    );
                }

                const tamanho = Number(tamanhoConstante);
                this.consumir(tiposDeSimbolos.COLCHETE_DIREITO, "Esperado ']' após tamanho do vetor.");

                const elementos: Literal[] = Array.from(
                    { length: tamanho },
                    () => new Literal(this.hashArquivo, linha, valorPadrao, tipoDelegua)
                );
                inicializacoes.push(
                    new Var(identificador, new Vetor(this.hashArquivo, linha, elementos, `${tipoDelegua}[]` as TipoInferencia))
                );
            } else {
                // Inicialização opcional: `inteiro x = 5` (usa = como igualdade aqui, não seta)
                let valorInicial: Construto = new Literal(
                    this.hashArquivo, linha, valorPadrao, tipoDelegua
                );
                if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
                    valorInicial = await this.expressao();
                }
                inicializacoes.push(new Var(identificador, valorInicial, tipoDelegua));
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return inicializacoes;
    }

    /**
     * `constante tipo nome = valor`
     */
    private async declaracaoConstante(): Promise<Const[]> {
        this.avancarEDevolverAnterior(); // consome 'constante'

        // Tipo obrigatório após 'constante'
        const tipoSimbolo = this.simbolos[this.atual];
        const mapaValoresPadrao: Record<string, any> = {
            [tiposDeSimbolos.INTEIRO]: 0,
            [tiposDeSimbolos.TEXTO]: '',
            [tiposDeSimbolos.REAL]: 0.0,
            [tiposDeSimbolos.LOGICO]: false,
            [tiposDeSimbolos.CARACTER]: '',
        };
        const mapaTipos: Record<string, TipoInferencia> = {
            [tiposDeSimbolos.INTEIRO]: 'inteiro',
            [tiposDeSimbolos.TEXTO]: 'texto',
            [tiposDeSimbolos.REAL]: 'real',
            [tiposDeSimbolos.LOGICO]: 'lógico',
            [tiposDeSimbolos.CARACTER]: 'caracter',
        };

        if (!(tipoSimbolo.tipo in mapaValoresPadrao)) {
            throw this.erro(tipoSimbolo, "Esperado tipo após 'constante'.");
        }

        this.avancarEDevolverAnterior(); // consome o tipo
        const tipoDelegua = mapaTipos[tipoSimbolo.tipo];

        const constantes: Const[] = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após '${tipoSimbolo.lexema}'.`
            );
            this.consumir(tiposDeSimbolos.IGUAL, "Esperado '=' após nome da constante.");
            const valor = await this.expressao();
            constantes.push(new Const(identificador, valor, tipoDelegua, true));
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return constantes;
    }

    // ── Ponto de entrada de declarações ────────────────────────────────────────

    async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVER:
                return await this.declaracaoEscreva();
            case tiposDeSimbolos.LER:
                return new Expressao(await this.expressaoLeia());
            case tiposDeSimbolos.SE:
                return await this.declaracaoSe();
            case tiposDeSimbolos.ENQUANTO:
                return await this.declaracaoEnquanto();
            case tiposDeSimbolos.PARA:
                return await this.declaracaoPara();
            case tiposDeSimbolos.REPETE:
                return await this.declaracaoRepete();
            case tiposDeSimbolos.FAZ:
                return await this.declaracaoFazer();
            case tiposDeSimbolos.ESCOLHE:
                return await this.declaracaoEscolhaAsync();
            case tiposDeSimbolos.INTEIRO:
                return await this.declaracaoVariaveis(tiposDeSimbolos.INTEIRO, 'inteiro', 0);
            case tiposDeSimbolos.TEXTO:
                if (
                    simboloAtual.literal === null &&
                    String(simboloAtual.lexema).toLowerCase() === 'texto'
                ) {
                    return await this.declaracaoVariaveis(tiposDeSimbolos.TEXTO, 'texto', '');
                }
                return new Expressao(await this.expressao());
            case tiposDeSimbolos.REAL:
                return await this.declaracaoVariaveis(tiposDeSimbolos.REAL, 'real', 0.0);
            case tiposDeSimbolos.LOGICO:
                return await this.declaracaoVariaveis(tiposDeSimbolos.LOGICO, 'lógico', false);
            case tiposDeSimbolos.CARACTER:
                return await this.declaracaoVariaveis(tiposDeSimbolos.CARACTER, 'caracter', '');
            case tiposDeSimbolos.CONSTANTE:
                return await this.declaracaoConstante();
            case tiposDeSimbolos.VARIAVEL: {
                // 'variavel' é apenas um modificador opcional; avança e processa o tipo
                this.avancarEDevolverAnterior();
                return await this.resolverDeclaracaoForaDeBloco();
            }
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default:
                return new Expressao(await this.expressao());
        }
    }

    // ── Métodos obrigatórios não usados em Portugol IPT ────────────────────────

    blocoEscopo(): Promise<Declaracao[]> {
        throw new Error('Método não implementado.');
    }

    corpoDaFuncao(_tipo: string): Promise<FuncaoConstruto> {
        throw new Error('Portugol IPT não suporta funções definidas pelo utilizador.');
    }

    // ── Ponto de entrada principal ─────────────────────────────────────────────

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        this.consumirQuebrasLinha();

        this.consumir(
            tiposDeSimbolos.INICIO,
            "Esperado 'inicio' para marcar o início do algoritmo."
        );

        let declaracoes: Declaracao[] = [];

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM) {
            const resolucao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(resolucao)) {
                declaracoes = declaracoes.concat(resolucao);
            } else if (resolucao !== null && resolucao !== undefined) {
                declaracoes.push(resolucao);
            }
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
