import {
    AcessoIndiceVariavel,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Construto,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
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
    EscrevaMesmaLinha,
    Var,
    Expressao,
    Bloco,
} from '../../declaracoes';
import { RetornoLexador, RetornoAvaliadorSintatico } from '../../interfaces/retornos';
import { AvaliadorSintaticoBase } from '../avaliador-sintatico-base';

import { SimboloInterface } from '../../interfaces';

import tiposDeSimbolos from '../../tipos-de-simbolos/portugol-ipt';

export class AvaliadorSintaticoPortugolIpt extends AvaliadorSintaticoBase {
    async primario(): Promise<Construto> {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                const simboloIdentificador: SimboloInterface = this.avancarEDevolverAnterior();

                return new Variavel(this.hashArquivo, simboloIdentificador);
            case tiposDeSimbolos.INTEIRO:
            case tiposDeSimbolos.TEXTO:
                const simboloAnterior: SimboloInterface = this.avancarEDevolverAnterior();
                return new Literal(
                    this.hashArquivo,
                    Number(simboloAnterior.linha),
                    simboloAnterior.literal
                );
            case tiposDeSimbolos.PARENTESE_ESQUERDO:
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

    /**
     * Aparentemente, o Portugol IPT não suporta chamadas de função.
     * @returns O retorno da chamada de `primario()`.
     */
    async chamar(): Promise<Construto> {
        return await this.primario();
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

    /**
     * A declaração escreva (ou escrever) do Portugol IPT é sempre na mesma linha.
     */
    async declaracaoEscreva(): Promise<Escreva> {
        const simboloAtual = this.avancarEDevolverAnterior();

        // const argumentos = this.logicaComumEscreva();
        const argumentos: FormatacaoEscrita[] = [];
        do {
            const valor = await this.expressao();

            argumentos.push(
                new FormatacaoEscrita(this.hashArquivo, Number(simboloAtual.linha), valor)
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new EscrevaMesmaLinha(Number(simboloAtual.linha), this.hashArquivo, argumentos);
    }

    blocoEscopo(): Promise<Declaracao[]> {
        throw new Error('Método não implementado.');
    }

    async declaracaoSe(): Promise<Se> {
        this.avancarEDevolverAnterior();
        const condicao = await this.expressao();
        this.consumir(tiposDeSimbolos.ENTAO, "Esperado 'então' ou 'entao' após condição do se.");
        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra reservada 'então' ou 'entao' em condição se."
        );

        const caminhoEntao = (await this.resolverDeclaracaoForaDeBloco()) as Bloco;

        while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.QUEBRA_LINHA));

        let caminhoSenao = null;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
            this.consumir(
                tiposDeSimbolos.QUEBRA_LINHA,
                "Esperado quebra de linha após palavra reservada 'senão' ou 'senao' em instrução se."
            );
            caminhoSenao = await this.resolverDeclaracaoForaDeBloco();
        }

        this.consumir(
            tiposDeSimbolos.QUEBRA_LINHA,
            "Esperado quebra de linha após palavra reservada 'então' ou 'entao' em condição se."
        );
        this.consumir(
            tiposDeSimbolos.FIMSE,
            "Esperado 'fimse' para finalização de uma instrução se."
        );

        return new Se(condicao, caminhoEntao, [], caminhoSenao);
    }

    declaracaoEnquanto(): Promise<Enquanto> {
        throw new Error('Método não implementado.');
    }

    declaracaoPara(): Promise<Para> {
        throw new Error('Método não implementado.');
    }

    declaracaoEscolha(): Escolha {
        throw new Error('Método não implementado.');
    }

    declaracaoFazer(): Fazer {
        throw new Error('Método não implementado.');
    }

    async declaracaoInteiros(): Promise<Var[]> {
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
                const literalInicializacao = this.consumir(
                    tiposDeSimbolos.INTEIRO,
                    'Esperado literal inteiro após símbolo de igual em declaração de variável.'
                );
                valorInicializacao = Number(literalInicializacao.literal);
            }

            inicializacoes.push(
                new Var(
                    identificador,
                    new Literal(
                        this.hashArquivo,
                        Number(simboloInteiro.linha),
                        valorInicializacao,
                        'inteiro'
                    )
                )
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return Promise.resolve(inicializacoes);
    }

    /**
     * Análise de uma declaração `leia()`. No VisuAlg, `leia()` aceita 1..N argumentos.
     * @returns Uma declaração `Leia`.
     */
    async expressaoLeia(): Promise<Leia> {
        const simboloAtual = this.avancarEDevolverAnterior();

        const argumentos = [];
        do {
            argumentos.push(await this.resolverDeclaracaoForaDeBloco());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        return new Leia(simboloAtual, argumentos);
    }

    corpoDaFuncao(tipo: string): Promise<FuncaoConstruto> {
        throw new Error('Método não implementado.');
    }

    async resolverDeclaracaoForaDeBloco(): Promise<Declaracao | Declaracao[]> {
        const simboloAtual = this.simbolos[this.atual];
        switch (simboloAtual.tipo) {
            case tiposDeSimbolos.ESCREVER:
                return await this.declaracaoEscreva();
            case tiposDeSimbolos.INTEIRO:
                return await this.declaracaoInteiros();
            case tiposDeSimbolos.LER:
                return new Expressao(await this.expressaoLeia());
            case tiposDeSimbolos.QUEBRA_LINHA:
                this.avancarEDevolverAnterior();
                return null;
            case tiposDeSimbolos.SE:
                return await this.declaracaoSe();
            default:
                return new Expressao(await this.expressao());
        }
    }

    private validarSegmentoInicio(): void {
        this.consumir(
            tiposDeSimbolos.INICIO,
            `Esperada expressão 'inicio' para marcar escopo do algoritmo.`
        );
    }

    async analisar(
        retornoLexador: RetornoLexador<SimboloInterface>,
        hashArquivo: number
    ): Promise<RetornoAvaliadorSintatico<Declaracao>> {
        this.erros = [];
        this.atual = 0;
        this.blocos = 0;

        this.hashArquivo = hashArquivo || 0;
        this.simbolos = retornoLexador?.simbolos || [];

        while (this.verificarTipoSimboloAtual(tiposDeSimbolos.QUEBRA_LINHA)) {
            this.avancarEDevolverAnterior();
        }

        let declaracoes = [];
        this.validarSegmentoInicio();

        while (!this.estaNoFinal() && this.simbolos[this.atual].tipo !== tiposDeSimbolos.FIM) {
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
        } as RetornoAvaliadorSintatico<Declaracao>;
    }
}
