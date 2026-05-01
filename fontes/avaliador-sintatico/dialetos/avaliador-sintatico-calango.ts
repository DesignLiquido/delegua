import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Variavel,
    Vetor,
} from '../../construtos';
import { Simbolo } from '../../lexador/simbolo';
import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import {
    Bloco,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Para,
    Retorna,
    Se,
    Sustar,
    Var,
} from '../../declaracoes';
import { RetornoLexadorInterface, SimboloInterface, RetornoAvaliadorSintaticoInterface } from '../../interfaces';
import { CaminhoEscolha } from '../../interfaces/construtos';
import { ParametroInterface } from '../../interfaces/parametro-interface';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';
import { PilhaEscopos } from '../pilha-escopos';
import { InformacaoEscopo } from '../informacao-escopo';
import { InformacaoElementoSintatico } from '../../informacao-elemento-sintatico';
import { TipoInferencia } from '../../inferenciador';

import tiposDeSimbolos from '../../tipos-de-simbolos/calango';

export class AvaliadorSintaticoCalango extends AvaliadorSintaticoBase {
    pilhaEscopos: PilhaEscopos;
    /** Flag ativa quando se está a parsear a condição de um `se`, `enquanto` ou `faca/enquanto`.
     * Permite que `=` seja tratado como igualdade (não atribuição) nesses contextos. */
    private emContextoCondicao = false;

    constructor() {
        super();

        this.pilhaEscopos = new PilhaEscopos();
    }

    protected async atribuir(): Promise<ConstrutoInterface> {
        const expressao = await this.ou();

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL_ATRIBUICAO)) {
            const setaAtribuicao = this.simbolos[this.atual - 1];
            const valor = await this.atribuir();

            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

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

    protected blocoEscopo(): Promise<Declaracao[]> {
        throw new Error('Método não implementado.');
    }

    protected async chamar(): Promise<ConstrutoInterface> {
        let expressao = await this.primario();

        while (true) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
                const argumentos: ConstrutoInterface[] = [];
                if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
                    do {
                        argumentos.push(await this.expressao());
                    } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
                }
                this.consumir(
                    tiposDeSimbolos.PARENTESE_DIREITO,
                    "Esperado ')' após argumentos da chamada."
                );
                expressao = new Chamada(this.hashArquivo, expressao, argumentos);
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const indice = await this.expressao();
                const fechamento = this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após índice."
                );
                expressao = new AcessoIndiceVariavel(
                    this.hashArquivo,
                    expressao,
                    indice,
                    fechamento
                );
            } else {
                break;
            }
        }

        return expressao;
    }

    protected async declaracaoEnquanto(): Promise<Enquanto> {
        try {
            this.blocos += 1;
            this.avancarEDevolverAnterior(); // consome 'enquanto'

            this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'enquanto'.");
            this.emContextoCondicao = true;
            const condicao = await this.ou();
            this.emContextoCondicao = false;
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após condição do 'enquanto'."
            );
            this.consumir(tiposDeSimbolos.FACA, "Esperado 'faca' após condição do 'enquanto'.");

            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

            const corpo = await this.resolverBloco(['fimEnquanto']);

            this.consumir(
                tiposDeSimbolos.FIM_ENQUANTO,
                "Esperado 'fimEnquanto' para fechar o laço."
            );

            return new Enquanto(condicao, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    protected async declaracaoEscolha(): Promise<Escolha> {
        this.avancarEDevolverAnterior(); // consome 'escolha'

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'escolha'.");
        const identificador = await this.expressao();
        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após expressão do 'escolha'."
        );
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        const caminhos: CaminhoEscolha[] = [];
        let caminhoPadrao: CaminhoEscolha = null;

        while (
            !this.estaNoFinal() &&
            this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_ESCOLHA
        ) {
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
                const condicao = await this.expressao();
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após valor do 'caso'.");
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);
                const bloco = await this.resolverBloco(['caso', 'outroCaso', 'fimEscolha']);
                caminhos.push({ condicoes: [condicao], declaracoes: bloco.declaracoes });
            } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OUTRO_CASO)) {
                this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após 'outroCaso'.");
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);
                const bloco = await this.resolverBloco(['fimEscolha']);
                caminhoPadrao = { condicoes: [], declaracoes: bloco.declaracoes };
            } else {
                break;
            }
        }

        this.consumir(
            tiposDeSimbolos.FIM_ESCOLHA,
            "Esperado 'fimEscolha' para fechar o 'escolha'."
        );

        return new Escolha(identificador, caminhos, caminhoPadrao);
    }

    // Em Calango, método "escreval"
    protected async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = await this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        return new Escreva(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    /**
     * Em Calango, este é o método `escreva()`.
     * @returns {EscrevaMesmaLinha} Uma declaracao de escrita na mesma linha.
     */
    protected async declaracaoEscrevaMesmaLinha(): Promise<EscrevaMesmaLinha> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' antes dos valores em escreva."
        );

        const argumentos: FormatacaoEscrita[] = [];

        if (!this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            do {
                const valor = await this.resolverDeclaracaoForaDeBloco();

                argumentos.push(
                    new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        }

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            "Esperado ')' após os valores em escreva."
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    private declaracaoVariaveis(
        _tipoToken: string,
        tipoDelégua: TipoInferencia,
        valorPadrao: any
    ): Var[] {
        const simboloTipo = this.avancarEDevolverAnterior();

        const inicializacoes = [];
        do {
            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado identificador após palavra reservada '${simboloTipo.lexema}'.`
            );

            // Vetor com tamanho fixo: inteiro v[10];
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
                const tamanhoSimbolo = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    'Esperado tamanho do vetor.'
                );
                const tamanho = Number(tamanhoSimbolo.literal);
                if (!Number.isInteger(tamanho) || tamanho < 0) {
                    throw this.erro(
                        tamanhoSimbolo,
                        'Tamanho do vetor deve ser um inteiro não-negativo.'
                    );
                }
                this.consumir(
                    tiposDeSimbolos.COLCHETE_DIREITO,
                    "Esperado ']' após tamanho do vetor."
                );

                const elementos: Literal[] = Array.from(
                    { length: tamanho },
                    () =>
                        new Literal(
                            this.hashArquivo,
                            Number(simboloTipo.linha),
                            valorPadrao,
                            tipoDelégua
                        )
                );
                const tipoVetor = `${tipoDelégua}[]` as TipoInferencia;

                inicializacoes.push(
                    new Var(
                        identificador,
                        new Vetor(this.hashArquivo, Number(simboloTipo.linha), elementos, tipoVetor)
                    )
                );

                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    new InformacaoElementoSintatico(identificador.lexema, tipoVetor)
                );
            } else {
                inicializacoes.push(
                    new Var(
                        identificador,
                        new Literal(
                            this.hashArquivo,
                            Number(simboloTipo.linha),
                            valorPadrao,
                            tipoDelégua
                        )
                    )
                );

                this.pilhaEscopos.definirInformacoesVariavel(
                    identificador.lexema,
                    new InformacaoElementoSintatico(identificador.lexema, tipoDelégua)
                );
            }
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após declaração de variáveis.'
        );

        return inicializacoes;
    }

    protected declaracaoInteiros(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.INTEIRO, 'inteiro', 0);
    }

    protected declaracaoReais(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.REAL, 'real', 0.0);
    }

    protected declaracaoLogicos(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.LOGICO, 'lógico', false);
    }

    protected declaracaoCaracteres(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.CARACTER, 'caracter', '');
    }

    protected declaracaoTextos(): Var[] {
        return this.declaracaoVariaveis(tiposDeSimbolos.TIPO_TEXTO, 'texto', '');
    }

    protected async declaracaoFazer(): Promise<Fazer> {
        try {
            this.blocos += 1;
            const simboloFaca = this.avancarEDevolverAnterior(); // consome 'faca'
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

            // Corpo termina quando encontramos o 'enquanto' do do-while.
            // LIMITAÇÃO CONHECIDA: um `enquanto...fimEnquanto` (while) aninhado dentro deste bloco
            // causará término prematuro, pois o parser não consegue distinguir o 'enquanto' de
            // fechamento do do-while do 'enquanto' de abertura de um while aninhado sem lookahead
            // arbitrário. Este é um defeito da gramática do Calango, presente também no interpretador
            // de referência (github.com/GeovanaRamos/calango-interpreter). Não deve ser corrigido.
            const corpo = await this.resolverBloco(['enquanto']);

            this.consumir(tiposDeSimbolos.ENQUANTO, "Esperado 'enquanto' após corpo do 'faca'.");
            this.consumir(
                tiposDeSimbolos.PARENTESE_ESQUERDO,
                "Esperado '(' após 'enquanto' no 'faca'."
            );
            this.emContextoCondicao = true;
            const condicao = await this.ou();
            this.emContextoCondicao = false;
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                "Esperado ')' após condição do 'faca'."
            );
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);

            return new Fazer(this.hashArquivo, Number(simboloFaca.linha), corpo, condicao);
        } finally {
            this.blocos -= 1;
        }
    }

    protected async declaracaoPara(): Promise<Para> {
        try {
            this.blocos += 1;
            const simboloPara = this.avancarEDevolverAnterior(); // consome 'para'

            const identificador = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                "Esperado identificador após 'para'."
            );

            this.consumir(tiposDeSimbolos.DE, "Esperado 'de' após variável do 'para'.");
            const inicioExpr = await this.expressao();

            this.consumir(tiposDeSimbolos.ATE, "Esperado 'ate' após valor inicial do 'para'.");
            const fimExpr = await this.expressao();

            let passoExpr: ConstrutoInterface = new Literal(
                this.hashArquivo,
                Number(simboloPara.linha),
                1,
                'inteiro'
            );
            if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PASSO)) {
                passoExpr = await this.expressao();
            }

            this.consumir(tiposDeSimbolos.FACA, "Esperado 'faca' após condição do 'para'.");
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

            const corpo = await this.resolverBloco(['fimPara']);
            this.consumir(
                tiposDeSimbolos.FIM_PARA,
                "Esperado 'fimPara' para fechar o laço 'para'."
            );

            const linha = Number(simboloPara.linha);
            const varIteracao = new Variavel(this.hashArquivo, identificador, 'inteiro');

            const simboloMenorIgual = new Simbolo(
                tiposDeSimbolos.MENOR_IGUAL,
                '<=',
                null,
                linha,
                this.hashArquivo
            );
            const simboloAdicao = new Simbolo(
                tiposDeSimbolos.ADICAO,
                '+',
                null,
                linha,
                this.hashArquivo
            );

            const inicializador = new Expressao(
                new Atribuir(this.hashArquivo, varIteracao, inicioExpr)
            );
            const condicao = new Binario(this.hashArquivo, varIteracao, simboloMenorIgual, fimExpr);
            const incrementar = new Atribuir(
                this.hashArquivo,
                varIteracao,
                new Binario(this.hashArquivo, varIteracao, simboloAdicao, passoExpr)
            );

            return new Para(this.hashArquivo, linha, inicializador, condicao, incrementar, corpo);
        } finally {
            this.blocos -= 1;
        }
    }

    /**
     * Em Calango, `=` é usado tanto para atribuição (em comandos) quanto para igualdade (em condições).
     * Este override só trata `IGUAL_ATRIBUICAO` como igualdade quando `emContextoCondicao` estiver ativo,
     * evitando que `i = i + 1` dentro de blocos seja erroneamente interpretado como comparação.
     */
    protected override async comparacaoIgualdade(): Promise<ConstrutoInterface> {
        let expressao = await this.comparar();

        while (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.DIFERENTE,
                tiposDeSimbolos.IGUAL,
                tiposDeSimbolos.IGUAL_IGUAL
            ) ||
            (this.emContextoCondicao &&
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL_ATRIBUICAO))
        ) {
            let operador = this.simbolos[this.atual - 1];
            if (operador.tipo === tiposDeSimbolos.IGUAL_ATRIBUICAO) {
                operador = new Simbolo(
                    tiposDeSimbolos.IGUAL_IGUAL,
                    '=',
                    null,
                    operador.linha,
                    operador.hashArquivo
                );
            }
            const direito = await this.comparar();
            expressao = new Binario(this.hashArquivo, expressao, operador, direito);
        }

        return expressao;
    }

    protected async resolverBloco(simbolosParada: string[]): Promise<Bloco> {
        const declaracoes = [];
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        const primeiroSimbolo = this.simbolos[this.atual];

        while (!this.estaNoFinal() && !simbolosParada.includes(this.simbolos[this.atual].lexema)) {
            const resolucao = await this.resolverDeclaracaoForaDeBloco();
            if (Array.isArray(resolucao)) {
                declaracoes.push(...resolucao);
            } else {
                declaracoes.push(resolucao);
            }
        }

        this.pilhaEscopos.removerUltimo();
        return new Bloco(
            this.hashArquivo,
            primeiroSimbolo.linha,
            declaracoes.filter((d) => d)
        );
    }

    protected async declaracaoSe(): Promise<Se> {
        this.avancarEDevolverAnterior();
        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após 'se'");
        this.emContextoCondicao = true;
        const condicao = await this.ou();
        this.emContextoCondicao = false;
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após condição do 'se'");
        this.consumir(tiposDeSimbolos.ENTAO, "Esperado 'entao' após condição");

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        const caminhoEntao = await this.resolverBloco(['senao', 'fimSe']);

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA));

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);
            caminhoSenao = await this.resolverBloco(['senao', 'fimSe']);
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        this.consumir(
            tiposDeSimbolos.FIM_SE,
            "Esperado 'fimSe' para finalização de uma instrução se."
        );

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    protected async expressaoLeia(): Promise<Leia> {
        const simboloAtual = this.avancarEDevolverAnterior();

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' depois da declaração 'leia'"
        );

        const argumentos = [];

        do {
            argumentos.push(await this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após declaração 'leia'");

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            'Esperado ponto e vírgula após declaração leia'
        );

        return new Leia(simboloAtual, argumentos);
    }

    protected async primario(): Promise<ConstrutoInterface> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();
                let tipoOperando: string;

                try {
                    tipoOperando = this.pilhaEscopos.obterTipoVariavelPorNome(
                        simboloIdentificador.lexema
                    );
                } catch (erro: any) {
                    throw this.erro(simboloIdentificador, erro.message);
                }

                return new Variavel(this.hashArquivo, simboloIdentificador, tipoOperando);
            case tiposDeSimbolos.NUMERO:
                const simboloNumero: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloNumero.linha),
                    simboloNumero.literal,
                    Number.isInteger(simboloNumero.literal) ? 'inteiro' : 'real'
                );
            case tiposDeSimbolos.TEXTO:
                const simboloTexto: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloTexto.linha),
                    simboloTexto.literal,
                    'texto'
                );
            case tiposDeSimbolos.LITERAL_CARACTER:
                const simboloCaracter: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloCaracter.linha),
                    simboloCaracter.literal,
                    'caracter'
                );
            case tiposDeSimbolos.VERDADEIRO:
                const simboloVerdadeiro: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloVerdadeiro.linha),
                    true,
                    'lógico'
                );
            case tiposDeSimbolos.FALSO:
                const simboloFalso: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(this.hashArquivo, Number(simboloFalso.linha), false, 'lógico');
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
                this.avancarEDevolverAnterior();
                const expressao = await this.expressao();
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após a expressão.");

                return new Agrupamento(
                    this.hashArquivo,
                    this.simbolos[this.atual].linha,
                    expressao
                );
        }
    }

    override async resolverDeclaracaoForaDeBloco(): Promise<
        Declaracao | Declaracao[] | ConstrutoInterface | ConstrutoInterface[] | any
    > {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVA:
                return await this.declaracaoEscrevaMesmaLinha();
            case tiposDeSimbolos.ESCREVAL:
                return await this.declaracaoEscreva();
            case tiposDeSimbolos.LEIA:
                return await this.expressaoLeia();
            case tiposDeSimbolos.INTEIRO:
                return this.declaracaoInteiros();
            case tiposDeSimbolos.REAL:
                return this.declaracaoReais();
            case tiposDeSimbolos.LOGICO:
                return this.declaracaoLogicos();
            case tiposDeSimbolos.CARACTER:
                return this.declaracaoCaracteres();
            case tiposDeSimbolos.TIPO_TEXTO:
                return this.declaracaoTextos();
            case tiposDeSimbolos.ENQUANTO:
                return await this.declaracaoEnquanto();
            case tiposDeSimbolos.ESCOLHA:
                return await this.declaracaoEscolha();
            case tiposDeSimbolos.INTERROMPA:
                return new Sustar(this.avancarEDevolverAnterior());
            case tiposDeSimbolos.RETORNA:
                return await this.declaracaoRetorna();
            case tiposDeSimbolos.FACA:
                return await this.declaracaoFazer();
            case tiposDeSimbolos.PARA:
                return await this.declaracaoPara();
            case tiposDeSimbolos.SE:
                return await this.declaracaoSe();
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            default: {
                const resultado = await this.expressao();
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
                return resultado;
            }
        }
    }

    protected corpoDaFuncao(_tipo: string): Promise<FuncaoConstruto> {
        throw new Error('Método não implementado.');
    }

    /** Mapeia um tipo de token Calango para a string de tipo da Delégua. */
    private mapearTipo(tipoToken: string): string {
        switch (tipoToken) {
            case tiposDeSimbolos.INTEIRO:
                return 'inteiro';
            case tiposDeSimbolos.REAL:
                return 'real';
            case tiposDeSimbolos.LOGICO:
                return 'lógico';
            case tiposDeSimbolos.CARACTER:
                return 'caracter';
            case tiposDeSimbolos.TIPO_TEXTO:
                return 'texto';
            default:
                return 'qualquer';
        }
    }

    private async analisarParametrosCalango(): Promise<ParametroInterface[]> {
        const parametros: ParametroInterface[] = [];
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PARENTESE_DIREITO)) {
            return parametros;
        }
        do {
            const tipoTipo = this.mapearTipo(this.simbolos[this.atual].tipo);
            this.avancarEDevolverAnterior(); // consome o token de tipo
            const nome = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado nome de parâmetro.'
            );
            this.pilhaEscopos.definirInformacoesVariavel(
                nome.lexema,
                new InformacaoElementoSintatico(nome.lexema, tipoTipo)
            );
            parametros.push({ abrangencia: 'padrao', nome, tipoDado: tipoTipo });
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));
        return parametros;
    }

    protected async declaracaoFuncao(): Promise<FuncaoDeclaracao> {
        this.avancarEDevolverAnterior(); // consome 'funcao'
        const simboloNome = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome da função.'
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            simboloNome.lexema,
            new InformacaoElementoSintatico(simboloNome.lexema, 'qualquer')
        );

        this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, "Esperado '(' após nome da função.");
        const parametros = await this.analisarParametrosCalango();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.consumir(tiposDeSimbolos.DOIS_PONTOS, "Esperado ':' após ')' na função.");

        const tipoRetorno = this.mapearTipo(this.simbolos[this.atual].tipo);
        this.avancarEDevolverAnterior(); // consome o tipo de retorno
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        const bloco = await this.resolverBloco(['fimFuncao']);
        this.consumir(tiposDeSimbolos.FIM_FUNCAO, "Esperado 'fimFuncao' para fechar a função.");

        const funcaoConstruto = new FuncaoConstruto(
            this.hashArquivo,
            Number(simboloNome.linha),
            parametros,
            bloco.declaracoes,
            tipoRetorno,
            true
        );
        return new FuncaoDeclaracao(simboloNome, funcaoConstruto, tipoRetorno);
    }

    protected async declaracaoProcedimento(): Promise<FuncaoDeclaracao> {
        this.avancarEDevolverAnterior(); // consome 'procedimento'
        const simboloNome = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome do procedimento.'
        );
        this.pilhaEscopos.definirInformacoesVariavel(
            simboloNome.lexema,
            new InformacaoElementoSintatico(simboloNome.lexema, 'qualquer')
        );

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            "Esperado '(' após nome do procedimento."
        );
        const parametros = await this.analisarParametrosCalango();
        this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, "Esperado ')' após parâmetros.");
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA);

        const bloco = await this.resolverBloco(['fimProcedimento']);
        this.consumir(
            tiposDeSimbolos.FIM_PROCEDIMENTO,
            "Esperado 'fimProcedimento' para fechar o procedimento."
        );

        const funcaoConstruto = new FuncaoConstruto(
            this.hashArquivo,
            Number(simboloNome.linha),
            parametros,
            bloco.declaracoes,
            'vazio',
            false
        );
        return new FuncaoDeclaracao(simboloNome, funcaoConstruto, 'vazio');
    }

    protected async declaracaoRetorna(): Promise<Retorna> {
        const simbolo = this.avancarEDevolverAnterior(); // consome 'retorna'
        const valor = await this.expressao();
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA);
        return new Retorna(simbolo, valor);
    }

    private validarSegmentoAlgoritmo(): void {
        this.consumir(tiposDeSimbolos.ALGORITMO, `Expressão 'algoritmo' não declarada`);

        this.consumir(tiposDeSimbolos.IDENTIFICADOR, `Esperado identificador após 'algoritmo'.`);

        this.consumir(
            tiposDeSimbolos.PONTO_E_VIRGULA,
            `Esperado ponto e vírgula após identificador do algoritmo.`
        );
    }

    private validarSegmentoPrincipal(algoritmoOuFuncao: string): void {
        this.consumir(tiposDeSimbolos.PRINCIPAL, `Expressão 'principal' não declarada`);
    }

    async analisar(
        retornoLexador: RetornoLexadorInterface<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintaticoInterface<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;
        this.pilhaEscopos = new PilhaEscopos();
        this.pilhaEscopos.empilhar(new InformacaoEscopo());

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes = [];

        this.validarSegmentoAlgoritmo();

        // Declarações de funções e procedimentos antes do bloco principal
        while (
            !this.estaNoFinal() &&
            this.simbolos[this.atual].tipo !== tiposDeSimbolos.PRINCIPAL
        ) {
            if (this.simbolos[this.atual].tipo === tiposDeSimbolos.FUNCAO) {
                declaracoes.push(await this.declaracaoFuncao());
            } else if (this.simbolos[this.atual].tipo === tiposDeSimbolos.PROCEDIMENTO) {
                declaracoes.push(await this.declaracaoProcedimento());
            } else {
                this.avancarEDevolverAnterior(); // pula tokens inesperados
            }
        }

        this.validarSegmentoPrincipal('principal');

        while (
            !this.estaNoFinal() &&
            this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM_PRINCIPAL
        ) {
            const resolucaoDeclaracao = await this.resolverDeclaracaoForaDeBloco();

            if (Array.isArray(resolucaoDeclaracao)) {
                declaracoes = declaracoes.concat(resolucaoDeclaracao);
            } else {
                declaracoes.push(resolucaoDeclaracao);
            }
        }

        return {
            declaracoes: declaracoes.filter((d) => d),
            erros: this.erros,
        } as RetornoAvaliadorSintaticoInterface<Declaracao>;
    }
}


